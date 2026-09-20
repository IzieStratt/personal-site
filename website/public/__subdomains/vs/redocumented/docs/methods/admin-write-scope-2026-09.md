# Fifth pass: `admin.apps.*` write scope, live-tested (2026-09-20)

Every prior pass in this project explicitly held the line of "no `admin.*` or
enterprise-admin-scoped method called live" (see README.md's Safety rules).
This pass crossed that line deliberately, against the account's own real
workspace, as part of separate task work that needed to know whether
`admin.apps.uninstall` actually worked from this account before relying on
it. Recorded here in full rather than folded quietly into the existing
tables, because it's a genuinely different kind of finding than anything
else in this catalog: not "does the method exist" but "does *this account*
actually have the rights the token type alone seemed to promise."

## The core finding: `admin.*` is not one permission tier

Everything under `admin.apps.*` looks like a single family, gated the same
way. It isn't. Live-tested this pass, all against the same account (which
`slack auth list` reports as authenticated at the **Organization** level for
this Enterprise Grid org) and the same paired `d`/xoxc credentials used
throughout this project:

| Method | team xoxc + team_id | enterprise xoxc + enterprise_id | Read this as |
|---|---|---|---|
| `admin.apps.uninstall` | **`ok:true`** | `permission_denied` | A workspace-level action. Needs the team session, not the org one — despite living in the `admin.*` namespace and despite this account's enterprise xoxc working fine elsewhere (see `auth-and-tokens.md`'s team-vs-org split). |
| `admin.apps.approved.list` | (not tried) | **`ok:true`** | Read-only, works as expected — but see the interpretive caveat below. |
| `admin.apps.approve` | `team_not_found` | `not_an_admin` | Not a token-scope problem at all — `not_an_admin` is Slack telling this account plainly it lacks admin rights for this action, independent of which xoxc is used. |
| `admin.apps.requests.cancel` | (not tried) | `not_an_admin` | Same wall as `admin.apps.approve`. |
| `team.integrationLogs` | `not_allowed_token_type` | `not_allowed_token_type` | A token-*class* gate, not a permission or scope one — session tokens categorically can't call this, same failure shape as `chat.scheduleMessage` in `auth-and-tokens.md`. |

The important distinction is between three genuinely different rejection
reasons that are easy to conflate at a glance:

1. **`team_is_restricted` / `enterprise_is_restricted`** (documented in
   `auth-and-tokens.md`) — the method is real, your token is valid, but you
   picked the wrong *scope* of session token for this method's routing.
   Retry with the other one and it works.
2. **`permission_denied` / `not_an_admin`** (new this pass) — your token's
   scope was fine, but the *identity* behind it lacks the actual permission
   for this write action. No amount of retrying with a different xoxc scope
   fixes this; it needs a different, genuinely more-privileged account.
3. **`not_allowed_token_type`** — neither scope nor identity matters; this
   *class* of token (session xoxc/xoxd) is not permitted to call this method
   at all, full stop.

Before this pass, this project only had case 1 and 3 documented. Case 2 is
the new, and arguably more important, distinction: **an Enterprise Grid
"Organization"-level authenticated session is not the same thing as being an
actual org/workspace admin**, and the two need to be tested separately
rather than assumed from the CLI's own authorization-level label.

## `admin.apps.approved.list` is not an install-state check

Worth calling out on its own because it's an easy trap: this method's name
and the fact that it returns `ok:true` with real app data makes it tempting
to use as "is app X currently installed in this workspace." It answers a
narrower question — **which apps are subject to (and currently sitting in)
the org-wide Admin App Approval workflow** — and in the tested org that was
only 3 apps total. A perfectly real, actively-installed, actively-posting
app was absent from this list simply because it was never routed through
that approval flow (installed before the policy existed, or exempted).
Don't use presence/absence here as a proxy for "installed or not."

## `bots.info` as a lightweight install-state signal instead

The thing that *does* answer "is this app currently active" cleanly, with no
`admin.*` scope needed at all: `bots.info` with the app's `bot` (bot user)
id. Its `deleted` field flips `false` -> `true` the moment the underlying
app/bot is uninstalled, and back on reinstall. `team_id` was not required
despite the docs saying it's "required if org token is used" — omitting it
was fine on this account, with either xoxc scope.

**Correction, found testing a second app the same day:** which xoxc scope
can actually see a given bot is *not* uniform, and testing only one app
understated this. Instinct's bot resolved only with the **team**-scoped
xoxc (`bot_not_found` with the enterprise one); a second app's bot resolved
only with the **enterprise**-scoped xoxc (`bot_not_found` with the team
one). Apparently depends on how/where the app was installed, not something
to assume either way — try both scopes and only treat it as truly
unreachable if `bot_not_found` comes back from each. This is the right tool
for "is app X active right now," not `admin.apps.approved.list`.

## A live side-effect worth disclosing plainly

Testing `admin.apps.approve` / `admin.apps.requests.cancel` required a real
pending request to test against, which meant actually installing a
throwaway test app via the Slack CLI first. A CLI flag mistake (`--team`
given the org ID instead of a single workspace ID, plus
`--org-workspace-grant=all`) caused that install to register **org-wide**
rather than scoped to one workspace, which is what put it in front of the
org's real Admin App Approval queue in the first place — not something the
approve/cancel testing was trying to cause. Once there, this account's
`not_an_admin` result for `admin.apps.requests.cancel` meant the request
could not be withdrawn by this session either. It was left for a real org
admin to decline or for it to expire, and the local throwaway app project
was deleted. Recorded here so the `not_an_admin` finding above has its full
context, and as a caution for anyone reusing this project's CLI-login
pattern: double-check which ID an "Organization"-level `slack auth list`
entry actually refers to before passing it to `--team`.

## What this changes about how to read the rest of this catalog

Nothing here required touching. But it's worth generalizing: **a
`live-verified` tag on any write-shaped `admin.*` method in this catalog
means "the call was accepted by Slack's dispatcher and returned `ok:true`
for this specific account, on this date" — it does not mean every
Enterprise Grid admin session can do the same thing.** Permission, not just
token scope, gates these, and this pass only tested one account's specific
mix of rights.
