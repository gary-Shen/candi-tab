const { getToken } = require('./_token');

module.exports = function handler(req, res) {
  const { uuid } = req.query;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const accessToken = getToken(uuid);

  if (accessToken) {
    res.write(accessToken);
    res.setHeader('Content-Type', 'application/json');
    res.write(JSON.stringify({ accessToken }));
    res.end();
  } else {
    res.writeHead(500);
    res.end({ error: `No access token found for ${uuid}` });
  }
};
