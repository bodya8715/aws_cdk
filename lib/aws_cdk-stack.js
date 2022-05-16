const cdk = require('aws-cdk-lib');
const s3 = require('aws-cdk-lib/aws-s3');
const s3deploy = require('aws-cdk-lib/aws-s3-deployment');
const path = require('path');
const cloudfront = require('aws-cdk-lib/aws-cloudfront');
const origins = require('aws-cdk-lib/aws-cloudfront-origins');
const iam = require('aws-cdk-lib/aws-iam');

class AwsCdkStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // Create S3 Bucket
    const publicAssets = new s3.Bucket(this, 'MyFirstBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      blockPublicAccess: new s3.BlockPublicAccess({ restrictPublicBuckets: false }),
      publicReadAccess: true,
      autoDeleteObjects: true
    });

    // Add bucket policy
    const bucketPolicy = new iam.PolicyStatement({
      actions: ['s3:GetObject'],
      resources: [
        `${publicAssets.bucketArn}/*`
      ],
      principals: [new iam.Anyone()],
    })

    //Add the policy to bucket
    publicAssets.addToResourcePolicy(bucketPolicy);

    const distribution = new cloudfront.CloudFrontWebDistribution(this, 'MyDistribution', {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: publicAssets,
          },
          behaviors: [{ isDefaultBehavior: true }]
        }
      ]
    });
          
    new s3deploy.BucketDeployment(
      this,
      `client-analytics-bucket-deployment`,
      {
        sources: [s3deploy.Source.asset(path.join(__dirname, '../files'))],
        destinationBucket: publicAssets,
        distribution
      }
    );
  }
}

module.exports = { AwsCdkStack };
