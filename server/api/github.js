const fetch = require('node-fetch');
const { Redis } = '@upstash/redis';

const { createCodeHandler } = require('./utils');
const { setToken } = require('./_token');

const { UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN } = process.env;

const redis = new Redis({
  url: UPSTASH_REDIS_REST_URL,
  token: UPSTASH_REDIS_REST_TOKEN,
});

module.exports = createCodeHandler(async (code, uuid) => {
  const { CLIENT_ID, CLIENT_SECRET } = process.env;

  console.log('fetching');

  const res = await fetch('https://github.com/login/oauth/access_token', {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    redirect: 'follow',
    method: 'post',
    body: JSON.stringify({
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  });

  const body = await res.json();

  const { access_token: accessToken, scope, error_description: errorDescription } = body;
  if (errorDescription) {
    throw new Error(errorDescription);
  } else if (scope !== 'gist' || !accessToken || !(typeof accessToken === 'string')) {
    console.log(JSON.stringify(body));
    throw new Error(`Cannot resolve response from GitHub`);
  }

  redis.set(uuid, accessToken);
  return accessToken;
});
