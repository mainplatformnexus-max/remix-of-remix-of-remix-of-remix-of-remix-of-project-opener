<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

- Subdirectories may have their own `AGENTS.md` (e.g. `src/lib/`, `src/lib/providers/`); read it before changing files there.

- The WhatsApp floating banner uses bundled movie-wall artwork and the existing bundled brand logo with semantic channel tokens. Why: its imagery must render on independent Cloudflare deployments without Lovable asset URLs.

- Catalog playback and downloads use only unlocked, full-length MP4 streams from the website BFF through `/api/public/movie`, with its media referer; never substitute TV/mobile resources or adaptive manifests. Why: the website's actual full files must match the selected title.
- Catalog discovery and title details use the MovieBox web BFF browser-first with server fallback; playback sources use server-first requests carrying MovieBox's media Referer and the browser-discovered detail slug. Home rows only come from the web home; never substitute TV/mobile. Why: browser Referer restrictions make play responses empty even when discovery works.
- MovieBox relay preserves GET/Range/If-Range and exact resource IDs; website source metadata is cached for at most 30 seconds and explicitly invalidated on CDN failure. Why: truncating progressive responses or swapping equal-resolution files interrupts playback and corrupts resume.
- Watch paths use tested name/year/type slugs with exact catalog resolution; old numeric links canonicalize after loading. Player instances persist across quality switches, resetting only for new content. Why: readable URLs and fullscreen continuity.
- Activity records capture only signed-in users' actionable clicks, internal destinations, and page paths; never store typed field values or other sensitive input.
- Keep every existing sitemap in the sitemap index and robots file when adding a new content-group sitemap, because external indexes may already rely on those URLs.
- Packages that break the server runtime (e.g. `qrcode`/pngjs) must be dynamically imported inside browser-only handlers; why: one static import crashed every hosted page with "This page didn't load".
- PayPal orders and captures run server-side behind `paypal.functions.ts`, while the v6 Web SDK renders PayPal's real button and modal approval UI; the public client ID lives in code and `PAYPAL_CLIENT_SECRET` stays server-only.
- Card payments use Whop's express "whop-pay" button (floating Whop window) with a floating embedded checkout as fallback, never a new tab or inline full checkout; why: user wants a one-click button that opens Whop's overlay on the page.
- Mobile money (deposits, payouts, wallet balances) runs through Relworx via the external payments backend in `src/lib/relworx.ts` (CORS-open, browser-called); open pages ping its /health every few seconds and a Worker cron keeps pinging when no one is on the site. Why: the backend sleeps when idle.
- Mobile money network detection uses only the national prefix table in `countries.ts`.
- Catalog and subtitle downloads open the same-origin attachment URL directly so the browser's own download manager handles them; no in-app download panel. Why: user wants downloads to behave like the MovieBox website.
- Admin uploads: the site route verifies admin/staff, then proxies signing to the external r2upload Worker using a token constant kept in server-only code (user chose code over env); browsers PUT bytes directly to presigned R2 URLs (parallel parts). Why: fastest upload and no R2 binding on the site Worker.
- Display the uploaded MOVIEMAX logo as a file bundled in the project and derive the browser icon from that same upload; keep brand gradients in global CSS and fall back to a bundled/loaded sans font when the requested licensed font is unavailable. Why: visual identity stays consistent without committing a binary or assuming a font license.
- Keep the desktop sidebar icon-only: category links backed by existing category routes (TV is a series category) plus page links (Music, Live TV channels), with icons bundled in the project or from lucide. Why: external asset links break off-Lovable.

- The upload signing route verifies only the Firebase ID token signature (no Firestore role reads) and lets any signed-in user write to `media/admin`, `media/channels`, `media/artists`, enforcing size caps on capped folders server-side. Why: user chose zero database reads so the daily Firestore quota can never block uploads.

- Luganda external catalog reads use the public Narabox JSON API through validated TanStack server functions, with separate namespaced detail URLs; preserve uploads separately. Why: numeric API IDs must never collide with uploaded title IDs.
- Title likes are stored per device in Firestore `title_likes` (id `titleId_deviceId`) and counted per title on the watch page.
- Sitemaps must never be empty or hang (time-boxed reads, last-good fallback, no video tags); Luganda/VJ/image sitemaps also list Narabox titles via `loadNaraboxCatalog`. Why: Narabox needs no Firestore quota.
- On Cloudflare (workerd), MovieBox API calls, media bytes and subtitles use raw sockets (`socket-fetch.ts`), falling back to fetch(); the movie file server answers 427 to all Cloudflare traffic, so deployed media bytes need the non-Cloudflare `MOVIEBOX_RELAY` (`docs/moviebox-relay/`). Why: Worker fetch() adds a `CF-Worker` header MovieBox rejects, breaking deployed play/download.
- Payment provider keys (PayPal secret, Whop, pawaPay) live in server-only `src/lib/payment-keys.server.ts`, with env vars overriding. Why: owner remixes often and chose keys in code over secrets.
- Mobile money customer deposits run through pawaPay v2 server functions (`pawapay.functions.ts`), choosing the network from the site prefix table matched against pawaPay active-conf; payouts/balances still use the Relworx backend. Why: owner moved customer payments to pawaPay.
