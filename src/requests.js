import {
  JsapiUnifiedOrderParams,
  AggregateCodeUnifiedOrderParams,
  MiniProgramUnifiedOrderParams,
  H5UnifiedOrderParams,
  AppUnifiedOrderParams,
  OrderQueryParams,
  RefundParams,
  RefundQueryParams,
  ReverseParams,
  ReverseQueryParams,
} from "./params.js";
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
} from "./responses.js";

/**
 * 每操作一个 Request 类，携带 funcode/version/path/签名字段名/excludeSignType 元数据。
 * 不使用集中式 Requests 工厂（已在设计评审中否决）。
 */
export class IpaynowRequest {
  /**
   * @param {{funcode: string, version: string, path?: string, signTypeField: string,
   *   excludeSignType?: boolean, responseClass: Function, params: {toFields: () => Record<string, string>}}} options
   */
  constructor({ funcode, version, path = "/", signTypeField, excludeSignType = false, responseClass, params }) {
    this.funcode = funcode;
    this.version = version;
    this.path = path;
    this.signTypeField = signTypeField;
    this.excludeSignType = excludeSignType;
    this.responseClass = responseClass;
    this.params = params;
  }

  get mhtCharset() {
    return "UTF-8";
  }

  get signatureField() {
    return "mhtSignature";
  }

  get responseSignatureField() {
    return "signature";
  }

  /** @returns {Record<string, string>} */
  toFields() {
    return this.params.toFields();
  }
}

/** @param {string|{version?: string}} [override] */
function resolveVersion(defaultVersion, override) {
  if (typeof override === "string") return override;
  if (override && typeof override === "object" && override.version) return override.version;
  return defaultVersion;
}

/** JSAPI 统一下单请求（funcode=WP001, version=1.0.0, path=/） */
export class JsapiUnifiedOrderRequest extends IpaynowRequest {
  /**
   * @param {JsapiUnifiedOrderParams|object} params
   * @param {string|{version?: string}} [versionOrOptions]
   */
  constructor(params, versionOrOptions) {
    const p = params instanceof JsapiUnifiedOrderParams ? params : new JsapiUnifiedOrderParams(params);
    super({
      funcode: "WP001",
      version: resolveVersion("1.0.0", versionOrOptions),
      path: "/",
      signTypeField: "mhtSignType",
      excludeSignType: false,
      responseClass: JsapiUnifiedOrderResponse,
      params: p,
    });
  }
}

/** 聚合码统一下单请求（funcode=WP001, version=1.0.3, path=/） */
export class AggregateCodeUnifiedOrderRequest extends IpaynowRequest {
  /**
   * @param {AggregateCodeUnifiedOrderParams|object} params
   * @param {string|{version?: string}} [versionOrOptions]
   */
  constructor(params, versionOrOptions) {
    const p = params instanceof AggregateCodeUnifiedOrderParams ? params : new AggregateCodeUnifiedOrderParams(params);
    super({
      funcode: "WP001",
      version: resolveVersion("1.0.3", versionOrOptions),
      path: "/",
      signTypeField: "mhtSignType",
      excludeSignType: false,
      responseClass: AggregateCodeUnifiedOrderResponse,
      params: p,
    });
  }
}

/** 小程序统一下单请求（funcode=WP001, version=1.0.0, path=/） */
export class MiniProgramUnifiedOrderRequest extends IpaynowRequest {
  /**
   * @param {MiniProgramUnifiedOrderParams|object} params
   * @param {string|{version?: string}} [versionOrOptions]
   */
  constructor(params, versionOrOptions) {
    const p = params instanceof MiniProgramUnifiedOrderParams ? params : new MiniProgramUnifiedOrderParams(params);
    super({
      funcode: "WP001",
      version: resolveVersion("1.0.0", versionOrOptions),
      path: "/",
      signTypeField: "mhtSignType",
      excludeSignType: false,
      responseClass: MiniProgramUnifiedOrderResponse,
      params: p,
    });
  }
}

/** H5 统一下单请求（funcode=WP001, version=1.0.0, path=/） */
export class H5UnifiedOrderRequest extends IpaynowRequest {
  /**
   * @param {H5UnifiedOrderParams|object} params
   * @param {string|{version?: string}} [versionOrOptions]
   */
  constructor(params, versionOrOptions) {
    const p = params instanceof H5UnifiedOrderParams ? params : new H5UnifiedOrderParams(params);
    super({
      funcode: "WP001",
      version: resolveVersion("1.0.0", versionOrOptions),
      path: "/",
      signTypeField: "mhtSignType",
      excludeSignType: false,
      responseClass: H5UnifiedOrderResponse,
      params: p,
    });
  }
}

