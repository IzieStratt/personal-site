# `users.*` — users

Documented `users.*` methods are unchanged from official docs (no quirks
observed this session beyond what's already public). This file covers the
undocumented additions.

## `users.admin.invite`

- **Status:** UNDOCUMENTED (legacy admin API).
- **Purpose:** invite a new user to the workspace — old-style admin invite,
  predates the modern `admin.users.*` / SCIM-based flows.
- **Existence:** confirmed via oracle.
- **Live-tested:** **no** — clearly mutating (invites a real person) and
  admin-scoped; explicitly excluded by the safety rules.
- **Provenance:** `slack-ruby/slack-api-ref`
  `methods/_undocumented/users/users.admin.invite.json`; also in
  `ErikKalkoken/slackApiDoc` (`users.admin.invite.md`).
- **Params (from `ErikKalkoken/slackApiDoc`, cross-referenced, not independently
  verified here):** `token` (required, **legacy token only** — the doc notes
  `not_allowed_token_type` for workspace tokens), `email` (required),
  `channels` (optional, comma-separated channel/group IDs to auto-join),
  `real_name` (optional), `resend` (optional bool), `restricted` (optional bool,
  guest w/ multi-channel), `ultra_restricted` (optional bool, single-channel
  guest), `expiration_ts` (optional, guest auto-disable time).
- **Errors documented there but not previously listed here:** `already_in_team`,
  `already_invited`, `already_in_team_invited_user` (undocumented meaning per
  their own notes), `channel_not_found`, `expiration_requires_restricted`,
  `invalid_email`, `invite_limit_reached`, `missing_scope`, `not_allowed` (SSO
  workspaces must use SCIM instead), `not_allowed_token_type`, `not_authed`,
  `requires_one_channel`, `sent_recently`, `user_disabled`.

## `users.admin.setInactive`

- **Status:** UNDOCUMENTED (legacy admin API).
- **Purpose:** deactivate a user account — legacy predecessor to
  `admin.users.remove`.
- **Existence:** confirmed via oracle.
- **Live-tested:** **no** — destructive/admin-scoped, excluded by safety rules.
- **Provenance:** same sources as `users.admin.invite`.
- **Params (cross-referenced from `ErikKalkoken/slackApiDoc`, not independently
  verified here):** `token` (required, legacy), `user` (required, user ID).
  Their notes: does not work on free-tier workspaces; a paid-plan SCIM
  interface (`PATCH /scim/v1/Users/{id}`) is the modern equivalent.
- **Errors documented there:** `paid_only`, `user_not_found`.

## `users.prefs.get`

- **Status:** UNDOCUMENTED. **Live-verified.**
- **Purpose:** fetch the calling user's full client preference blob (the same
  data that backs Slack's in-app Preferences panel — notification settings,
  theme, sidebar behavior, etc).
- **Token:** works with team xoxc/xoxd (not retried against enterprise; no
  reason to expect it's Grid-scoped since it's per-user not per-org).
- **Params:** none required.
- **Response:** `{"ok": true, "prefs": {...}}` — a large flat object of
  preference keys/values (not enumerated/retained here — personal settings
  data).
- **Provenance:** `slack-ruby/slack-api-ref`
  `methods/_undocumented/users/users.prefs.get.json`; also in
  `ErikKalkoken/slackApiDoc`.

## `users.prefs.set`

- **Status:** UNDOCUMENTED.
- **Purpose:** write to the same preference blob `users.prefs.get` reads.
- **Existence:** confirmed via oracle.
- **Live-tested:** **no** — mutating (would change real account settings).
- **Provenance:** `ErikKalkoken/slackApiDoc` (`users.prefs.set.md`); not present
  in the slack-api-ref undocumented set but confirmed to exist independently.
- **Params (cross-referenced from `ErikKalkoken/slackApiDoc`, not independently
  verified here):** `token` (required), `prefs` (required — a JSON object of
  preference keys to overwrite, e.g. `{"muted_channels":"G12345678"}`; same key
  namespace as the blob returned by `users.prefs.get`, e.g. `highlight_words`,
  `tz`, `push_dm_alert`, `push_sound`, `email_alerts`, `loud_channels`,
  `all_channels_loud`, etc — this project has never enumerated that key
  namespace directly; the shape is only known via this cross-reference).

## `users.priority.list`

- **Status:** UNDOCUMENTED. **Live-verified.**
- **Purpose:** a ranked "priority contacts" list — used for DM/people sorting
  in the client (who shows up first in quick-switcher/DM lists).
- **Token:** **enterprise xoxc/xoxd only** — team xoxc gives
  `team_is_restricted`.
- **Params:** none required for a basic call; returned `ok:true` with no
  params.
- **Provenance:** reverse-engineering gist (sshh12), "User & Contact Data"
  section.

## `users.channelSections.list`

- **Status:** UNDOCUMENTED. **Live-verified.**
- **Purpose:** sidebar "sections" (custom channel groupings) definitions for
  the current user.
- **Token:** enterprise xoxc/xoxd only — team xoxc gives `team_is_restricted`.
- **Params:** none required.
- **Provenance:** same reverse-engineering gist.
