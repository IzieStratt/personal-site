# Auth and token types

## Token types observed/relevant to this account

| Token | Prefix | Obtained from | Hosts it works on | What it's for |
|---|---|---|---|---|
| Bot token | `xoxb-` | App install (OAuth) | `slack.com/api` | Scoped app/bot access, `chat.postMessage` etc. under bot identity. |
| User (OAuth) token | `xoxp-` | App install w/ user scope | `slack.com/api` | Scoped access acting as the installing user. |
| Session token (workspace) | `xoxc-` (paired with cookie `d=xoxd-...`) | Browser `localStorage`/cookies while logged into `https://<workspace>.slack.com` | `slack.com/api` and `https://<workspace>.slack.com/api` | Full "you, in the browser" access at the **team** level — same as the web client's own calls, but capped at Enterprise Grid **team** scope for grid-wide endpoints. |
| Session token (enterprise) | `xoxc-` (paired with same `d=` cookie) | Browser session while viewing the **Enterprise Grid org** context (org-level URL, not a single workspace) | same hosts | Full browser-session access at the **organization** level; required for anything that spans/precedes team selection (drafts across teams, org-wide client boot, etc). |
| App-level token | `xapp-` | App config (Socket Mode) | Socket Mode / `apps.connections.open` | Not a per-call bearer token for most Web API methods; used to open a Socket Mode websocket. |

All four `xoxc`/`xoxb`/`xoxp` types are sent the same way: form-encoded POST,
`Authorization: Bearer <token>` header. The `xoxc` pair additionally requires
`Cookie: d=<xoxd, percent-encoded>` — without the cookie, `xoxc` alone gives
`invalid_auth` even though the token itself is otherwise valid (Slack ties the
session token to the browser session cookie).

```python
headers = {
    "Authorization": f"Bearer {xoxc_token}",
    "Cookie": f"d={urllib.parse.quote(xoxd_cookie, safe='')}",
}
requests.post(f"https://slack.com/api/{method}", headers=headers, data=form_encoded_params)
```

Both `https://slack.com/api/<method>` and `https://hackclub.slack.com/api/<method>`
accepted the same session-token calls in our testing; no behavioral difference was
observed between the two hosts for the methods tried.

## Enterprise Grid: the team-vs-org split

This is the single biggest gotcha for this workspace (Hack Club, Enterprise Grid).
Many methods — not just `drafts.*` — are **routed differently depending on whether
your `xoxc` token is a team-level session or the enterprise/org-level session**:

- Methods that are inherently **org-wide** (span every team in the Grid, or run
  before team selection) reject the **team** xoxc with `team_is_restricted` and
  require the **enterprise** xoxc. Confirmed for: `drafts.list`, `drafts.delete`,
  `drafts.update`, `client.userBoot`, `client.counts`, `client.extras`,
  `client.shouldReload`, `search.modules.messages`, `saved.list`, `commands.list`,
  `users.priority.list`, `users.channelSections.list`, `blocks.actions`
  (also `views.submit` works with it; see `methods/block-actions-and-modals-2026-09.md`).
- Conversely, at least one method is **team-scoped** and rejects the **enterprise**
  token: `client.boot` returns `ok:true` with the **team** xoxc, but
  `enterprise_is_restricted` with the **enterprise** xoxc. Read it as: `client.boot`
  boots a single team's client state; `client.userBoot` boots the org-wide user
  state and needs the org session. `rtm.connect` is team-scoped too
  (`enterprise_is_restricted` with the enterprise xoxc), so an app modal opened by
  an enterprise-token `blocks.actions` click arrives on the **team** token's socket.
- `drafts.create` is the odd one out: it works with **either** xoxc (team or
  enterprise) — creating a draft doesn't require org-wide session scope the way
  listing/deleting them apparently does.
- Neither xoxc (team or enterprise), on either host, can call `chat.scheduleMessage`
  or `chat.scheduledMessages.list` — both come back `not_allowed_token_type`
  regardless of Grid scope. This looks like a hard token-class gate (session tokens
  are simply not allowed to schedule via the legacy `chat.*` scheduling path at all
  on this workspace/plan — `drafts.*` is the client's actual scheduling mechanism
  and is allowed instead).

