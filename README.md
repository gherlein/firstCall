# First Call

This is my first attempt to grok the Chime SDK.  I intentionally started with just plain Javascript (not typescript) to strip down to the essentials.  I wanted to just make a call from a phone and have the system play back a recording and hang up.  The MOST SIMPLE thing I can do with an IVR.

This project is raw, but it demonstrates a CDK app with an instance of a stack (`FirstCallStack`) deployed with the AWS CDK.  The `cdk.json` file tells the CDK Toolkit how to execute your app. 
See [this useful workshop](https://cdkworkshop.com/20-typescript.html) on working with the AWS CDK for Typescript.  I'll be modifying this to use typescript soon.  Why?  Static typing.

Check out the Makefile.  After setting up your AWS environment (which I will blog about soon) You can just type 

```
make deploy
```

And it will deploy a stack in AWS and output a phone number.  Yes, a real phone number.  You can call that from your cell phone and it will play a recording for you and then hang up.  The output of the deploy looks like this:

```
Outputs:
FirstCallStack.firstCallLambdaARN = arn:aws:lambda:us-west-2:497939524935:function:FirstCallStack-firstCall43FFA0B4-jGoBbvJvD8XG
FirstCallStack.firstCallLambdaLog = /aws/lambda/FirstCallStack-firstCall43FFA0B4-jGoBbvJvD8XG
FirstCallStack.inboundPhoneNumber = +12247040992
```

Go ahead and call that number.  It probably will work, at least for awhile.  

You can watch the logs in CloudWatch, conveniently visible in a terminal by:

```
make watch
```

And if you are curious what the lambda is doing exactly to interact with the Chime SDK services you can test it raw with:

```
make invoke
```

This is really just a learning hack I did to kick the tires.  It does not do anything well, and the code is purely educational-level, if that.  I drew heavily on examples from the AWS blog on [Bridging Call with Amazon Chime SIP Media Applications](https://github.com/aws-samples/amazon-chime-sma-bridging).

More to come!

