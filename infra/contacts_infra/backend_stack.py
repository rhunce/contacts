"""
Backend Infrastructure Stack
AWS CDK Python implementation for backend services
"""

import os
from typing import Optional
from aws_cdk import (
    Stack, Duration, RemovalPolicy, CfnOutput, SecretValue,
    aws_ec2 as ec2,
    aws_rds as rds,
    aws_ecs as ecs,
    aws_ecs_patterns as ecs_patterns,
    aws_elasticache as elasticache,
    aws_secretsmanager as secretsmanager,
    aws_route53 as route53,
    aws_route53_targets as targets,
    aws_certificatemanager as acm,
    aws_iam as iam,
    aws_elasticloadbalancingv2 as elbv2
)
from constructs import Construct


class BackendStack(Stack):
    """Backend infrastructure stack for contacts application"""
    
    def __init__(
        self, 
        scope: Construct, 
        construct_id: str, 
        app_name: str,
        root_domain: Optional[str] = None,
        **kwargs
    ) -> None:
        super().__init__(scope, construct_id, **kwargs)
        
        self.app_name = app_name
        self.root_domain = root_domain
        
        # VPC for backend resources
        self.vpc = self._create_vpc()
        
        # Database cluster
        db_cluster = self._create_database()
        
        # Redis for session storage
        redis_replication_group, redis_sg = self._create_redis()
        
        # Session secret
        session_secret = self._create_session_secret()
        
        # API domain and certificate
        api_domain_name = None
        cert = None
        zone = None
        
        if self.root_domain:
            api_domain_name = f"api.{self.root_domain}"
            zone = route53.HostedZone.from_lookup(
                self, 
                f"{self.app_name}HostedZone",
                domain_name=self.root_domain
            )
            
            cert = acm.Certificate(
                self, 
                f"{self.app_name}ApiCert",
                domain_name=api_domain_name,
                validation=acm.CertificateValidation.from_dns(zone)
            )
        
        # ECS Fargate service
        fargate_service = self._create_fargate_service(
            db_cluster=db_cluster,
            redis_replication_group=redis_replication_group,
            session_secret=session_secret,
            cert=cert,
            api_domain_name=api_domain_name,
            zone=zone,
        )

        # Allow ECS -> DB
        db_cluster.connections.allow_default_port_from(fargate_service.service, "ECS tasks to Aurora")

        # Allow ECS -> Redis 6379
        redis_sg.add_ingress_rule(
            fargate_service.service.connections.security_groups[0],
            ec2.Port.tcp(6379),
            "ECS tasks to Redis TLS",
        )
        
        # Store domain name for outputs
        self.api_domain_name = api_domain_name
        self.load_balancer_dns_name = fargate_service.load_balancer.load_balancer_dns_name
        
        # Create outputs
        self._create_outputs(fargate_service, db_cluster, redis_replication_group)
    
    def _create_vpc(self) -> ec2.Vpc:
        """Create VPC for backend resources"""
        return ec2.Vpc(
            self, 
            f"{self.app_name}Vpc",
            max_azs=2,
            nat_gateways=1,
            ip_addresses=ec2.IpAddresses.cidr("172.16.0.0/16"),
            subnet_configuration=[
                ec2.SubnetConfiguration(
                    name="Public",
                    subnet_type=ec2.SubnetType.PUBLIC,
                    cidr_mask=24
                ),
                ec2.SubnetConfiguration(
                    name="Private",
                    subnet_type=ec2.SubnetType.PRIVATE_WITH_EGRESS,
                    cidr_mask=24
                ),
                ec2.SubnetConfiguration(
                    name="Isolated",
                    subnet_type=ec2.SubnetType.PRIVATE_ISOLATED,
                    cidr_mask=24
                )
            ]
        )
    
    def _create_database(self) -> rds.DatabaseCluster:
        """Create Aurora PostgreSQL cluster"""
        return rds.DatabaseCluster(
            self,
            f"{self.app_name}Database",
            engine=rds.DatabaseClusterEngine.aurora_postgres(
                version=rds.AuroraPostgresEngineVersion.VER_15_4
            ),
            writer=rds.ClusterInstance.serverless_v2("writer"),
            # Optional read replica:
            # readers=[rds.ClusterInstance.serverless_v2("reader")],
            serverless_v2_min_capacity=0.5,
            serverless_v2_max_capacity=2,
            vpc=self.vpc,
            vpc_subnets=ec2.SubnetSelection(subnet_type=ec2.SubnetType.PRIVATE_ISOLATED),
            storage_encrypted=True,
            backup=rds.BackupProps(retention=Duration.days(7), preferred_window="03:00-04:00"),
            deletion_protection=False,
            removal_policy=RemovalPolicy.DESTROY,
            credentials=rds.Credentials.from_generated_secret("postgres"),
        )

    
    def _create_redis(self) -> tuple[elasticache.CfnReplicationGroup, ec2.SecurityGroup]:
        """Create ElastiCache Redis cluster + SG and return both"""
        redis_security_group = ec2.SecurityGroup(
            self,
            f"{self.app_name}RedisSecurityGroup",
            vpc=self.vpc,
            description="Security group for Redis ElastiCache",
            allow_all_outbound=True,
        )

        redis_subnet_group = elasticache.CfnSubnetGroup(
            self,
            f"{self.app_name}RedisSubnetGroup",
            description="Subnet group for Redis ElastiCache",
            subnet_ids=[s.subnet_id for s in self.vpc.isolated_subnets],
        )

        rg = elasticache.CfnReplicationGroup(
            self,
            f"{self.app_name}Redis",
            replication_group_description="Redis cluster for session storage",
            num_cache_clusters=1,
            cache_node_type="cache.t3.micro",
            engine="redis",
            port=6379,
            cache_subnet_group_name=redis_subnet_group.ref,
            security_group_ids=[redis_security_group.security_group_id],
            at_rest_encryption_enabled=True,
            transit_encryption_enabled=True,
            automatic_failover_enabled=False,
        )
        return rg, redis_security_group

    
    def _create_session_secret(self) -> secretsmanager.Secret:
        """Create session secret"""
        return secretsmanager.Secret(
            self, 
            f"{self.app_name}SessionSecret",
            secret_name=f"{self.app_name.lower()}-session-secret",
            generate_secret_string=secretsmanager.SecretStringGenerator(
                exclude_characters="\"@/\\"
            ),
            rotation_schedule=secretsmanager.RotationSchedule.daily()
        )
    
    def _create_fargate_service(
        self,
        db_cluster: rds.DatabaseCluster,
        redis_replication_group: elasticache.CfnReplicationGroup,
        session_secret: secretsmanager.Secret,
        cert: Optional[acm.ICertificate],
        api_domain_name: Optional[str],
        zone: Optional[route53.IHostedZone],
    ) -> ecs_patterns.ApplicationLoadBalancedFargateService:
        """Create ECS Fargate service + ALB with proper HTTPS and domain configuration."""
        environment = {
            "PORT": "3000",
            "NODE_ENV": "production",
            "CORS_ORIGIN": os.getenv("CORS_ORIGIN", f"https://{self.root_domain}" if self.root_domain else ""),
            "MAX_USERS": os.getenv("MAX_USERS", "50"),
            "MAX_CONTACTS_PER_USER": os.getenv("MAX_CONTACTS_PER_USER", "50"),
            "PGDATABASE": "postgres",  # Aurora PostgreSQL default database
        }

        secrets = {
            "PGHOST": ecs.Secret.from_secrets_manager(db_cluster.secret, "host"),
            "PGPORT": ecs.Secret.from_secrets_manager(db_cluster.secret, "port"),
            "PGUSER": ecs.Secret.from_secrets_manager(db_cluster.secret, "username"),
            "PGPASSWORD": ecs.Secret.from_secrets_manager(db_cluster.secret, "password"),
            "SESSION_SECRET": ecs.Secret.from_secrets_manager(session_secret),
            "REDIS_URL": ecs.Secret.from_secrets_manager(
                secretsmanager.Secret(
                    self,
                    f"{self.app_name}RedisUrl",
                    secret_name=f"{self.app_name.lower()}-redis-url",
                    secret_string_value=SecretValue.unsafe_plain_text(
                        f"rediss://{redis_replication_group.attr_primary_end_point_address}:6379"
                    ),
                )
            ),
        }

        task_image_options = ecs_patterns.ApplicationLoadBalancedTaskImageOptions(
            image=ecs.ContainerImage.from_asset("../backend"),
            container_port=3000,
            environment=environment,
            secrets=secrets,
        )

        # Create ECS cluster
        cluster = ecs.Cluster(self, f"{self.app_name}EcsCluster", vpc=self.vpc)

        # Configure Fargate service with proper listener setup
        if cert and api_domain_name and zone:
            # HTTPS with custom domain
            fargate = ecs_patterns.ApplicationLoadBalancedFargateService(
                self,
                f"{self.app_name}FargateService",
                cluster=cluster,
                public_load_balancer=True,
                task_image_options=task_image_options,
                certificate=cert,
                domain_name=api_domain_name,
                domain_zone=zone,
                redirect_http=True,
                protocol=elbv2.ApplicationProtocol.HTTPS,
                desired_count=1,
                cpu=256,
                memory_limit_mib=512,
            )
        else:
            # HTTP only (for development/testing)
            fargate = ecs_patterns.ApplicationLoadBalancedFargateService(
                self,
                f"{self.app_name}FargateService",
                cluster=cluster,
                public_load_balancer=True,
                task_image_options=task_image_options,
                protocol=elbv2.ApplicationProtocol.HTTP,
                desired_count=1,
                cpu=256,
                memory_limit_mib=512,
            )

        # Configure health check
        fargate.target_group.configure_health_check(
            path="/health", 
            healthy_http_codes="200",
            interval=Duration.seconds(30),
            timeout=Duration.seconds(5),
            healthy_threshold_count=2,
            unhealthy_threshold_count=3
        )

        # Grant secrets access
        db_cluster.secret.grant_read(fargate.task_definition.task_role)
        db_cluster.secret.grant_read(fargate.task_definition.execution_role)
        session_secret.grant_read(fargate.task_definition.task_role)
        session_secret.grant_read(fargate.task_definition.execution_role)

        return fargate

    def _create_outputs(
        self,
        fargate_service: ecs_patterns.ApplicationLoadBalancedFargateService,
        db_cluster: rds.DatabaseCluster,
        redis_replication_group: elasticache.CfnReplicationGroup
    ) -> None:
        """Create CloudFormation outputs"""
        
        if self.api_domain_name:
            CfnOutput(
                self, 
                "ApiUrl",
                value=f"https://{self.api_domain_name}",
                description="Public HTTPS API endpoint",
                export_name=f"{self.app_name}-api-url"
            )
        
        CfnOutput(
            self, 
            "AlbUrl",
            value=f"http://{fargate_service.load_balancer.load_balancer_dns_name}",
            description="Load Balancer URL for the Contacts API",
            export_name=f"{self.app_name}-alb-url"
        )
        
        CfnOutput(
            self, 
            "DatabaseEndpoint",
            value=db_cluster.cluster_endpoint.hostname,
            description="Aurora PostgreSQL Cluster Endpoint"
        )
        
        CfnOutput(
            self, 
            "RedisEndpoint",
            value=redis_replication_group.attr_primary_end_point_address,
            description="Redis ElastiCache Endpoint"
        )
        
        CfnOutput(
            self, 
            "VpcId",
            value=self.vpc.vpc_id,
            description="VPC ID for the backend infrastructure",
            export_name=f"{self.app_name}-vpc-id"
        )
