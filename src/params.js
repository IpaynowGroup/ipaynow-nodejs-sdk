/**
 * 将 Params 实例（不含 extraParams）与 extraParams 合并为字符串字段表。
 * null/undefined 跳过；其余值转字符串；extraParams 与命名字段同名时以 extraParams 为准
 * （即后写覆盖前写，与 Java BeanMap 行为一致）。
 * @param {object} instance
 * @returns {Record<string, string>}
 */
function toFieldsOf(instance) {
  const out = {};
  for (const key of Object.keys(instance)) {
    if (key === "extraParams") continue;
    const value = instance[key];
    if (value === undefined || value === null) continue;
    out[key] = String(value);
  }
  if (instance.extraParams) {
    for (const [key, value] of Object.entries(instance.extraParams)) {
      if (value === undefined || value === null) continue;
      out[key] = String(value);
    }
  }
  return out;
}

/** JSAPI 统一下单入参（规范 §5.1） */
export class JsapiUnifiedOrderParams {
  /** @param {object} [fields] */
  constructor(fields = {}) {
    const {
      consumerCreateIp,
      consumerId,
      deviceType = "0600",
      frontNotifyUrl,
      mhtCurrencyType = "156",
      mhtGoodsTag,
      mhtGoodsDetails,
      mhtLimitPay,
      mhtOrderAmt,
      mhtOrderDetail,
      mhtOrderName,
      mhtOrderNo,
      mhtOrderStartTime,
      mhtOrderTimeOut = 120,
      mhtOrderType = "05",
      mhtReserved,
      mhtSubAppId,
      notifyUrl,
      outputType,
      payChannelType,
      extraParams,
    } = fields;
    Object.assign(this, {
      consumerCreateIp,
      consumerId,
      deviceType,
      frontNotifyUrl,
      mhtCurrencyType,
      mhtGoodsTag,
      mhtGoodsDetails,
      mhtLimitPay,
      mhtOrderAmt,
      mhtOrderDetail,
      mhtOrderName,
      mhtOrderNo,
      mhtOrderStartTime,
      mhtOrderTimeOut,
      mhtOrderType,
      mhtReserved,
      mhtSubAppId,
      notifyUrl,
      outputType,
      payChannelType,
    });
    this.extraParams = extraParams;
  }

  toFields() {
    return toFieldsOf(this);
  }
}

/** 聚合码统一下单入参（规范 §5.2） */
export class AggregateCodeUnifiedOrderParams {
  /** @param {object} [fields] */
  constructor(fields = {}) {
    const {
      deviceType = "20",
      mhtCurrencyType = "156",
      mhtLimitPay,
      mhtOrderAmt,
      mhtOrderDetail,
      mhtOrderName,
      mhtOrderNo,
      mhtOrderStartTime,
      mhtOrderTimeOut = 120,
      mhtOrderType = "05",
      mhtReserved,
      notifyUrl,
      outputType,
      extraParams,
    } = fields;
    Object.assign(this, {
      deviceType,
      mhtCurrencyType,
      mhtLimitPay,
      mhtOrderAmt,
      mhtOrderDetail,
      mhtOrderName,
      mhtOrderNo,
      mhtOrderStartTime,
      mhtOrderTimeOut,
      mhtOrderType,
      mhtReserved,
      notifyUrl,
      outputType,
    });
    this.extraParams = extraParams;
  }

  toFields() {
    return toFieldsOf(this);
  }
}

/** 小程序统一下单入参（规范 §5.3） */
export class MiniProgramUnifiedOrderParams {
  /** @param {object} [fields] */
  constructor(fields = {}) {
    const {
      consumerId,
      deviceType = "14",
      discountAmt,
      mhtCurrencyType = "156",
      mhtGoodsTag,
      mhtGoodsDetails,
      mhtLimitPay,
      mhtOrderAmt,
      mhtOrderDetail,
      mhtOrderName,
      mhtOrderNo,
      mhtOrderStartTime,
      mhtOrderTimeOut = 120,
      mhtOrderType = "05",
      mhtReserved,
      mhtSubAppId,
      notifyUrl,
      oriMhtOrderAmt,
      outputType = "1",
      payChannelType,
      mhtStoreId,
      extraParams,
    } = fields;
    Object.assign(this, {
      consumerId,
      deviceType,
      discountAmt,
      mhtCurrencyType,
      mhtGoodsTag,
      mhtGoodsDetails,
      mhtLimitPay,
      mhtOrderAmt,
      mhtOrderDetail,
      mhtOrderName,
      mhtOrderNo,
      mhtOrderStartTime,
      mhtOrderTimeOut,
      mhtOrderType,
      mhtReserved,
      mhtSubAppId,
      notifyUrl,
      oriMhtOrderAmt,
      outputType,
      payChannelType,
      mhtStoreId,
    });
    this.extraParams = extraParams;
  }

