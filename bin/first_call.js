#!/usr/bin/env node
const cdk = require('@aws-cdk/core');
const { FirstCallStack } = require('../lib/first_call-stack');

const app = new cdk.App();
new FirstCallStack(app, 'FirstCallStack');
