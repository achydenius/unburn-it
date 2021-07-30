#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from '@aws-cdk/core'
import InfrastructureStack from '../lib/infrastructure-stack'

const devSubdomain = 'dev'

if (
  !process.env.CDK_DEFAULT_ACCOUNT ||
  !process.env.CDK_DEFAULT_REGION ||
  !process.env.DOMAIN_NAME
) {
  throw Error(
    'CDK_DEFAULT_ACCOUNT, CDK_DEFAULT_REGION and DOMAIN_NAME need to be defined!'
  )
}

const config = {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  domainName: process.env.DOMAIN_NAME,
}

const app = new cdk.App()
new InfrastructureStack(app, 'InfrastructureStack-dev', {
  ...config,
  subdomain: devSubdomain,
  assetDirectory: '../main/dist',
})
new InfrastructureStack(app, 'InfrastructureStack-prod', {
  ...config,
  assetDirectory: '../placeholder',
})
