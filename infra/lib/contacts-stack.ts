import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';

interface ContactsStackProps extends cdk.StackProps {
  appName: string;
}

export class ContactsStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: ContactsStackProps) {
    super(scope, id, props);

    // VPC
    const vpc = new ec2.Vpc(this, `${props?.appName}Vpc`, { maxAzs: 2 });

    // Aurora PostgreSQL Database
    const dbSecret = new secretsmanager.Secret(this, `${props?.appName}DbSecret`, {
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'postgres' }),
        generateStringKey: 'password',
        excludeCharacters: '"@/\\',
      },
    });

    const dbCluster = new rds.DatabaseCluster(this, `${props?.appName}AuroraCluster`, {
      engine: rds.DatabaseClusterEngine.auroraPostgres({ version: rds.AuroraPostgresEngineVersion.VER_15_4 }),
      credentials: rds.Credentials.fromSecret(dbSecret),
      instanceProps: {
        instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.MEDIUM),
        vpc,
        vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      },
    });

    // ECS Fargate Service with Load Balancer
      const fargateService = new ecsPatterns.ApplicationLoadBalancedFargateService(this, `${props?.appName}FargateService`, {
      vpc,
      cluster: new ecs.Cluster(this, `${props?.appName}EcsCluster`, { vpc }),
      taskImageOptions: {
        image: ecs.ContainerImage.fromRegistry('nginx:alpine'),
        environment: {
          DATABASE_HOST: dbCluster.clusterEndpoint.hostname,
          DATABASE_PORT: dbCluster.clusterEndpoint.port.toString(),
          DATABASE_NAME: 'contacts',
          DATABASE_SECRET_ARN: dbSecret.secretArn,
        },
      },
      publicLoadBalancer: true,
    });

    // Grant Fargate service access to the database secret
    dbSecret.grantRead(fargateService.taskDefinition.taskRole);
  }

}
