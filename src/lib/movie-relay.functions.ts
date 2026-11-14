import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { normalizeRelayUrl, relayRequestUrl, resetMovieRelayCache } from "./movie-relay";

export type RelayCheck = { ok: boolean; message: string };

/**
 * Proves a relay address really works: it must answer like the MovieBox relay,
 * refuse unrelated hosts, and pass a real MovieBox catalog request through.
 */
export const testMovieRelay = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ url: z.string().max(300) }).parse(d))
  .handler(async ({ data }): Promise<RelayCheck> => {
    const relay = normalizeRelayUrl(data.url);
    if (!relay) return { ok: false, message: "Enter a full https:// address." };
    const timed = (url: string, init?: RequestInit) =>
      fetch(url, { ...init, signal: AbortSignal.timeout(15000) });
    try {
      const root = await timed(`${relay}/`);
      const rootText = (await root.text()).slice(0, 80);
      if (!/missing u/i.test(rootText)) {
        return { ok: false, message: `This address is not a movie relay (it answered ${root.status}).` };
      }
      const api = await timed(
        relayRequestUrl(relay, "https://h5-api.aoneroom.com/wefeed-h5api-bff/home?host=moviebox.ph"),
        { headers: { referer: "https://mzfi.me/", accept: "application/json" } },
      );
      const body = await api.text();
      if (!api.ok || !body.includes('"code"')) {
        return {
          ok: false,
          message: `Relay is up but MovieBox requests fail (${api.status}${body ? `: ${body.slice(0, 80)}` : ""}).`,
        };
      }
      resetMovieRelayCache();
      return { ok: true, message: "Relay works — MovieBox answered through it." };
    } catch (e) {
      return { ok: false, message: `Could not reach the relay: ${e instanceof Error ? e.message : String(e)}` };
    }
  });

/** Called after saving so this server instance picks up the new address now. */
export const refreshMovieRelay = createServerFn({ method: "POST" }).handler(async () => {
  resetMovieRelayCache();
  return { ok: true };
});
