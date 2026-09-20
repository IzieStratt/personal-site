# Undocumented / internal methods — index

Methods confirmed to **exist** (via the existence oracle, see `../README.md`
methodology) that are **not** in Slack's official method list
(`docs.slack.dev/reference/methods` / `api.slack.com/methods`). "Live-verified"
means we made a real, read-only call with real credentials this session; "source
only" means we know it from a secondary source (reverse-engineering writeup / SDK)
and confirmed only its *existence* via the oracle, not its behavior.

## Update (this pass and the follow-up mining pass): larger batches kept out of the table below

The hand-curated table below (48 methods) is from the original pass. Later
passes added larger batches that are **not** transcribed row-by-row here
(hundreds of entries each would make this table unusable) -- see their own
files:

- **`../methods/datamine-2026-09.md`** -- 391 methods newly confirmed to exist
  (oracle `EXISTS`) out of 403 candidate names mined from `3kh0/slack-datamine`'s
  committed build-132396 webpack extraction (12 NOT_FOUND, excluded).
  `existence-only`, not live-called with real credentials.
- **`../methods/internal-canvas-2026.md`** -- **all 1,197 genuinely-new
  candidate names from a private internal Canvas the user linked mid-task
  (not one of the 3 assigned sources) are now existence-oracle-tested, 100%,
  not just sampled.** Final: **1,120 confirmed EXISTS** (added,
  `existence-only`), **68 confirmed NOT_FOUND** (excluded from the catalog
  entirely), **9 ambiguous** (kept, tagged `ambiguous (...)` -- includes a
  notable finding: 3 `mc.*` names all return a distinct "internal access
  elevation" error referencing `mc.tinyspeck.com`, suggesting a real but
  employee-gated internal namespace, not a normal client-facing dispatch).
  See that file for the full NOT_FOUND/ambiguous lists and detail.
