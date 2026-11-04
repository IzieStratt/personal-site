# Read-only sweep, 2026-11-03

**Read-style methods only, two token types, one account (`auto-accountsjohnfloc`, Hack Club / Enterprise Grid).** Raw per-method results: [`docs/data/read-sweep-2026-11-03.tsv`](../data/read-sweep-2026-11-03.tsv).

## Scope

- 716 methods taken from the catalog's non-write-shaped list, filtered to read-style names (`list`, `get`, `info`, `search`, `lookup`, `history`, `replies`, `status`, `fetch`, `count(s)`, `members`, `files`, `dms`, `find`, `details`, `metadata`, `permissions`, `read`, `view`).
- Each was called once with an empty body.
- Skipped: about 820 write-shaped methods, and about 696 non-write methods with mutating or ambiguous names (`start`, `open`, `publish`, `export`, `submit`, `bulkDelete`, `deactivate`, and similar).
- No write-shaped methods were called.

## Two tokens

- **Workspace token** (`teams[2]`, workspace `T0266FRGM`): 68 `ok`. Most calls fail with `team_is_restricted` (295).
- **Enterprise token** (`teams[0]`, `E09V59WQY1E`): 104 `ok`. Fails with `missing_scope`, `access_denied`, and `restricted_action` instead.
- **Union**: 116 methods returned `ok: true`. 56 work with both tokens, 12 only with the workspace token, 48 only with the enterprise token.

## `unknown_method` (catalog entries this workspace doesn't know)

Returned by both tokens, so this doesn't depend on the token used:

`admin.apps.activities.list`, `admin.apps.config.lookup`, `admin.apps.domainWideAuth.list`, `admin.apps.updates.list`, `admin.productivity.apps.getBanner`, `admin.workflows.search`, `ai.alpha.replies.get`, `api.statusSite`, `apps.permissions.internal.info`, `calendar.alerts.list`, `channels.history`, `channels.replies`, `im.history`, `im.replies`, `lists.getOrCreateTaskList`, `mpim.history`, `sfdc.datacloud.getDatacloudTeamInfo`, `sfdc.getContactAvailableFields`, `sfdc.getContactCSVSample`, `unread.history`

These catalog entries should be corrected or removed.

## Sensitive read

- `users.admin.fetchTeamUsersCsv` returned `ok: true` on the workspace token. It returns a CSV of team members. The body was not saved.

## Edge API

The 17 Edge endpoints in [`edge-api.md`](edge-api.md) return `ok: true` with both tokens.
