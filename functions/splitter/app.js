const aws = require("aws-sdk");
const sqs = new aws.SQS();
const dynamo = new aws.DynamoDB.DocumentClient()
const MessagesTableName = process.env.MESSAGES_TABLE
const BatchQueueUrl = process.env.BATCH_QUEUE

exports.handler = async (event, context) => {
    var collectionId = event["collection_id"];
    var batchSize = event["batch_size"];
    var exclusiveStartKey;
    var result;
    do {
        result = await dynamo.query({
            TableName: MessagesTableName,
            KeyConditionExpression: 'CollectionId = :collection_id',
            ExpressionAttributeValues: {
                ':collection_id': collectionId,
            },
            Limit: batchSize,
            ExclusiveStartKey: exclusiveStartKey
        }).promise();

        await sqs.sendMessage({
            QueueUrl: BatchQueueUrl,
            MessageBody: JSON.stringify({
                messages: result.Items.map(item => {
                    return {
                        id: item.MessageId,
                        message: item.Message
                    };
                }),
                collectionId: collectionId,
                batchId: exclusiveStartKey ? exclusiveStartKey.MessageId : "firstBatch"
            })
        }).promise();
        exclusiveStartKey = result.LastEvaluatedKey;
    } while (result.LastEvaluatedKey);
};
