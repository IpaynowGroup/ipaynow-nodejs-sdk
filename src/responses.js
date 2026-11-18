/**
 * 通用响应基类：字段访问 + isSuccess 判定（正向交易 responseCode==A001，见规范 §6）。
 */
export class IpaynowResponse {
  constructor() {
    /** @type {Record<string, string>} */
    this._fields = {};
    /** @type {string|undefined} */
    this._rawBody = undefined;
  }

  /**
   * @param {Record<string, string>} fields
   * @param {string} [rawBody]
   */
  load(fields, rawBody) {
    this._fields = { ...fields };
    this._rawBody = rawBody;
  }

  /** @param {string} name */
  get(name) {
    return this._fields[name];
  }

  /** @returns {Record<string, string>} 字段表副本 */
  fields() {
    return { ...this._fields };
  }

  /** @returns {string|undefined} 原始报文串 */
  rawBody() {
    return this._rawBody;
  }

  /** @returns {string|undefined} responseCode */
  code() {
    return this.get("responseCode");
  }

  /** @returns {string|undefined} responseMsg */
  message() {
    return this.get("responseMsg");
  }

  /** @returns {boolean} */
  isSuccess() {
    return this.get("responseCode") === "A001";
  }
}

/** WP001 统一下单响应公共便捷访问器 */
export class UnifiedOrderResponse extends IpaynowResponse {
  /** @returns {string|undefined} 支付要素（兼容大写 TN） */
  tn() {
    const tn = this.get("tn");
    return tn !== undefined ? tn : this.get("TN");
  }

  /** @returns {string|undefined} 现在支付流水号 */
  nowPayOrderNo() {
    return this.get("nowPayOrderNo");
  }
}

export class JsapiUnifiedOrderResponse extends UnifiedOrderResponse {}
export class AggregateCodeUnifiedOrderResponse extends UnifiedOrderResponse {}
export class MiniProgramUnifiedOrderResponse extends UnifiedOrderResponse {}
export class H5UnifiedOrderResponse extends UnifiedOrderResponse {}
export class AppUnifiedOrderResponse extends UnifiedOrderResponse {}

/** MQ002 订单查询响应 */
export class OrderQueryResponse extends IpaynowResponse {
  transStatus() {
    return this.get("transStatus");
  }

  nowPayOrderNo() {
    return this.get("nowPayOrderNo");
  }

  payTime() {
    return this.get("payTime");
  }

  channelOrderNo() {
    return this.get("channelOrderNo");
  }
}

/** 退款族响应：responseCode==R000 才算成功 */
export class RefundResponse extends IpaynowResponse {
  isSuccess() {
    return this.get("responseCode") === "R000";
  }
}

export class RefundQueryResponse extends IpaynowResponse {
  isSuccess() {
    return this.get("responseCode") === "R000";
  }
}

export class ReverseResponse extends IpaynowResponse {
  isSuccess() {
    return this.get("responseCode") === "R000";
  }
}

export class ReverseQueryResponse extends IpaynowResponse {
  isSuccess() {
    return this.get("responseCode") === "R000";
  }
}

/** N001 支付回调：transStatus==A001 才算成功，部分通道下发 tradeStatus */
export class PaymentNotifyResponse extends IpaynowResponse {
  isSuccess() {
    return this.status() === "A001";
  }

  /** @returns {string|undefined} transStatus 字段 */
  transStatus() {
    return this.get("transStatus");
  }

  /** @returns {string|undefined} tradeStatus 字段 */
  tradeStatus() {
    return this.get("tradeStatus");
  }

  /** @returns {string|undefined} 交易状态：优先 transStatus，缺失回退 tradeStatus */
  status() {
    return this.get("transStatus") || this.get("tradeStatus");
  }
}

/** RN001 退款回调：tradeStatus==A001 才算成功 */
export class RefundNotifyResponse extends IpaynowResponse {
  isSuccess() {
    return this.get("tradeStatus") === "A001";
  }
}
