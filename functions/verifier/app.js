const crypto = require("crypto");
const aws = require("aws-sdk");
const dynamo = new aws.DynamoDB.DocumentClient()
const MessagesTableName = process.env.MESSAGES_TABLE

exports.handler = async (event, context) => {
    var collectionId = event["collection_id"];

    var exclusiveStartKey;
    var result;
    var succeeded = 0;
    var failed = 0;
    var missing = 0;
    var failedIds = [];
    var missingIds = [];
    do {
        result = await dynamo.query({
            TableName: MessagesTableName,
            KeyConditionExpression: 'CollectionId = :collection_id',
            ExpressionAttributeValues: {
                ':collection_id': collectionId,
            },
            ExclusiveStartKey: exclusiveStartKey
        }).promise();

        result.Items.forEach(item => {
            if (!item.signingKey) {
                missing++;
                missingIds.push(item.MessageId);
                return;
            }

            let message = Buffer.from(item.Message, 'hex')
            let signingKey = Buffer.from(item.signingKey, 'hex')
            let signature = Buffer.from(item.Signature, 'hex')
            let verified = crypto.verify('SHA384', message, {
                key: signingKey,
                format: 'der',
                type: 'spki'
            }, signature);

            if (!verified) {
                failed++;
                failedIds.push(item.MessageId);
                return;
            }

            succeeded++;
        });

        exclusiveStartKey = result.LastEvaluatedKey;
    } while (result.LastEvaluatedKey);

    return {
        succeeded: succeeded,
        failed: failed,
        missing: missing,
        failedIds: failedIds,
        missingIds: missingIds
    }
};
