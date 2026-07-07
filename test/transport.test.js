import assert from "node:assert/strict";
import test from "node:test";
import http from "node:http";
import { IpaynowClient } from "../src/client.js";
import { IpaynowConfig } from "../src/config.js";
import { IpaynowError } from "../src/errors.js";
import { JsapiUnifiedOrderRequest } from "../src/requests.js";

function listen(server) {
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve(server.address().port));
  });
}

test("real HTTP transport: non-2xx response throws HTTP_EXCEPTION with status code and body", async () => {
  const server = http.createServer((req, res) => {
    res.writeHead(500, { "content-type": "text/plain" });
    res.end("boom");
  });
  const port = await listen(server);
  try {
    const config = new IpaynowConfig({ appId: "app", appKey: "secret", baseUrl: `http://127.0.0.1:${port}` });
    const client = new IpaynowClient(config);
    const request = new JsapiUnifiedOrderRequest({ mhtOrderNo: "O1" });

    await assert.rejects(
      () => client.execute(request),
      (err) => {
        assert.ok(err instanceof IpaynowError);
        assert.equal(err.codeName, "HTTP_EXCEPTION");
        assert.match(err.message, /500/);
        assert.match(err.message, /boom/);
        return true;
      }
    );
  } finally {
    server.close();
  }
});

test("real HTTP transport: slow server triggers SOCKET_TIMEOUT", async () => {
  const server = http.createServer((req, res) => {
    // 故意不响应，等待客户端超时
  });
  const port = await listen(server);
  try {
    const config = new IpaynowConfig({
      appId: "app",
      appKey: "secret",
      baseUrl: `http://127.0.0.1:${port}`,
      connectTimeoutMillis: 50,
      readTimeoutMillis: 50,
    });
    const client = new IpaynowClient(config);
    const request = new JsapiUnifiedOrderRequest({ mhtOrderNo: "O1" });

    await assert.rejects(
      () => client.execute(request),
      (err) => {
        assert.ok(err instanceof IpaynowError);
        assert.equal(err.codeName, "SOCKET_TIMEOUT");
        return true;
      }
    );
  } finally {
    server.close();
  }
});
