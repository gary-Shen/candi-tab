const { Redis } = require('@upstash/redis')

module.exports = function handler(req, res) {
  const { uuid } = req.query

  const { UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN } = process.env

  const redis = new Redis({
    url: UPSTASH_REDIS_REST_URL,
    token: UPSTASH_REDIS_REST_TOKEN,
  })

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST')
  res.setHeader('Access-Control-Allow-Methods', 'GET')

  redis.get(uuid).then((accessToken) => {
    console.log('uuid', uuid, accessToken)

    if (accessToken) {
      res.write(accessToken)
      res.setHeader('Content-Type', 'application/json')
      res.write(JSON.stringify({ accessToken }))
      res.end()
    }
    else {
      res.writeHead(500)
      res.end(`No access token found for ${uuid}`)
    }
  })
}
