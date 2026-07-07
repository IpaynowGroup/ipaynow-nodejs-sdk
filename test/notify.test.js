import assert from "node:assert/strict";
import test from "node:test";
import { IpaynowConfig } from "../src/config.js";
import { NotifyParser, NotifyAck } from "../src/notify.js";
import { IpaynowError } from "../src/errors.js";
import { sign } from "../src/signer.js";

const config = new IpaynowConfig({ appId: "app", appKey: "secret" });

test("NotifyParser.parsePayment (N001): signType participates in signature (excludeSignType=false)", () => {
  const fields = { transStatus: "A001", signType: "MD5" };
  const signature = sign(fields, config, false, "signature", "mhtSignature");
  const body = `transStatus=A001&signType=MD5&signature=${signature}`;
  const response = NotifyParser.parsePayment(body, config);
  assert.equal(response.isSuccess(), true);
});

test("NotifyParser.parsePayment (N001): rejects signature computed with excludeSignType=true", () => {
  const fields = { transStatus: "A001", signType: "MD5" };
  const wrongSignature = sign(fields, config, true, "signature", "mhtSignature");
  const body = `transStatus=A001&signType=MD5&signature=${wrongSignature}`;
  assert.throws(
    () => NotifyParser.parsePayment(body, config),
    (err) => err instanceof IpaynowError && err.codeName === "SIGN_ERROR"
  );
});

test("NotifyParser.parseRefund (RN001): signType excluded from signature (excludeSignType=true)", () => {
  const fields = { tradeStatus: "A001", signType: "MD5" };
  const signature = sign(fields, config, true, "signature", "mhtSignature");
  const body = `tradeStatus=A001&signType=MD5&signature=${signature}`;
  const response = NotifyParser.parseRefund(body, config);
  assert.equal(response.isSuccess(), true);
});

test("NotifyParser.parseRefund (RN001): rejects signature computed with excludeSignType=false", () => {
  const fields = { tradeStatus: "A001", signType: "MD5" };
  const wrongSignature = sign(fields, config, false, "signature", "mhtSignature");
  const body = `tradeStatus=A001&signType=MD5&signature=${wrongSignature}`;
  assert.throws(
    () => NotifyParser.parseRefund(body, config),
    (err) => err instanceof IpaynowError && err.codeName === "SIGN_ERROR"
  );
});

test("NotifyParser: throws SIGN_ERROR when signature is missing entirely", () => {
  assert.throws(
    () => NotifyParser.parsePayment("transStatus=A001", config),
    (err) => err instanceof IpaynowError && err.codeName === "SIGN_ERROR"
  );
  assert.throws(
    () => NotifyParser.parseRefund("tradeStatus=A001", config),
    (err) => err instanceof IpaynowError && err.codeName === "SIGN_ERROR"
  );
});

test("NotifyAck: success()/fail() bodies", () => {
  assert.equal(NotifyAck.success(), "success=Y");
  assert.equal(NotifyAck.fail(), "success=N");
});
