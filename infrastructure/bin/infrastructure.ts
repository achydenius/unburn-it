#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from '@aws-cdk/core'
import InfrastructureStack from '../lib/infrastructure-stack'

const domainName = 'unburn.it'
const devSubdomain = 'dev'

const app = new cdk.App()
const assetDirectory = app.node.tryGetContext('assets')

if (!process.env.CDK_DEFAULT_ACCOUNT || !process.env.CDK_DEFAULT_REGION) {
  throw Error(
    'CDK_DEFAULT_ACCOUNT and CDK_DEFAULT_REGION env variables need to be defined!'
  )
}

if (!assetDirectory) {
  throw Error('assets context variable needs to be defined!')
}

const config = {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  domainName,
  assetDirectory,
}

new InfrastructureStack(app, 'InfrastructureStack-dev', {
  ...config,
  subdomain: devSubdomain,
})
new InfrastructureStack(app, 'InfrastructureStack-prod', {
  ...config,
})