  toFields() {
    return toFieldsOf(this);
  }
}

/** H5 统一下单入参（规范 §5.4） */
export class H5UnifiedOrderParams {
  /** @param {object} [fields] */
  constructor(fields = {}) {
    const {
      consumerCreateIp,
      consumerId,
      deviceType = "0601",
      frontNotifyUrl,
      mhtCurrencyType = "156",
      mhtLimitPay,
      mhtOrderAmt,
      mhtOrderDetail,
      mhtOrderName,
      mhtOrderNo,
      mhtOrderStartTime,
      mhtOrderTimeOut = 120,
      mhtOrderType = "05",
      mhtReserved,
      notifyUrl,
      outputType,
      payChannelType,
      specifiedChannel,
      payAccNo,
      guideId,
      extraParams,
    } = fields;
    Object.assign(this, {
      consumerCreateIp,
      consumerId,
      deviceType,
      frontNotifyUrl,
      mhtCurrencyType,
      mhtLimitPay,
      mhtOrderAmt,
      mhtOrderDetail,
      mhtOrderName,
      mhtOrderNo,
      mhtOrderStartTime,
      mhtOrderTimeOut,
      mhtOrderType,
      mhtReserved,
      notifyUrl,
      outputType,
      payChannelType,
      specifiedChannel,
      payAccNo,
      guideId,
    });
    this.extraParams = extraParams;
  }

  toFields() {
    return toFieldsOf(this);
  }
}

/** APP 统一下单入参（规范 §5.5） */
export class AppUnifiedOrderParams {
  /** @param {object} [fields] */
  constructor(fields = {}) {
    const {
      consumerCreateIp,
      consumerId,
      consumerName,
      deviceType = "01",
      mhtCurrencyType = "156",
      mhtLimitPay,
      mhtOrderAmt,
      mhtOrderDetail,
      mhtOrderName,
      mhtOrderNo,
      mhtOrderStartTime,
      mhtOrderTimeOut = 120,
      mhtOrderType = "05",
      mhtReserved,
      mhtSubAppId,
      notifyUrl,
      payChannelType,
      outputType = "0",
      frontNotifyUrl,
      mhtStoreId,
      extraParams,
    } = fields;
    Object.assign(this, {
      consumerCreateIp,
      consumerId,
      consumerName,
      deviceType,
      mhtCurrencyType,
      mhtLimitPay,
      mhtOrderAmt,
      mhtOrderDetail,
      mhtOrderName,
      mhtOrderNo,
      mhtOrderStartTime,
      mhtOrderTimeOut,
      mhtOrderType,
      mhtReserved,
      mhtSubAppId,
      notifyUrl,
      payChannelType,
      outputType,
      frontNotifyUrl,
      mhtStoreId,
    });
    this.extraParams = extraParams;
  }

  toFields() {
    return toFieldsOf(this);
  }
}

/** 订单查询入参（规范 §5.6） */
export class OrderQueryParams {
  /** @param {object} [fields] */
  constructor(fields = {}) {
    const { deviceType, mhtOrderNo, version, extraParams } = fields;
    Object.assign(this, { deviceType, mhtOrderNo, version });
    this.extraParams = extraParams;
  }

  toFields() {
    return toFieldsOf(this);
  }
}

/** 退款入参（规范 §5.7） */
export class RefundParams {
  /** @param {object} [fields] */
  constructor(fields = {}) {
    const { amount, mhtOrderNo, mhtRefundNo, notifyUrl, oriTransId, reason, extraParams } = fields;
    Object.assign(this, { amount, mhtOrderNo, mhtRefundNo, notifyUrl, oriTransId, reason });
    this.extraParams = extraParams;
  }

  toFields() {
    return toFieldsOf(this);
  }
}

/** 退款查询入参（规范 §5.8） */
export class RefundQueryParams {
  /** @param {object} [fields] */
  constructor(fields = {}) {
    const { mhtRefundNo, extraParams } = fields;
    Object.assign(this, { mhtRefundNo });
    this.extraParams = extraParams;
  }

  toFields() {
    return toFieldsOf(this);
  }
}

/** 撤销入参（规范 §5.9） */
export class ReverseParams {
  /** @param {object} [fields] */
  constructor(fields = {}) {
    const { mhtRefundNo, mhtOrderNo, oriTransId, reason, extraParams } = fields;
    Object.assign(this, { mhtRefundNo, mhtOrderNo, oriTransId, reason });
    this.extraParams = extraParams;
  }

  toFields() {
    return toFieldsOf(this);
  }
}

/** 撤销查询入参（规范 §5.10） */
export class ReverseQueryParams {
  /** @param {object} [fields] */
  constructor(fields = {}) {
    const { mhtRefundNo, extraParams } = fields;
    Object.assign(this, { mhtRefundNo });
    this.extraParams = extraParams;
  }

  toFields() {
    return toFieldsOf(this);
  }
}
