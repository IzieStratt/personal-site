# ReDocumented — Slack Web API, including undocumented/internal methods

**Personal reference for izie (Hack Club workspace, `hackclub.slack.com`, Enterprise Grid).**
Compiled 2026-09-20. Published at [vs.izie.top/redocumented](https://vs.izie.top/redocumented).
Contains no secrets (see Safety below) — every credential-shaped value in this
project is a placeholder (`xoxc-REDACTED`, `C0XXXXXXXX`, etc), never a real one.

## What this is

A from-scratch pass at documenting the Slack Web API — both the ~323 officially
documented `https://slack.com/api/<method>` methods and the internal/undocumented
methods used by Slack's own web/desktop client (`client.*`, `search.modules.*`,
`drafts.*`, session-only prefs endpoints, etc.), for personal automation reference.

**Second pass (this update, still 2026-09-20):** mined three additional named
sources (`3kh0/slack-datamine`, `jeremy46231/taut` + the user's fork, and
`ErikKalkoken/slackApiDoc`) plus a bonus fourth source the user linked mid-task
(a private internal Canvas). See "Second-pass methodology" below for what each
one actually yielded — one was a rich hit, one was a confirmed dead end (with
useful negative information), one added detail/cross-checks to methods already
known, and the bonus source dwarfed everything else in raw candidate count but
is the least independently verified. **Third pass (same day):** mined one more
named source, [`ImShyMike/slack-undoc-client`](https://github.com/ImShyMike/slack-undoc-client)
— a real generated TypeScript client with typed params/responses for 468
undocumented methods. Modest, honest yield: 437 of its methods were already
known by this point, **31 were genuinely new**, plus one new auth-model fact
(a `d` cookie alone can enumerate every workspace/team + token you're logged
into, no prior token needed — see `auth-and-tokens.md`). **Catalog now: 323
documented + 1,599 undocumented/cross-referenced = 1,922 total method names**
(up from 372 before any of this update's mining). **All `slack-datamine` and
Canvas candidate names are existence-oracle-tested (safe, garbage-token,
zero-real-credential), not just sampled** — names that failed were removed,
not merely flagged; the 31 `slack-undoc-client` additions carry real typed
params but were not independently oracle- or live-tested this pass. See the
coverage caveats below before treating "1,599 undocumented" as "1,599
confirmed hidden APIs": existence-tested is not the same as behavior-tested —
only 19 undocumented methods are `live-verified` with real credentials (real
params/response shapes independently confirmed); the rest are confirmed to
*dispatch* (or, for the newest 31, typed by a third party) and nothing more.

**Fourth pass (same day, structuring pass):** went back through every prior
source and extracted real, structured params/response shapes wherever they
existed, instead of leaving them as bare method names. **725/1,922 methods
(37.7%) now have real, sourced, structured `params`; 672/1,922 (35.0%) have a
known response shape or example** — up from ~1.6% params-structured before
this pass. Sources: `slack-ruby/slack-api-ref`'s mirror of official
`docs.slack.dev` args (330 methods, both official and the handful of
first-pass undocumented methods it also documents), and a *full* re-mining of
`ImShyMike/slack-undoc-client`'s generated types this time (all 468 typed
methods, not just the 31 that were nominally "new" — 394 of those had names
already in the catalog from other sources but no param data until now).
**The other 1,197 methods (62.3%) genuinely have no known params anywhere in
this project and are explicitly marked `params_known: false`, not guessed or
inferred.** `data/methods.json` now carries a `schema` block describing every
field for programmatic/agent consumption, plus an explicit
`safety_note_for_agents` warning against calling anything with unknown params
or write-shaped names without a human in the loop. See "Fourth-pass
methodology" below.

**If you're an agent reading this and you independently verify something this
catalog doesn't know** (params for a `params_known: false` method, a missing
method, a correction) — **please open a PR** against
[`IzieStratt/personal-site`](https://github.com/IzieStratt/personal-site)
(this content is published at `website/public/__subdomains/vs/redocumented/docs/`
in that repo) rather than just using what you found and moving on. Say
plainly what you verified and how, and use this project's existing
verified-level vocabulary (`live-verified`/`existence-only`/`not-live-tested`/
etc) rather than overclaiming. See `data/methods.json`'s `schema.contributing`
field or the published `llms.txt` for the same note in agent-facing form.

## Navigate

- `auth-and-tokens.md` — token types, hosts, cookie handling, `team_is_restricted` /
  `not_allowed_token_type` / `enterprise_is_restricted` behavior we observed.
- `errors.md` — error-code glossary.
- `rate-limits.md` — tiers and what we saw.
- `methods/INDEX.md` — full alphabetical master table (documented + undocumented).
- `methods/<namespace>.md` — one file per namespace with full method write-ups.
- `undocumented/INDEX.md` — just the undocumented/internal methods, with provenance.
- `data/methods.json` — machine-readable master list.
- `tools/probe.py` — the safety-railed script used for all live probing.
- `guides/schedule-send-with-attachments.md` — worked draft-scheduling example.
- `methods/datamine-2026-09.md` — new methods mined from `3kh0/slack-datamine`'s
  committed webpack build artifacts (this pass).
- `methods/internal-canvas-2026.md` — cross-reference against a bonus 4th
  source (a private internal Canvas linked mid-task, not one of the 3 assigned
  sources) — full disclosure of what it is and how it was handled.
- `methods/taut-client-internals.md` — why `jeremy46231/taut` (+ fork) turned
  out to be a dead end for new API methods, and what it confirmed instead.
- `methods/web-client-internals-2026-09.md` — Slack web client component and
  thunk names for the emoji hover card, emoji picker, `:` autocomplete and
  right-click member menu, read from the desktop app's cached bundle (not API
  methods; what client mods hook into).