Practical rule of thumb we used: **try the team xoxc first; if you get
`team_is_restricted`, retry with the enterprise xoxc.** If you get
`not_allowed_token_type` on *both*, the method is gated by token class, not Grid
scope, and no xoxc/xoxd combination will get through it (would need a proper
xoxb/xoxp app token with the right scope, if the method is exposed to apps at all).

## `admin.*` is not uniformly org-scoped

**New this pass (2026-09-20), and a real exception to the team-vs-org split
above.** Not every method in the `admin.*` namespace needs the enterprise
xoxc, and passing the enterprise xoxc doesn't guarantee more access than the
team one — `admin.apps.uninstall` got `ok:true` with the **team** xoxc +
`team_id`, but `permission_denied` with the **enterprise** xoxc +
`enterprise_id`, on the same account and the same app. Read this as: despite
living in `admin.*`, uninstall is a workspace-level action, not an org-wide
one.

A separate, more important axis surfaced testing `admin.apps.approve` and
`admin.apps.requests.cancel`: both returned `not_an_admin` regardless of
which xoxc scope was used. This is not a token-scope problem at all — it's
Slack stating plainly that **this account's identity lacks admin rights for
that action**, independent of session scope. An "Organization"-level
authenticated CLI session (`slack auth list`'s own authorization-level
label) is not the same claim as "this account is an org admin," and the two
need to be tested separately. Full writeup, including the
`admin.apps.approved.list` interpretive trap and the `bots.info`
install-state alternative: `methods/admin-write-scope-2026-09.md`.

## Errors specifically about token/auth class

See `errors.md` for the full glossary; the ones that matter for choosing a token:

- `invalid_auth` — token rejected outright (wrong/garbage/revoked token, or xoxc
  missing its paired cookie). Also what a garbage token returns for **any existing**
  method name — this is the basis of the existence-oracle technique in `tools/probe.py`.
- `not_allowed_token_type` — the method exists and your token was authenticated,
  but this *class* of token (e.g. xoxc/xoxd session tokens) is categorically not
  permitted to call it, independent of Grid scope.
- `team_is_restricted` — org-wide/Grid-spanning method called with a team-scoped
  xoxc; retry with the enterprise xoxc.
- `enterprise_is_restricted` — team-scoped method called with an enterprise-scoped
  xoxc; retry with the team xoxc.
- `no_permission` — token type is fine but the identity behind it lacks the
  scope/permission (relevant to xoxb/xoxp with missing OAuth scopes).

## Discovering every workspace/team token from just the `d` cookie

**New this pass, cross-referenced from `ImShyMike/slack-undoc-client`, not
independently live-verified here.** That repo's `SlackClient.fetchAvailableWorkspaces()`
does an unauthenticated (no bearer token at all, just the `d=` cookie) `GET` to:

```
https://app.slack.com/auth?app=client
Cookie: d=<xoxd, percent-encoded>
```

and scrapes an embedded `JSON.stringify(...)` payload out of the HTML response
containing a `teams` map — every workspace the cookie's browser session is
logged into, each with its own pre-issued `token` (xoxc), plus
`enterprise_api_token`/`enterprise_id`/`enterprise_name` when the team is part
of an Enterprise Grid org. In other words: **a single `d` cookie is enough to
enumerate every team you're signed into and get a working xoxc for each one,
without needing to already have any token** — confirming/extending this
project's own auth model (`xoxc` alone is useless without its paired `d`
cookie; this shows the reverse direction, that the cookie alone can mint the
tokens). The client's own token-selection logic
(`enterprise_api_token ?? team.token`, i.e. prefer the org-level session token
if the team has one) matches this project's own "try enterprise xoxc for
org-wide methods" rule of thumb above, independently corroborating it rather
than adding a new mechanism.

## What we did NOT test

- Whether `xoxp`/`xoxb` (music-stalker's `SLACK_USER_TOKEN`/`SLACK_BOT_TOKEN`) can
  reach any of the undocumented `client.*`/`search.modules.*`/`drafts.*` family —
  these are session-only internal endpoints by design and near-certainly reject
  OAuth tokens, but we did not spend live calls confirming this for every one; where
  we did check indirectly (via published reverse-engineering sources), bot tokens
  were reported to categorically lack search/saved-items access.
- `xapp-` app-level tokens were not exercised against any Web API method in this pass
  (out of scope — they're for Socket Mode, not a general bearer token).
