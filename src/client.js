import { sign, verify, clean } from "./signer.js";
import { parseResponse } from "./form.js";
import { IpaynowError } from "./errors.js";

/**
 * 基于全局 fetch 的默认传输实现。
 * fetch 无法区分“建连超时”与“读取超时”（AbortError/TimeoutError 一概抛出），
 * 因此超时统一映射为 SOCKET_TIMEOUT，并在注释中说明这一限制。
 * @param {import("./config.js").IpaynowConfig} config
 * @returns {(url: string, params: Record<string, string>) => Promise<string>}
 */
function createFetchTransport(config) {
  return async function transport(url, params) {
    const body = new URLSearchParams(params);
    const funcode = params.funcode;
    let response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body,
        // fetch 没有独立的建连/读取超时旋钮，用两者之和近似整体请求预算。
        signal: AbortSignal.timeout(config.connectTimeoutMillis + config.readTimeoutMillis),
      });
    } catch (err) {
      if (err.name === "TimeoutError" || err.name === "AbortError") {
        throw new IpaynowError("SOCKET_TIMEOUT", `现在支付请求超时，功能码=${funcode}`, { cause: err });
      }
      throw new IpaynowError("HTTP_EXCEPTION", `现在支付请求异常，功能码=${funcode}`, { cause: err });
    }
    const text = await response.text();
    if (!response.ok) {
      throw new IpaynowError(
        "HTTP_EXCEPTION",
        `现在支付HTTP请求失败，状态码=${response.status}，功能码=${funcode}，响应报文=${text}`
      );
    }
    return text;
  };
}

/**
 * iPayNow 客户端：组装公共字段 → 签名 → POST 表单 → 解析响应 → 验签 → 返回类型化 Response。
 */
export class IpaynowClient {
  /**
   * @param {import("./config.js").IpaynowConfig} config
   * @param {(url: string, params: Record<string, string>) => Promise<string>} [transport] 可注入的传输实现，便于测试
   */
  constructor(config, transport) {
    this.config = config;
    this.transport = transport ?? createFetchTransport(config);
  }

  /**
   * @param {import("./requests.js").IpaynowRequest} request
   * @returns {Promise<import("./responses.js").IpaynowResponse>}
   */
  async execute(request) {
    const funcode = request.funcode;
    const fields = this.signedFields(request);

    const responseText = await this.transport(this.config.endpoint(request.path), fields);
    const responseFields = parseResponse(responseText);

    if (!verify(responseFields, this.config, request.responseSignatureField, request.excludeSignType)) {
      throw new IpaynowError("SIGN_ERROR", `现在支付响应验签失败，功能码=${funcode}`);
    }

    const response = new request.responseClass();
    response.load(responseFields, responseText);
    return response;
  }

  /**
   * 返回签名后的完整表单字段（供前端跳转表单场景），不发请求。
   * @param {import("./requests.js").IpaynowRequest} request
   * @returns {Record<string, string>}
   */
  buildFormFields(request) {
    return this.signedFields(request);
  }

  /**
   * @param {import("./requests.js").IpaynowRequest} request
   * @returns {Record<string, string>}
   */
  signedFields(request) {
    const fields = {
      ...request.toFields(),
      funcode: request.funcode,
      version: request.version,
      appId: this.config.appId,
      mhtCharset: request.mhtCharset,
    };
    fields[request.signTypeField] = this.config.signType;
    fields[request.signatureField] = sign(
      fields,
      this.config,
      request.excludeSignType,
      request.signatureField,
      request.responseSignatureField
    );
    return clean(fields);
  }
}
