/*
  File: redisClient.ts
  Description: Create a redis client and export it
*/

import Redis from 'ioredis';

const redisClient = new Redis(process.env.REDIS_URL!);

export default redisClient;
