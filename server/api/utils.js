function createCodeHandler(oauthHandler) {
  return async function handleCode(request, response) {
    const { code, uuid } = request.query;

    console.log('code', code);
    try {
      setCORSHeaders(response);
      if (!request.method || request.method.toLowerCase() !== 'get') {
        return sendRejection(response, 405);
      }
      if (!code || typeof code !== 'string') {
        return sendRejection(response, 403);
      }
      const accessToken = await oauthHandler(code, uuid);
      writeJSON(response, { accessToken });
      response.end();
    } catch (err) {
      return sendRejection(response, 400, err instanceof Error ? err.message : '');
    }
  };
}

function setCORSHeaders(response) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST');
  response.setHeader('Access-Control-Allow-Methods', 'GET');
}

function sendRejection(response, status = 400, content) {
  response.writeHead(status);
  response.end(content);
}

function writeJSON(response, data) {
  response.setHeader('Content-Type', 'application/json');
  response.write(JSON.stringify(data));
}

module.exports = {
  createCodeHandler,
  sendRejection,
};
