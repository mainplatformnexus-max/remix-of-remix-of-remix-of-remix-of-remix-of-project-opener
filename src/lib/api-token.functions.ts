import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

/** Drops the cached token hash so a newly created token works right away. */
export const refreshApiToken = createServerFn({ method: "POST" }).handler(async () => {
  const { resetApiTokenCache } = await import("./api-token");
  resetApiTokenCache();
  return { ok: true };
});

/** Public origin of the current request (for the /doc page). */
export const getSiteOrigin = createServerFn({ method: "GET" }).handler(async () => {
  const req = getRequest();
  const url = new URL(req.url);
  const proto = req.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? url.host;
  return `${proto.split(",")[0].trim()}://${host.split(",")[0].trim()}`;
});
