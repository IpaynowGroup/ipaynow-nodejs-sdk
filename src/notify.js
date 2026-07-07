import { parseResponse } from "./form.js";
import { verify } from "./signer.js";
import { IpaynowError } from "./errors.js";
import { PaymentNotifyResponse, RefundNotifyResponse } from "./responses.js";

/**
 * @param {string} body
 * @param {import("./config.js").IpaynowConfig} config
 * @param {boolean} excludeSignType
 * @param {new () => import("./responses.js").IpaynowResponse} ResponseClass
 */
function parse(body, config, excludeSignType, ResponseClass) {
  const fields = parseResponse(body);
  if (!verify(fields, config, "signature", excludeSignType)) {
    throw new IpaynowError("SIGN_ERROR", "现在支付回调通知验签失败");
  }
  const response = new ResponseClass();
  response.load(fields, body);
  return response;
}

export const NotifyParser = Object.freeze({
  /**
   * N001 支付回调，signType 参与签名。
   * @param {string} body
   * @param {import("./config.js").IpaynowConfig} config
   * @returns {PaymentNotifyResponse}
   */
  parsePayment(body, config) {
    return parse(body, config, false, PaymentNotifyResponse);
  },

  /**
   * RN001 退款回调，signType 不参与签名。
   * @param {string} body
   * @param {import("./config.js").IpaynowConfig} config
   * @returns {RefundNotifyResponse}
   */
  parseRefund(body, config) {
    return parse(body, config, true, RefundNotifyResponse);
  },
});

/** 回调同步应答体 */
export const NotifyAck = Object.freeze({
  success() {
    return "success=Y";
  },
  fail() {
    return "success=N";
  },
});
