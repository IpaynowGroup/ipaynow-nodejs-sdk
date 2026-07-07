import assert from "node:assert/strict";
import crypto from "node:crypto";
import test from "node:test";
import { IpaynowConfig, SignType } from "../src/config.js";

test("Config: default baseUrl and timeouts applied", () => {
  const config = new IpaynowConfig({ appId: "app", appKey: "key" });
  assert.equal(config.baseUrl, "https://pay.ipaynow.cn");
  assert.equal(config.connectTimeoutMillis, 5000);
  assert.equal(config.readTimeoutMillis, 15000);
});

test("Config: trims trailing slashes from baseUrl and builds endpoint", () => {
  const config = new IpaynowConfig({ appId: "app", appKey: "key", baseUrl: "https://pay.test///" });
  assert.equal(config.endpoint("/refund/refundOrder"), "https://pay.test/refund/refundOrder");
  assert.equal(config.endpoint("/"), "https://pay.test/");
});

test("Config: rejects blank appId", () => {
  assert.throws(() => new IpaynowConfig({ appId: "  ", appKey: "key" }), TypeError);
  assert.throws(() => new IpaynowConfig({ appId: undefined, appKey: "key" }), TypeError);
});

test("Config: rejects blank appKey", () => {
  assert.throws(() => new IpaynowConfig({ appId: "app", appKey: "" }), TypeError);
});

test("Config: rejects blank baseUrl", () => {
  assert.throws(() => new IpaynowConfig({ appId: "app", appKey: "key", baseUrl: "   " }), TypeError);
});

test("Config: rejects non-positive timeouts", () => {
  assert.throws(() => new IpaynowConfig({ appId: "app", appKey: "key", connectTimeoutMillis: 0 }), TypeError);
  assert.throws(() => new IpaynowConfig({ appId: "app", appKey: "key", readTimeoutMillis: -1 }), TypeError);
});

test("Config: RSA mode parses base64 keys and rejects PEM", () => {
  const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", { modulusLength: 2048 });
  const privateBase64 = privateKey.export({ type: "pkcs8", format: "der" }).toString("base64");
  const publicBase64 = publicKey.export({ type: "spki", format: "der" }).toString("base64");

  const config = new IpaynowConfig({
    appId: "app",
    signType: SignType.RSA,
    mchPrivateKey: privateBase64,
    ipaynowPublicKey: publicBase64,
  });

  assert.equal(config.signType, SignType.RSA);
  assert.equal(config.appKey, null);
  assert.equal(config.mchPrivateKeyObject.type, "private");
  assert.equal(config.ipaynowPublicKeyObject.type, "public");

  const privatePem = privateKey.export({ type: "pkcs8", format: "pem" });
  const publicPem = publicKey.export({ type: "spki", format: "pem" });
  assert.throws(() => new IpaynowConfig({
    appId: "app",
    signType: SignType.RSA,
    mchPrivateKey: privatePem,
    ipaynowPublicKey: publicBase64,
  }), /仅支持裸 base64/);
  assert.throws(() => new IpaynowConfig({
    appId: "app",
    signType: SignType.RSA,
    mchPrivateKey: privateBase64,
    ipaynowPublicKey: publicPem,
  }), /仅支持裸 base64/);
});
