**MOVIE MAX**

**Public Content API — Developer Guide**

English (MovieBox) · Luganda (VJ) · Luo · Teso · Search · Play ·
Download · Subtitles

Version 1 · November 2026

[1. Overview](#overview)

[1.1 Base address](#base-address)

[1.2 Response format](#response-format)

[1.3 All endpoints at a glance](#all-endpoints-at-a-glance)

[2. Search](#search)

[3. English — MovieBox](#english-moviebox)

[3.1 Catalog item (used in every
list)](#catalog-item-used-in-every-list)

[4. Luganda](#luganda)

[4.1 Luganda VJ catalog (Narabox)](#luganda-vj-catalog-narabox)

[4.2 Luganda titles uploaded by your
admins](#luganda-titles-uploaded-by-your-admins)

[5. Luo, Luganda & Teso uploads](#luo-luganda-teso-uploads)

[6. Playing, downloading & subtitles](#playing-downloading-subtitles)

[6.1 HTML player example](#html-player-example)

[6.2 Download button example](#download-button-example)

[7. Code examples](#code-examples)

[7.1 JavaScript (browser or Node)](#javascript-browser-or-node)

[7.2 PHP](#php)

[7.3 Typical screens and the calls behind
them](#typical-screens-and-the-calls-behind-them)

[8. Limits & good practice](#limits-good-practice)

# 1. Overview

This API lets another website or app show the full MOVIE MAX library:
English movies and series (MovieBox), Luganda translated titles with
their VJ, and the Luo, Luganda and Teso titles uploaded by your admins.
Everything — lists, details, search, playing, downloading and subtitles
— is called **on your own domain**. Your other site never talks to
MovieBox, Narabox or Firebase directly.

- **Read-only:** every endpoint is GET and returns JSON (play/download
  links return video).

- **Open to any site:** CORS allows every origin, so it works straight
  from a browser, a mobile app or a server.

- **No API key needed:** the content is public. Payments, accounts and
  admin actions are NOT part of this API.

- **Your domain everywhere:** every playUrl, downloadUrl and subtitle
  link in the answers already points back to your domain.

## 1.1 Base address

> https://YOUR-DOMAIN/api/public/v1

Replace YOUR-DOMAIN with the domain where MOVIE MAX is published (for
example your custom domain or the .lovable.app address). Opening the
base address returns a list of every endpoint, already filled in with
your domain.

## 1.2 Response format

Every JSON answer has the same envelope:

> // success
>
> { "ok": true, "data": { ... } }
>
> // error
>
> { "ok": false, "error": "Invalid id" }

| **HTTP status** | **Meaning** |
|----|----|
| 200 | Success — read data. |
| 400 | A parameter is missing or invalid (e.g. Missing q, Invalid id). |
| 404 | Unknown endpoint or title not found. |
| 502 | The upstream catalog is temporarily unavailable — retry after a few seconds. |

## 1.3 All endpoints at a glance

| **Endpoint** | **What it returns** |
|----|----|
| /search?q= | One search across English, Luganda (Narabox) and uploaded titles |
| /moviebox/home | Home page: hero slides, all sections (rows), trending, coming soon |
| /moviebox/feed?page=0 | Endless "More from MovieBox" feed, page by page |
| /moviebox/trending | Trending movies and series |
| /moviebox/search?q=&page=1 | English catalog search |
| /moviebox/title/{id} | Full details: description, cast, seasons, country |
| /moviebox/sources/{id}?se=&ep= | Every quality with play, download and subtitle links |
| /moviebox/related/{id} | Similar titles |
| /luganda?page= | Luganda titles uploaded by your admins |
| /luganda/title/{id} | One uploaded Luganda title with episodes |
| /luganda/narabox?kind=movies&page= | Luganda VJ catalog (movies or tv-shows), page by page |
| /luganda/narabox/{kind}/{id} | One Luganda VJ title with play/download links and episodes |
| /luganda/catalog | The whole Luganda VJ catalog in one answer (posters only) |
| /luo?page= · /luo/title/{id} | Luo titles and details |
| /teso?page= · /teso/title/{id} | Teso titles and details |

# 2. Search

**GET /api/public/v1/search?q={text}**

Searches all three libraries at once. Each group is returned separately
so you can show them as tabs or sections. If one library is down, its
group is simply empty — the others still return.

| **Parameter** | **Where** | **Required** | **Description**                |
|---------------|-----------|--------------|--------------------------------|
| q             | query     | yes          | Search text, 1–120 characters. |

> GET /api/public/v1/search?q=love
>
> {
>
> "ok": true,
>
> "data": {
>
> "query": "love",
>
> "moviebox": \[ { "id": "777059274332718120", "title": "Love", "type":
> "movie", "year": "2015", "poster": "https://...", ... } \],
>
> "luganda": \[ { "id": 2656, "kind": "movie", "title": "...", "poster":
> "https://...", "vj": "Vj mark",
>
> "detailUrl":
> "https://YOUR-DOMAIN/api/public/v1/luganda/narabox/movies/2656" } \],
>
> "uploads": \[ { "id": "abc123", "language": "luo", "title": "...",
> "playUrl": "https://YOUR-DOMAIN/api/public/stream?url=...",
>
> "detailUrl": "https://YOUR-DOMAIN/api/public/v1/luo/title/abc123" } \]
>
> }
>
> }

# 3. English — MovieBox

MovieBox titles use long numeric ids (e.g. 8906247916759695608). type is
movie or series.

## 3.1 Catalog item (used in every list)

| **Field** | **Type** | **Description** |
|----|----|----|
| id | string | MovieBox subject id — use it for title / sources / related. |
| title | string | Title as shown on MovieBox. |
| type | "movie" \| "series" | Movie or series. |
| year | string \| null | Release year. |
| poster | string \| null | Portrait poster (400 px wide). |
| backdrop | string \| null | Wide image (1440 px wide). |
| rating | string \| null | IMDb-style rating, e.g. "8.0". |
| genre | string \| null | Genres separated by " · ". |
| appointmentDate | string \| null | Release date for Coming Soon titles. |
| booked | number \| null | People who pre-booked a Coming Soon title. |

**GET /api/public/v1/moviebox/home**

The same home page MovieBox's website shows: hero slides, every section,
trending and coming soon. Cached 5 minutes.

> { "ok": true, "data": {
>
> "hero": \[ CatalogItem, ... \],
>
> "rows": \[ { "title": "Popular Series", "items": \[ CatalogItem, ...
> \] },
>
> { "title": "Popular Movie", "items": \[ ... \] },
>
> { "title": "Nollywood Movie", "items": \[ ... \] }, ... \],
>
> "trending": \[ CatalogItem, ... \],
>
> "comingSoon": \[ CatalogItem, ... \],
>
> "web": true
>
> } }

**GET /api/public/v1/moviebox/feed?page={n}**

Endless feed for the bottom of the home page. Start with page=0, then
request nextPage until it is null.

| **Parameter** | **Where** | **Required** | **Description**         |
|---------------|-----------|--------------|-------------------------|
| page          | query     | no           | Page number, default 0. |

> { "ok": true, "data": { "items": \[ CatalogItem, ... \], "nextPage": 1
> } }

**GET /api/public/v1/moviebox/trending**

Trending movies and series merged from the home, movie and series tabs.

> { "ok": true, "data": \[ CatalogItem, ... \] }

**GET /api/public/v1/moviebox/search?q={text}&page={n}**

Searches the English catalog.

| **Parameter** | **Where** | **Required** | **Description**                |
|---------------|-----------|--------------|--------------------------------|
| q             | query     | yes          | Search text, 1–120 characters. |
| page          | query     | no           | Page, default 1.               |

> GET /api/public/v1/moviebox/search?q=avatar
>
> { "ok": true, "data": \[ { "id": "8906247916759695608", "title":
> "Avatar", "type": "movie", "year": "2009", ... } \] }

**GET /api/public/v1/moviebox/title/{id}**

Full details of one title. {id} may be the numeric id or a MOVIE MAX
watch link name such as avatar-2009-movie. For series, seasons tells you
how many episodes each season has.

| **Parameter** | **Where** | **Required** | **Description**                |
|---------------|-----------|--------------|--------------------------------|
| id            | path      | yes          | Numeric id or watch-link name. |

> { "ok": true, "data": {
>
> "id": "2190807691784770592", "title": "Lucifer S1-S6", "type":
> "series", "year": "2016",
>
> "poster": "https://...", "backdrop": "https://...", "rating": "8.0",
> "genre": "Crime · Drama · Fantasy",
>
> "description": "Lucifer Morningstar has decided he's had enough ...",
>
> "duration": null, "country": "United States", "language": null,
>
> "cast": \[ { "name": "Nathan Hope", "character": "Director", "avatar":
> "https://..." } \],
>
> "seasons": \[ { "season": 1, "episodes": 13 }, { "season": 2,
> "episodes": 18 } \],
>
> "detailPath": "lucifer-UQASHYbVPB2"
>
> } }

**GET /api/public/v1/moviebox/sources/{id}?se={season}&ep={episode}**

Every available quality of the full movie or episode, best first. Each
one carries ready-to-use links on your domain: playUrl for a video
player, downloadUrl to save the file, and subtitle links (converted to
WebVTT). For movies leave se/ep out; for series pass both.

| **Parameter** | **Where** | **Required** | **Description** |
|----|----|----|----|
| id | path | yes | Numeric MovieBox id. |
| se | query | series | Season number (0 or omit for movies). |
| ep | query | series | Episode number. |
| detailPath | query | no | Value from /title — speeds up the lookup. |
| title | query | no | Used for download file names. |

> GET /api/public/v1/moviebox/sources/2190807691784770592?se=1&ep=1
>
> { "ok": true, "data": \[ {
>
> "resourceId": "6484813154554889304", "resolution": 1080, "codec":
> "h264",
>
> "bytes": 644380485, "size": "615 MB", "promo": false,
>
> "playUrl":
> "https://YOUR-DOMAIN/api/public/movie?subjectId=...&se=1&ep=1&resourceId=...&res=1080&detailPath=...",
>
> "downloadUrl":
> "https://YOUR-DOMAIN/api/public/movie?...&dl=Lucifer-S1E1-1080p.mp4",
>
> "subtitles": \[ { "label": "English", "url":
> "https://YOUR-DOMAIN/api/public/subtitle?url=...",
>
> "downloadUrl":
> "https://YOUR-DOMAIN/api/public/subtitle?url=...&dl=Lucifer-English.vtt"
> } \]
>
> }, { "resolution": 720, ... }, { "resolution": 480, ... } \] }

**promo:** MovieBox sometimes lists a short "upgrade your app" clip.
Entries with promo: true should not be used in your player.

**Links stay valid:** playUrl and downloadUrl do not expire. Each time
they are opened, the server fetches a fresh signed file from MovieBox,
so long viewing sessions and resumed downloads keep working.

**GET /api/public/v1/moviebox/related/{id}**

Titles similar to this one (same genre and type).

| **Parameter** | **Where** | **Required** | **Description**      |
|---------------|-----------|--------------|----------------------|
| id            | path      | yes          | Numeric MovieBox id. |

> { "ok": true, "data": \[ CatalogItem, ... \] }

# 4. Luganda

Luganda content has two sources, both available here: the **Luganda VJ
catalog** (Narabox — translated movies and series with a VJ name) and
**titles your admins upload** to MOVIE MAX.

## 4.1 Luganda VJ catalog (Narabox)

**GET
/api/public/v1/luganda/narabox?kind={movies\|tv-shows}&page={n}&per_page={n}**

Newest first. Movies include playUrl/downloadUrl; series include their
episodes when you open the detail.

| **Parameter** | **Where** | **Required** | **Description**               |
|---------------|-----------|--------------|-------------------------------|
| kind          | query     | no           | movies (default) or tv-shows. |
| page          | query     | no           | Page, default 1.              |
| per_page      | query     | no           | 1–100, default 50.            |

> { "ok": true, "data": {
>
> "items": \[ {
>
> "id": 2656, "source": "narabox", "kind": "movie",
>
> "title": "Opportunity Knocks", "originalTitle": "Opportunity Knocks -
> VJ Mark",
>
> "slug": "opportunity-knocks-vj-mark-vj-mark", "description": "Eddie
> and Lou are ...",
>
> "poster": "https://...", "backdrop": "https://...", "rating": null,
>
> "year": "1990", "releaseDate": "1990-...", "vj": "Vj mark", "genre":
> \["Comedy"\],
>
> "createdAt": "2026-11-14T11:33:36+03:00",
>
> "playUrl": "https://YOUR-DOMAIN/api/public/stream?url=...",
>
> "downloadUrl":
> "https://YOUR-DOMAIN/api/public/stream?url=...&dl=Opportunity-Knocks.mp4"
>
> } \],
>
> "meta": { "current_page": 1, "last_page": 73, "per_page": 50, "total":
> 3600 }
>
> } }

**GET /api/public/v1/luganda/narabox/{kind}/{id}**

One Luganda VJ title. For series, seasons\[\].episodes\[\] each carry
their own playUrl and downloadUrl (an episode without a video has null
links).

| **Parameter** | **Where** | **Required** | **Description**     |
|---------------|-----------|--------------|---------------------|
| kind          | path      | yes          | movies or tv-shows. |
| id            | path      | yes          | Numeric Narabox id. |

> { "ok": true, "data": { "id": 109, "kind": "series", "title": "If
> Wishes Could Kill", "vj": "...",
>
> "seasons": \[ { "season": 1, "title": "Season 1",
>
> "episodes": \[ { "id": 5501, "episode": 1, "title": "Episode 1",
>
> "playUrl": "https://YOUR-DOMAIN/api/public/stream?url=...",
>
> "downloadUrl": "https://YOUR-DOMAIN/api/public/stream?url=...&dl=..."
> } \] } \] } }

**GET /api/public/v1/luganda/catalog**

The whole Luganda VJ catalog in one answer — light cards (poster, VJ,
genre, year) with a detailUrl for each. Movies without a video are left
out. Ideal for building your own filters by VJ or genre. Cached 5
minutes.

> { "ok": true, "data": {
>
> "movies": \[ { "id": 2656, "kind": "movie", "title": "Opportunity
> Knocks", "poster": "https://...", "vj": "Vj mark",
>
> "genre": \["Comedy"\], "year": "1990", "detailUrl":
> "https://YOUR-DOMAIN/api/public/v1/luganda/narabox/movies/2656" } \],
>
> "series": \[ ... \]
>
> } }

## 4.2 Luganda titles uploaded by your admins

Same format as Luo and Teso — see section 5. Use
/api/public/v1/luganda?page=1 and /api/public/v1/luganda/title/{id}.

# 5. Luo, Luganda & Teso uploads

Titles your admins upload in the MOVIE MAX dashboard. Only **published**
titles appear. Newest first.

**GET
/api/public/v1/{language}?page={n}&per_page={n}&q={text}&vj={name}**

{language} is luo, luganda or teso.

| **Parameter** | **Where** | **Required** | **Description**       |
|---------------|-----------|--------------|-----------------------|
| language      | path      | yes          | luo, luganda or teso. |
| page          | query     | no           | Page, default 1.      |
| per_page      | query     | no           | 1–500, default 50.    |
| q             | query     | no           | Filter by title text. |
| vj            | query     | no           | Filter by VJ name.    |

> GET /api/public/v1/luo?page=1&per_page=20
>
> { "ok": true, "data": {
>
> "items": \[ {
>
> "id": "Kx81...", "source": "upload", "language": "luo", "kind":
> "movie",
>
> "title": "...", "description": "...", "poster": "https://...",
> "backdrop": "https://...",
>
> "vj": "VJ ...", "genre": "Action", "year": 2025, "latest": true,
>
> "createdAt": "2026-11-10T09:12:00.000Z",
>
> "playUrl": "https://YOUR-DOMAIN/api/public/stream?url=...",
>
> "downloadUrl":
> "https://YOUR-DOMAIN/api/public/stream?url=...&dl=Title.mp4"
>
> } \],
>
> "page": 1, "perPage": 20, "total": 134, "lastPage": 7
>
> } }

**latest: true** means an admin marked the title as Latest — show these
first in a "Latest" row.

**GET /api/public/v1/{language}/title/{id}**

One uploaded title plus its episodes (series), sorted by season and
episode.

| **Parameter** | **Where** | **Required** | **Description**         |
|---------------|-----------|--------------|-------------------------|
| language      | path      | yes          | luo, luganda or teso.   |
| id            | path      | yes          | Title id from the list. |

> { "ok": true, "data": { ...same fields as the list...,
>
> "episodes": \[ { "id": "e1", "season": 1, "episode": 1, "name":
> "Episode 1",
>
> "playUrl": "https://YOUR-DOMAIN/api/public/stream?url=...",
> "downloadUrl": "..." } \] } }

# 6. Playing, downloading & subtitles

You never build these links yourself — copy them from the answers above.
They all live on your domain:

| **Link** | **Used for** | **Notes** |
|----|----|----|
| /api/public/movie?... | English (MovieBox) play & download | Supports seeking (Range requests). &dl=name.mp4 makes the browser download it. |
| /api/public/stream?url=... | Luganda VJ, Luo, Teso play & download | Supports seeking. &dl=name.mp4 downloads. &probe=1 returns { size, type } without downloading. |
| /api/public/subtitle?url=... | MovieBox subtitles | Always returned as WebVTT (works in the HTML \<track\> tag). &dl= downloads. |

## 6.1 HTML player example

> \<video controls playsinline width="100%" crossorigin="anonymous"
>
> src="https://YOUR-DOMAIN/api/public/movie?subjectId=...&resourceId=...&res=1080"\>
>
> \<track kind="subtitles" label="English" srclang="en" default
>
> src="https://YOUR-DOMAIN/api/public/subtitle?url=..." /\>
>
> \</video\>

## 6.2 Download button example

> \<a
> href="https://YOUR-DOMAIN/api/public/movie?...&dl=Avatar-1080p.mp4"\>Download
> 1080p (4.83 GB)\</a\>

Opening a downloadUrl hands the file to the browser's own download
manager, exactly like the MOVIE MAX site.

# 7. Code examples

## 7.1 JavaScript (browser or Node)

> const API = "https://YOUR-DOMAIN/api/public/v1";
>
> async function api(path) {
>
> const res = await fetch(API + path);
>
> const body = await res.json();
>
> if (!body.ok) throw new Error(body.error);
>
> return body.data;
>
> }
>
> // Home page
>
> const home = await api("/moviebox/home");
>
> home.rows.forEach(row =\> console.log(row.title, row.items.length));
>
> // Search everything
>
> const results = await api("/search?q=" + encodeURIComponent("john
> wick"));
>
> // Play a movie: best non-promo quality
>
> const movie = results.moviebox\[0\];
>
> const sources = await api(\`/moviebox/sources/\${movie.id}\`);
>
> const best = sources.find(s =\> !s.promo);
>
> document.querySelector("video").src = best.playUrl;
>
> // Play episode 3 of season 1
>
> const ep = await api(\`/moviebox/sources/\${seriesId}?se=1&ep=3\`);
>
> // Luganda VJ movies, page 1
>
> const lug = await api("/luganda/narabox?kind=movies&page=1");
>
> // Luo uploads
>
> const luo = await api("/luo?page=1");

## 7.2 PHP

> \$api = "https://YOUR-DOMAIN/api/public/v1";
>
> \$data = json_decode(file_get_contents("\$api/moviebox/trending"),
> true);
>
> foreach (\$data\["data"\] as \$item) {
>
> echo \$item\["title"\] . " (" . \$item\["year"\] . ")\n";
>
> }

## 7.3 Typical screens and the calls behind them

| **Screen on your other site** | **Call** |
|----|----|
| Home page | /moviebox/home + /moviebox/feed?page=0… for endless scroll + /luganda?page=1 and /luo?page=1 rows |
| English movies / series | /moviebox/home rows, /moviebox/trending |
| Luganda page | /luganda/catalog (filter by VJ/genre yourself) + /luganda?page=1 |
| Luo page / Teso page | /luo?page=1 / /teso?page=1 |
| Search page | /search?q= |
| Title page | /moviebox/title/{id} + /moviebox/related/{id} (English) or the Luganda/Luo detail endpoint |
| Watch page | /moviebox/sources/{id}?se=&ep= → playUrl + subtitles |

# 8. Limits & good practice

- **Caching:** answers are cached by browsers and CDNs (home/search 5
  min, titles 10 min, uploads 2 min, sources 20 s). Cache on your side
  too and avoid calling on every keystroke — wait until the user stops
  typing.

- **Sources:** fetch /moviebox/sources when the user presses Play, not
  for every poster.

- **Uploads (Luo/Luganda/Teso):** these come from your MOVIE MAX
  database, which has a free daily read limit. The API keeps the last
  good copy, but if the limit is reached before any copy exists, the
  endpoint returns an error until the limit resets.

- **English playback on the published site:** MovieBox's file server
  refuses Cloudflare's network, so the published site plays English
  files through the movie relay set in Dashboard → Settings → Movie
  relay. That relay must run on a host MovieBox allows.

- **Images:** poster and backdrop links point to the providers' image
  servers and can be used directly in \<img\> tags.

- **Not included:** sign-in, subscriptions, payments, likes and admin
  actions stay on MOVIE MAX and are not part of this API.
