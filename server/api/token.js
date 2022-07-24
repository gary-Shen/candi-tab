const { getToken } = require('./_token');

module.exports = function handler(req, res) {
  const { uuid } = req.query;

  function loop() {
    const accessToken = getToken(uuid);

    if (accessToken) {
      res.write(accessToken);
      res.setHeader('Content-Type', 'application/json');
      res.write(JSON.stringify({ accessToken }));
      res.end();
    } else {
      setTimeout(loop, 1000);
    }
  }

  loop();
};
