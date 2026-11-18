import assert from "node:assert/strict";
import test from "node:test";
import {
  JsapiUnifiedOrderResponse,
  OrderQueryResponse,
  RefundResponse,
  RefundQueryResponse,
  ReverseResponse,
  ReverseQueryResponse,
  PaymentNotifyResponse,
  RefundNotifyResponse,
} from "../src/responses.js";

// 规范 §6 isSuccess 判定规则核对

test("UnifiedOrderResponse (WP001): isSuccess when responseCode==A001; tn()/nowPayOrderNo() accessors, tn falls back to TN", () => {
  const response = new JsapiUnifiedOrderResponse();
  response.load({ responseCode: "A001", TN: "tn-value", nowPayOrderNo: "N1" }, "raw");
  assert.equal(response.isSuccess(), true);
  assert.equal(response.tn(), "tn-value");
  assert.equal(response.nowPayOrderNo(), "N1");

  const failure = new JsapiUnifiedOrderResponse();
  failure.load({ responseCode: "E999" });
  assert.equal(failure.isSuccess(), false);
});

test("OrderQueryResponse (MQ002): isSuccess when responseCode==A001; accessors", () => {
  const response = new OrderQueryResponse();
  response.load({ responseCode: "A001", transStatus: "A001", nowPayOrderNo: "N1", payTime: "20260101", channelOrderNo: "C1" });
  assert.equal(response.isSuccess(), true);
  assert.equal(response.transStatus(), "A001");
  assert.equal(response.nowPayOrderNo(), "N1");
  assert.equal(response.payTime(), "20260101");
  assert.equal(response.channelOrderNo(), "C1");
});

test("Refund family responses (R001/Q001/R002/Q002): isSuccess when responseCode==R000", () => {
  for (const Response of [RefundResponse, RefundQueryResponse, ReverseResponse, ReverseQueryResponse]) {
    const success = new Response();
    success.load({ responseCode: "R000" });
    assert.equal(success.isSuccess(), true, Response.name);

    const failure = new Response();
    failure.load({ responseCode: "A001" });
    assert.equal(failure.isSuccess(), false, Response.name);
  }
});

test("PaymentNotifyResponse (N001): isSuccess when transStatus==A001, ignores responseCode", () => {
  const response = new PaymentNotifyResponse();
  response.load({ transStatus: "A001", responseCode: "whatever" });
  assert.equal(response.isSuccess(), true);

  const failure = new PaymentNotifyResponse();
  failure.load({ transStatus: "A002" });
  assert.equal(failure.isSuccess(), false);
});

test("PaymentNotifyResponse (N001): falls back to tradeStatus when transStatus is absent", () => {
  const response = new PaymentNotifyResponse();
  response.load({ tradeStatus: "A001" });
  assert.equal(response.isSuccess(), true);
  assert.equal(response.tradeStatus(), "A001");

  const failure = new PaymentNotifyResponse();
  failure.load({ tradeStatus: "A002" });
  assert.equal(failure.isSuccess(), false);

  const both = new PaymentNotifyResponse();
  both.load({ transStatus: "A002", tradeStatus: "A001" });
  assert.equal(both.isSuccess(), false);
});

test("RefundNotifyResponse (RN001): isSuccess when tradeStatus==A001", () => {
  const response = new RefundNotifyResponse();
  response.load({ tradeStatus: "A001" });
  assert.equal(response.isSuccess(), true);

  const failure = new RefundNotifyResponse();
  failure.load({ tradeStatus: "A002" });
  assert.equal(failure.isSuccess(), false);
});

test("IpaynowResponse common accessors: get/fields/rawBody/code/message", () => {
  const response = new JsapiUnifiedOrderResponse();
  response.load({ responseCode: "A001", responseMsg: "ok" }, "responseCode=A001&responseMsg=ok");
  assert.equal(response.get("responseCode"), "A001");
  assert.deepEqual(response.fields(), { responseCode: "A001", responseMsg: "ok" });
  assert.equal(response.rawBody(), "responseCode=A001&responseMsg=ok");
  assert.equal(response.code(), "A001");
  assert.equal(response.message(), "ok");
});
