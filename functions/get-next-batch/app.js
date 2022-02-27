const aws = require("aws-sdk");
const dynamo = new aws.DynamoDB.DocumentClient()
const MessagesTableName = process.env.MESSAGES_TABLE
const ProgressTableName = process.env.PROGRESS_TABLE

exports.handler = async (event, context) => {

};
