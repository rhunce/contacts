import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as elasticache from 'aws-cdk-lib/aws-elasticache';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as path from 'path';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';

interface BackendStackProps extends cdk.StackProps {
  appName: string;
  rootDomain: string;
}

export class BackendStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;
  public readonly loadBalancerDnsName: string;
  public readonly apiDomainName: string;

  constructor(scope: cdk.App, id: string, props: BackendStackProps) {
    super(scope, id, props);

    // VPC
    this.vpc = new ec2.Vpc(this, `${props.appName}Vpc`, { maxAzs: 2 });

    // DB secret + cluster (Aurora Serverless v2)
    const dbSecret = new secretsmanager.Secret(this, `${props.appName}DbSecret`, {
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'postgres' }),
        generateStringKey: 'password',
        excludeCharacters: '"@/\\',
      },
    });

    const dbSecurityGroup = new ec2.SecurityGroup(this, `${props.appName}DbSecurityGroup`, { vpc: this.vpc });
    
    const dbCluster = new rds.DatabaseCluster(this, `${props.appName}Aurora`, {
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_15_4,
      }),
      credentials: rds.Credentials.fromSecret(dbSecret),
      defaultDatabaseName: `${props.appName}Db`,
      vpc: this.vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      securityGroups: [dbSecurityGroup],
      writer: rds.ClusterInstance.serverlessV2('writer'),
      serverlessV2MinCapacity: 0.5,
      serverlessV2MaxCapacity: 2,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      deletionProtection: false
    });

    const sessionSecret = new secretsmanager.Secret(this, `${props.appName}SessionSecret`);

    // Redis
    const redisSubnetGroup = new elasticache.CfnSubnetGroup(this, `${props.appName}RedisSubnetGroup`, {
      description: 'Subnet group for Redis cluster',
      subnetIds: this.vpc.privateSubnets.map(subnet => subnet.subnetId),
    });

    const redisSecurityGroup = new ec2.SecurityGroup(this, `${props.appName}RedisSecurityGroup`, { vpc: this.vpc });

    const redisReplicationGroup = new elasticache.CfnReplicationGroup(this, `${props.appName}Redis`, {
      replicationGroupDescription: 'Redis cluster for session storage',
      engine: 'redis',
      cacheNodeType: 'cache.t3.micro',
      numCacheClusters: 1,
      automaticFailoverEnabled: false,
      multiAzEnabled: false,
      cacheSubnetGroupName: redisSubnetGroup.ref,
      securityGroupIds: [redisSecurityGroup.securityGroupId],
      port: 6379,
      transitEncryptionEnabled: true,
      atRestEncryptionEnabled: true,
    });

    // Route53 + ACM for API
    const zone = route53.HostedZone.fromLookup(this, `${props.appName}HostedZone`, {
      domainName: props.rootDomain,
    });

    const apiDomainName = `api.${props.rootDomain}`;
    this.apiDomainName = apiDomainName;

    const cert = new acm.Certificate(this, `${props.appName}ApiCert`, {
      domainName: apiDomainName,
      validation: acm.CertificateValidation.fromDns(zone),
    });

    // ECS Fargate + ALB with HTTPS
    const fargateService = new ecsPatterns.ApplicationLoadBalancedFargateService(
      this,
      `${props.appName}FargateService`,
      {
        cluster: new ecs.Cluster(this, `${props.appName}EcsCluster`, { vpc: this.vpc }),
        publicLoadBalancer: true,
        certificate: cert,
        domainName: apiDomainName,
        domainZone: zone,
        redirectHTTP: true, // 80 -> 443
        taskImageOptions: {
          image: ecs.ContainerImage.fromAsset(path.join(__dirname, '../../backend')),
          containerPort: 3000,
          environment: { 
            PORT: '3000', 
            NODE_ENV: 'production',
            CORS_ORIGIN: process.env.CORS_ORIGIN || `https://${props.rootDomain}`
          },
          secrets: {
            PGHOST: ecs.Secret.fromSecretsManager(dbCluster.secret!, 'host'),
            PGPORT: ecs.Secret.fromSecretsManager(dbCluster.secret!, 'port'),
            PGUSER: ecs.Secret.fromSecretsManager(dbCluster.secret!, 'username'),
            PGPASSWORD: ecs.Secret.fromSecretsManager(dbCluster.secret!, 'password'),
            PGDATABASE: ecs.Secret.fromSecretsManager(dbCluster.secret!, 'dbname'),
            SESSION_SECRET: ecs.Secret.fromSecretsManager(sessionSecret),
            REDIS_URL: ecs.Secret.fromSecretsManager(
              new secretsmanager.Secret(this, `${props.appName}RedisUrl`, {
                secretStringValue: cdk.SecretValue.unsafePlainText(
                  `rediss://${redisReplicationGroup.attrPrimaryEndPointAddress}:6379`
                ),
              })
            )
          },
        },
      }
    );

    // Health check
    fargateService.targetGroup.configureHealthCheck({ path: '/health', healthyHttpCodes: '200' });

    // Networking
    dbCluster.connections.allowDefaultPortFrom(fargateService.service, 'ECS tasks to Aurora');
    redisSecurityGroup.addIngressRule(
      fargateService.service.connections.securityGroups[0],
      ec2.Port.tcp(6379),
      'ECS tasks to Redis TLS'
    );

    // Secrets read access
    dbCluster.secret!.grantRead(fargateService.taskDefinition.taskRole);
    dbCluster.secret!.grantRead(fargateService.taskDefinition.executionRole!);
    sessionSecret.grantRead(fargateService.taskDefinition.taskRole);
    sessionSecret.grantRead(fargateService.taskDefinition.executionRole!);

    this.loadBalancerDnsName = fargateService.loadBalancer.loadBalancerDnsName;

    // Outputs
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: `https://${apiDomainName}`,
      description: 'Public HTTPS API endpoint',
      exportName: `${props.appName}-api-url`
    });
    new cdk.CfnOutput(this, 'AlbUrl', {
      value: `http://${fargateService.loadBalancer.loadBalancerDnsName}`,
      description: 'Load Balancer URL for the Contacts API',
      exportName: `${props.appName}-alb-url`
    });
    new cdk.CfnOutput(this, 'DatabaseEndpoint', {
      value: dbCluster.clusterEndpoint.hostname,
      description: 'Aurora PostgreSQL Cluster Endpoint'
    });
    new cdk.CfnOutput(this, 'RedisEndpoint', {
      value: redisReplicationGroup.attrPrimaryEndPointAddress,
      description: 'Redis ElastiCache Endpoint'
    });
    new cdk.CfnOutput(this, 'VpcId', {
      value: this.vpc.vpcId,
      description: 'VPC ID for the backend infrastructure',
      exportName: `${props.appName}-vpc-id`
    });
  }
}