/** APP 统一下单请求（funcode=WP001, version=1.0.3, path=/） */
export class AppUnifiedOrderRequest extends IpaynowRequest {
  /**
   * @param {AppUnifiedOrderParams|object} params
   * @param {string|{version?: string}} [versionOrOptions]
   */
  constructor(params, versionOrOptions) {
    const p = params instanceof AppUnifiedOrderParams ? params : new AppUnifiedOrderParams(params);
    super({
      funcode: "WP001",
      version: resolveVersion("1.0.3", versionOrOptions),
      path: "/",
      signTypeField: "mhtSignType",
      excludeSignType: false,
      responseClass: AppUnifiedOrderResponse,
      params: p,
    });
  }
}

/** 订单查询请求（funcode=MQ002, version=1.0.0，可被 params.version 或构造覆盖，path=/） */
export class OrderQueryRequest extends IpaynowRequest {
  /**
   * @param {OrderQueryParams|object} params
   * @param {string|{version?: string}} [versionOrOptions]
   */
  constructor(params, versionOrOptions) {
    const p = params instanceof OrderQueryParams ? params : new OrderQueryParams(params);
    const version = resolveVersion(p.version || "1.0.0", versionOrOptions);
    super({
      funcode: "MQ002",
      version,
      path: "/",
      signTypeField: "mhtSignType",
      excludeSignType: false,
      responseClass: OrderQueryResponse,
      params: p,
    });
  }
}

/** 退款请求（funcode=R001, version=1.0.0, path=/refund/refundOrder, signType 不参与签名） */
export class RefundRequest extends IpaynowRequest {
  /**
   * @param {RefundParams|object} params
   * @param {string|{version?: string}} [versionOrOptions]
   */
  constructor(params, versionOrOptions) {
    const p = params instanceof RefundParams ? params : new RefundParams(params);
    super({
      funcode: "R001",
      version: resolveVersion("1.0.0", versionOrOptions),
      path: "/refund/refundOrder",
      signTypeField: "signType",
      excludeSignType: true,
      responseClass: RefundResponse,
      params: p,
    });
  }
}

/** 退款查询请求（funcode=Q001, version=1.0.0, path=/refund/refundQuery, signType 不参与签名） */
export class RefundQueryRequest extends IpaynowRequest {
  /**
   * @param {RefundQueryParams|object} params
   * @param {string|{version?: string}} [versionOrOptions]
   */
  constructor(params, versionOrOptions) {
    const p = params instanceof RefundQueryParams ? params : new RefundQueryParams(params);
    super({
      funcode: "Q001",
      version: resolveVersion("1.0.0", versionOrOptions),
      path: "/refund/refundQuery",
      signTypeField: "signType",
      excludeSignType: true,
      responseClass: RefundQueryResponse,
      params: p,
    });
  }
}

/** 撤销请求（funcode=R002, version=1.0.0, path=/refund/cancelOrder, signType 不参与签名） */
export class ReverseRequest extends IpaynowRequest {
  /**
   * @param {ReverseParams|object} params
   * @param {string|{version?: string}} [versionOrOptions]
   */
  constructor(params, versionOrOptions) {
    const p = params instanceof ReverseParams ? params : new ReverseParams(params);
    super({
      funcode: "R002",
      version: resolveVersion("1.0.0", versionOrOptions),
      path: "/refund/cancelOrder",
      signTypeField: "signType",
      excludeSignType: true,
      responseClass: ReverseResponse,
      params: p,
    });
  }
}

/** 撤销查询请求（funcode=Q002, version=1.0.0, path=/refund/refundQuery, signType 不参与签名） */
export class ReverseQueryRequest extends IpaynowRequest {
  /**
   * @param {ReverseQueryParams|object} params
   * @param {string|{version?: string}} [versionOrOptions]
   */
  constructor(params, versionOrOptions) {
    const p = params instanceof ReverseQueryParams ? params : new ReverseQueryParams(params);
    super({
      funcode: "Q002",
      version: resolveVersion("1.0.0", versionOrOptions),
      path: "/refund/refundQuery",
      signTypeField: "signType",
      excludeSignType: true,
      responseClass: ReverseQueryResponse,
      params: p,
    });
  }
}