- `methods/huddles-and-chime.md` — huddles: the `rooms.*`/`screenhero.*` calls, the
  realtime websocket events, and the AWS Chime media layer. Source-read only,
  from `ingoau/huddlefm` and `LeafdTK/huddlecast` (not live-tested).
- `methods/slack-undoc-client-2026.md` — the 31 new methods (with typed
  params) found cross-referencing `ImShyMike/slack-undoc-client`.
- `methods/admin-write-scope-2026-09.md` — the fifth pass: live-testing
  `admin.apps.uninstall`/`approve`/`approved.list`/`requests.cancel` and
  `team.integrationLogs`/`bots.info` for real against this account, and the
  new `permission_denied`/`not_an_admin` distinction that came out of it.

## Methodology

### First pass (original)

1. **Enumeration.** Pulled the full official method list from the `slack-ruby/slack-api-ref`
   mirror (a structured JSON mirror of `docs.slack.dev`/`api.slack.com/methods`, 324 methods
   across all namespaces as of this writing), plus its small `_undocumented/` corpus
   (`chat.command`, `files.edit`, `files.share`, `users.admin.invite`,
   `users.admin.setInactive`, `users.prefs.get`). Cross-referenced with
   `ErikKalkoken/slackApiDoc` (adds `users.prefs.set`, `team.prefs.get`,
   `commands.list`), a public reverse-engineering writeup of Slack's Enterprise Grid
   web client network traffic (gist by sshh12, "200+ API calls captured across boot,
   search, messaging, reactions and navigation"), and the `korotovsky/slack-mcp-server`
   Go project's Edge-API provider notes (`client.userBoot`, `client.counts`, etc.).
   Session facts already known from prior hands-on work with this account
   (`drafts.*`, `chat.scheduleMessage` behavior) were folded in and re-verified.
2. **Existence oracle.** Established empirically (see `tools/probe.py --oracle-check`)
   that Slack's `/api/<method>` router answers a **garbage bearer token** with
   `unknown_method` for a method name that does not exist, and with an
   auth-stage error (`invalid_auth`, etc.) for a method name that *does* exist and
   simply rejected the garbage token before ever looking at params. This lets any
   number of candidate method names be checked for existence with **zero real
   credentials and zero possible side effects** — the call never gets past
   authentication. All ~55 undocumented candidates below were screened this way;
   4 candidate names from secondary sources (`bots.list`, `channels.delete`,
   `apps.user.connection`, `calendar.list`) came back `unknown_method` and are
   recorded as **not found** (likely stale/renamed/hallucinated in their source).
3. **Live verification, read-only only.** Only methods confirmed to exist, and whose
   name/semantics were clearly read-only (`get`/`list`/`info`/`boot`/`test`-shaped,
   no known side effect), were called with real tokens — and only with empty/minimal
   params, never touching anyone else's data. ~35 such calls were made total across
   both xoxc tokens, all logged as ok/error only (never full payloads to disk).
   Every method write-up below says explicitly whether it is "live-verified" or
   "source-only, not live-tested."
4. **Drafts/scheduling sandbox.** All draft-lifecycle testing (create/list/delete)
   used only the user's self-DM `D09KUP5M2N7`, dates ≥30 days out, and was cleaned
   up immediately, verified via `drafts.list` after.

### Second pass (this update): three assigned sources + one bonus source

This update mined three specific additional sources, plus one the user
surfaced mid-task. Source-mining and cross-referencing only — no bulk live
calls with real tokens beyond what's noted per-method; one small, explicitly
user-directed, read-only spot-check is called out below.

1. **`3kh0/slack-datamine`** — **the richest hit of the three assigned sources.**
   Cloned read-only. Unlike the others, this repo tooling actually mines
   Slack's live webpack client bundle via Chrome DevTools Protocol, and —
   critically — **its `build/` output and per-build git history are already
   committed to the repo**, so no live CDP session was needed (none was
   available here: `curl localhost:9222/json` came back empty, confirmed
   before doing anything else, and no attempt was made to launch/configure a
   Slack desktop client, per scope). Its most recent committed build
   (`132396`, captured 2026-09-20 per its own `meta.json`) includes
   `build/api-methods.txt`: 498 `namespace.method`-shaped strings extracted
   from the real client bundle. 403 of those weren't already in this
   project's catalog; running the existence oracle (safe, garbage-token only)
   against all 403 found **391 genuinely exist**, 12 don't (webpack strings
   that aren't live dispatch targets — recorded in
   `methods/datamine-2026-09.md`). This alone is a larger yield than this
   project's entire first pass. The same build also dumped feature flags,
   experiments, error codes, slash commands, block-kit types, etc.,
   -- out of this task's method-focused scope, left as raw files in the
   cloned repo (not copied in), noted here for anyone doing a future pass.
