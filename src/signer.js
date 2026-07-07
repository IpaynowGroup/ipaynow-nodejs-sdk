import crypto from "node:crypto";
import { SignType } from "./config.js";

/**
 * @param {string} value
 * @returns {string} 小写 hex md5
 */
export function md5Hex(value) {
  return crypto.createHash("md5").update(value, "utf8").digest("hex");
}

/**
 * 剔除 null / undefined / 空串值，其余值转为字符串。
 * @param {Record<string, unknown>} fields
 * @returns {Record<string, string>}
 */
export function clean(fields) {
  const out = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null || value === "") continue;
    out[key] = String(value);
  }
  return out;
}

function canonical(fields, excludeSignType = false, ...excludeFields) {
  const cleaned = clean(fields);
  if (excludeSignType) delete cleaned.signType;
  delete cleaned.mhtSignature;
  delete cleaned.signature;
  for (const field of excludeFields) delete cleaned[field];
  return Object.keys(cleaned)
    .sort()
    .map((key) => `${key}=${cleaned[key]}`)
    .join("&");
}

function md5Sign(canonicalValue, config) {
  return md5Hex(`${canonicalValue}&${md5Hex(config.appKey)}`);
}

function rsaSign(canonicalValue, config) {
  return crypto.sign("RSA-SHA256", Buffer.from(canonicalValue, "utf8"), config.mchPrivateKeyObject).toString("base64");
}

function strategy(config) {
  return config.signType === SignType.RSA
    ? { sign: rsaSign, verify: rsaVerify }
    : { sign: md5Sign, verify: md5Verify };
}

function md5Verify(canonicalValue, actual, config) {
  const expectedBuf = Buffer.from(md5Sign(canonicalValue, config), "utf8");
  const actualBuf = Buffer.from(String(actual).toLowerCase(), "utf8");
  return expectedBuf.length === actualBuf.length && crypto.timingSafeEqual(expectedBuf, actualBuf);
}

function rsaVerify(canonicalValue, actual, config) {
  try {
    return crypto.verify(
      "RSA-SHA256",
      Buffer.from(canonicalValue, "utf8"),
      config.ipaynowPublicKeyObject,
      Buffer.from(String(actual).replace(/\s+/g, ""), "base64")
    );
  } catch {
    return false;
  }
}

/**
 * 现在支付签名算法：
 * 1. 剔除 null/空串值
 * 2. 剔除 mhtSignature / signature（以及调用方额外指定的字段）
 * 3. excludeSignType=true 时再剔除 signType（mhtSignType 是不同字段名，永远参与签名）
 * 4. 按 key 字典序排序拼接 k=v&k2=v2...
 * 5. 追加 &md5(appKey)，整体再取 md5
 *
 * @param {Record<string, unknown>} fields
 * @param {import("./config.js").IpaynowConfig} config
 * @param {boolean} [excludeSignType]
 * @param {...string} excludeFields 额外需要剔除的字段（如当前签名字段本身）
 * @returns {string}
 */
export function sign(fields, config, excludeSignType = false, ...excludeFields) {
  return strategy(config).sign(canonical(fields, excludeSignType, ...excludeFields), config);
}

/**
 * 验签（安全红线）：签名缺失即失败，常量时间比较。
 * @param {Record<string, unknown>} fields
 * @param {import("./config.js").IpaynowConfig} config
 * @param {string} signatureField
 * @param {boolean} [excludeSignType]
 * @returns {boolean}
 */
export function verify(fields, config, signatureField, excludeSignType = false) {
  const actual = fields[signatureField];
  if (actual === undefined || actual === null || actual === "") {
    return false;
  }
  if (fields.signType && String(fields.signType).toUpperCase() !== config.signType) {
    return false;
  }
  return strategy(config).verify(
    canonical(fields, excludeSignType, signatureField, "mhtSignature"),
    actual,
    config
  );
}
