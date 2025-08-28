#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { BackendStack } from '../lib/backend-stack';
import { FrontendStack } from '../lib/frontend-stack';

const app = new cdk.App();

const account = process.env.CDK_DEFAULT_ACCOUNT;
const region = process.env.CDK_DEFAULT_REGION;
const appName = process.env.APP_NAME;
const rootDomain = process.env.ROOT_DOMAIN;

if (!account || !region || !appName || !rootDomain) {
  const missing: string[] = [];
  if (!account) missing.push('CDK_DEFAULT_ACCOUNT');
  if (!region) missing.push('CDK_DEFAULT_REGION');
  if (!appName) missing.push('APP_NAME');
  if (!rootDomain) missing.push('ROOT_DOMAIN');
  throw new Error(`Missing env vars: ${missing.join(', ')}`);
}

const backendStack = new BackendStack(app, `${appName}BackendStack`, {
  env: { account, region },
  appName,
  rootDomain
});

const frontendStack = new FrontendStack(app, `${appName}FrontendStack`, {
  env: { account, region },
  appName,
  rootDomain,
  frontendSubdomain: 'www'
});

frontendStack.addDependency(backendStack);
