import assert from "node:assert/strict";
import test from "node:test";
import {
  JsapiUnifiedOrderRequest,
  AggregateCodeUnifiedOrderRequest,
  MiniProgramUnifiedOrderRequest,
  H5UnifiedOrderRequest,
  AppUnifiedOrderRequest,
  OrderQueryRequest,
  RefundRequest,
  RefundQueryRequest,
  ReverseRequest,
  ReverseQueryRequest,
} from "../src/requests.js";
import {
  JsapiUnifiedOrderResponse,
  AggregateCodeUnifiedOrderResponse,
  MiniProgramUnifiedOrderResponse,
  H5UnifiedOrderResponse,
  AppUnifiedOrderResponse,
  OrderQueryResponse,
  RefundResponse,
  RefundQueryResponse,
  ReverseResponse,
  ReverseQueryResponse,
} from "../src/responses.js";

// 规范 §2 操作定义表：funcode/version/path/signTypeField/excludeSignType 逐条核对。
const cases = [
  {
    name: "JSAPI 统一下单",
    Request: JsapiUnifiedOrderRequest,
    Response: JsapiUnifiedOrderResponse,
    funcode: "WP001",
    version: "1.0.0",
    path: "/",
    signTypeField: "mhtSignType",
    excludeSignType: false,
  },
  {
    name: "聚合码统一下单",
    Request: AggregateCodeUnifiedOrderRequest,
    Response: AggregateCodeUnifiedOrderResponse,
    funcode: "WP001",
    version: "1.0.3",
    path: "/",
    signTypeField: "mhtSignType",
    excludeSignType: false,
  },
  {
    name: "小程序统一下单",
    Request: MiniProgramUnifiedOrderRequest,
    Response: MiniProgramUnifiedOrderResponse,
    funcode: "WP001",
    version: "1.0.0",
    path: "/",
    signTypeField: "mhtSignType",
    excludeSignType: false,
  },
  {
    name: "H5 统一下单",
    Request: H5UnifiedOrderRequest,
    Response: H5UnifiedOrderResponse,
    funcode: "WP001",
    version: "1.0.0",
    path: "/",
    signTypeField: "mhtSignType",
    excludeSignType: false,
  },
  {
    name: "APP 统一下单",
    Request: AppUnifiedOrderRequest,
    Response: AppUnifiedOrderResponse,
    funcode: "WP001",
    version: "1.0.3",
    path: "/",
    signTypeField: "mhtSignType",
    excludeSignType: false,
  },
  {
    name: "订单查询",
    Request: OrderQueryRequest,
    Response: OrderQueryResponse,
    funcode: "MQ002",
    version: "1.0.0",
    path: "/",
    signTypeField: "mhtSignType",
    excludeSignType: false,
  },
  {
    name: "退款",
    Request: RefundRequest,
    Response: RefundResponse,
    funcode: "R001",
    version: "1.0.0",
    path: "/refund/refundOrder",
    signTypeField: "signType",
    excludeSignType: true,
  },
  {
    name: "退款查询",
    Request: RefundQueryRequest,
    Response: RefundQueryResponse,
    funcode: "Q001",
    version: "1.0.0",
    path: "/refund/refundQuery",
    signTypeField: "signType",
    excludeSignType: true,
  },
  {
    name: "撤销",
    Request: ReverseRequest,
    Response: ReverseResponse,
    funcode: "R002",
    version: "1.0.0",
    path: "/refund/cancelOrder",
    signTypeField: "signType",
    excludeSignType: true,
  },
  {
    name: "撤销查询",
    Request: ReverseQueryRequest,
    Response: ReverseQueryResponse,
    funcode: "Q002",
    version: "1.0.0",
    path: "/refund/refundQuery",
    signTypeField: "signType",
    excludeSignType: true,
  },
];

for (const c of cases) {
  test(`Request metadata: ${c.name}`, () => {
    const request = new c.Request({});
    assert.equal(request.funcode, c.funcode);
    assert.equal(request.version, c.version);
    assert.equal(request.path, c.path);
    assert.equal(request.signTypeField, c.signTypeField);
    assert.equal(request.excludeSignType, c.excludeSignType);
    assert.equal(request.signatureField, "mhtSignature");
    assert.equal(request.responseSignatureField, "signature");
    assert.equal(request.responseClass, c.Response);
  });

  test(`Request version override via second constructor arg (string): ${c.name}`, () => {
    const request = new c.Request({}, "9.9.9");
    assert.equal(request.version, "9.9.9");
  });

  test(`Request version override via options object: ${c.name}`, () => {
    const request = new c.Request({}, { version: "8.8.8" });
    assert.equal(request.version, "8.8.8");
  });
}