- **`../methods/slack-undoc-client-2026.md`** -- a follow-up source-mining
  pass on [`ImShyMike/slack-undoc-client`](https://github.com/ImShyMike/slack-undoc-client),
  a real generated TypeScript client with typed params/responses for 468
  undocumented methods. Diffed against everything gathered so far: 437 were
  already known (heavy overlap, expected by this point), **31 were genuinely
  new**. Modest yield, not a dead end -- added with their typed params, tagged
  `not-live-tested (source-only, typed but unverified)` since this project
  did not independently confirm them. Also yielded a new auth-model fact (see
  `../auth-and-tokens.md`): a single `d` cookie alone, no token needed, can
  enumerate every workspace/team you're logged into and its pre-issued xoxc
  token, via an unauthenticated fetch of `app.slack.com/auth?app=client`.

All of the above are also in `../data/methods.json` and rolled into the totals
in `../methods/INDEX.md` and `../README.md`.

| Method | Purpose (one line) | Token type | Live-verified? | Section |
|---|---|---|---|---|
| `client.boot` | Boots a single team's web-client state (team-scoped). | team xoxc/xoxd | Yes | [methods/client.md](../methods/client.md#clientboot) |
| `client.userBoot` | Boots org-wide user/client state across the whole Enterprise Grid org. | enterprise xoxc/xoxd | Yes | [methods/client.md](../methods/client.md#clientuserboot) |
| `client.counts` | Unread/mention/badge counts across the org. | enterprise xoxc/xoxd | Yes (existence + `team_is_restricted`/`ok` behavior) | [methods/client.md](../methods/client.md#clientcounts) |
| `client.extras` | Auxiliary boot payload (exact contents unconfirmed — needs args). | enterprise xoxc/xoxd | Partial (exists, `invalid_arguments` with no params) | [methods/client.md](../methods/client.md#clientextras) |
| `client.shouldReload` | Tells the client whether its cached build is stale. | enterprise xoxc/xoxd | Partial (exists, wants a build-version param) | [methods/client.md](../methods/client.md#clientshouldreload) |
| `client.dms` | DM list/history filters for the Edge-style client sync path. | session (reported) | No — source only | [methods/client.md](../methods/client.md#clientdms) |
| `drafts.list` | List the user's scheduled/unsent drafts. | enterprise xoxc/xoxd | Yes (prior work + re-confirmed) | [methods/drafts.md](../methods/drafts.md) |
| `drafts.create` | Create a scheduled draft (Slack client's actual "schedule send" mechanism). | team OR enterprise xoxc/xoxd | Yes (sandbox-tested) | [methods/drafts.md](../methods/drafts.md) |
| `drafts.update` | Edit an existing draft. | enterprise xoxc/xoxd | Existence only (not exercised for real edits) | [methods/drafts.md](../methods/drafts.md) |
| `drafts.delete` | Delete a draft. | enterprise xoxc/xoxd | Yes (sandbox cleanup) | [methods/drafts.md](../methods/drafts.md) |
| `chat.command` | Runs a slash command server-side (as if typed in the composer). | unknown (listed in slack-api-ref `_undocumented`) | No — source only | [methods/chat.md](../methods/chat.md#chatcommand) |
| `files.edit` | Edit an uploaded file's content/title in place. | unknown | No — source only | [methods/files.md](../methods/files.md#filesedit) |
| `files.share` | Share an already-uploaded file into a channel (separate from the upload step). | unknown | No — source only | [methods/files.md](../methods/files.md#filesshare) |
| `users.admin.invite` | Legacy admin user invite. | admin session | No — source only, explicitly out of live-test scope (admin/mutating) | [methods/users.md](../methods/users.md#usersadmininvite) |
| `users.admin.setInactive` | Legacy admin user deactivation. | admin session | No — source only, explicitly out of scope (mutating) | [methods/users.md](../methods/users.md#usersadminsetinactive) |
| `users.prefs.get` | Fetch the calling user's full client preference blob. | session xoxc/xoxd | Yes | [methods/users.md](../methods/users.md#usersprefsget) |
| `users.prefs.set` | Set client preferences. | session xoxc/xoxd | No — mutating, not live-tested | [methods/users.md](../methods/users.md#usersprefsset) |
| `users.priority.list` | Ranked/priority contact list (used for DM sorting). | enterprise xoxc/xoxd | Yes | [methods/users.md](../methods/users.md#userspriroritylist) |
| `users.channelSections.list` | Sidebar section/grouping definitions for channels. | enterprise xoxc/xoxd | Yes | [methods/users.md](../methods/users.md#userschannelsectionslist) |
| `team.prefs.get` | Team-level client preferences. | session xoxc/xoxd | Yes | [methods/team.md](../methods/team.md#teamprefsget) |
| `commands.list` | List available slash commands. | enterprise xoxc/xoxd | Yes | [methods/misc-undocumented.md](../methods/misc-undocumented.md#commandslist) |
| `bookmarks.list` | List bookmarks for a channel (needs `channel_id`). | session xoxc/xoxd | Yes (exists, `invalid_arguments` w/o channel_id) | [methods/misc-undocumented.md](../methods/misc-undocumented.md#bookmarkslist) |
| `saved.list` | List "Saved for later" items. | enterprise xoxc/xoxd | Yes | [methods/misc-undocumented.md](../methods/misc-undocumented.md#savedlist) |
| `search.inline` | Inline/as-you-type search suggestions. | session xoxc/xoxd | No — source only | [methods/search.md](../methods/search.md#searchinline) |
| `search.autocomplete` | General search-box autocomplete. | session xoxc/xoxd | Existence only | [methods/search.md](../methods/search.md#searchautocomplete) |
| `search.autocomplete.topEmojis` | Emoji-picker autocomplete ranking. | session xoxc/xoxd | Existence only | [methods/search.md](../methods/search.md#searchautocompletetopemojis) |
| `search.autocomplete.files` | File-search autocomplete. | session xoxc/xoxd | Existence only | [methods/search.md](../methods/search.md#searchautocompletefiles) |
| `search.modules.messages` | Modular message search (modern search backend). | enterprise xoxc/xoxd | Yes (exists, wants query) | [methods/search.md](../methods/search.md#searchmodulesmessages) |
| `search.modules.files` | Modular file search. | enterprise xoxc/xoxd | Existence only | [methods/search.md](../methods/search.md#searchmodulesfiles) |
| `search.modules.channels` | Modular channel search. | enterprise xoxc/xoxd | Existence only | [methods/search.md](../methods/search.md#searchmoduleschannels) |
| `search.modules.people` | Modular people search. | enterprise xoxc/xoxd | Existence only | [methods/search.md](../methods/search.md#searchmodulespeople) |
| `search.modules.dms` | Modular DM search. | enterprise xoxc/xoxd | Existence only | [methods/search.md](../methods/search.md#searchmodulesdms) |
| `search.save` | Save a search query (recent/saved searches). | session xoxc/xoxd | No — mutating, not live-tested | [methods/search.md](../methods/search.md#searchsave) |
| `search.precache` | Pre-warm search caches. | session xoxc/xoxd | Existence only | [methods/search.md](../methods/search.md#searchprecache) |
| `features.access.policies.list` | List feature-flag/entitlement access policies visible to this user. | team xoxc/xoxd | Yes | [methods/misc-undocumented.md](../methods/misc-undocumented.md#featuresaccesspolicieslist) |
| `experiments.getByUser` | Get A/B experiment bucket assignments for the current user. | team xoxc/xoxd | Yes | [methods/misc-undocumented.md](../methods/misc-undocumented.md#experimentsgetbyuser) |
| `api.features` | Feature-gate flags for the calling client/app. | team xoxc/xoxd | Yes | [methods/misc-undocumented.md](../methods/misc-undocumented.md#apifeatures) |
| `enterprise.prefs.get` | Enterprise-level client preferences. | enterprise xoxc/xoxd | Existence only | [methods/misc-undocumented.md](../methods/misc-undocumented.md#enterpriseprefsget) |
| `conversations.view` | Marks a conversation as "viewed"/opened in the client (possible side effect — see caution). | session xoxc/xoxd | No — deliberately not live-tested, ambiguous mutation risk | [methods/conversations.md](../methods/conversations.md#conversationsview) |
| `conversations.listPrefs` | Per-conversation client prefs (mute state, etc.) list. | session xoxc/xoxd | No — not live-tested | [methods/conversations.md](../methods/conversations.md#conversationslistprefs) |
| `conversations.bulkReacjiTriggers` | Bulk fetch of reacji/auto-reaction trigger config. | session xoxc/xoxd | No — not live-tested | [methods/conversations.md](../methods/conversations.md#conversationsbulkreacjitriggers) |
| `help.issues.ticketStats` | Counts of open/unread Slack support tickets for this user. | team xoxc/xoxd | Yes | [methods/misc-undocumented.md](../methods/misc-undocumented.md#helpissuesticketstats) |
| `sharedInvites.canGetLink` | Whether the user is eligible to generate a shared-invite link. | team xoxc/xoxd | Yes | [methods/misc-undocumented.md](../methods/misc-undocumented.md#sharedinvitescangetlink) |
| `workflows.triggers.list` | List Workflow Builder triggers visible to the user. | team xoxc/xoxd | Yes | [methods/misc-undocumented.md](../methods/misc-undocumented.md#workflowstriggerslist) |
| `megaphone.notifications.list` | "What's new" / announcement banner notifications. | team xoxc/xoxd | Yes (exists, wants args) | [methods/misc-undocumented.md](../methods/misc-undocumented.md#megaphonenotificationslist) |
| `aiApps.list` | List AI apps/agents available in the workspace. | team xoxc/xoxd | Yes | [methods/misc-undocumented.md](../methods/misc-undocumented.md#aiappslist) |
| `slackAi.permissions.getForUser` | Slack AI feature permission state for this user. | team xoxc/xoxd | Yes (exists, wants args) | [methods/misc-undocumented.md](../methods/misc-undocumented.md#slackaipermissionsgetforuser) |
| `sfdc.integration.listOrgs` | Salesforce-integration org list (enterprise-admin-adjacent). | enterprise session (reported) | No — deliberately skipped, org-wide/admin-adjacent per safety rules | [methods/misc-undocumented.md](../methods/misc-undocumented.md#sfdcintegrationlistorgs) |
| `edgeapi.slack.com/cache/<enterprise_id>/*` (users/info, users/list, users/counts, users/search, channels/info, channels/membership, channels/search, permissions/info, huddles/info, emojis/info) | Slack's separate **Edge API** cache layer — a different host/path scheme entirely, not `slack.com/api/<method>`. | session xoxc/xoxd | No — different dispatch path, existence oracle as built doesn't apply, source only | [methods/edge-api.md](../methods/edge-api.md) |

## Candidates checked and found **not to exist** (false leads from secondary sources)

`bots.list`, `channels.delete`, `apps.user.connection`, `calendar.list` — all came
back `unknown_method` under the existence oracle. Recorded here so the same dead
ends aren't re-walked later; they may be renamed/removed/misremembered in whatever
source suggested them.

**Update from mining `ErikKalkoken/slackApiDoc` this pass:** that repo documents
full param/response detail for `bots.list` and `channels.delete` (see below) and
both of their own write-ups note the token requirement is a **legacy token**
(pre-2020 `xoxp`-style "legacy token", not the session `xoxc`/`xoxd` pair this
project's oracle probes with, and not a modern OAuth token either). Slack retired
legacy-token creation in May 2020 (per that repo's own README banner). The most
likely explanation for the oracle's `unknown_method` on these two names is that
their dispatch path was fully removed for the modern router once legacy tokens
were phased out — not that the names were ever wrong. This is inference, not
independently confirmed (would require an actual working legacy token, which
this project does not have and did not seek out).

- `bots.list` — lists all apps/bots in the workspace (similar to `users.list`
  but for bot entities). Params: `token` (required, legacy, `read` scope).
  Response: `{"ok": true, "bots": [{"id", "deleted", "name", "updated",
  "app_id", "icons": {...}}, ...]}`. Error: `missing_scope`.
  Provenance: `ErikKalkoken/slackApiDoc` (`bots.list.md`), cross-referenced,
  not independently verified here (oracle says not-found on modern tokens).
- `channels.delete` — deletes a public channel. Params: `token` (required,
  legacy, `client` scope), `channel` (required, channel ID). Response:
  `{"ok": true}`. Errors: `channel_not_found`, `missing_scope`.
  Provenance: `ErikKalkoken/slackApiDoc` (`channels.delete.md`), cross-referenced,
  not independently verified here (oracle says not-found on modern tokens).
