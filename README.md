# iPayNow Node.js SDK

现在支付 Node.js SDK，封装统一下单、订单查询、退款、撤销、回调验签和前端表单提交字段生成。基于原生 ESM 编写，运行时依赖仅使用 Node.js 内置模块（`node:crypto`）与全局 `fetch`。

## 环境要求

- Node.js 18+（需要全局 `fetch`、`AbortSignal.timeout` 与 `node:test`，建议使用 20+）
- 本包为 ESM（`package.json` 中 `"type": "module"`），只能使用 `import` 语法引入，不支持 `require`

## 安装

```bash
npm install ipaynow-nodejs-sdk
```

## 快速开始

以 H5 统一下单为例：

```javascript
import {
  IpaynowClient,
  IpaynowConfig,
  H5UnifiedOrderParams,
  H5UnifiedOrderRequest,
} from "ipaynow-nodejs-sdk";

const config = new IpaynowConfig({
  appId: "appId",
  appKey: "appKey",
  baseUrl: "https://pay.ipaynow.cn",
});
const client = new IpaynowClient(config);

const params = new H5UnifiedOrderParams({
  mhtOrderNo: "ORDER202607030001",
  mhtOrderName: "测试订单",
  mhtOrderDetail: "测试订单",
  mhtOrderAmt: 1,
  mhtOrderTimeOut: 120,
  mhtOrderStartTime: "20260703120000",
  notifyUrl: "https://example.com/notify",
  frontNotifyUrl: "https://example.com/front",
  payChannelType: "12",
  outputType: "1",
  consumerCreateIp: "127.0.0.1",
});

const response = await client.execute(new H5UnifiedOrderRequest(params));
if (response.isSuccess()) {
  const tn = response.tn();
  console.log(tn);
}
```

`Params` 构造函数也接受普通对象字面量（不强制先 `new`），`Request` 构造函数会在收到普通对象时自动包装为对应的 `Params` 实例：

```javascript
const response = await client.execute(
  new H5UnifiedOrderRequest({ mhtOrderNo: "ORDER202607030001", mhtOrderAmt: 1 })
);
```

## 前端 Form 表单提交

需要让浏览器直接向现在支付网关提交表单时，使用 `buildFormFields` 生成完整请求字段。入参与 `execute` 一致，SDK 不发起 HTTP 请求：

```javascript
const fields = client.buildFormFields(new H5UnifiedOrderRequest(params));
```

返回字段包含业务参数、公共参数和签名字段，例如：

- `funcode`
- `version`
- `appId`
- `mhtCharset`
- `mhtSignType` 或 `signType`
- `mhtSignature`

表单提交地址由请求路径决定：

```javascript
const request = new H5UnifiedOrderRequest(params);
const action = config.endpoint(request.path);
```

## 支持接口

| funcode | 操作 | Params | Request | Response |
| --- | --- | --- | --- | --- |
| `WP001` (v1.0.0) | JSAPI 统一下单 | `JsapiUnifiedOrderParams` | `JsapiUnifiedOrderRequest` | `JsapiUnifiedOrderResponse` |
| `WP001` (v1.0.3) | 聚合码统一下单 | `AggregateCodeUnifiedOrderParams` | `AggregateCodeUnifiedOrderRequest` | `AggregateCodeUnifiedOrderResponse` |
| `WP001` (v1.0.0) | 小程序统一下单 | `MiniProgramUnifiedOrderParams` | `MiniProgramUnifiedOrderRequest` | `MiniProgramUnifiedOrderResponse` |
| `WP001` (v1.0.0) | H5 统一下单 | `H5UnifiedOrderParams` | `H5UnifiedOrderRequest` | `H5UnifiedOrderResponse` |
| `WP001` (v1.0.3) | APP 统一下单 | `AppUnifiedOrderParams` | `AppUnifiedOrderRequest` | `AppUnifiedOrderResponse` |
| `MQ002` | 订单查询 | `OrderQueryParams` | `OrderQueryRequest` | `OrderQueryResponse` |
| `R001` | 退款 | `RefundParams` | `RefundRequest` | `RefundResponse` |
| `Q001` | 退款查询 | `RefundQueryParams` | `RefundQueryRequest` | `RefundQueryResponse` |
| `R002` | 撤销 | `ReverseParams` | `ReverseRequest` | `ReverseResponse` |
| `Q002` | 撤销查询 | `ReverseQueryParams` | `ReverseQueryRequest` | `ReverseQueryResponse` |
| `N001` | 支付结果回调 | - | - | `PaymentNotifyResponse`（经 `NotifyParser.parsePayment`） |
| `RN001` | 退款结果回调 | - | - | `RefundNotifyResponse`（经 `NotifyParser.parseRefund`） |

