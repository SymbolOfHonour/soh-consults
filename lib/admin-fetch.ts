/** Bound both the request and its body so failed CMS requests release controls. */
export async function fetchAdminResponse(input: RequestInfo | URL, init: RequestInit = {}, timeoutMs = 30000): Promise<Response> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error("Request timed out. Refresh the dashboard to check whether it saved before retrying."));
      controller.abort();
    }, timeoutMs);
  });
  const request = (async () => {
    const response = await fetch(input, { ...init, signal: controller.signal });
    const body = await response.text();
    return new Response(response.status === 204 || response.status === 205 || response.status === 304 ? null : body, {
      status: response.status, statusText: response.statusText, headers: response.headers,
    });
  })();
  try { return await Promise.race([request, timeout]); }
  finally { clearTimeout(timer!); }
}
