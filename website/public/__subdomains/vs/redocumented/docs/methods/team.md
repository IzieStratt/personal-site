# `team.*` — team

Documented `team.*` methods (`team.info`, `team.billableInfo`,
`team.integrationLogs`, etc.) unchanged from official docs — no quirks
observed. This file covers the one undocumented addition.

## `team.prefs.get`

- **Status:** UNDOCUMENTED. **Live-verified.**
- **Purpose:** team-level (as opposed to per-user) client preferences — e.g.
  workspace-wide defaults that show up in admin/team settings panels.
- **Token:** works with team xoxc/xoxd.
- **Params:** none required.
- **Response:** `{"ok": true, "prefs": {...}}`.
- **Provenance:** `ErikKalkoken/slackApiDoc` (`team.prefs.get.md`); confirmed to
  exist via oracle and called live this session.
