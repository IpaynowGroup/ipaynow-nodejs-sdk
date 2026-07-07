import crypto from "node:crypto";

function requireNonBlank(value, name) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(`${name} 不能为空`);
  }
  return value;
}

export const SignType = Object.freeze({
  MD5: "MD5",
  RSA: "RSA",
});

function decodeBase64(value, name) {
  if (value.includes("-----BEGIN") || value.includes("-----END")) {
    throw new TypeError(`${name} 仅支持裸 base64，不支持 PEM`);
  }
  try {
    return Buffer.from(value.replace(/\s+/g, ""), "base64");
  } catch (error) {
    throw new TypeError(`${name} 非法，需传裸 base64`, { cause: error });
  }
}

/**
 * iPayNow SDK 配置：appId / appKey / baseUrl / 超时时间。
 */
export class IpaynowConfig {
  /**
   * @param {{appId: string, appKey?: string, signType?: string, mchPrivateKey?: string, ipaynowPublicKey?: string, baseUrl?: string, connectTimeoutMillis?: number, readTimeoutMillis?: number}} options
   */
  constructor({
    appId,
    appKey,
    signType = SignType.MD5,
    mchPrivateKey,
    ipaynowPublicKey,
    baseUrl = "https://pay.ipaynow.cn",
    connectTimeoutMillis = 5000,
    readTimeoutMillis = 15000,
  } = {}) {
    this.appId = requireNonBlank(appId, "appId");
    this.signType = signType ?? SignType.MD5;
    if (this.signType === SignType.MD5) {
      this.appKey = requireNonBlank(appKey, "appKey");
      this.mchPrivateKey = null;
      this.ipaynowPublicKey = null;
      this.mchPrivateKeyObject = null;
      this.ipaynowPublicKeyObject = null;
    } else if (this.signType === SignType.RSA) {
      this.appKey = null;
      this.mchPrivateKey = requireNonBlank(mchPrivateKey, "mchPrivateKey");
      this.ipaynowPublicKey = requireNonBlank(ipaynowPublicKey, "ipaynowPublicKey");
      this.mchPrivateKeyObject = crypto.createPrivateKey({
        key: decodeBase64(this.mchPrivateKey, "mchPrivateKey"),
        type: "pkcs8",
        format: "der",
      });
      this.ipaynowPublicKeyObject = crypto.createPublicKey({
        key: decodeBase64(this.ipaynowPublicKey, "ipaynowPublicKey"),
        type: "spki",
        format: "der",
      });
    } else {
      throw new TypeError(`不支持的签名类型: ${this.signType}`);
    }
    requireNonBlank(baseUrl, "baseUrl");
    if (!(connectTimeoutMillis > 0) || !(readTimeoutMillis > 0)) {
      throw new TypeError(
        `超时时间必须大于 0：connectTimeoutMillis=${connectTimeoutMillis}，readTimeoutMillis=${readTimeoutMillis}`
      );
    }
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.connectTimeoutMillis = connectTimeoutMillis;
    this.readTimeoutMillis = readTimeoutMillis;
  }

  /**
   * @param {string} path
   * @returns {string}
   */
  endpoint(path) {
    const normalizedPath = !path ? "/" : path.startsWith("/") ? path : `/${path}`;
    return `${this.baseUrl}${normalizedPath}`;
  }
}
