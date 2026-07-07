/**
 * iPayNow SDK 统一错误码。调用方只捕获 IpaynowError 一种异常类型，
 * 通过 `code`/`codeName` 属性区分具体失败原因。
 */
export const IpaynowErrorCode = Object.freeze({
  SYSTEM_ERROR: "E0001",
  HTTP_EXCEPTION: "E0002",
  CONNECT_TIMEOUT: "E0003",
  SOCKET_TIMEOUT: "E0004",
  SIGN_ERROR: "E0012",
});

const DEFAULT_MESSAGES = Object.freeze({
  SYSTEM_ERROR: "组件内部异常",
  HTTP_EXCEPTION: "HTTP异常",
  CONNECT_TIMEOUT: "ConnectTimeOut",
  SOCKET_TIMEOUT: "SocketTimeOut",
  SIGN_ERROR: "渠道报文验签失败",
});

/**
 * iPayNow SDK 统一异常。
 */
export class IpaynowError extends Error {
  /**
   * @param {keyof typeof IpaynowErrorCode} codeName
   * @param {string} [message]
   * @param {{cause?: unknown}} [options]
   */
  constructor(codeName, message, options) {
    super(message ?? DEFAULT_MESSAGES[codeName], options);
    this.name = "IpaynowError";
    this.codeName = codeName;
    this.code = IpaynowErrorCode[codeName];
  }
}
