export class AppError extends Error {
  constructor(code, message, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export const route = handler => (req, res, next) => Promise.resolve(handler(req, res)).catch(next);

export async function providerFetch(url, options = {}, attempts = 2) {
  let response;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    response = await fetch(url, options);
    if (response.status !== 429 || attempt === attempts - 1) break;
    const seconds = Math.min(Number(response.headers.get('retry-after') || 1), 10);
    await new Promise(resolve => setTimeout(resolve, Math.max(seconds, 1) * 1000));
  }
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const code = response.status === 429 ? 'RATE_LIMITED' : response.status === 401 ? 'RECONNECT_REQUIRED' : 'PROVIDER_FAILED';
    throw new AppError(code, `${code}: ${response.status}`, response.status === 429 ? 429 : 502);
  }
  return body;
}

export async function pages(firstUrl, options, select) {
  let url = firstUrl;
  const result = [];
  while (url) {
    const page = await providerFetch(url, options);
    result.push(...select(page));
    url = page.next || (page.nextPageToken ? `${firstUrl}${firstUrl.includes('?') ? '&' : '?'}pageToken=${encodeURIComponent(page.nextPageToken)}` : null);
  }
  return result;
}
