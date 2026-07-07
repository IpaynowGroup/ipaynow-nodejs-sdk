/**
 * 解析 `k=v&k2=v2` 表单串为字段表（值已 URL-decode）。
 * @param {string} text
 * @returns {Record<string, string>}
 */
export function parseResponse(text) {
  const trimmed = typeof text === "string" ? text.trim() : "";
  if (!trimmed) return {};
  const out = {};
  for (const [key, value] of new URLSearchParams(trimmed)) {
    out[key] = value;
  }
  return out;
}
