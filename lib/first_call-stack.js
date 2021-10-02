//  “Copyright Amazon.com Inc. or its affiliates.” 

"use strict";
exports.FirstCallStack = void 0;
const cdk = require("@aws-cdk/core");
const s3 = require("@aws-cdk/aws-s3");
const s3deploy = require("@aws-cdk/aws-s3-deployment");
const iam = require("@aws-cdk/aws-iam");
const lambda = require("@aws-cdk/aws-lambda");
const core_1 = require("@aws-cdk/core");
const custom = require("@aws-cdk/custom-resources");
const aws_lambda_event_sources_1 = require("@aws-cdk/aws-lambda-event-sources");

class FirstCallStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);

	// create a bucket for the recorded wave files and set the right policies
        const wavFiles = new s3.Bucket(this, 'wavFiles', {
            publicReadAccess: false,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true
        });
        const wavFileBucketPolicy = new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
                's3:GetObject',
                's3:PutObject',
                's3:PutObjectAcl'
            ],
            resources: [
                wavFiles.bucketArn,
                `${wavFiles.bucketArn}/*`
            ],
            sid: 'SIPMediaApplicationRead',
        });
        wavFileBucketPolicy.addServicePrincipal('voiceconnector.chime.amazonaws.com');
        wavFiles.addToResourcePolicy(wavFileBucketPolicy);
        new s3deploy.BucketDeployment(this, 'WavDeploy', {
            sources: [s3deploy.Source.asset('./wav_files')],
            destinationBucket: wavFiles,
            contentType: 'audio/wav'
        });
        const smaLambdaRole = new iam.Role(this, 'smaLambdaRole', {
            assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
        });
        smaLambdaRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole"));

	// create the lambda function that does the call
        const firstCall = new lambda.Function(this, 'firstCall', {
            code: lambda.Code.fromAsset("src", { exclude: ["**", "!firstCall.js"] }),
            handler: 'firstCall.handler',
            runtime: lambda.Runtime.NODEJS_14_X,
            environment: {
                WAVFILE_BUCKET: wavFiles.bucketName,
            },
            role: smaLambdaRole,
            timeout: core_1.Duration.seconds(60)
        });
        const chimeCreateRole = new iam.Role(this, 'createChimeLambdaRole', {
            assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
            inlinePolicies: {
                ['chimePolicy']: new iam.PolicyDocument({ statements: [new iam.PolicyStatement({
                            resources: ['*'],
                            actions: ['chime:*',
                                'lambda:GetPolicy',
                                'lambda:AddPermission']
                        })] })
            },
            managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole")]
        });


	// create the lambda for CDK custom resource to deploy SMA, etc.
        const createSMALambda = new lambda.Function(this, 'createSMALambda', {
            code: lambda.Code.fromAsset("src", { exclude: ["**", "!createChimeResources.py"] }),
            handler: 'createChimeResources.on_event',
            runtime: lambda.Runtime.PYTHON_3_8,
            role: chimeCreateRole,
            timeout: core_1.Duration.seconds(60)
        });
        const chimeProvider = new custom.Provider(this, 'chimeProvider', {
            onEventHandler: createSMALambda
        });
        const inboundSMA = new core_1.CustomResource(this, 'inboundSMA', {
            serviceToken: chimeProvider.serviceToken,
            properties: { 'lambdaArn': firstCall.functionArn,
                'region': this.region,
                'smaName': this.stackName + '-inbound',
                'ruleName': this.stackName + '-inbound',
                'createSMA': true,
                'smaID': '',
                'phoneNumberRequired': true }
        });
        const inboundPhoneNumber = inboundSMA.getAttString('phoneNumber');
        new cdk.CfnOutput(this, 'inboundPhoneNumber', { value: inboundPhoneNumber });
	new cdk.CfnOutput(this, 'firstCallLambdaLog', { value: firstCall.logGroup.logGroupName });
	new cdk.CfnOutput(this, 'firstCallLambdaARN', { value: firstCall.functionArn });
    }
}
exports.FirstCallStack = FirstCallStack;
