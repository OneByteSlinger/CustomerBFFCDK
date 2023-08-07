import customerUserStackSingleton from '../bin/cdk_test';
import {
    DynamoDBClient,
    PutItemCommand,
    GetItemCommand,
    UpdateItemCommand,
    DeleteItemCommand,
} from '@aws-sdk/client-dynamodb';

export async function customerService(httpMethod: string, event: any) {
    const ddbClient = new DynamoDBClient({ region: 'eu-west-1' });

    const item = {
        Id: { S: event.id },
        Name: { S: event.name },
        Description: { S: event.description },
        Sector: { S: event.sector },
        Users: { L: event.users },
        StatusHistory: { L: event.statusHistory },
        DateCreated: { S: event.dateCreated },
        DateModified: { S: event.dateModified },
    };

    const params = {
        TableName: customerUserStackSingleton.customerTable.tableName,
        Key: { Id: { S: event.Id } },
        Item: item,
    };
    try {
        switch (httpMethod) {
            case 'POST': // Create Customer
                const putCommand = new PutItemCommand(params);
                const putResponse = await ddbClient.send(putCommand);
                return putResponse;

            case 'GET': // Get Customer
                const getCommand = new GetItemCommand({
                    TableName: params.TableName,
                    Key: params.Key,
                });
                const getResponse = await ddbClient.send(getCommand);
                return getResponse;

            case 'PUT': // Update Customer
                const updateCommand = new UpdateItemCommand(params);
                const updateResponse = await ddbClient.send(updateCommand);
                return updateResponse;

            case 'DELETE': // Delete Customer
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