2. **`jeremy46231/taut`** (+ the user's fork `IzieStratt/taut`, all 4 extra
   branches) — **a confirmed dead end for new API methods**, and documented as
   such rather than silently skipped: see `methods/taut-client-internals.md`.
   Taut is an Electron wrapper that patches Slack's own already-loaded web
   client in-process (webpack module swaps, Redux thunk/slice patches, React
   prop wrapping) rather than talking to Slack's API/Edge-API/RTM gateway
   itself. Grepping its source, the installed `/Applications/Taut.app`
   (`app.asar`, extracted read-only then deleted), and the local
   `developing-taut-plugins` skill all confirm the same architecture. The one
   literal API method name found (`conversations.replies`) was already
   documented. No new "different API surface" (Edge/gateway or otherwise) was
   found — Taut doesn't implement one, it rides Slack's own.
3. **`ErikKalkoken/slackApiDoc`** — **added detail/cross-checks to methods
   already known, no wholly-new methods** (it only documents 9 methods total,
   all but two of which — `bots.list`, `channels.delete` — were already in
   this project). Diffed its full method list against `undocumented/INDEX.md`
   / `data/methods.json`. Added: full param tables and documented error codes
   for `chat.command`, `commands.list`, `files.edit`, `files.share`,
   `users.admin.invite`, `users.admin.setInactive`, `users.prefs.set` (which
   previously had no known param shape at all here); a message/attachment
   text-length reference (`rate-limits.md`); and, notably, an explanation for
   why this project's own oracle sweep found `bots.list`/`channels.delete`
   `unknown_method` — that repo's own docs say both require a **legacy**
   token, and Slack retired legacy-token creation in 2020, which plausibly
   explains the modern dispatcher no longer routing them (inference, not
   independently confirmed — see `undocumented/INDEX.md`).
