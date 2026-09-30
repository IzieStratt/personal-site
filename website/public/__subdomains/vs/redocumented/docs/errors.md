# Error-code glossary

Errors actually observed in this session (marked **seen**) plus well-known ones from
official docs (marked **docs**) relevant to the methods covered here.

| Error | Meaning | Seen on |
|---|---|---|
| `ok:false` + `error:"unknown_method"` | The method name doesn't exist at all — returned **before** auth is checked, even with a garbage token. This is the existence-oracle signal. **seen** | Any nonexistent method name, e.g. `conversations.definitelyNotAMethod12345`, `bots.list`, `channels.delete`, `apps.user.connection`, `calendar.list`. |
| `invalid_auth` | Token rejected: garbage/expired/revoked token, or a session token missing its paired `d=` cookie. Also the generic "method exists but you're not authenticated" response used by the existence oracle. **seen** | Garbage token against any real method name. |
| `not_allowed_token_type` | Method exists, token authenticated fine, but this **class** of token can never call it (independent of scope/permissions). **seen** | `chat.scheduleMessage`, `chat.scheduledMessages.list` with either xoxc (team or enterprise), either host. |
| `team_is_restricted` | Org/Grid-wide method called with a **team**-scoped session token; needs the enterprise-level xoxc instead. **seen** | `drafts.list`/`delete`/`update`, `client.userBoot`, `client.counts`, `client.extras`, `client.shouldReload`, `search.modules.messages`, `saved.list`, `commands.list`, `users.priority.list`, `users.channelSections.list` — all with team xoxc. |
| `enterprise_is_restricted` | Reverse of the above: team-scoped method called with the **enterprise**-level session token. **seen** | `client.boot` with enterprise xoxc. |
| `invalid_channel` | Destination isn't a valid channel/DM id for this call. **seen** | `drafts.create` with a user id (`U...`) instead of a channel/DM id (`D...`) in `destinations`. |
| `invalid_arguments` | Required/shape of arguments is wrong (missing required param, wrong JSON shape, etc). **seen** — and for JSON-body methods it carries a **self-describing schema**: see `response_metadata.messages[]`, which lists every problem as `[ERROR] <problem> <detail> [json-pointer:/path]`. Iterating on those reconstructs the full required-field set without guessing (done that way for `users.profile.setAdminSections`; see `methods/profile-fields-2026-09.md`). | `drafts.create` with `is_from_composer` unset or false variants; several undocumented methods called with no params at all (`bookmarks.list`, `megaphone.notifications.list`, `slackAi.permissions.getForUser`, `client.extras`, `search.modules.messages` with enterprise token but no query); `users.profile.setSections` with `section_id`/`profile_section_id` instead of `section` (returns `failed_to_set_sections`). |
| `failed_to_set_sections` | `users.profile.setSections` was addressed with the wrong param name for the section id. Live-verified: the param is **`section`**, not `section_id` or `profile_section_id`. **seen** | `users.profile.setSections`. |
| *(no error — silent discard)* | Not an error code, but the most dangerous behaviour in this catalog's profile surface: a write to a custom `Xf...` field via `users.profile.set`, or to an element whose `permissions.ui` is `false` via `users.profile.setSections`, returns **`ok: true`** and changes nothing. Always read back independently. **seen** | `users.profile.set` on any custom field; `users.profile.setSections` on a `ui: false` element. See `methods/profile-fields-2026-09.md`. |
| `scheduled_draft_cannot_be_attached` | `drafts.create` called with `file_ids` but `is_from_composer:false`. **seen** | `drafts.create`. |
| `draft_has_conflict` | `drafts.delete`/`update` called with a stale `client_last_updated_ts` (must be a *current* timestamp, not the draft's own `last_updated_ts`). **seen** | `drafts.delete`. |
| `bad_build_version_ts` | Client-boot-family method wants a `version_ts`/build-version param we didn't supply. **seen** | `client.shouldReload` with enterprise xoxc, no params. |
| `internal_error` | Generic server-side failure; in our case, likely from calling an internal boot endpoint (`client.userBoot`) with the wrong token scope (team xoxc) rather than a real outage — compare against the same call succeeding with the enterprise xoxc. **seen** | `client.userBoot` with team xoxc (contrast: works with enterprise xoxc). |
| `missing_scope` | (docs) OAuth token lacks a required scope for this method. Not directly seen this session (no scope-limited xoxb/xoxp calls made), but standard for `chat.postMessage` etc. **docs** | — |
| `no_permission` | (docs) Authenticated identity lacks permission for this specific target (e.g. not a member of the channel). **docs** | — |
| `permission_denied` | Token scope was accepted (unlike `team_is_restricted`/`enterprise_is_restricted`), but this specific token/scope isn't allowed to perform this write action on this target. **seen** (new this pass, see `methods/admin-write-scope-2026-09.md`) | `admin.apps.uninstall` with the **enterprise**-scoped xoxc + `enterprise_id` (the **team**-scoped xoxc + `team_id` succeeded instead on the same account/app). |
| `not_an_admin` | A plain, unambiguous statement that the authenticated identity is not an admin for this action — distinct from `team_is_restricted`/`enterprise_is_restricted` (which are about session *scope*, fixed by retrying with the other xoxc) and from `permission_denied` (which is per-target). No xoxc scope swap fixes this; it needs a genuinely more-privileged account. **seen** (new this pass, see `methods/admin-write-scope-2026-09.md`) | `admin.apps.approve` and `admin.apps.requests.cancel`, both xoxc scopes, same account that successfully called `admin.apps.uninstall`. |
| `must_revoke_access` | The app is deployed to the whole Grid org, so it can't be uninstalled from a single workspace. Uninstall with `enterprise_id` instead. **seen** (see `methods/grid-admin-sandbox-2026-09.md`) | `admin.apps.uninstall` + `team_ids`, real admin xoxp, org-deployed app. |
| `missing_argument` (with `arg`) | A required argument is missing; the response names it in `arg`. **seen** (see `methods/grid-admin-sandbox-2026-09.md`) | `bots.info`, `users.list`, `usergroups.users.list` with an org-level xoxb and no `team_id`. |
| `messages_tab_disabled` | The bot's app has no Messages tab, so it can't DM anyone. Enable `features.app_home.messages_tab_enabled`. **seen** | `chat.postMessage` to a DM, xoxb. |
| `invalid_request_id` | The app request ID doesn't exist. **seen** | `admin.apps.restrict` with a made-up `request_id`, real admin xoxp. |
| `bot_not_found` | No bot with that ID visible to this token — also what you get after an app is uninstalled from the whole org. **seen** | `bots.info` after an org-wide `admin.apps.uninstall`. |
| `invalid_container` | `blocks.actions` with a well-formed `container` when the caller isn't a member of the channel. The same container works after joining. **seen** (see `methods/block-actions-and-modals-2026-09.md`) | `blocks.actions`, enterprise xoxc. |
| `post_error` (with `message`) | `blocks.actions` was delivered to the app, but it didn't ack within 3s (for example, an `action_id` it doesn't handle). `message`: "App took too long to respond…". **seen** | `blocks.actions`, enterprise xoxc. |
| `rate_limited` / HTTP 429 | Standard rate limiting; `Retry-After` header gives seconds to wait. **docs**, backoff implemented in `tools/probe.py` but never triggered at our ~1 req/s pace. Seen as `ratelimited` on `admin.apps.uninstall` in the sixth pass. | `admin.apps.uninstall` (see `methods/grid-admin-sandbox-2026-09.md`) |
| `account_inactive` / `token_revoked` | Token/account no longer valid — treated as a hard-stop lockout signal in `tools/probe.py`, never encountered live. **docs**, not seen. | — |
| `cant_leave_general` | The target is the workspace's `#general` channel, which nobody may leave — not a scope or permission issue, and not fixable by a different token. **seen** (see `methods/conversations.md`) | `conversations.leave` on this workspace's one `is_general: true` channel, 51 accounts, both hosts, both xoxc scopes. The undocumented `conversations.bulkLeave` returns `ok:true` on the same target and silently doesn't leave — the only reliable tell is re-reading membership. |
| `not_in_channel` | Self-leave/removal when the caller isn't a member. The normal, benign result of sweeping a call across accounts that weren't all in the target. **seen** | `conversations.leave`, 50 of 51 accounts against a channel only one was in. |
| `channel_not_found` | Also what a **private** channel looks like to a non-member: invisible, not merely forbidden. Means an account can never *self*-leave a private channel it isn't in — only someone who can already see it can remove it. **seen** | `conversations.leave`/`conversations.join`/`conversations.invite`/`conversations.open`/`conversations.members` on a private channel, from every non-member account tried. |
| `restricted_action` | Authenticated fine, token type fine, but this identity may not perform this action on this target — a permissions answer, distinct from `not_an_admin` (no admin claim at all) and from the scope errors. **seen** (see `methods/conversations.md`) | `conversations.kick` of yourself, and `admin.conversations.invite`, with a non-admin xoxc. |

## Notes on the existence oracle

`unknown_method` vs. any auth-stage error (`invalid_auth` chief among them) is a
clean, reliable, **side-effect-free** signal for "does this method exist," because
Slack's router appears to check the method name against its dispatch table before
it ever validates the token. This was confirmed directly:

```
conversations.list         + garbage token -> invalid_auth        (real method)
conversations.definitelyNotAMethod12345 + garbage token -> unknown_method (fake method)
```

It cannot tell you anything about what the method *does*, what params it wants, or
whether it's safe to call for real — only that it's wired up in Slack's dispatcher.
