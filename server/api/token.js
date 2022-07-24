const { getToken } = require('./_token');

module.exports = function handler(req, res) {
  const { uuid } = req.query;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const accessToken = getToken(uuid);

  console.log('uuid', uuid, accessToken);

  if (accessToken) {
    res.write(accessToken);
    res.setHeader('Content-Type', 'application/json');
    res.write(JSON.stringify({ accessToken }));
    res.end();
  } else {
    res.writeHead(500);
    res.end(`No access token found for ${uuid}`);
  }
};
