import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
// import * as path from "path";

interface ContactsStackProps extends cdk.StackProps {
  appName: string;
}

export class ContactsStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: ContactsStackProps) {
    super(scope, id, props);

    // VPC
    const vpc = new ec2.Vpc(this, `${props.appName}Vpc`, { maxAzs: 2 });

    // Aurora PostgreSQL Database
    const dbSecret = new secretsmanager.Secret(this, `${props.appName}DbSecret`, {
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'postgres' }),
        generateStringKey: 'password',
        excludeCharacters: '"@/\\',
      },
    });

    const dbSecurityGroup = new ec2.SecurityGroup(this, `${props!.appName}DbSecurityGroup`, { vpc });

    const dbCluster = new rds.DatabaseCluster(this, `${props!.appName}Aurora`, {
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_15_4,
      }),
      credentials: rds.Credentials.fromSecret(dbSecret),
      defaultDatabaseName: `${props!.appName}Db`,
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      securityGroups: [dbSecurityGroup],
      writer: rds.ClusterInstance.serverlessV2("writer"),
      // readers: [rds.ClusterInstance.serverlessV2("reader")], // optional
      serverlessV2MinCapacity: 0.5,
      serverlessV2MaxCapacity: 2,
      // TODO: Below prop values used for dev only
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      deletionProtection: false
    });

    // const sessionSecret = new secretsmanager.Secret(this, `${props.appName}SessionSecret`);

    // ECS Fargate Service with Load Balancer
    const fargateService = new ecsPatterns.ApplicationLoadBalancedFargateService(this, `${props.appName}FargateService`, {
      cluster: new ecs.Cluster(this, `${props.appName}EcsCluster`, { vpc }),
      publicLoadBalancer: true,
      taskImageOptions: {
        image: ecs.ContainerImage.fromRegistry('nginx:alpine'), // TODO: change this to the actual backend image once BE built
        containerPort: 80,
        // TODO: Uncomment below when BE actually built
        // environment: {
        //   NODE_ENV: "production",
        //   WEB_ORIGIN: "https://your-frontend.vercel.app", // TODO: change this to the actual frontend URL
        // },
        // // Sensitive values: inject as secrets
        // secrets: {
        //   PGHOST: ecs.Secret.fromSecretsManager(dbCluster.secret!, "host"),
        //   PGPORT: ecs.Secret.fromSecretsManager(dbCluster.secret!, "port"),
        //   PGUSER: ecs.Secret.fromSecretsManager(dbCluster.secret!, "username"),
        //   PGPASSWORD: ecs.Secret.fromSecretsManager(dbCluster.secret!, "password"),
        //   PGDATABASE: ecs.Secret.fromSecretsManager(dbCluster.secret!, "dbname"),
        //   SESSION_SECRET: ecs.Secret.fromSecretsManager(sessionSecret)
        // },
      },
    });

    // TODO: Change path later when BE actually built
    // Configure health check
    fargateService.targetGroup.configureHealthCheck({ path: "/" }); // nginx will 200 at “/”

    // Allow ECS tasks to connect to the database
    dbCluster.connections.allowDefaultPortFrom(fargateService.service, 'ECS tasks to Aurora');
    // Secrets must be readable by BOTH the task role AND the *execution* role:
    dbCluster.secret!.grantRead(fargateService.taskDefinition.taskRole);
    dbCluster.secret!.grantRead(fargateService.taskDefinition.executionRole!);
    // sessionSecret.grantRead(fargateService.taskDefinition.taskRole);
    // sessionSecret.grantRead(fargateService.taskDefinition.executionRole!);

    new cdk.CfnOutput(this, "AlbUrl", {
      value: `http://${fargateService.loadBalancer.loadBalancerDnsName}`,
    });

  }

}
