const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

// XXX: temporary use of memory-db until we add DynamoDB
const MemoryDB = require('../memory/memory-db');
const s3Client = require('./s3Client');
const logger = require('../../../logger');

// Keep metadata in memory for now; data goes to S3.
const metadata = new MemoryDB();

// Write a fragment's metadata. Returns a Promise<void>
function writeFragment(fragment) {
  const serialized = JSON.stringify(fragment);
  return metadata.put(fragment.ownerId, fragment.id, serialized);
}

// Read a fragment's metadata. Returns a Promise<Object>
async function readFragment(ownerId, id) {
  const serialized = await metadata.get(ownerId, id);
  return typeof serialized === 'string' ? JSON.parse(serialized) : serialized;
}

// Writes a fragment's data to an S3 Object in a Bucket.
async function writeFragmentData(ownerId, id, data) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${ownerId}/${id}`,
    Body: data,
  };

  const command = new PutObjectCommand(params);

  try {
    await s3Client.send(command);
  } catch (err) {
    const { Bucket, Key } = params;
    logger.error({ err, Bucket, Key }, 'Error uploading fragment data to S3');
    throw new Error('unable to upload fragment data', { cause: err });
  }
}

// Convert a stream of data into a Buffer.
const streamToBuffer = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];

    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });

// Reads a fragment's data from S3 and returns Promise<Buffer>
async function readFragmentData(ownerId, id) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${ownerId}/${id}`,
  };

  const command = new GetObjectCommand(params);

  try {
    const data = await s3Client.send(command);
    return streamToBuffer(data.Body);
  } catch (err) {
    const { Bucket, Key } = params;
    logger.error({ err, Bucket, Key }, 'Error streaming fragment data from S3');
    throw new Error('unable to read fragment data', { cause: err });
  }
}

// Get a list of fragment ids/objects for the given user.
async function listFragments(ownerId, expand = false) {
  const fragments = await metadata.query(ownerId);

  if (!fragments || fragments.length === 0) {
    return [];
  }

  if (expand) {
    return fragments.map((fragment) =>
      typeof fragment === 'string' ? JSON.parse(fragment) : fragment
    );
  }

  return fragments.map((fragment) =>
    typeof fragment === 'string' ? JSON.parse(fragment).id : fragment.id
  );
}

// Delete a fragment's metadata and data. Returns a Promise
async function deleteFragment(ownerId, id) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${ownerId}/${id}`,
  };

  const command = new DeleteObjectCommand(params);

  try {
    await s3Client.send(command);
    await metadata.del(ownerId, id);
  } catch (err) {
    const { Bucket, Key } = params;
    logger.error({ err, Bucket, Key }, 'Error deleting fragment data from S3');
    throw new Error('unable to delete fragment data', { cause: err });
  }
}

module.exports.listFragments = listFragments;
module.exports.writeFragment = writeFragment;
module.exports.readFragment = readFragment;
module.exports.writeFragmentData = writeFragmentData;
module.exports.readFragmentData = readFragmentData;
module.exports.deleteFragment = deleteFragment;
