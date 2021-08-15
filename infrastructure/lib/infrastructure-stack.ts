import * as cdk from '@aws-cdk/core'
import * as route53 from '@aws-cdk/aws-route53'
import * as s3 from '@aws-cdk/aws-s3'
import * as s3Deployment from '@aws-cdk/aws-s3-deployment'
import * as acm from '@aws-cdk/aws-certificatemanager'
import * as targets from '@aws-cdk/aws-route53-targets'
import * as cloudfront from '@aws-cdk/aws-cloudfront'
import * as iam from '@aws-cdk/aws-iam'

export interface InfrastructureProps {
  env: {
    account: string
    region: string
  }
  domainName: string
  assetDirectory: string
  subdomain?: string
}

export default class InfrastructureStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: InfrastructureProps) {
    super(scope, id, { env: props.env })

    const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
      domainName: props.domainName,
    })
    const domain = `${props.subdomain ? `${props.subdomain}.` : ''}${
      props.domainName
    }`
    const originAccessIdentity = new cloudfront.OriginAccessIdentity(
      this,
      'OriginAccessIdentity'
    )
    new cdk.CfnOutput(this, 'SiteUrl', { value: `https://${domain}` })

    const bucket = new s3.Bucket(this, 'Bucket', {
      bucketName: domain,
      websiteIndexDocument: 'index.html',
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    })

    bucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ['s3:GetObject'],
        resources: [bucket.arnForObjects('*')],
        principals: [
          new iam.CanonicalUserPrincipal(
            originAccessIdentity.cloudFrontOriginAccessIdentityS3CanonicalUserId
          ),
        ],
      })
    )
    new cdk.CfnOutput(this, 'BucketName', { value: bucket.bucketName })

    const certificate = new acm.DnsValidatedCertificate(this, 'Certificate', {
      domainName: domain,
      hostedZone,
      region: 'us-east-1',
    })
    new cdk.CfnOutput(this, 'CertificateArn', {
      value: certificate.certificateArn,
    })

    const viewerCertificate = cloudfront.ViewerCertificate.fromAcmCertificate(
      certificate,
      {
        sslMethod: cloudfront.SSLMethod.SNI,
        securityPolicy: cloudfront.SecurityPolicyProtocol.TLS_V1_1_2016,
        aliases: [domain],
      }
    )

    const distribution = new cloudfront.CloudFrontWebDistribution(
      this,
      'Distribution',
      {
        viewerCertificate,
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: bucket,
              originAccessIdentity,
            },
            behaviors: [
              {
                isDefaultBehavior: true,
                compress: true,
                allowedMethods:
                  cloudfront.CloudFrontAllowedMethods.GET_HEAD_OPTIONS,
              },
            ],
          },
        ],
      }
    )
    new cdk.CfnOutput(this, 'DistributionId', {
      value: distribution.distributionId,
    })

    new route53.ARecord(this, 'SiteAliasRecord', {
      recordName: domain,
      target: route53.RecordTarget.fromAlias(
        new targets.CloudFrontTarget(distribution)
      ),
      zone: hostedZone,
    })

    new s3Deployment.BucketDeployment(this, 'DeployWithInvalidation', {
      sources: [s3Deployment.Source.asset(props.assetDirectory)],
      destinationBucket: bucket,
      distribution,
      distributionPaths: ['/*'],
      memoryLimit: 512,
    })
  }
}
