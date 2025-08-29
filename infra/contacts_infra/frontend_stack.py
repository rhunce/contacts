"""
Frontend Infrastructure Stack
AWS CDK Python implementation for frontend hosting
"""

import os
from typing import Optional
from aws_cdk import (
    Stack, RemovalPolicy, CfnOutput,
    aws_s3 as s3,
    aws_cloudfront as cloudfront,
    aws_cloudfront_origins as origins,
    aws_route53 as route53,
    aws_route53_targets as targets,
    aws_certificatemanager as acm,
    aws_iam as iam
)
from constructs import Construct


class FrontendStack(Stack):
    """Frontend infrastructure stack for contacts application"""
    
    def __init__(
        self, 
        scope: Construct, 
        construct_id: str, 
        app_name: str,
        root_domain: Optional[str] = None,
        frontend_subdomain: str = "www",
        **kwargs
    ) -> None:
        super().__init__(scope, construct_id, **kwargs)
        
        self.app_name = app_name
        self.root_domain = root_domain
        self.frontend_subdomain = frontend_subdomain
        
        # S3 bucket for static hosting
        self.bucket = self._create_s3_bucket()
        
        # CloudFront distribution
        self.distribution = self._create_cloudfront_distribution()
        
        # DNS configuration if domain provided
        if self.root_domain:
            self._create_dns_records()
        
        # Create outputs
        self._create_outputs()
    
    def _create_s3_bucket(self) -> s3.Bucket:
        """Create S3 bucket for static hosting"""
        return s3.Bucket(
            self, 
            f"{self.app_name}FrontendBucket",
            bucket_name=f"{self.app_name.lower()}-frontend-{self.account}",
            public_read_access=False,
            block_public_access=s3.BlockPublicAccess.BLOCK_ALL,
            removal_policy=RemovalPolicy.DESTROY,
            auto_delete_objects=True,
            versioned=False,
            encryption=s3.BucketEncryption.S3_MANAGED,
            cors=[
                s3.CorsRule(
                    allowed_methods=[s3.HttpMethods.GET, s3.HttpMethods.HEAD],
                    allowed_origins=["*"],
                    allowed_headers=["*"],
                    max_age=3000
                )
            ]
        )
    
    def _create_cloudfront_distribution(self) -> cloudfront.Distribution:
        """Create CloudFront distribution"""
        
        # Origin Access Identity
        oai = cloudfront.OriginAccessIdentity(
            self, 
            f"{self.app_name}OriginAccessIdentity",
            comment=f"OAI for {self.app_name} frontend"
        )
        self.bucket.grant_read(oai)
        
        # Custom domain configuration
        use_custom_domain = bool(self.root_domain)
        frontend_domain = f"{self.frontend_subdomain}.{self.root_domain}" if use_custom_domain else None
        
        certificate = None
        domain_names = None
        
        if use_custom_domain:
            zone = route53.HostedZone.from_lookup(
                self, 
                f"{self.app_name}FrontendZone",
                domain_name=self.root_domain
            )
            
            # Certificate must be in us-east-1 for CloudFront
            cf_cert = acm.DnsValidatedCertificate(
                self, 
                f"{self.app_name}FrontendCert",
                domain_name=frontend_domain,
                subject_alternative_names=[self.root_domain],
                hosted_zone=zone,
                region="us-east-1"
            )
            certificate = cf_cert
            domain_names = [frontend_domain, self.root_domain]
        
        # Create distribution
        distribution = cloudfront.Distribution(
            self, 
            f"{self.app_name}FrontendDistribution",
            default_behavior=cloudfront.BehaviorOptions(
                origin=origins.S3Origin(
                    self.bucket, 
                    origin_access_identity=oai
                ),
                viewer_protocol_policy=cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                cache_policy=cloudfront.CachePolicy.CACHING_OPTIMIZED,
                origin_request_policy=cloudfront.OriginRequestPolicy.CORS_S3_ORIGIN
            ),
            default_root_object="index.html",
            error_responses=[
                cloudfront.ErrorResponse(
                    http_status=404,
                    response_http_status=200,
                    response_page_path="/index.html"
                ),
                cloudfront.ErrorResponse(
                    http_status=403,
                    response_http_status=200,
                    response_page_path="/index.html"
                )
            ],
            domain_names=domain_names,
            certificate=certificate
        )
        
        return distribution
    
    def _create_dns_records(self) -> None:
        """Create DNS records for custom domain"""
        zone = route53.HostedZone.from_lookup(
            self, 
            f"{self.app_name}FrontendZone2",
            domain_name=self.root_domain
        )
        
        frontend_domain = f"{self.frontend_subdomain}.{self.root_domain}"
        
        # www.contactfolio.com -> distribution
        route53.ARecord(
            self, 
            f"{self.app_name}FrontendAliasWwwA",
            zone=zone,
            record_name=frontend_domain,
            target=route53.RecordTarget.from_alias(
                targets.CloudFrontTarget(self.distribution)
            )
        )
        
        route53.AaaaRecord(
            self, 
            f"{self.app_name}FrontendAliasWwwAAAA",
            zone=zone,
            record_name=frontend_domain,
            target=route53.RecordTarget.from_alias(
                targets.CloudFrontTarget(self.distribution)
            )
        )
        
        # contactfolio.com (apex) -> distribution
        route53.ARecord(
            self, 
            f"{self.app_name}FrontendAliasApexA",
            zone=zone,
            record_name=self.root_domain,
            target=route53.RecordTarget.from_alias(
                targets.CloudFrontTarget(self.distribution)
            )
        )
        
        route53.AaaaRecord(
            self, 
            f"{self.app_name}FrontendAliasApexAAAA",
            zone=zone,
            record_name=self.root_domain,
            target=route53.RecordTarget.from_alias(
                targets.CloudFrontTarget(self.distribution)
            )
        )
    
    def _create_outputs(self) -> None:
        """Create CloudFormation outputs"""
        
        use_custom_domain = bool(self.root_domain)
        frontend_domain = f"{self.frontend_subdomain}.{self.root_domain}" if use_custom_domain else None
        
        CfnOutput(
            self, 
            "FrontendUrl",
            value=(
                f"https://{frontend_domain}" if use_custom_domain 
                else f"https://{self.distribution.distribution_domain_name}"
            ),
            description="Public URL for the Frontend",
            export_name=f"{self.app_name}-frontend-url"
        )
        
        CfnOutput(
            self, 
            "FrontendBucketName",
            value=self.bucket.bucket_name,
            description="S3 Bucket Name for Frontend Files",
            export_name=f"{self.app_name}-frontend-bucket"
        )
        
        CfnOutput(
            self, 
            "CloudFrontDistributionId",
            value=self.distribution.distribution_id,
            description="CloudFront Distribution ID",
            export_name=f"{self.app_name}-cloudfront-distribution-id"
        )
