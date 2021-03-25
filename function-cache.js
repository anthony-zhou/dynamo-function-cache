const DynamoDB = require('aws-sdk/clients/dynamodb');
require('dotenv').config();

const docClient = new DynamoDB.DocumentClient({ region: process.env.REGION });

async function put(key, value) {
  try {
    const params = {
      TableName: process.env.TABLE_NAME,
      Item: {
        PK: key,
        value: JSON.stringify(value),
      }
    }
    await docClient.put(params).promise();
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function get(key) {
  try {
    const params = {
      TableName: process.env.TABLE_NAME,
      Key: { PK: key }
    }
    const { Item } = await docClient.get(params).promise();
    if (!Item) {
      // Key not found in cache
      return undefined;
    }
    const { value } = Item;
    return JSON.parse(value);
  } catch (err) {
    console.log(err);
    throw err;
  }
}

function hash(args) {
  return args.join();
}

/**
 * Function wrapper that attempts to fetch the result of fn from the DynamoDB cache. If the item is not in the cache, 
 * this function calls fn and stores the result in the cache.
 * @param {string} prefix The string pre-pended to each DynamoDB cache key. Should be unique to each function.
 * @param {Promise|Function} fn A function (can be async) that takes string or string-like parameters, including numbers and booleans.
 * @returns {any} The result of the function fn.
 */
function withCache(prefix, fn) {
  return async (...args) => {
      const cacheKey = `${prefix}#${hash(args)}`
      const cachedResult = await get(cacheKey);
      if (cachedResult) {
        console.log('Found result in cache.');
        return cachedResult;
      }
    
      process.stdout.write('Result not cached. Calling slow API... ')
      const result = await fn.apply(this, args);
      console.log('done!')
      
      process.stdout.write('Storing result in cache... ')
      await put(cacheKey, result);
      console.log('done!')
    
      return result;
  }
}

module.exports = {
  withCache
}