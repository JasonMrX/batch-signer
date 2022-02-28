const crypto = require("crypto");
const aws = require("aws-sdk");
const dynamo = new aws.DynamoDB.DocumentClient()
const MessagesTableName = process.env.MESSAGES_TABLE

exports.handler = async (event, context) => {
    messagesCount = event["messages_count"]
    collectionId = crypto.randomBytes(16).toString("hex"), // Unique ID for the transaction
    promises = []
    for (i = 0; i < messagesCount; i++) {
        promises.push(dynamo.put({
            TableName: MessagesTableName,
            Item: {
                CollectionId: collectionId,
                MessageId: Date.now() + crypto.randomBytes(8).toString("hex"),
                Message: crypto.randomBytes(256).toString("hex")
            }
        }).promise())
    }
    await Promise.all(promises);
    return {
        CollectionId: collectionId
    };
};
