import * as cdk from '@aws-cdk/core';
import * as cloudfront from "@aws-cdk/aws-cloudfront";
import * as origins from "@aws-cdk/aws-cloudfront-origins";
import * as s3 from "@aws-cdk/aws-s3";
import * as s3deploy from "@aws-cdk/aws-s3-deployment";
import * as route53 from '@aws-cdk/aws-route53';
import * as targets from '@aws-cdk/aws-route53-targets';
import * as acm from "@aws-cdk/aws-certificatemanager"
import { IHostedZone } from '@aws-cdk/aws-route53';
import { ICertificate } from '@aws-cdk/aws-certificatemanager';


export class Route53Stack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // create a bucket to upload your app files
    const websiteBucket = new s3.Bucket(this, "WebsiteBucket", {
      versioned: true,
    });

    const domainName = "realshow.tk"

    const myzone = route53.HostedZone.fromHostedZoneAttributes(this, "HostedZone", {
      zoneName: domainName,
      hostedZoneId: "Z02203692056KZ9P4QE4R"
    })

    //ssl ceritificate
    const certificate = new acm.DnsValidatedCertificate(this, 'CrossRegionCertificate', {
      domainName: domainName,
      hostedZone: myzone,
      region: 'us-east-1',
    })

    // create a CDN to deploy your website
    const distribution = new cloudfront.Distribution(this, "Distribution", {
      defaultBehavior: {
        origin: new origins.S3Origin(websiteBucket),

      },
      defaultRootObject: "index.html",
      domainNames: [domainName],
      certificate: certificate
    });


    // housekeeping for uploading the data in bucket 
    const deployment = new s3deploy.BucketDeployment(this, "DeployWebsite", {
      sources: [s3deploy.Source.asset("./frontend")],
      destinationBucket: websiteBucket,
      distribution,
      distributionPaths: ["/*"],
    });

    // Adding A(ipv4) record
    const aRecord = new route53.ARecord(this, 'AliasA', {
      zone: myzone,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),

    });

  }
}
