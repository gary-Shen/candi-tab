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
  response.setHeader('Content-Type', 'text/html');
  response.write(`
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link
      href="https://unpkg.com/@primer/css@^20.2.4/dist/primer.css"
      rel="stylesheet"
    />
    <title>Github access token for candi-tab</title>
    <script src="https://cdn.jsdelivr.net/npm/clipboard@2.0.11/dist/clipboard.min.js"></script>
    <style>
      #content {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .inputs {
        display: flex;
      }

      .inputs > * {
        padding: 0.5rem 0.6rem;
        border: 1px solid #ccc;
        border-radius: 6px;
      }

      .inputs button {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }

      .inputs input {
        border-right: 0;
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }
    </style>
  </head>

  <body>
    <div id="content">
      <h1>Success!</h1>
      <p>Copy the following access token and paste it into the extension.</p>
      <div class="inputs">
        <input
          readonly
          class="form-control"
          type="text"
          id="token"
          type="text"
          value="${data.accessToken}"
          placeholder="Standard input"
          aria-label="Repository description"
        />
        <button
          class="btn tooltipped tooltipped-nw"
          type="button"
          id="copy"
          data-clipboard-target="#token"
          aria-label="This is the tooltip on the North West side."
        >
          Copy
        </button>
      </div>
    </div>
    <script>
      new ClipboardJS('#copy');
    </script>
  </body>
</html>

  `);
}

module.exports = {
  createCodeHandler,
  sendRejection,
};
