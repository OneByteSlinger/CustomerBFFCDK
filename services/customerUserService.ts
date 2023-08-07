import customerUserStackSingleton from '../bin/cdk_test';
import {
    DynamoDBClient,
    PutItemCommand,
    GetItemCommand,
    UpdateItemCommand,
    DeleteItemCommand,
} from '@aws-sdk/client-dynamodb';

export async function customerUserService(httpMethod: string, event: any) {
    const ddbClient = new DynamoDBClient({ region: 'eu-west-1' });

    const item = {
        Id: { S: event.id },
        CustomerId: { S: event.customerId },
        Firstname: { S: event.firstName },
        Lastname: { S: event.lastName },
        Email: { S: event.email },
        PhoneNumber: { S: event.phoneNumber },
        JobRole: { S: event.jobRole },
        Status: {
            M: {
                Invited: {
                    M: {
                        Value: { BOOL: event.status.invited.value },
                        Description: {
                            S: event.status.invited.description,
                        },
                        Date: { S: event.status.invited.date },
                    },
                },
                Active: {
                    M: {
                        Value: { BOOL: event.status.active.value },
                        Description: {
                            S: event.status.active.description,
                        },
                        Date: { S: event.status.active.date },
                    },
                },
                Deactivated: {
                    M: {
                        Value: { BOOL: event.status.deactivated.value },
                        Description: {
                            S: event.status.deactivated.description,
                        },
                        Date: { S: event.status.deactivated.date },
                    },
                },
            },
        },
        AgreedToPrivacyPolicy: { BOOL: event.agreedToPrivacyPolicy },
        AgreedToTermsAndConditions: {
            BOOL: event.agreedToTermsAndConditions,
        },
        Steers: { L: event.steers },
        DateCreated: { S: event.dateCreated },
        DateModified: { S: event.dateModified },
    };

    const params = {
        TableName: customerUserStackSingleton.customerUserTable.tableName,
        Key: { Id: { S: event.Id } },
        Item: item,
    };
    try {
        switch (httpMethod) {
            case 'POST': // Create Customer User
                const putCommand = new PutItemCommand(params);
                const putResponse = await ddbClient.send(putCommand);
                return putResponse;

            case 'GET': // Get Customer User
                const getCommand = new GetItemCommand({
                    TableName: params.TableName,
                    Key: params.Key,
                });
                const getResponse = await ddbClient.send(getCommand);
                return getResponse;

            case 'PUT': // Update Customer User
                const updateCommand = new UpdateItemCommand(params);
                const updateResponse = await ddbClient.send(updateCommand);
                return updateResponse;

            case 'DELETE': // Delete Customer User
                const deleteCommand = new DeleteItemCommand({
                    TableName: params.TableName,
                    Key: params.Key,
                });
                const deleteResponse = await ddbClient.send(deleteCommand);
                return deleteResponse;

            default:
                return { statusCode: 400, body: 'Invalid HTTP Method' };
        }
    } catch (error) {
        console.error(error);
    }
}
