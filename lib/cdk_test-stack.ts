import {
    IResource,
    LambdaIntegration,
    MockIntegration,
    PassthroughBehavior,
    RestApi,
} from 'aws-cdk-lib/aws-apigateway';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { App, Stack, RemovalPolicy } from 'aws-cdk-lib';
import {
    NodejsFunction,
    NodejsFunctionProps,
} from 'aws-cdk-lib/aws-lambda-nodejs';

import { join } from 'path';

export class ApiLambdaCrudDynamoDBStack extends Stack {
    private static instance: ApiLambdaCrudDynamoDBStack;
    public readonly customerTable: Table;
    public readonly customerUserTable: Table;
    public readonly customerUserLambda: NodejsFunction;
    public readonly api: RestApi;

    private constructor(app: App, id: string) {
        super(app, id);

        // DynamoDB tables
        this.customerTable = new Table(this, 'customerTable', {
            partitionKey: { name: 'id', type: AttributeType.STRING },
            tableName: 'customerTable',
            removalPolicy: RemovalPolicy.DESTROY,
        });

        this.customerUserTable = new Table(this, 'customerUserTable', {
            partitionKey: { name: 'id', type: AttributeType.STRING },
            tableName: 'customerUserTable',
            removalPolicy: RemovalPolicy.DESTROY,
        });

        const nodeJsFunctionProps: NodejsFunctionProps = {
            bundling: {
                externalModules: [
                    'aws-sdk', // Use the 'aws-sdk' available in the Lambda runtime
                ],
            },
            // depsLockFilePath: join(__dirname, 'lambdas', 'package-lock.json'),
            environment: {
                CUSTOMER_TABLE_NAME: this.customerTable.tableName,
                CUSTOMER_USER_TABLE_NAME: this.customerUserTable.tableName,
            },
            runtime: Runtime.NODEJS_16_X,
        };

        // Lambda function
        this.customerUserLambda = new NodejsFunction(
            this,
            'customerUserLambda',
            {
                entry: join(__dirname, '../', 'lambdas', 'index.ts'),
                ...nodeJsFunctionProps,
            },
        );

        // Grant the lambda role read/write permissions to our table
        this.customerTable.grantReadWriteData(this.customerUserLambda);
        this.customerUserTable.grantReadWriteData(this.customerUserLambda);

        // API Gateway
        this.api = new RestApi(this, 'customerUserApi', {
            restApiName: 'Customer User Service',
        });

        const customerResource = this.api.root.addResource('customer');
        const userResource = customerResource.addResource('user');

        const lambdaIntegration = new LambdaIntegration(
            this.customerUserLambda,
        );

        // API Gateway methods
        customerResource.addMethod('POST', lambdaIntegration);
        customerResource.addMethod('GET', lambdaIntegration);
        customerResource.addMethod('PUT', lambdaIntegration);
        customerResource.addMethod('DELETE', lambdaIntegration);

        userResource.addMethod('POST', lambdaIntegration);
        userResource.addMethod('GET', lambdaIntegration);
        userResource.addMethod('PUT', lambdaIntegration);
        userResource.addMethod('DELETE', lambdaIntegration);

        addCorsOptions(customerResource);
        addCorsOptions(userResource);
    }
    public static getInstance(
        app: App,
        id: string,
    ): ApiLambdaCrudDynamoDBStack {
        if (!ApiLambdaCrudDynamoDBStack.instance) {
            ApiLambdaCrudDynamoDBStack.instance =
                new ApiLambdaCrudDynamoDBStack(app, id);
        }
        return ApiLambdaCrudDynamoDBStack.instance;
    }
}

function addCorsOptions(apiResource: IResource) {
    apiResource.addMethod(
        'OPTIONS',
        new MockIntegration({
            // In case you want to use binary media types, uncomment the following line
            // contentHandling: ContentHandling.CONVERT_TO_TEXT,
            integrationResponses: [
                {
                    statusCode: '200',
                    responseParameters: {
                        'method.response.header.Access-Control-Allow-Headers':
                            "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
                        'method.response.header.Access-Control-Allow-Origin':
                            "'*'",
                        'method.response.header.Access-Control-Allow-Credentials':
                            "'false'",
                        'method.response.header.Access-Control-Allow-Methods':
                            "'OPTIONS,GET,PUT,POST,DELETE'",
                    },
                },
            ],
            // In case you want to use binary media types, comment out the following line
            passthroughBehavior: PassthroughBehavior.NEVER,
            requestTemplates: {
                'application/json': '{"statusCode": 200}',
            },
        }),
        {
            methodResponses: [
                {
                    statusCode: '200',
                    responseParameters: {
                        'method.response.header.Access-Control-Allow-Headers':
                            true,
                        'method.response.header.Access-Control-Allow-Methods':
                            true,
                        'method.response.header.Access-Control-Allow-Credentials':
                            true,
                        'method.response.header.Access-Control-Allow-Origin':
                            true,
                    },
                },
            ],
        },
    );
}
