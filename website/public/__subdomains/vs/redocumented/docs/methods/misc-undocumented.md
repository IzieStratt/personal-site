# Misc undocumented methods (assorted namespaces)

One-off undocumented methods that don't warrant their own namespace file.
All confirmed to exist via the existence oracle; live-testing status noted per
method. All live calls used the **team** xoxc/xoxd unless noted otherwise.

## `commands.list`

- **Purpose:** list slash commands available/installed for the workspace.
- **Token:** **enterprise xoxc/xoxd only** (team xoxc -> `team_is_restricted`).
- **Live-verified:** yes, with enterprise xoxc, `{"ok": true, ...}`.
- **Provenance:** `ErikKalkoken/slackApiDoc` (`commands.list.md`).
- **Response shape (cross-referenced from that repo, not independently
  re-verified here):** `commands` is an object keyed by command name (e.g.
  `/feed`), each value having `canonical_name`, `usage`, `desc`, `name`, `type`
  (`core` for Slack-provided commands, `app` for ones from an installed app —
  `app` type entries also carry an `app` field with the app ID).

## `bookmarks.list`

- **Purpose:** list bookmarks attached to a channel (the "Bookmarks" bar above
  the message list).
- **Token:** team xoxc/xoxd worked for the call shape (error was about missing
  params, not token scope).
- **Params:** requires `channel_id` — called with none, got `invalid_arguments`.
- **Live-verified:** partially (exists, confirmed required-param error; not
  called with a real channel id to avoid reading channel-specific data
  unnecessarily — bookmarks are visible to all channel members anyway so this
  would have been low-risk, just not done this pass).
- **Provenance:** reverse-engineering gist, "Drafts, Bookmarks, Saved" section.
  (Note: `bookmarks.list` is *also* a real, documented `slack.com/api` method in
  some SDKs — double check against `methods/INDEX.md`; if it's already in the
  official 324, treat this entry as confirming/re-documenting it rather than a
  new discovery. In our slack-api-ref mirror, `bookmarks` has 4 documented
  methods total — this name appearing in the internal-client traffic gist is
  consistent with it being the same, official, `bookmarks.list`.)

## `saved.list`

- **Purpose:** list "Saved for later" items (Slack's saved-items/bookmarked-
  messages feature, distinct from channel bookmarks above).
- **Token:** **enterprise xoxc/xoxd only** (team xoxc -> `team_is_restricted`).
- **Live-verified:** yes, `{"ok": true, ...}` with enterprise xoxc.
- **Provenance:** reverse-engineering gist; also referenced (as a general
  concept, `stars.list` being the documented deprecated predecessor) in
  korotovsky/slack-mcp-server docs ("cannot access saved items tools" for xoxb).

## `features.access.policies.list`

- **Purpose:** list feature-flag/entitlement access policies visible to the
  current user — i.e. which paid/gated features this account can see.
- **Token:** team xoxc/xoxd.
- **Live-verified:** yes, `{"ok": true, "feature_policies": [...]}`.
- **Provenance:** reverse-engineering gist, "Features & Experiments" section.

## `experiments.getByUser`

- **Purpose:** A/B experiment bucket assignments for the current user — which
  Slack feature experiments this account is enrolled in and which variant.
- **Token:** team xoxc/xoxd.
- **Live-verified:** yes, `{"ok": true, "assignments": [...], "config_version_ts": ...}`.
- **Provenance:** reverse-engineering gist.

## `api.features`

- **Purpose:** feature-gate flags for the calling client/app — a flatter,
  simpler cousin of `features.access.policies.list`.
- **Token:** team xoxc/xoxd.
- **Live-verified:** yes, `{"ok": true, "features": {...}}`.
- **Provenance:** reverse-engineering gist.

## `enterprise.prefs.get`

- **Purpose:** enterprise-org-level client preferences (as opposed to
  `team.prefs.get`'s single-workspace scope, or `users.prefs.get`'s per-user
  scope).
- **Token:** presumed enterprise xoxc/xoxd by naming analogy with `client.userBoot`
  etc.; **not live-tested** this pass (existence only).
- **Provenance:** reverse-engineering gist.

## `help.issues.ticketStats`

- **Purpose:** counts of open/unread Slack customer-support tickets filed by
  this user/workspace — backs the little badge on the Help/support menu item.
- **Token:** team xoxc/xoxd.
- **Live-verified:** yes, `{"ok": true, "open_count": N, "unread_count": N}`.
- **Provenance:** reverse-engineering gist.

## `sharedInvites.canGetLink`

- **Purpose:** whether the current user is eligible/permitted to generate a
  workspace shared-invite link (the "Invite people" -> "Share this link"
  feature) — an eligibility check, not the link-generation call itself.
- **Token:** team xoxc/xoxd.
- **Live-verified:** yes, `{"ok": true, "is_eligible": bool, "reason": "..."}`.
- **Provenance:** reverse-engineering gist.

## `workflows.triggers.list`

- **Purpose:** list Workflow Builder triggers visible to the current user —
  the undocumented listing counterpart to the documented, more narrowly-scoped
  `workflows.*` methods (workflow step execution, etc).
- **Token:** team xoxc/xoxd.
- **Live-verified:** yes, `{"ok": true, "triggers": [...], "rejected_triggers":
  [...], "response_metadata": {...}}`.
- **Provenance:** reverse-engineering gist.

## `megaphone.notifications.list`

- **Purpose:** "what's new"/announcement-banner notifications shown in the
  client (Slack's own in-product marketing/feature-announcement system, third-
  party-integration name is "Megaphone").
- **Token:** team xoxc/xoxd (call succeeded past auth).
- **Live-verified:** partially — got `invalid_arguments` with no params (wants
  at least one filter/pagination arg, exact name unconfirmed).
- **Provenance:** reverse-engineering gist.

## `aiApps.list`

- **Purpose:** list AI apps/agents available/installed in the workspace (Slack
  AI feature surface, e.g. workspace-installed AI assistants).
- **Token:** team xoxc/xoxd.
- **Live-verified:** yes, `{"ok": true, "apps": [...], "response_metadata": {...}}`.
- **Provenance:** reverse-engineering gist.

## `slackAi.permissions.getForUser`

- **Purpose:** Slack AI feature permission/entitlement state for the current
  user (whether AI features are enabled/visible for this account).
- **Token:** team xoxc/xoxd (call succeeded past auth).
- **Live-verified:** partially — `invalid_arguments` with no params (likely
  wants a `user` id, even if only the caller's own).
- **Provenance:** reverse-engineering gist.

## `sfdc.integration.listOrgs`

- **Purpose:** list connected Salesforce ("SFDC") integration orgs — an
  enterprise integration-admin feature.
- **Token:** reported as enterprise-session in source material.
- **Live-tested:** **deliberately skipped.** Even though shaped like a `list`
  read, it's an enterprise-integration/admin-adjacent surface
  ("`sfdc.*`"/"integration orgs" implies org-wide config visibility), and the
  safety rules call for treating "anything enterprise-admin/org-wide" as
  off-limits for live calls even when nominally read-only, unless clearly
  harmless. This one wasn't clearly harmless, so it's documented source-only.
- **Provenance:** reverse-engineering gist, "Additional Features" section.