test("OrderQueryRequest: params.version overrides default when no constructor override given", () => {
  const request = new OrderQueryRequest({ mhtOrderNo: "O1", version: "2.0.0" });
  assert.equal(request.version, "2.0.0");
});

test("OrderQueryRequest: explicit constructor override wins over params.version", () => {
  const request = new OrderQueryRequest({ mhtOrderNo: "O1", version: "2.0.0" }, "3.0.0");
  assert.equal(request.version, "3.0.0");
});

// 规范 §5 Params 默认值核对
test("Params defaults: JSAPI unified order", () => {
  const request = new JsapiUnifiedOrderRequest({ mhtOrderNo: "O1" });
  const fields = request.toFields();
  assert.equal(fields.deviceType, "0600");
  assert.equal(fields.mhtCurrencyType, "156");
  assert.equal(fields.mhtOrderTimeOut, "120");
  assert.equal(fields.mhtOrderType, "05");
});

test("Params defaults: aggregate code unified order", () => {
  const request = new AggregateCodeUnifiedOrderRequest({ mhtOrderNo: "O1" });
  const fields = request.toFields();
  assert.equal(fields.deviceType, "20");
  assert.equal(fields.mhtCurrencyType, "156");
  assert.equal(fields.mhtOrderTimeOut, "120");
  assert.equal(fields.mhtOrderType, "05");
});

test("Params defaults: mini program unified order", () => {
  const request = new MiniProgramUnifiedOrderRequest({ mhtOrderNo: "O1" });
  const fields = request.toFields();
  assert.equal(fields.deviceType, "14");
  assert.equal(fields.mhtCurrencyType, "156");
  assert.equal(fields.mhtOrderTimeOut, "120");
  assert.equal(fields.mhtOrderType, "05");
  assert.equal(fields.outputType, "1");
});

test("Params: mini program supports mhtStoreId", () => {
  const fields = new MiniProgramUnifiedOrderRequest({ mhtOrderNo: "O1", mhtStoreId: "S1" }).toFields();
  assert.equal(fields.mhtStoreId, "S1");
});

test("Params defaults: H5 unified order", () => {
  const request = new H5UnifiedOrderRequest({ mhtOrderNo: "O1" });
  const fields = request.toFields();
  assert.equal(fields.deviceType, "0601");
  assert.equal(fields.mhtCurrencyType, "156");
  assert.equal(fields.mhtOrderTimeOut, "120");
  assert.equal(fields.mhtOrderType, "05");
});

test("Params: H5 supports specifiedChannel/payAccNo/guideId", () => {
  const fields = new H5UnifiedOrderRequest({
    mhtOrderNo: "O1",
    specifiedChannel: "wechat",
    payAccNo: "18800000000",
    guideId: "G1",
  }).toFields();
  assert.equal(fields.specifiedChannel, "wechat");
  assert.equal(fields.payAccNo, "18800000000");
  assert.equal(fields.guideId, "G1");
});

test("Params defaults: APP unified order", () => {
  const request = new AppUnifiedOrderRequest({ mhtOrderNo: "O1" });
  const fields = request.toFields();
  assert.equal(fields.deviceType, "01");
  assert.equal(fields.mhtCurrencyType, "156");
  assert.equal(fields.mhtOrderTimeOut, "120");
  assert.equal(fields.mhtOrderType, "05");
  assert.equal(fields.outputType, "0");
});

test("Params: APP supports frontNotifyUrl and mhtStoreId", () => {
  const fields = new AppUnifiedOrderRequest({
    mhtOrderNo: "O1",
    frontNotifyUrl: "https://example.com/front",
    mhtStoreId: "STORE1",
  }).toFields();
  assert.equal(fields.frontNotifyUrl, "https://example.com/front");
  assert.equal(fields.mhtStoreId, "STORE1");
});

test("Params: extraParams merges into toFields output and can override a named field", () => {
  const request = new JsapiUnifiedOrderRequest({
    mhtOrderNo: "O1",
    extraParams: { customField: "v1", deviceType: "override" },
  });
  const fields = request.toFields();
  assert.equal(fields.customField, "v1");
  assert.equal(fields.deviceType, "override");
});

test("Params: null/undefined fields are dropped from toFields, explicit values kept", () => {
  const request = new RefundRequest({ mhtOrderNo: "O1", mhtRefundNo: "RF1", amount: 100 });
  const fields = request.toFields();
  assert.equal(fields.mhtOrderNo, "O1");
  assert.equal("notifyUrl" in fields, false);
});
