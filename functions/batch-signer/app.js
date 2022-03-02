const crypto = require("crypto");
const aws = require("aws-sdk");
const { assert } = require("console");
const sqs = new aws.SQS();
const dynamo = new aws.DynamoDB.DocumentClient()
const MessagesTableName = process.env.MESSAGES_TABLE
const KeysTableName = process.env.KEYS_TABLE
const BatchQueueUrl = process.env.BATCH_QUEUE

exports.handler = async (event, context) => {
    var pubKey = event["public_key"];
    var keyResponse = await dynamo.get({
        TableName: KeysTableName,
        Key: {
            PubKey: pubKey
        }
    }).promise();
    var privKey = Buffer.from(keyResponse.Item.PrivKey, 'hex');

    var batchResponse = await sqs.receiveMessage({
        QueueUrl: BatchQueueUrl
    }).promise();

    if (!batchResponse.Messages?.length) {
        return false
        // TODO: consider send to DLQ when length > 1 which is not expected.
    }
    
    var sqsMessage = batchResponse.Messages[0];
    var body = JSON.parse(sqsMessage.Body);
    var collectionId = body.collectionId;
    await Promise.all(body.messages.map(async item => {
        let messageId = item.id;
        let message = item.message;
        let messageBuffer = Buffer.from(message, 'hex');
        let signature = crypto.sign('SHA384', messageBuffer, {
            key: privKey,
            format: 'der',
            type: 'pkcs8'
        });

        await dynamo.put({
            TableName: MessagesTableName,
            Item: {
                CollectionId: collectionId,
                MessageId: messageId,
                Message: message,
                Signature: signature.toString('hex'),
                signingKey: pubKey
            }
        }).promise();
    }));

    await sqs.deleteMessage({
        QueueUrl: BatchQueueUrl,
        ReceiptHandle: sqsMessage.ReceiptHandle
    }).promise();
    return true;
};
