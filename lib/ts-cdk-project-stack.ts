import { Construct } from 'constructs';
import { Distribution } from 'aws-cdk-lib/aws-cloudfront'
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins'
import { StringParameter } from 'aws-cdk-lib/aws-ssm'

import { 
  Stack, 
  StackProps, 
  CfnOutput, 
  RemovalPolicy,
  Duration
 } from 'aws-cdk-lib';


import { 
  Vpc, 
  SubnetType,
  InstanceClass,
  InstanceType,
  InstanceSize,
 } from 'aws-cdk-lib/aws-ec2';
import { 
  Bucket, 
  BucketEncryption,
 } from 'aws-cdk-lib/aws-s3';
import { 
  DatabaseInstance, 
  DatabaseInstanceEngine, 
  PostgresEngineVersion,
  Credentials,
 } from 'aws-cdk-lib/aws-rds'
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class TsCdkProjectStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const vpc = new Vpc(this, 'MainVpc',{
      cidr: '176.16.0.0/16',
      maxAzs: 2,
        subnetConfiguration:  [
          {
            cidrMask: 24,
            name: 'public',
            subnetType: SubnetType.PUBLIC
          },
          {
            cidrMask: 24,
            name: 'isolated',
            subnetType: SubnetType.PRIVATE_ISOLATED,
          }
        ]
      });

    const s3Bucket = new Bucket(this, 's3-bucket', {
      bucketName: 'mauricio-growth-days-2022',
      publicReadAccess: false,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      websiteIndexDocument: 'index.html',
      encryption: BucketEncryption.S3_MANAGED,
    });

    const CDN = new Distribution(this, 'CDN', {
      defaultBehavior: { origin: new S3Origin(s3Bucket) },
    });


    // PGSQL Instance
    const RDSInstance = new DatabaseInstance(this, 'db-instance', {
      vpc,
      vpcSubnets: {
        subnetType: SubnetType.PRIVATE_ISOLATED,
      },
      engine: DatabaseInstanceEngine.postgres({
        version: PostgresEngineVersion.VER_14_2,
      }),
      instanceType: InstanceType.of(
        InstanceClass.BURSTABLE3,
        InstanceSize.MICRO,
      ),
      credentials: Credentials.fromGeneratedSecret('pgadmin'),
      multiAz: false,
      allocatedStorage: 100,
      maxAllocatedStorage: 105,
      allowMajorVersionUpgrade: false,
      autoMinorVersionUpgrade: true,
      backupRetention: Duration.days(0),
      deleteAutomatedBackups: true,
      removalPolicy: RemovalPolicy.DESTROY,
      deletionProtection: false,
      databaseName: 'growthdaysdb',
      publiclyAccessible: false,
    });

    // Outputs
    new CfnOutput(this, 'WebAppURL', {
      value: 'https://' + s3Bucket.bucketDomainName + '/index.html',
      description: 'The URL of our web app',
      exportName: 'WebAppURL',
    });

    new CfnOutput(this, 'DistributionID', {
      value: CDN.distributionId,
      description: 'CloudFront distribution id',
      exportName: 'DistributionID',
    });

    new CfnOutput(this, 'DistributionDomain', {
      value: CDN.distributionDomainName,
      description: 'CloudFront distribution Domain',
      exportName: 'DistributionDomain',
    });

    new CfnOutput(this, 'DBSecretName', {
      value: RDSInstance.secret?.secretName!,
    });
  }
}
