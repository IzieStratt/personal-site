# `slack-datamine` refresh -- build 134791 (2026-10-19), and what "removed" means

**Source:** `3kh0/slack-datamine`, full git history (3,402 commits, one per mined client build, 2026-06-02 -> 2026-10-19). Every `build/api-methods.txt` across history was unioned, then compared with the latest build, **134791** (captured 2026-10-19).

## What changed in the catalog

- **Every name the datamine has ever listed** is now tracked in `methods.json` with a `datamine` block: `first_build`, `first_seen`, `last_build`, `last_seen`.
- **`removed: true`** is set on an undocumented method when some build listed it but build 134791 does not (`removed_note` has the last build it was seen in). **1,500 methods** are flagged. Official `documented` methods are never flagged: they come from the public docs, not the bundle.
- **Removed methods stay in the list.** The explorer hides them by default; tick **Show removed** to see them (they carry a red `removed` tag). They are also in `api/index.json` / `api/methods.txt` with the flag, and in the master index with a **removed** note.
- **+128 names** that appeared in older builds but were never in this catalog were added, all `removed`, with verified level `datamine-only (not oracle-tested)`. **+1 live name**, `apps.profile.check`, is new in the latest build (same level, not removed).
- The 12 oracle `NOT_FOUND` names from `datamine-2026-09.md` are still excluded even though several are still in the bundle.

## Read "removed" carefully

The latest builds list far fewer methods than older ones, and the miner is the reason, not Slack:

| window | `apiMethods` per build |
|---|---|
| 2026-06 -> 2026-07-14 | ~1,650 -> 1,760 |
| 2026-07-15 -> 2026-07-24 | ~1,750 (394 chunks failed) |
| 2026-07-24 -> 2026-10-01 | ~450 -> 475 |
| 2026-10-02 -> 2026-10-14 | ~345 -> 365 |
| 2026-10-15 -> now | 250 |

The miner only sees chunks served to one logged-in client, and 12 `gantry-v2` chunks fail to download in every recent build (see `failedChunkFiles` in `meta.json`). So **"removed" means "no longer in the bundle the miner can read", not "Slack deleted the endpoint"**. Many entries (the `admin.*`, `sfdc.*`, `enterprise.*` families) likely just moved into the unreadable chunks. The existence-oracle results for them still stand.

## Why chunks "fail" (checked 2026-10-19)

- The 12 failed names are `gantry-v2.<hash>.min.js`. They return `403 AccessDenied` (an S3-style XML body) from the CDN **even for build 128106**, which was mined with 1,526 chunks, so they were never fetchable and are probably not real files. The same 403 comes back with a browser User-Agent, Referer, Origin or `?cacheKey=`.
- The real chunks (`client-boot.*`, `gantry-v2-vendors.*`, `gantry-v2-async-*`) return 200 and are **brotli-compressed** (the `-br` in the CDN path); decode before grepping.
- The collapse after 2026-07-24 is therefore in manifest parsing: the miner stopped finding the `gantry-v2-async-*` list (1,526 -> 14 chunks), which is where the application code (and most method names) lives. `client-boot` and `vendors` alone give about 250 names.

## Latest build, other extracted data (build 134791)

250 API methods, 92 feature flags, 49 experiments, 230 error codes, 138 slash commands (including `/code` and `/codeblock`), 27 notification types, 87 Block Kit types, 76 workflow functions, 4,623 UI strings. OAuth scopes, API args, MCP actions and AI features currently extract as empty.

For code channels specifically, see `code-channels.md`.
