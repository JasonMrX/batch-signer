const crypto = require("crypto");
const aws = require("aws-sdk");
const dynamo = new aws.DynamoDB.DocumentClient()
const keysTableName = process.env.KEYS_TABLE

exports.lambdaHandler = async (event, context) => {
    promises = []
    for (i = 0; i < 30; i++) {
        promises.push(new Promise(resolve => {
            crypto.generateKeyPair('ec', {
                namedCurve: 'secp256k1',
                publicKeyEncoding: {
                    type: 'spki',
                    format: 'der'
                },
                privateKeyEncoding: {
                    type: 'pkcs8',
                    format: 'der'
                }
            }, async (err, publicKey, privateKey) => {
                await dynamo.put({
                    TableName: keysTableName,
                    Item: {
                        PubKey: publicKey.toString('hex'),
                        PrivKey: privateKey.toString('hex')
                    }
                }).promise();
                resolve();
            });
        }));
    }
    await Promise.all(promises)
    return {};
};
