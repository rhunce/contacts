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
        redis_replication_group = self._create_redis()
        
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
            db_cluster, 
            redis_replication_group, 
            session_secret,
            cert,
            api_domain_name,
            zone
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
        """Create Aurora PostgreSQL database cluster"""
        return rds.DatabaseCluster(
            self, 
            f"{self.app_name}Database",
            engine=rds.DatabaseClusterEngine.aurora_postgres(
                version=rds.AuroraPostgresEngineVersion.VER_15_4
            ),
            instance_props=rds.InstanceProps(
                vpc=self.vpc,
                vpc_subnets=ec2.SubnetSelection(
                    subnet_type=ec2.SubnetType.PRIVATE_ISOLATED
                ),
                instance_type=ec2.InstanceType.of(
                    ec2.InstanceClass.T3, 
                    ec2.InstanceSize.MICRO
                )
            ),
            instances=1,
            storage_encrypted=True,
            backup=rds.BackupProps(
                retention=Duration.days(7),
                preferred_window="03:00-04:00"
            ),
            deletion_protection=False,
            removal_policy=RemovalPolicy.DESTROY
        )
    
    def _create_redis(self) -> elasticache.CfnReplicationGroup:
        """Create ElastiCache Redis cluster"""
        redis_security_group = ec2.SecurityGroup(
            self, 
            f"{self.app_name}RedisSecurityGroup",
            vpc=self.vpc,
            description="Security group for Redis ElastiCache",
            allow_all_outbound=True
        )
        
        redis_subnet_group = elasticache.CfnSubnetGroup(
            self, 
            f"{self.app_name}RedisSubnetGroup",
            description="Subnet group for Redis ElastiCache",
            subnet_ids=[subnet.subnet_id for subnet in self.vpc.private_subnets]
        )
        
        return elasticache.CfnReplicationGroup(
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
            transit_encryption_enabled=True
        )
    
    def _create_session_secret(self) -> secretsmanager.Secret:
        """Create session secret"""
        return secretsmanager.Secret(
            self, 
            f"{self.app_name}SessionSecret",
            secret_name=f"{self.app_name.lower()}-session-secret",
            generate_secret_string=secretsmanager.SecretStringGenerator(
                secret_string_template='{"secret": "',
                generate_string_key="value",
                exclude_characters="\"@/\\"
            )
        )
    
    def _create_fargate_service(
        self,
        db_cluster: rds.DatabaseCluster,
        redis_replication_group: elasticache.CfnReplicationGroup,
        session_secret: secretsmanager.Secret,
        cert: Optional[acm.ICertificate],
        api_domain_name: Optional[str],
        zone: Optional[route53.IHostedZone]
    ) -> ecs_patterns.ApplicationLoadBalancedFargateService:
        """Create ECS Fargate service with load balancer"""
        
        # Environment variables
        environment = {
            "PORT": "3000",
            "NODE_ENV": "production",
            "CORS_ORIGIN": os.getenv("CORS_ORIGIN", f"https://{self.root_domain}" if self.root_domain else ""),
            "MAX_USERS": os.getenv("MAX_USERS", "50"),
            "MAX_CONTACTS_PER_USER": os.getenv("MAX_CONTACTS_PER_USER", "50")
        }
        
        # Secrets
        secrets = {
            "PGHOST": ecs.Secret.from_secrets_manager(db_cluster.secret, "host"),
            "PGPORT": ecs.Secret.from_secrets_manager(db_cluster.secret, "port"),
            "PGUSER": ecs.Secret.from_secrets_manager(db_cluster.secret, "username"),
            "PGPASSWORD": ecs.Secret.from_secrets_manager(db_cluster.secret, "password"),
            "PGDATABASE": ecs.Secret.from_secrets_manager(db_cluster.secret, "dbname"),
            "SESSION_SECRET": ecs.Secret.from_secrets_manager(session_secret),
            "REDIS_URL": ecs.Secret.from_secrets_manager(
                secretsmanager.Secret(
                    self, 
                    f"{self.app_name}RedisUrl",
                    secret_string_value=SecretValue.unsafe_plain_text(
                        f"rediss://{redis_replication_group.attr_primary_end_point_address}:6379"
                    )
                )
            )
        }
        
        # Task image options
        task_image_options = ecs_patterns.ApplicationLoadBalancedTaskImageOptions(
            image=ecs.ContainerImage.from_asset("../backend"),
            container_port=3000,
            environment=environment,
            secrets=secrets
        )
        
        # Create Fargate service
        fargate_service = ecs_patterns.ApplicationLoadBalancedFargateService(
            self, 
            f"{self.app_name}FargateService",
            cluster=ecs.Cluster(self, f"{self.app_name}EcsCluster", vpc=self.vpc),
            public_load_balancer=True,
            task_image_options=task_image_options
        )
        
        # Configure HTTPS if domain is provided
        if cert and api_domain_name and zone:
            fargate_service.target_group.configure_health_check(
                path="/health", 
                healthy_http_codes="200"
            )
            
            # Add HTTPS listener
            https_listener = fargate_service.load_balancer.add_listener(
                "HttpsListener",
                port=443,
                protocol=elbv2.ApplicationProtocol.HTTPS,
                certificates=[cert],
                default_action=elbv2.ListenerAction.forward([fargate_service.target_group])
            )
            
            # Redirect HTTP to HTTPS
            fargate_service.load_balancer.add_listener(
                "HttpListener",
                port=80,
                protocol=elbv2.ApplicationProtocol.HTTP,
                default_action=elbv2.ListenerAction.redirect(
                    protocol="HTTPS",
                    port="443"
                )
            )
            
            # Create DNS record
            route53.ARecord(
                self, 
                f"{self.app_name}ApiAlias",
                zone=zone,
                record_name=api_domain_name,
                target=route53.RecordTarget.from_alias(
                    targets.LoadBalancerTarget(fargate_service.load_balancer)
                )
            )
        
        # Configure networking
        db_cluster.connections.allow_default_port_from(
            fargate_service.service, 
            "ECS tasks to Aurora"
        )
        
        # Grant secrets access
        db_cluster.secret.grant_read(fargate_service.task_definition.task_role)
        db_cluster.secret.grant_read(fargate_service.task_definition.execution_role)
        session_secret.grant_read(fargate_service.task_definition.task_role)
        session_secret.grant_read(fargate_service.task_definition.execution_role)
        
        return fargate_service
    
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
