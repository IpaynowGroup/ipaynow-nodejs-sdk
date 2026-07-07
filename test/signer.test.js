import assert from "node:assert/strict";
import crypto from "node:crypto";
import test from "node:test";
import { IpaynowConfig, SignType } from "../src/config.js";
import { sign, verify, clean } from "../src/signer.js";

function md5Config() {
  return new IpaynowConfig({ appId: "app", appKey: "secret" });
}

function rsaConfig() {
  const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", { modulusLength: 2048 });
  return new IpaynowConfig({
    appId: "app",
    signType: SignType.RSA,
    mchPrivateKey: privateKey.export({ type: "pkcs8", format: "der" }).toString("base64"),
    ipaynowPublicKey: publicKey.export({ type: "spki", format: "der" }).toString("base64"),
  });
}

test("sign: known vector - sorts keys, drops empty values, excludeSignType removes signType", () => {
  const got = sign({ b: "2", a: "1", empty: "", signType: "MD5", mhtSignature: "bad" }, md5Config(), true);
  assert.equal(got, "c319c9529d781b179bff6bfdc3f82202");
});

test("sign: excludeSignType=false keeps signType in canonical string (changes signature)", () => {
  const config = md5Config();
  const withoutSignType = sign({ b: "2", a: "1", signType: "MD5" }, config, true);
  const withSignType = sign({ b: "2", a: "1", signType: "MD5" }, config, false);
  assert.notEqual(withoutSignType, withSignType);
});

test("sign: mhtSignType always participates regardless of excludeSignType", () => {
  const config = md5Config();
  const excludeTrue = sign({ b: "2", mhtSignType: "MD5" }, config, true);
  const withoutField = sign({ b: "2" }, config, true);
  assert.notEqual(excludeTrue, withoutField);
});

test("clean: drops null/undefined/empty values, stringifies the rest", () => {
  const out = clean({ a: 1, b: null, c: undefined, d: "", e: "x" });
  assert.deepEqual(out, { a: "1", e: "x" });
});

test("verify: missing signature returns false (no bypass)", () => {
  const config = md5Config();
  assert.equal(verify({ a: "1" }, config, "signature", false), false);
  assert.equal(verify({ a: "1", signature: "" }, config, "signature", false), false);
});

test("verify: forward response (excludeSignType=false) passes with matching signType-inclusive signature, rejects with excludeSignType=true", () => {
  const config = md5Config();
  const fields = { responseCode: "A001", signType: "MD5" };
  const signature = sign(fields, config, false, "signature", "mhtSignature");
  const signed = { ...fields, signature };
  assert.equal(verify(signed, config, "signature", false), true);
  assert.equal(verify(signed, config, "signature", true), false);
});

test("verify: refund response (excludeSignType=true) passes with signType-excluded signature, rejects with excludeSignType=false", () => {
  const config = md5Config();
  const fields = { responseCode: "R000", signType: "MD5" };
  const signature = sign(fields, config, true, "signature", "mhtSignature");
  const signed = { ...fields, signature };
  assert.equal(verify(signed, config, "signature", true), true);
  assert.equal(verify(signed, config, "signature", false), false);
});

test("verify: signature comparison is case-insensitive on the actual value", () => {
  const config = md5Config();
  const fields = { responseCode: "A001" };
  const signature = sign(fields, config, false, "signature", "mhtSignature");
  const signed = { ...fields, signature: signature.toUpperCase() };
  assert.equal(verify(signed, config, "signature", false), true);
});

test("verify: signType mismatch fails closed", () => {
  const config = md5Config();
  const fields = { responseCode: "A001", signType: "RSA" };
  const signature = sign(fields, config, false, "signature", "mhtSignature");
  assert.equal(verify({ ...fields, signature }, config, "signature", false), false);
});

test("sign/verify: RSA strategy uses config signType", () => {
  const config = rsaConfig();
  const fields = { responseCode: "A001", signType: "RSA" };
  const signature = sign(fields, config, false, "signature", "mhtSignature");
  assert.equal(typeof signature, "string");
  assert.equal(verify({ ...fields, signature }, config, "signature", false), true);
});
