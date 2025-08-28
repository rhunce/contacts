import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';

interface FrontendStackProps extends cdk.StackProps {
  appName: string;
  rootDomain: string;
  frontendSubdomain?: string;
}

export class FrontendStack extends cdk.Stack {
  public readonly distribution: cloudfront.Distribution;
  public readonly bucket: s3.Bucket;

  constructor(scope: cdk.App, id: string, props: FrontendStackProps) {
    super(scope, id, props);

    // S3 bucket for static assets
    this.bucket = new s3.Bucket(this, `${props.appName}FrontendBucket`, {
      bucketName: `${props.appName.toLowerCase()}-frontend-${this.account}`,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // OAI so CloudFront can read the bucket
    const oai = new cloudfront.OriginAccessIdentity(this, `${props.appName}OriginAccessIdentity`, {
      comment: `OAI for ${props.appName} frontend`,
    });
    this.bucket.grantRead(oai);

    // --- Custom domain ---
    const useCustomDomain = !!props.rootDomain;
    const frontendSub = props.frontendSubdomain ?? 'www';
    const frontendDomain = useCustomDomain ? `${frontendSub}.${props.rootDomain}` : undefined;

    let certificate: acm.ICertificate | undefined;
    let domainNames: string[] | undefined;

    if (useCustomDomain) {
      const zone = route53.HostedZone.fromLookup(this, `${props.appName}FrontendZone`, {
        domainName: props.rootDomain!,
      });

      // For CloudFront the certificate MUST be in us-east-1
      const cfCert = new acm.DnsValidatedCertificate(this, `${props.appName}FrontendCert`, {
        domainName: frontendDomain!,                       // www.contactfolio.com
        subjectAlternativeNames: [props.rootDomain!],      // contactfolio.com (apex also valid)
        hostedZone: zone,
        region: 'us-east-1',
      });
      certificate = cfCert;
      domainNames = [frontendDomain!, props.rootDomain!];  // serve both www + apex
    }

    // CloudFront distribution
    this.distribution = new cloudfront.Distribution(this, `${props.appName}FrontendDistribution`, {
      defaultBehavior: {
        origin: new origins.S3Origin(this.bucket, { originAccessIdentity: oai }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        originRequestPolicy: cloudfront.OriginRequestPolicy.CORS_S3_ORIGIN,
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        { httpStatus: 404, responseHttpStatus: 200, responsePagePath: '/index.html' },
        { httpStatus: 403, responseHttpStatus: 200, responsePagePath: '/index.html' },
      ],
      ...(useCustomDomain ? { domainNames, certificate } : {}),
    });

    // DNS alias records (A/AAAA) for www and apex -> CloudFront
    if (useCustomDomain) {
      const zone = route53.HostedZone.fromLookup(this, `${props.appName}FrontendZone2`, {
        domainName: props.rootDomain!,
      });

      // www.contactfolio.com -> distribution
      new route53.ARecord(this, `${props.appName}FrontendAliasWwwA`, {
        zone,
        recordName: frontendDomain!, // full name allowed
        target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(this.distribution)),
      });
      new route53.AaaaRecord(this, `${props.appName}FrontendAliasWwwAAAA`, {
        zone,
        recordName: frontendDomain!,
        target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(this.distribution)),
      });

      // contactfolio.com (apex) -> distribution
      new route53.ARecord(this, `${props.appName}FrontendAliasApexA`, {
        zone,
        recordName: props.rootDomain!,
        target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(this.distribution)),
      });
      new route53.AaaaRecord(this, `${props.appName}FrontendAliasApexAAAA`, {
        zone,
        recordName: props.rootDomain!,
        target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(this.distribution)),
      });
    }

    // Outputs
    new cdk.CfnOutput(this, 'FrontendUrl', {
      value: useCustomDomain ? `https://${frontendDomain}` : `https://${this.distribution.distributionDomainName}`,
      description: 'Public URL for the Frontend',
      exportName: `${props.appName}-frontend-url`,
    });

    new cdk.CfnOutput(this, 'FrontendBucketName', {
      value: this.bucket.bucketName,
      description: 'S3 Bucket Name for Frontend Files',
      exportName: `${props.appName}-frontend-bucket`,
    });

    new cdk.CfnOutput(this, 'CloudFrontDistributionId', {
      value: this.distribution.distributionId,
      description: 'CloudFront Distribution ID',
      exportName: `${props.appName}-cloudfront-distribution-id`,
    });
  }
}