统一下单、订单查询走网关根路径 `/`；退款、退款查询走 `/refund/refundOrder`；撤销、撤销查询走 `/refund/cancelOrder`（撤销查询实际路径为 `/refund/refundOrder`，与源码一致）。所有 `Request` 构造函数第二个参数均可传入版本号字符串或 `{ version }` 覆盖默认版本，例如 `new OrderQueryRequest(params, "1.0.1")`。

## 响应判断

`isSuccess()` 按操作类型使用不同判定字段（见 `src/responses.js` 真实实现）：

- 统一下单族（JSAPI/聚合码/小程序/H5/APP）：`responseCode === "A001"`（继承自 `IpaynowResponse`）。
- 订单查询：同样使用 `responseCode === "A001"`。
- 退款、退款查询、撤销、撤销查询：`responseCode === "R000"`。
- 支付结果回调（`PaymentNotifyResponse`）：`transStatus === "A001"`。
- 退款结果回调（`RefundNotifyResponse`）：`tradeStatus === "A001"`。

统一下单响应额外提供便捷访问器：

```javascript
response.tn();            // 支付要素，兼容大写字段 TN
response.nowPayOrderNo();  // 现在支付流水号
```

订单查询响应提供：`response.transStatus()`、`response.nowPayOrderNo()`、`response.payTime()`、`response.channelOrderNo()`。

也可以直接读取原始字段：

```javascript
const code = response.code();       // responseCode
const message = response.message(); // responseMsg
const rawBody = response.rawBody(); // 原始报文串
const fields = response.fields();   // 全部字段的副本
```

## 扩展字段

`Params` 构造函数支持 `extraParams`（普通对象），用于传递 SDK 尚未显式建模的业务字段：

```javascript
const params = new H5UnifiedOrderParams({
  mhtOrderNo: "ORDER202607030001",
  mhtOrderAmt: 1,
  extraParams: { mhtGoodsTag: "TAG001" },
});
```

`extraParams` 中的字段与命名字段合并时，`extraParams` 后写覆盖前写（与已建模字段同名时以 `extraParams` 为准）。SDK 只在客户端组装阶段（`IpaynowClient#signedFields`）以固定顺序追加公共字段和签名字段，因此业务参数无法覆盖以下保留字段：

- `funcode`
- `version`
- `appId`
- `mhtCharset`
- `mhtSignType`
- `signType`
- `mhtSignature`
- `signature`

## 回调验签

```javascript
import { NotifyParser, NotifyAck } from "ipaynow-nodejs-sdk";

const notify = NotifyParser.parsePayment(requestBody, appKey);
if (notify.isSuccess()) {
  // 处理支付成功业务逻辑
}
// 按现在支付协议要求同步返回 success=Y / success=N
const ackBody = NotifyAck.success(); // 或 NotifyAck.fail()
```

退款回调：

```javascript
const notify = NotifyParser.parseRefund(requestBody, appKey);
```

两者验签失败均抛出 `IpaynowError`（`codeName: "SIGN_ERROR"`）。

## 错误处理

SDK 只抛出一种异常类型 `IpaynowError`，通过 `code` / `codeName` 属性区分具体失败原因：

```javascript
import { IpaynowError } from "ipaynow-nodejs-sdk";

try {
  await client.execute(request);
} catch (err) {
  if (err instanceof IpaynowError) {
    console.error(err.codeName, err.code, err.message);
  }
}
```

错误码表（`src/errors.js`）：

| codeName | code | 默认信息 |
| --- | --- | --- |
| `SYSTEM_ERROR` | `E0001` | 组件内部异常 |
| `HTTP_EXCEPTION` | `E0002` | HTTP异常 |
| `CONNECT_TIMEOUT` | `E0003` | ConnectTimeOut |
| `SOCKET_TIMEOUT` | `E0004` | SocketTimeOut |
| `SIGN_ERROR` | `E0012` | 渠道报文验签失败 |

注意：默认传输基于全局 `fetch`，无法区分“建连超时”与“读取超时”，超时统一映射为 `SOCKET_TIMEOUT`；`connectTimeoutMillis + readTimeoutMillis` 之和作为整体请求超时预算传给 `AbortSignal.timeout`。
