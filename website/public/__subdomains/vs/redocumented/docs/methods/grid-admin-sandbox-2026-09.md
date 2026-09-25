# Sixth pass: real admin tokens on an Enterprise Grid sandbox (2026-09-25)

Everything in `admin-write-scope-2026-09.md` was tested with browser session
tokens (xoxc/xoxd) on hackclub. This pass is the other side of that: a
**Slack developer sandbox** (an Enterprise Grid org with one workspace),
with a normal app installed through the Slack CLI, using real OAuth tokens:

- an **org-level bot token** (xoxb) — the CLI installs apps at the org level
  on Grid, so `auth.test` reports the org (`E…`) as `team_id` and
  `is_enterprise_install: true`
- a **user token** (xoxp) from the org owner, with `admin.apps:read` +
  `admin.apps:write`

The focus is `admin.apps.*`, `bots.info`, and channel canvases. Everything
below was called for real; nothing here is from docs alone. No session
tokens were used.

## Org-level bot tokens need `team_id` where the docs say it's optional

With the org-level xoxb, these returned `{"error": "missing_argument", "arg": "team_id"}`
until `team_id` (the workspace, `T…`) was added:

| Method | Without `team_id` | With `team_id` |
|---|---|---|
| `bots.info` | `missing_argument` | ok |
| `usergroups.users.list` | `missing_argument` | ok |
| `users.list` | `missing_argument` | ok |

Note this contradicts the existing `bots.info` note (team_id not required) —
that was with xoxc tokens. Both are true for their token type: the rule is
"org-level OAuth token → pass team_id", as Slack's docs say for `bots.info`.

`users.info`, `conversations.info`, `conversations.history`,
`conversations.join`, `chat.postMessage`, `conversations.open` and the
`canvases.*` methods all worked without it.

To find the workspace ID from an org-level token: `auth.teams.list` (returns
the workspaces the app is granted to).

## `admin.apps.*` with a real admin user token

All with the org owner's xoxp (`admin.apps:read`, `admin.apps:write`):

| Call | Result |
|---|---|
| `admin.apps.uninstall` `app_id` + `team_ids=T…` | ok for a workspace-level install; **`must_revoke_access`** when the app is deployed org-wide |
| `admin.apps.uninstall` `app_id` + `enterprise_id=E…` | **ok** — removes an org-deployed app from the whole org. (Contrast: the enterprise xoxc got `permission_denied` for this in the fifth pass.) |
| `admin.apps.restrict` `app_id` + `team_id` | ok — app then shows in `admin.apps.restricted.list` for that team |
| `admin.apps.restrict` `request_id` + `team_id` | `invalid_request_id` for a made-up ID — i.e. the param is accepted and checked; this is how you deny a pending install request |
| `admin.apps.clearResolution` `app_id` + `team_id` | ok — removes it from the restricted list again |
| `admin.apps.restricted.list` `team_id` | ok, lists apps restricted on that workspace |
| `admin.apps.restricted.list` `enterprise_id` | ok but **empty** — a workspace-level restriction is not listed at org level |
| `admin.apps.requests.list` `team_id` | ok |

Other behaviour worth knowing:

- **Restricting doesn't stop admins.** After `admin.apps.restrict`, the org
  owner could still install the app with the Slack CLI. Restriction only
  gates the approval flow for regular members.
- **`bots.info` after an org-wide uninstall** returns `bot_not_found`, not
  `deleted: true`. (A workspace-level uninstall gives `deleted: true`, as in
  the fifth pass.) The bot's *user* still exists with `deleted: true`, and
  its `profile` still has `bot_id` and `api_app_id` — so `users.info` /
  `users.list` can still resolve it.
- **Reinstalling keeps the same bot ID.** After uninstalling from the org and
  reinstalling, `bots.info` for the old `B…` ID flipped back to
  `deleted: false`.
- **`admin.apps.uninstall` rate-limits quickly.** About ten uninstalls over
  a few minutes (with a failed `team_ids` attempt before each successful
  `enterprise_id` one) started returning `ratelimited`. Honouring
  `Retry-After` made the next attempt wait about a minute.

## Channel canvases and tabs

| Call | Result |
|---|---|
| `conversations.canvases.create` on a channel that already has canvas tabs | ok — **adds another tab**. No `channel_canvas_already_exists`; channels can have several canvas tabs now |
| `conversations.info` | the tabs are in `channel.properties.tabs` (and a near-duplicate `properties.tabz`): `{"id": "Ct…", "type": "canvas", "data": {"file_id": "F…", "shared_ts": …}}`. There was no `properties.canvas` on these channels |
| `canvases.delete` on a tabbed canvas | ok — but the **tab stays** in `properties.tabs`, pointing at the deleted file |
| `conversations.removeTab` `channel_id` + `id` | **`not_allowed_token_type`** with the bot token. Existence-only before; now we know app tokens can't use it, so there is no app-side way to remove a dead tab |
| `canvases.access.set` `access_level=comment` | **ok**. Docs only list `read`/`write`/`owner`, but `comment` is accepted; made-up values (`can_comment`, `commenter`) get `invalid_arguments` "must be a valid enum value" |
| `canvases.sections.lookup` | needs `canvases:read` (`canvases:write` alone isn't enough) |

## Other small ones

- `chat.command` with an xoxp: `missing_scope`, `"needed": "post"` — the
  legacy `post` scope, which modern apps can't request. So it's not a way to
  run slash commands from an app or a user token either.
- `chat.postMessage` to a DM with a bot whose app has no Messages tab:
  `messages_tab_disabled`. Fix is `features.app_home.messages_tab_enabled:
  true` in the manifest (`messages_tab_read_only_enabled: true` if nobody
  should reply).
- Slash commands on an app the CLI installed at org level, but with
  `org_deploy_enabled: false` in the manifest, failed in the Slack client with
  `invalid_service`. Setting `org_deploy_enabled: true` fixed it.
- The CLI's own login token (from `slack login`) doesn't include
  `admin.apps:read` — `admin.apps.restricted.list` with it gives
  `missing_scope` and lists its scopes (`identify, channels:read, …,
  apps.requests:read, apps.requests:write, …`). It does have
  `channels:read` and works for `auth.teams.list`.
