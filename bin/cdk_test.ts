#!/usr/bin/env node
import 'source-map-support/register';
import { ApiLambdaCrudDynamoDBStack } from '../lib/cdk_test-stack';
import { App } from 'aws-cdk-lib';

const app = new App();
const apiLambdaCrudDynamoDBStackSingleton =
    ApiLambdaCrudDynamoDBStack.getInstance(app, 'ApiLambdaCrudDynamoDBExample');

export default apiLambdaCrudDynamoDBStackSingleton;
