const aws = require("aws-sdk");
const dynamo = new aws.DynamoDB.DocumentClient()
const keysTableName = process.env.KEYS_TABLE

exports.lambdaHandler = async (event, context) => {
    return await dynamo.scan({TableName: keysTableName}).promise();
};
