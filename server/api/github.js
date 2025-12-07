const fetch = require('node-fetch')

const { createCodeHandler } = require('./utils')

module.exports = createCodeHandler(async (code, uuid) => {
  const { CLIENT_ID, CLIENT_SECRET } = process.env

  const res = await fetch('https://github.com/login/oauth/access_token', {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    redirect: 'follow',
    method: 'post',
    body: JSON.stringify({
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  })

  const body = await res.json()

  const { access_token: accessToken, scope, error_description: errorDescription } = body
  if (errorDescription) {
    throw new Error(errorDescription)
  }
  else if (scope !== 'gist' || !accessToken || !(typeof accessToken === 'string')) {
    throw new Error(`Cannot resolve response from GitHub`)
  }

  return accessToken
})
