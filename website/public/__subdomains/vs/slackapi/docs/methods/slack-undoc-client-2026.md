# `ImShyMike/slack-undoc-client` cross-reference -- new methods this pass

**Source:** [`ImShyMike/slack-undoc-client`](https://github.com/ImShyMike/slack-undoc-client) (also on npm as `slack-undoc-client`), cloned read-only to scratch. A real TypeScript client for Slack's undocumented Web API surface, with a generated `SlackApiMap` (`src/types.ts`, 25,652 lines) giving **typed params and response shapes for 468 methods** -- `token`/`cookie` auth model identical to this project's (`xoxc` bearer + `d=` xoxd cookie, `POST slack.com/api/<method>`, form-encoded). No new protocol surface: same dispatcher, same token model, nothing Edge-API- or websocket-shaped in its source.

**Diff result: mostly overlap.** Of its 468 typed methods, 437 were already in this project's catalog (unsurprising -- by this pass the catalog already covers 1,891 names from the prior sources, including the same webpack-mining lineage this repo likely draws its method list from). **31 were genuinely new.** Not a dead end, but a modest, incremental yield rather than a rich one -- said plainly rather than padded.

**Verification level: `not-live-tested (source-only, typed but unverified)`.** This repo's types are *generated from real API responses* per its own README caveat ("may vary depending on input parameters"), which is stronger provenance than a bare name list, but this project did not independently confirm any of these 31 via the existence oracle or a live call this pass -- that's the honest label to use until someone does.

## The 31 new methods, with their typed params (from this repo's generated types)

| Method | Params (per `slack-undoc-client`'s generated types) |
|---|---|
| `admin.sessions.accessLogs` | `limit?: number; team_id?: string;` |
| `app.uninstallTasks.list` | `(void / no params)` |
| `auth.captcha` | `(void / no params)` |
| `conversations.channelPrefixes.create` | `prefix?: string; description?: string;` |
| `conversations.channelPrefixes.delete` | `prefix?: string;` |
| `developer.apps.actions.delete` | `app?: string; set_active?: boolean;` |
| `developer.apps.apphome.edit` | `app?: string; home_tab_enabled?: boolean; beta_opted_in?: boolean;` |
| `developer.apps.botusers.edit` | `app?: string; always_active?: boolean; real_name?: string; username?: string;` |
| `developer.apps.commands.add` | `app?: string; name?: string; desc?: string; usage?: string; parse_full?: string; set_active?: boolean;` |
| `developer.apps.commands.delete` | `app?: string; command?: string; set_active?: boolean;` |
| `developer.apps.commands.edit` | `app?: string; command?: string; name?: string; desc?: string; usage?: string; parse_full?: string; set_active?: boolean;` |
| `developer.apps.config.createToolingToken` | `(void / no params)` |
| `developer.apps.migration.orgReady` | `app?: string; enable_org_ready?: boolean;` |
| `developer.apps.suggestions.delete` | `app?: string; set_active?: boolean;` |
| `developer.apps.workObjects.update` | `app_id?: string; is_active?: boolean; entity_types?: string;` |
| `imports.listByService` | `service_name?: string; limit?: number;` |
| `payments.billing.history.list` | `limit?: number; cursor?: string;` |
| `payments.checkout.config` | `is_business_plus_trial?: boolean; is_autocharge_trial?: boolean;` |
| `search.modules.triggers` | `module?: string; query?: string; page?: number; client_req_id?: string; browse_session_id?: string; extracts?: number; highlight?: number; extra_message_data?: number; no_user_profile?: number; count?: number; file_title_only?: boolean; query_rewrite_disabled?: boolean; include_files_shares?: number; browse?: string; search_context?: string; max_filter_suggestions?: number; sort?: string; sort_dir?: string; search_only_my_apps?: boolean; strict_exposure_rules?: number; trigger_types?: string;` |
| `slackbot.responses.add` | `triggers?: string; responses?: string;` |
| `slackbot.responses.delete` | `response?: string;` |
| `slackbot.responses.edit` | `response?: string; triggers?: string; responses?: string;` |
| `slackbot.responses.list` | `limit?: number;` |
| `team.admin.attachments.list` | `(void / no params)` |
| `team.billing.addContact` | `email?: string;` |
| `team.billing.changes.list` | `page?: number;` |
| `team.billing.removeContact` | `id?: number;` |
| `users.accessLogs` | `(void / no params)` |
| `users.admin.fetchInvitesHistory` | `type?: string; query?: string; sort_dir?: string; sort_by?: string;` |
| `users.permissions.apps` | `(void / no params)` |
| `users.sharedInvites.renew` | `code?: string; team_id?: string;` |

## Auth-model finding (see `auth-and-tokens.md` for the full writeup)

This repo's `SlackClient.fetchAvailableWorkspaces()` does an unauthenticated (cookie-only, no bearer token) `GET https://app.slack.com/auth?app=client` and scrapes an embedded JSON payload listing every workspace/team the `d` cookie's session is logged into, each with its own pre-issued `token` (and `enterprise_api_token` for Grid orgs). This means **a single `d` cookie is sufficient to enumerate and obtain a working xoxc for every team you're signed into, with zero prior token** -- a new, cross-referenced (not independently live-verified here) fact about this project's auth model, added to `auth-and-tokens.md`.
