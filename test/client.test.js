import assert from "node:assert/strict";
import crypto from "node:crypto";
import test from "node:test";
import { IpaynowClient } from "../src/client.js";
import { IpaynowConfig, SignType } from "../src/config.js";
import { IpaynowError } from "../src/errors.js";
import { sign } from "../src/signer.js";
import { JsapiUnifiedOrderRequest, RefundRequest } from "../src/requests.js";

function config() {
  return new IpaynowConfig({ appId: "app1", appKey: "secret", baseUrl: "https://pay.test" });
}

function rsaConfig() {
  const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", { modulusLength: 2048 });
  return new IpaynowConfig({
    appId: "app1",
    signType: SignType.RSA,
    mchPrivateKey: privateKey.export({ type: "pkcs8", format: "der" }).toString("base64"),
    ipaynowPublicKey: publicKey.export({ type: "spki", format: "der" }).toString("base64"),
    baseUrl: "https://pay.test",
  });
}

test("execute: assembles public fields correctly (funcode/version/appId/mhtCharset/signType field)", async () => {
  let seenUrl;
  let seenParams;
  const transport = async (url, params) => {
    seenUrl = url;
    seenParams = params;
    const responseFields = { responseCode: "A001" };
    const signature = sign(responseFields, config(), false, "signature", "mhtSignature");
    return `responseCode=A001&signature=${signature}`;
  };
  const client = new IpaynowClient(config(), transport);
  const request = new JsapiUnifiedOrderRequest({ mhtOrderNo: "O1", mhtOrderAmt: 100 });
  const response = await client.execute(request);

  assert.equal(seenUrl, "https://pay.test/");
  assert.equal(seenParams.funcode, "WP001");
  assert.equal(seenParams.version, "1.0.0");
  assert.equal(seenParams.appId, "app1");
  assert.equal(seenParams.mhtCharset, "UTF-8");
  assert.equal(seenParams.mhtSignType, "MD5");
  assert.ok(seenParams.mhtSignature);
  assert.equal(response.isSuccess(), true);
});

test("execute: throws SIGN_ERROR when response signature verification fails", async () => {
  const transport = async () => "responseCode=A001&signature=deadbeef";
  const client = new IpaynowClient(config(), transport);
  const request = new JsapiUnifiedOrderRequest({ mhtOrderNo: "O1" });

  await assert.rejects(
    () => client.execute(request),
    (err) => err instanceof IpaynowError && err.codeName === "SIGN_ERROR"
  );
});

test("execute: throws SIGN_ERROR when response signature is missing (no bypass)", async () => {
  const transport = async () => "responseCode=A001";
  const client = new IpaynowClient(config(), transport);
  const request = new JsapiUnifiedOrderRequest({ mhtOrderNo: "O1" });

  await assert.rejects(
    () => client.execute(request),
    (err) => err instanceof IpaynowError && err.codeName === "SIGN_ERROR"
  );
});

test("execute: normal path returns typed response instance", async () => {
  const transport = async () => {
    const responseFields = { responseCode: "R000" };
    const signature = sign(responseFields, config(), true, "signature", "mhtSignature");
    return `responseCode=R000&signature=${signature}`;
  };
  const client = new IpaynowClient(config(), transport);
  const request = new RefundRequest({ mhtOrderNo: "O1", mhtRefundNo: "RF1", amount: 100 });
  const response = await client.execute(request);
  assert.equal(response.constructor.name, "RefundResponse");
  assert.equal(response.isSuccess(), true);
});

test("execute: refund request signs with signType excluded, path is /refund/refundOrder", async () => {
  let seenUrl;
  let seenParams;
  const transport = async (url, params) => {
    seenUrl = url;
    seenParams = params;
    const responseFields = { responseCode: "R000" };
    const signature = sign(responseFields, config(), true, "signature", "mhtSignature");
    return `responseCode=R000&signature=${signature}`;
  };
  const client = new IpaynowClient(config(), transport);
  const request = new RefundRequest({ mhtOrderNo: "O1", mhtRefundNo: "RF1", amount: 100 });
  await client.execute(request);

  assert.equal(seenUrl, "https://pay.test/refund/refundOrder");
  assert.equal(seenParams.signType, "MD5");
  assert.ok(seenParams.mhtSignature);
});

test("execute: RSA config sets signType=RSA and verifies RSA response", async () => {
  let seenParams;
  const cfg = rsaConfig();
  const transport = async (_url, params) => {
    seenParams = params;
    const responseFields = { responseCode: "A001", signType: "RSA" };
    const signature = sign(responseFields, cfg, false, "signature", "mhtSignature");
    return `responseCode=A001&signType=RSA&signature=${encodeURIComponent(signature)}`;
  };
  const client = new IpaynowClient(cfg, transport);
  const request = new JsapiUnifiedOrderRequest({ mhtOrderNo: "O1", mhtOrderAmt: 100 });

  const response = await client.execute(request);

  assert.equal(seenParams.mhtSignType, "RSA");
  assert.equal(response.isSuccess(), true);
});

test("buildFormFields: returns signed fields without sending a request", () => {
  const client = new IpaynowClient(config(), async () => {
    throw new Error("should not be called");
  });
  const request = new JsapiUnifiedOrderRequest({ mhtOrderNo: "O1" });
  const fields = client.buildFormFields(request);
  assert.equal(fields.funcode, "WP001");
  assert.ok(fields.mhtSignature);
});
