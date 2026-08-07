const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

const logger = require('../../../logger');

/**
 * If AWS credentials are configured in the environment, use them.
 * @returns {object|undefined}
 */
const getCredentials = () => {
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    const credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    };
    logger.debug('Using extra DynamoDB Credentials');
    return credentials;
  }

  return undefined;
};

/**
 * If an AWS DynamoDB Endpoint is configured in the environment, use it.
 * @returns {string|undefined}
 */
const getDynamoDBEndpoint = () => {
  if (process.env.AWS_DYNAMODB_ENDPOINT_URL) {
    logger.debug(
      { endpoint: process.env.AWS_DYNAMODB_ENDPOINT_URL },
      'Using alternate DynamoDB endpoint'
    );
    return process.env.AWS_DYNAMODB_ENDPOINT_URL;
  }

  return undefined;
};

const ddbClient = new DynamoDBClient({
  region: process.env.AWS_REGION,
  endpoint: getDynamoDBEndpoint(),
  credentials: getCredentials(),
});

module.exports = DynamoDBDocumentClient.from(ddbClient, {
  marshallOptions: {
    convertEmptyValues: false,
    removeUndefinedValues: false,
    convertClassInstanceToMap: true,
  },
  unmarshallOptions: {
    wrapNumbers: false,
  },
});
