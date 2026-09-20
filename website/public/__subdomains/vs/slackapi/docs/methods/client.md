# `client.*` — internal web-client boot/sync endpoints

**UNDOCUMENTED.** Not in `docs.slack.dev`/`api.slack.com/methods`. These are the
internal endpoints the Slack web/desktop client itself calls on load and while
running, found via `korotovsky/slack-mcp-server`'s Edge-API notes and a public
Enterprise Grid network-traffic reverse-engineering writeup, then confirmed to
exist via the existence oracle and partly live-tested read-only.

All calls are the usual `POST https://slack.com/api/client.<name>`,
form-encoded, `Authorization: Bearer <xoxc>` + `Cookie: d=<xoxd>` — same
dispatcher as documented methods, not the separate Edge-API cache host (see
`edge-api.md` for that one).

## `client.boot`

- **Status:** undocumented. **Live-verified.**
- **Purpose:** boots a single **team's** web-client state (as opposed to the
  org-wide `client.userBoot`).
- **Token:** team-scoped xoxc/xoxd. Enterprise-scoped xoxc gets
  `enterprise_is_restricted` — this method is explicitly team-level, not org-level.
- **Params tried:** none (empty POST body).
- **Response:** `{"ok": true, ...}` with team xoxc (full payload not captured/kept —
  only top-level shape checked to avoid retaining workspace data). With enterprise
  xoxc: `{"ok": false, "error": "enterprise_is_restricted"}`.
- **Gotcha:** this is the mirror-image failure mode of `client.userBoot` below —
  the two are scoped to opposite token classes. If you're writing a "boot the
  client" helper, you need both tokens and to try one then the other.
- **Provenance:** name from reverse-engineering gist (sshh12) "boot" call list;
  scoping behavior discovered live this session.

## `client.userBoot`

- **Status:** undocumented. **Live-verified.**
- **Purpose:** boots the **org-wide** user/client state across the whole
  Enterprise Grid organization — channels, DMs, prefs, starred items, subteams,
  workspaces list, etc. This is the "give me everything about this user across
  the whole Grid org" bootstrap call.
- **Token:** enterprise-scoped xoxc/xoxd required. Team-scoped xoxc gets
  `internal_error` (not `team_is_restricted` as with most other org-wide
  methods here — worth noting as an inconsistency in Slack's own error handling).
- **Params tried:** none.
- **Response (top-level keys only, redacted):** `ok, self, team, workspaces,
  channels, channels_priority, ims, non_threadable_channels,
  thread_only_channels, read_only_channels, temporary_channel_expirations,
  starred, subteams, prefs, prefs_version, dnd, links, account_types,
  can_access_client_v2, has_more_mpdms, is_open, is_europe,
  is_content_reporting_enabled, is_eligible_invited_user_glow_up,
  is_slack_first_crm, mobile_app_requires_upgrade, accept_tos_url,
  app_commands_cache_ts, cache_ts_version, cache_version, emoji_cache_ts,
  translations_cache_ts, paid_features, default_workspace, slack_route`.
  (Actual values — channel IDs, team name, self user object, etc. — deliberately
  not retained/quoted; this is genuinely the full state the web client bootstraps
  with, so treat it as sensitive/PII-bearing and don't dump it verbatim to a file.)
- **Gotcha:** heavy payload — this is effectively "give me your whole account,"
  call sparingly and never persist the raw response outside memory.
- **Provenance:** name + purpose from korotovsky/slack-mcp-server Edge-API docs
  ("fetches workspace bootstrap information... enterprise Grid only"); response
  shape confirmed live this session.

## `client.counts`

- **Status:** undocumented. **Live-verified** (existence + scoping only; did not
  retain response content).
- **Purpose:** unread/mention/badge counts across channels and DMs — what powers
  the little unread-count badges in the sidebar. Referenced as the "efficient"
  unread-detection path (vs. calling `conversations.info` once per channel with
  xoxp) by korotovsky/slack-mcp-server.
- **Token:** enterprise xoxc/xoxd. Team xoxc -> `team_is_restricted`.
- **Params tried:** none; real client calls likely pass a `thread_counts`/channel
  filter — not explored further to avoid over-probing.
- **Provenance:** korotovsky/slack-mcp-server ("efficient unread message
  detection... requires xoxc+xoxd session tokens").

## `client.extras`

- **Status:** undocumented. **Partially live-verified** (exists; not fully
  exercised).
- **Purpose:** unclear from name alone — likely auxiliary boot data not included
  in the main `userBoot`/`boot` payload (secondary workspaces, extra metadata).
- **Token:** enterprise xoxc/xoxd (team xoxc -> `team_is_restricted`).
- **Response with no params (enterprise xoxc):** `{"ok": false, "error":
  "invalid_arguments"}` — needs at least one param we didn't supply. Not probed
  further (unclear what's safe to pass without knowing the shape; left as a
  documented gap).
- **Provenance:** name from the Enterprise Grid reverse-engineering gist's boot
  call list.

## `client.shouldReload`

- **Status:** undocumented. **Partially live-verified.**
- **Purpose:** tells the client whether its cached JS build is stale and it
  should force-reload — part of Slack's incremental-boot/version-check flow.
- **Token:** enterprise xoxc/xoxd (team xoxc -> `team_is_restricted`).
- **Response with no params (enterprise xoxc):** `{"ok": false, "error":
  "bad_build_version_ts"}` — wants a build/version timestamp param.
- **Provenance:** name from the reverse-engineering gist's boot call list;
  matches Slack's public engineering blog post on "incremental boot"
  (`slack.engineering/getting-to-slack-faster-with-incremental-boot`), which
  describes the *concept* (not the private API) of build-version reload checks.

## `client.dms`

- **Status:** undocumented. **Existence confirmed via oracle; not live-called
  with real tokens** (no read-only call attempted — didn't want to guess at
  required filter params for a DM-history endpoint without knowing its shape).
- **Purpose:** per korotovsky/slack-mcp-server docs, "direct message history
  filters" — likely a DM-scoped listing/sync call, part of the same Edge-routing
  family as `client.counts`.
- **Token:** session tokens; Enterprise Grid, per the same source.
- **Provenance:** korotovsky/slack-mcp-server Edge-API documentation (via
  DeepWiki summary of that repo); existence confirmed directly this session
  (`client.dms` + garbage token -> `invalid_auth`, not `unknown_method`).
