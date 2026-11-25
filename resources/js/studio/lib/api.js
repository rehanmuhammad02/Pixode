let csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
let tokenRequest;
async function getToken() {
  if (csrfToken) return csrfToken;
  tokenRequest ||= fetch('/api/admin/session', { credentials: 'same-origin' }).then(r => r.json()).then(data => { csrfToken = data.csrf; tokenRequest = null; return csrfToken; }).catch(error => { tokenRequest = null; throw error; });
  return tokenRequest;
}
export async function api(path, { csrf, body, headers, ...options } = {}) {
  const mutation = !['GET', 'HEAD'].includes((options.method || 'GET').toUpperCase());
  const token = mutation ? await getToken() : null;
  const response = await fetch(path, {
    credentials: "same-origin",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "X-CSRF-TOKEN": token } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const result = await response.json().catch(() => ({}));
  if (response.ok && result.csrf) csrfToken = result.csrf;
  if (response.ok && path.endsWith("/logout")) csrfToken = null;
  if (response.status === 419) csrfToken = null;
  if (!response.ok) {
    const error = new Error(
      result.error ||
        result.detail ||
        Object.values(result.errors || {}).flat()[0] ||
        result.message ||
        "This request could not be completed. Please try again.",
    );
    error.status = response.status;
    throw error;
  }
  return result;
}
export const formatMoney = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
