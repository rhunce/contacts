#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { BackendStack } from '../lib/backend-stack';
import { FrontendStack } from '../lib/frontend-stack';

const app = new cdk.App();

// Validate required environment variables
const account = process.env.CDK_DEFAULT_ACCOUNT;
const region = process.env.CDK_DEFAULT_REGION;
const appName = process.env.APP_NAME;

if (!account || !region || !appName) {
  const missingVars = [];
  if (!account) missingVars.push('CDK_DEFAULT_ACCOUNT');
  if (!region) missingVars.push('CDK_DEFAULT_REGION');
  if (!appName) missingVars.push('APP_NAME'); 
  throw new Error(`Required environment variables are not set: ${missingVars.join(', ')}`);
}

// Create backend stack
const backendStack = new BackendStack(app, `${appName}BackendStack`, {
  env: {
    account,
    region
  },
  appName
});

// Create frontend stack
const frontendStack = new FrontendStack(app, `${appName}FrontendStack`, {
  env: {
    account,
    region
  },
  appName
});

// Add dependency: frontend depends on backend
frontendStack.addDependency(backendStack);

// app.synth();