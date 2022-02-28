const aws = require("aws-sdk");
const dynamo = new aws.DynamoDB.DocumentClient()
const MessagesTableName = process.env.MESSAGES_TABLE
const BatchQueueName = process.env.BATCH_QUEUE

exports.handler = async (event, context) => {
    collectionId = event["collection_id"];
    result = await dynamo.query({
        TableName: MessagesTableName,
        KeyConditionExpression: 'CollectionId = :collection_id',
        ExpressionAttributeValues: {
            ':collection_id': collectionId,
        },
        Limit: 20,
    }).promise()
    return result;
};