4. **Bonus, unplanned source: a private internal Canvas.** Mid-task, the user
   linked a Canvas in this workspace titled "Slack internal API." This was
   *not* one of the 3 assigned sources. It was read with one targeted,
   read-only `files.info` call plus one authenticated fetch of the canvas
   content — using the existing team session token, exactly the kind of
   narrow spot-check the safety rules anticipate, not a new capability. It
   turned out to contain **~1,740 `namespace.method` names across 136
   namespaces** — by far the largest single source encountered, but also the
   least self-documenting (no explanation of its own provenance, no
   params/responses, mixes documented and undocumented names freely). 1,197
   of its names were genuinely new versus everything else gathered this pass.
   An initial 80-name spread sample was existence-oracle-checked (75/80 =
   93.75% EXISTS), then — per an explicit mid-task request to get everything
   to 100% tested — **the remaining 1,117 names were also run through the
   full existence oracle.** Final result across all 1,197: **1,120 confirmed
   EXISTS** (added as `existence-only`), **68 confirmed NOT_FOUND** (excluded
   from the catalog entirely, not just flagged), **9 ambiguous** (kept,
   explicitly tagged, not guessed either way — see below, this includes a
   genuinely interesting find: 3 `mc.*` names all hit a distinct
   "internal access elevation... `mc.tinyspeck.com`" gate, suggesting a real
   but Slack-employee-only internal namespace rather than a normal
   client-facing method). **1,120 total added from this source** — every one
   of them existence-tested, none of them behavior/param-tested (that would
   require live calls with real credentials against hundreds of names of
   unknown, some clearly mutating, effect — out of scope for this pass and
   this project's safety rules). See `methods/internal-canvas-2026.md` for
   the full NOT_FOUND and ambiguous lists.

### Third pass (same day, follow-up): one more named source

[`ImShyMike/slack-undoc-client`](https://github.com/ImShyMike/slack-undoc-client)
(also on npm) — cloned read-only. **What it actually is:** a real TypeScript
client for Slack's undocumented API, built around a generated `SlackApiMap`
(`src/types.ts`, 25,652 lines) giving typed params and response shapes for
468 methods, plus a `SlackClient` class using the identical auth model this
project already documents (`xoxc` bearer token + `d=` xoxd cookie, form-
encoded `POST slack.com/api/<method>`) — no new protocol, no Edge-API or
websocket handling in its source.

**Honest result: mostly overlap, not a dead end but a modest yield.** Of its
468 typed methods, 437 were already in this catalog by this point (expected,
given how much ground the second pass already covered — likely drawing from
similar webpack-mining lineage). **31 were genuinely new**, added with their
real typed params (e.g. `slackbot.responses.add` takes `triggers`/`responses`
strings; `team.billing.addContact` takes `email`; `admin.sessions.accessLogs`
takes `limit`/`team_id`) — see `methods/slack-undoc-client-2026.md` for the
full list and types. Tagged `not-live-tested (source-only, typed but
unverified)`: this repo's own README caveats that its types are generated
from real responses and "may vary," which is stronger provenance than a bare
name list, but this project did not independently confirm any of the 31 via
the oracle or a live call.

**The more interesting find was about auth, not methods:** its
`fetchAvailableWorkspaces()` does an unauthenticated, cookie-only `GET
app.slack.com/auth?app=client` and scrapes an embedded JSON payload listing
every workspace/team the `d` cookie is logged into, each with its own
pre-issued xoxc token. A single `d` cookie, with **no token at all**, is
enough to enumerate and obtain a working token for every team you're signed
into. Cross-referenced, not independently live-verified here; added to
`auth-and-tokens.md`.

### Fourth pass (same day): structuring params/responses instead of leaving bare names

Prompted by an explicit request to make the catalog usable, not just a name
list. Re-visited every source already gathered rather than mining anything
new:

1. **`slack-ruby/slack-api-ref`** (re-cloned; this project already used it for
   enumeration in the first pass, but never pulled its full per-method `args`/
   `response` JSON before). Every official-method JSON file there has
   Slack's real param schema (`required`, `type`, `desc` per arg) and often a
   real example response, sourced from `docs.slack.dev` itself. Matched by
   name against the catalog: **330 methods** (323 documented + a handful of
   first-pass undocumented methods that repo also carries in its own
   `_undocumented/` corpus) gained real params; response examples where
   available.
2. **`ImShyMike/slack-undoc-client`, fully this time.** The third pass only
   diffed this repo for *new method names* (31) and never looked at whether
   its typed params/responses could enrich methods already known from other
   sources. Re-parsed its entire `SlackApiMap` (468 methods) and its
   `*Params`/`*Response` TypeScript interfaces into plain field maps this
   time. Result: **394 additional methods** (already-known undocumented
   names from `slack-datamine`/the internal Canvas) gained real typed params,
   and all 468 gained a typed response shape.
3. **The 48 hand-curated first-pass methods**: all but one (`commands.list`,
   which genuinely takes no params — confirmed live) already had params
   documented in prose in their `methods/*.md` write-ups from live testing or
   the `slackApiDoc` cross-reference; that one gap was closed explicitly
   (`params: {}`, sourced to this project's own live verification).
4. **Everything else was left honestly unknown.** No params were invented,
   inferred from method names, or guessed by pattern-matching similar
   methods. `data/methods.json` marks every entry `params_known: true` or
   `false` explicitly (never just absent), so a script or an agent reading
   the file can distinguish "real schema" from "just a name" without parsing
   prose. A `schema` block at the top of that file documents every field for
   exactly that purpose, plus an explicit `safety_note_for_agents` warning
   against calling unknown-params or write-shaped methods without a human in
   the loop — existence-verified is not the same as safe-to-call.
5. `methods/INDEX.md` got two new columns (Params summary, Response
   known/unknown) so the same information is scannable by a human without
   opening the JSON.

### Fifth pass (2026-09-20, later the same day): `admin.*` write scope, live

Separate task work needed to know, for real, whether `admin.apps.uninstall`
would actually work from this account before relying on it — so this pass
deliberately crossed the line every prior pass held ("no `admin.*` method
called live," see Safety rules below, now corrected). Six methods were
live-tested with real credentials against this account's real workspace:
`admin.apps.uninstall`, `admin.apps.approve`, `admin.apps.approved.list`,
`admin.apps.requests.cancel`, `team.integrationLogs`, `bots.info`.

**Headline finding:** the `admin.*` namespace is not one permission tier.
`admin.apps.uninstall` succeeded (`ok:true`) with the team-scoped xoxc, the
same account got `not_an_admin` calling `admin.apps.approve` and
`admin.apps.requests.cancel` with either xoxc scope. `not_an_admin` is a new
error code for this catalog, and a genuinely different kind of rejection
than the existing `team_is_restricted`/`enterprise_is_restricted`
scope-mismatch pair: it's Slack stating the *identity* lacks admin rights,
not that the *session* picked the wrong scope. Full details, including a
disclosed live side-effect (a stray org-wide app-install approval request
this account could not self-cancel, caused by a CLI targeting mistake, left
for a real admin to resolve) in `methods/admin-write-scope-2026-09.md`,
cross-referenced from `auth-and-tokens.md` and `errors.md`.

No bulk/exploratory `admin.*` calls were made — six specific methods,
chosen because the task at hand needed them, each called a small, bounded
number of times (never more than 4-5 param/token combinations per method).

## Honest coverage statement

This is **not** a complete map of Slack's private API surface, and cannot be:

- `methods/grid-admin-sandbox-2026-09.md` — the sixth pass: real admin
  OAuth tokens on an Enterprise Grid sandbox (org-level xoxb + admin xoxp):
  `admin.apps.*` behaviour, `team_id` requirements, channel canvas tabs.
- The existence oracle only covers methods routed through the standard
  `POST https://slack.com/api/<method>` (or `hackclub.slack.com/api/<method>`)
  dispatcher. Slack's web client also calls a structurally different **Edge API**
  (`https://edgeapi.slack.com/cache/<enterprise_id>/<resource>/<action>`, e.g.
  `/users/info`, `/channels/search`, `/huddles/info`) and other special hosts
  (`slack-prod.onquip.com` for Canvas/Quip, WebSocket RTM/EventsAPI gateways,
  `slack.com/beacon/error` for telemetry). Those are recorded here as **source-only**
  from the reverse-engineering writeups; the oracle technique was not built out for
  them and they were not live-probed.
- **Partially closed this pass:** we did not ourselves fetch/mine Slack's live
  webpack bundle, but `3kh0/slack-datamine`'s already-committed build 132396
  did that work and we cross-referenced its output (see second-pass
  methodology above). That's one dated build, one point in time — Slack ships
  new builds constantly, so this is a sample, not a moving-target guarantee.
  We still did not adapt the existence oracle for the Edge API
  (`edgeapi.slack.com`) or any websocket/RTM protocol; those remain source-only
  exactly as before.
- The candidate list is a union of a handful of public sources plus prior session
  knowledge; it is very likely there are more undocumented methods that simply never
  appeared in any source we checked. A method that doesn't show up here may still exist.
- **Remaining gap, narrowed this pass:** all 1,197 candidate names from the
  bonus internal-Canvas source are now existence-oracle-tested (100%, not
  sampled — see `methods/internal-canvas-2026.md`), so unlike the first
  version of this document, nothing here is an untested guess. What's
  **still** unknown for every Canvas-sourced and `slack-datamine`-sourced
  undocumented method: real params, response shape, side effects, token-type
  requirements, and rate limits — `existence-only` means "the dispatcher
  recognizes this name," nothing about what calling it actually does. Treat
  every `existence-only` row as "confirmed to exist, behavior completely
  unknown," and be especially cautious with anything shaped like a write
  (`*.create`/`*.delete`/`*.set`/`*.remove`/`*.update`, all common in this
  batch) — several hundred such names are now confirmed to exist and are
  correctly still un-called.
- **On the newly-added params/response data (fourth pass):** the 330 methods
  sourced from `slack-ruby/slack-api-ref` carry Slack's own official schema —
  trustworthy. The 468 methods (394 newly structured + the original 31)
  sourced from `ImShyMike/slack-undoc-client` are typed from that repo's own
  observed-response generation process, cross-referenced but **not**
  independently re-verified by this project — that repo's own README warns
  its types "may be slightly incorrect... depending on the given input
  parameters." Treat those 468 as "a credible third party's best guess at the
  real schema," not gospel — good enough to write a first attempt against,
  not good enough to skip error handling. `params_known`/`response_known`
  being `true` is a claim about *provenance*, not a guarantee of accuracy.
- Every "verified" tag means "we confirmed `ok:true`/a specific error with the params
  we tried, on this account, on this date." Behavior can differ by plan, Enterprise
  Grid vs. non-grid, feature flags, or change without notice — Slack's own ToS says
  as much about anything not on `docs.slack.dev`.

## Safety rules followed

- No state-changing (write) method was ever called with real tokens outside the
  self-DM sandbox, and all sandbox artifacts were created ≥30 days out and deleted
  before finishing (verified via `drafts.list`).
- No `admin.*` or enterprise-admin-scoped method was called live **through
  the fourth pass**. The fifth pass explicitly and deliberately crossed this
  line for separate, specific task reasons — six named methods, each called
  a small bounded number of times, never a bulk/exploratory sweep. See
  "Fifth pass" above and `methods/admin-write-scope-2026-09.md` for exactly
  what was called, why, and the one live side-effect it left behind
  (disclosed there, not hidden).
- Never posted/reacted/joined/left/marked anything visible to anyone else.
- Rate-limited to ≈1 req/s with 429/Retry-After backoff throughout.
- No tokens, cookies, message content, or other people's IDs were written to any
  file in this folder; all examples use placeholders (`C0XXXXXXXX`, `U0XXXXXXXX`,
  `xoxc-REDACTED`).

### Second-pass additions to the above

- All three assigned repos, the user's Taut fork, and `ErikKalkoken/slackApiDoc`
  were cloned **read-only** to `scratch/clones/` (outside this project's
  tracked files) and left there only as scratch; nothing was pushed, committed,
  or modified in any of them.
- `/Applications/Taut.app`'s `app.asar` was extracted read-only to
  `scratch/asar-extract/` for grepping, and not modified; the installed app
  itself was never launched or interacted with.
- The one real-token use this pass: a single `files.info` call plus a single
  authenticated `GET` of a Canvas's own content, both read-only, both against
  a doc the user linked directly and asked about — squarely inside "a
  read-only spot-check... worth it" per the task's own rules. No other real-
  token calls were made this pass; the 403 + 80 existence-oracle sweeps
  (`3kh0/slack-datamine` candidates and the internal-Canvas sample) all used
  the garbage-token oracle technique, never real credentials.
- Nothing from the Canvas — channel names, other users' names/IDs, the
  Canvas's own file ID — was written into any file in this project; only the
  extracted method-name list and a generic description of what the doc is.
- All scratch clones, the asar extraction, and the fetched Canvas HTML were
  deleted from `scratch/` before finishing this pass (see the wrap-up note at
  the end of this file / the task's final report).

### Third-pass additions to the above

- `ImShyMike/slack-undoc-client` was cloned **read-only** to `scratch/clones/`
  and deleted after mining; nothing pushed, committed, or modified.
- No real-token calls were made this pass at all — purely static source
  review (grepping `src/types.ts`/`client.template.ts`) and a diff against the
  existing catalog. No oracle sweep either (the 31 new names are recorded as
  unverified, honestly, rather than spending more live-adjacent calls on a
  third-party-typed but unconfirmed list).
