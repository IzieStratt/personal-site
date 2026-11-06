# slock debundle catalog (5th source, dropped 2026-09-24)

**Source:** [itsfelix5/slock](https://github.com/itsfelix5/slock) (Felix Gao's
reverse-engineered Slack server project). Felix generated a 2,002-name
machine-readable Web API catalog by pointing a Claude agent at decompiled
Slack client code from last month (his words: "ok I just threw claude at decomp
from last month and it spat back this") and dropped the raw JSON in the Hack
Club thread on 2026-09-24
([message](https://hackclub.slack.com/archives/C07AJB4TC5B/p1790260652430339?thread_ts=1790111535.167669&cid=C07AJB4TC5B)).
The catalog is built *on top of this repo's own* 2026-09-20 catalog: its
per-record `source` strings literally reference `methods/*.md` and
`undocumented/INDEX.md`, and its new entries come from a **full client
debundle** his repo checks in — real `method: "<name>", args: { ... }` **call
sites in application code**, i.e. code that actually invokes the method, not a
bare webpack string reference. His repo describes each source and how it was
verified in its own README.

## What changed in `data/methods.json`

> **Not applied in this repo.** The 2026-09-24 patch replaced `data/methods.json`
> wholesale with Felix's 2,002-method file. The shipped file has since grown to
> 2,247 methods through later daily syncs, so that swap would roll the catalog
> back. The numbers below describe Felix's file, not the current shipped data.

Felix's generated 2026-09-24 file (identical schema, 2-space pretty-printed):

| | shipped (2026-09-20) | after merge (2026-09-24) |
|---|---|---|
| documented | 323 | 323 |
| undocumented | 1,599 | **1,679 (+80)** |
| total | 1,922 | **2,002** |
| `params_known` methods | 726 | **894 (+148)** |
| live-verified (undocumented) | 19 | 19 |

- **80 net-new method names**, every one backed by debundle call sites
  (1 call site: 56 methods, 2: 23, 3: 1). Listed by namespace below.
- **148 existing methods gained real `params`** (argument *names* extracted
  from call sites; no required/type info — `params_source` says so per record).
- **Zero verified-level changes** — no existing method was upgraded or
  downgraded by this merge.

## The 80 new methods, by namespace

These enter the catalog as call-site-existence evidence, the same confidence
tier as `existence-only` (stronger than name-in-webpack-strings, weaker than
live-call verification — none were live-called with real credentials).

| namespace | new methods | n |
|---|---|---|
| `activity.*` | `activity.mark`, `activity.mentions` | 2 |
| `admin.apps.*` | `admin.apps.cancel`, `admin.apps.domainWideAuth.microsoft.getConsentUrl`, `admin.apps.domainWideAuth.removeDomain` | 3 |
| `admin.users.*` | `admin.users.resetPassword` | 1 |
| `agents.*` | `agents.sessions.stop`, `agents.threads.rename` | 2 |
| `ai.*` | `ai.swarmKnowledge.generate` | 1 |
| `ai.alpha.*` | `ai.alpha.slackbot.channelMemory.delete`, `ai.alpha.slackbot.channelMemory.list`, `ai.alpha.slackbot.channelResponses.redact`, `ai.alpha.slackbot.channelResponses.restore`, `ai.alpha.slackbot.channelSkills.addSkill`, `ai.alpha.slackbot.channelSkills.getConfiguration`, `ai.alpha.slackbot.channelSkills.removeSkill`, `ai.alpha.slackbot.channelSkills.setCustomInstructions`, `ai.alpha.slackbot.resolveVoiceToolApproval`, `ai.alpha.slackbot.skills.activate`, `ai.alpha.slackbot.skills.browse`, `ai.alpha.slackbot.skills.deactivate`, `ai.alpha.slackbot.skills.recordView`, `ai.alpha.slackbotBigMode.listRecommendations` | 14 |
| `api.*` | `api.benchmark` | 1 |
| `apps.*` | `apps.about.info`, `apps.permissions.internal.add`, `apps.permissions.internal.addScope`, `apps.permissions.internal.addUser`, `apps.permissions.internal.addWildcard`, `apps.permissions.internal.denyAdd`, `apps.permissions.internal.info`, `apps.permissions.internal.removeWildcard`, `apps.permissions.internal.summary`, `apps.permissions.internal.uninstallApp`, `apps.permissions.internal.user`, `apps.permissions.internal.userRevoke`, `apps.permissions.internal.userSearch` | 13 |
| `blocks.*` | `blocks.page.getContent` | 1 |
| `conversations.*` | `conversations.dms.mark` | 1 |
| `dataResidency.*` | `dataResidency.optIn` | 1 |
| `enterprise.*` | `enterprise.security.ipAllowlist.set` | 1 |
| `featureEligibility.*` | `featureEligibility.check` | 1 |
| `files.*` | `files.channelSettingsAllowDownloads`, `files.list3pFiles` | 2 |
| `functions.*` | `functions.workflows.executions.continueAgentConversation`, `functions.workflows.executions.getAgentConversationHandoffStatus` | 2 |
| `huddles.*` | `huddles.external.end`, `huddles.external.kick` | 2 |
| `lists.*` | `lists.getDefaultView`, `lists.history.restoreExecute`, `lists.history.restorePreview`, `lists.records.restore`, `lists.setDefaultView` | 5 |
| `moderation.*` | `moderation.flags.dismiss`, `moderation.removeMessage` | 2 |
| `screenhero.*` | `screenhero.rooms.inviteResponse` | 1 |
| `search.*` | `search.autocomplete.nlTypeahead` | 1 |
| `sfdc.*` | `sfdc.agentforce.admin.enableMcpServers`, `sfdc.agentforce.admin.getMcpServersDetails`, `sfdc.domainVerification.isVerified`, `sfdc.integration.searchUsers`, `sfdc.provisionOrg` | 5 |
| `slackbot.*` | `slackbot.mcp.discover`, `slackbot.mcp.invalidateToolsCache`, `slackbot.mcp.servers.add`, `slackbot.mcp.updateModelContext`, `slackbot.memories.create`, `slackbot.memories.update`, `slackbot.projects.create`, `slackbot.projects.delete`, `slackbot.projects.list`, `slackbot.projects.lookupByThread`, `slackbot.projects.memoryInfo`, `slackbot.projects.memoryUpdate`, `slackbot.projects.threads.add`, `slackbot.projects.threads.list`, `slackbot.projects.update` | 15 |
| `users.*` | `users.delegates.add`, `users.delegates.list`, `users.delegates.remove` | 3 |

**Namespace notes:**

- **`slackbot.*` (+15) and `ai.alpha.slackbot.*` (+14)** — the biggest new
  family is Slackbot-as-a-platform: MCP server management
  (`slackbot.mcp.discover` / `servers.add` / `invalidateToolsCache` /
  `updateModelContext`), per-project memory
  (`slackbot.projects.*`, `slackbot.memories.*`), and the agent-side
  equivalents (`ai.alpha.slackbot.channelSkills.*`, `channelMemory.*`,
  `channelResponses.redact/restore`, `skills.activate/browse/deactivate`).
- **`apps.permissions.internal.*` (+13)** — an internal permission-management
  family (add/deny/revoke scopes and users per app).
- **`sfdc.*` (+5)** — Salesforce integration, including Agentforce MCP server
  administration.
- **`huddles.external.*`** — ending/kicking external participants; **`lists.*`
  restore family**; **`users.delegates.*`**.

## Caveats

- Felix's own warning applies to everything in his file: *"note that the
  parameter list may not be complete or even correct in rare cases"*
  ([message](https://hackclub.slack.com/archives/C07AJB4TC5B/p1790172223050299?thread_ts=1790111535.167669&cid=C07AJB4TC5B)).
- Call-site argument extraction gives **arg names only** — no required/type
  info, not live-verified against a real account. Per-record `params_source`
  states this; trust nothing beyond the names.
- His catalog's provenance strings were generated in *his* session/repo ("call
  site(s) found this session" refers to his debundle check-in). Kept verbatim
  so the data file stays byte-identical to what he generated.
