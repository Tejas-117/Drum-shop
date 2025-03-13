import { S3Client } from '@aws-sdk/client-s3';

const keys = {
  accessKey: process.env.AWS_S3_ACCESSS_KEY!,
  secretKey: process.env.AWS_S3_SECRET_KEY!
}

const bucketName = process.env.AWS_S3_BUCKET_NAME!;

const bucketRegion = process.env.AWS_S3_BUCKET_REGION!;

function getS3Client() {
  return new S3Client({
    credentials: {
      accessKeyId: keys.accessKey,
      secretAccessKey: keys.secretKey,
    },
    region: bucketRegion,
  });
}

export {
  keys,
  bucketName,
  bucketRegion,
  getS3Client
}