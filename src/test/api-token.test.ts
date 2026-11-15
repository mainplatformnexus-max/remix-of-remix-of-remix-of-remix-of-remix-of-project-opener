import { describe, expect, it } from "vitest";
import { extractApiToken, newApiToken, sha256Hex, tokenMatches } from "@/lib/api-token";

const req = (url: string, headers: Record<string, string> = {}) => new Request(url, { headers });

describe("developer API token", () => {
  it("accepts the token from Authorization: Bearer", () => {
    expect(extractApiToken(req("https://x.site/api/public/v1/luo", { authorization: "Bearer mmx_abc" }))).toBe("mmx_abc");
  });
  it("accepts the token from X-API-Key", () => {
    expect(extractApiToken(req("https://x.site/api/public/v1/luo", { "x-api-key": "mmx_def" }))).toBe("mmx_def");
  });
  it("accepts the token from ?api_key=", () => {
    expect(extractApiToken(req("https://x.site/api/public/v1/luo?api_key=mmx_q"))).toBe("mmx_q");
  });
  it("finds no token when none is sent", () => {
    expect(extractApiToken(req("https://x.site/api/public/v1/luo"))).toBeNull();
  });
  it("matches only the token whose hash is stored", async () => {
    const token = newApiToken();
    const hash = await sha256Hex(token);
    expect(await tokenMatches(token, hash)).toBe(true);
    expect(await tokenMatches(newApiToken(), hash)).toBe(false);
    expect(await tokenMatches(null, hash)).toBe(false);
    expect(await tokenMatches(token, null)).toBe(false);
  });
});
