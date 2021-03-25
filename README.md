# DynamoDB Function Cache

Use DynamoDB as a cache for slow or computationally expensive functions in Node.js.

# What it does

This is a proof-of-concept demonstrating how DynamoDB can be used as a cache to speed up function calls and reduce API requests.

After you call a cached function for the first time with a given set of arguments, subsequent calls only hit the DynamoDB cache, rather than the original function or API call.

Use cases include:
- Saving the results of a rate-limited API
- Saving the results of a slow API
- Saving the results of mathematically complex computations

## Why not just an in-memory cache?

An in-memory cache works great if you're only caching function calls for one user, or are running a backend on a single machine.

If you're using serverless functions (e.g. AWS Lambda), it's not easy or reliable to cache function calls across separate invocations. That's the problem this example is designed to address.

# How it Works

Pass your slow function into the `withCache` function from `cache.js` as follows:

```
// original function call
yourFunction('hello');

// cached function call
const cachedFunction = withCache('YOUR_FUNCTION_NAME', yourFunction);
cachedFunction('hello');

```

Where `'YOUR_FUNCTION_NAME'` is whatever prefix you want to use in the cache, and `yourFunction` is a slow function you'd like to cache.

The cached function will attempt to fetch the result of the function call from DynamoDB using the given prefix and arguments. If it doesn't find anything, it'll call the original function, and store the result in DynamoDB with a PK of `YOUR_FUNCTION_NAME#hello`. If the function has multiple arguments, they are simply concatenated. 

# Installation

First, clone the repository and run `npm install` at the project root.

## Creating the table

In `function-cache/serverless.yml` I've provided settings for a simple DynamoDB table using [Serverless Components](https://www.serverless.com/components/), but you could use your own, existing table, as long as the key schema matches.

If you want to use the Serverless Component to provision a table:

1. Create a Serverless account and make sure AWS is configured as a provider. 
2. Install Serverless CLI globally 
   
   `npm i -g serverless`

3. Add appropriate org, app, service name, and table name to `function-cache/serverless.yml`
4. `cd function-cache && sls deploy`
   
   You may have to add AWS as a provider for this service specifically, from the Serverless Dashboard.


 Once you've created the table, you should be good to go! 

## Example Usage

Make sure the function you want to cache takes strings or string-like objects as parameters, so that we can use it as a cache key.

1. Rename `.env.example` to `.env` and add your own table name and AWS region (the ones you used above).
2. Run `index.js` for an example of how the caching works.

   Note: The examples in `index.js` use your actual table for caching, so you'll have to delete those example entries if you want to use the same table in production. 

## Item Size limit 

As of 2021, DynamoDB limits item sizes to 400KB (about 400,000 characters), and key sizes to 2048 bytes (about 256 characters).

As such, this caching strategy won't work directly for extremely large items. For those, you could try distributing the parts of the item across multiple DynamoDB rows, with the same partition key and different sort keys.