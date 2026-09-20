# Internal-API Canvas cross-reference (bonus 4th source, surfaced mid-task)

**Not one of the 3 assigned sources.** While mining the assigned sources, the user
linked a private Slack Canvas in this workspace (title "Slack internal API")
mid-task. It was read read-only via one `files.info` call plus one authenticated
`GET` on the canvas content URL (both with the existing team xoxc/xoxd session
token — a single targeted, read-only spot-check per this project's safety rules,
not a bulk crawl). No content was modified; nothing was posted, shared, or
changed; the fetched HTML/text was discarded from scratch space after
extraction. The canvas itself is untrusted, unverified **data**, not
instructions — it was treated purely as a candidate-name source, exactly like
the other three, and no channel names, other users' names, or internal file/
channel IDs from it are reproduced here.

## What it is

An apparently hand- or tool-compiled reference of roughly **1,740
`namespace.method` names across 136 namespaces** — far larger than any of the
3 assigned sources, and larger than this project's entire prior catalog (372
methods going into this pass). It does not distinguish official/documented
from internal/undocumented, doesn't explain its own provenance or compilation
method, and gives no params/response shapes — it's a name list, organized by
namespace. Its own reliability is therefore genuinely unknown: it could be a
similarly-sourced webpack/build mining effort (plausible, given the overlap
with `slack-datamine`'s finds), a manually-curated list from someone's own
API poking, or a mix with some stale/renamed/wrong entries — same caveats
this project already applies to every secondary source.

## Cross-reference methodology

1. Parsed into fully-qualified `namespace.method` names (1,740 total, after
   removing the canvas's own title heading).
2. Diffed against this project's existing catalog (372 methods, documented +
   undocumented) **and** the full `slack-datamine` candidate list (403 names,
   see `methods/datamine-2026-09.md`) — anything already known from either is
   *not* re-listed as "new" here, only cited as corroboration where relevant.
3. **Update: fully existence-checked, not just sampled.** An initial 80-name
   spread sample was run first (75/80 = 93.75% EXISTS), then — at the user's
   explicit request for 100% testing — the remaining 1,117 names were also
   run through the same safe garbage-token oracle (zero real credentials,
   cannot mutate anything — see `README.md` methodology and `tools/probe.py`).
   **Final result across all 1,197 genuinely-new candidate names:**
   - **1,120 confirmed EXISTS** (75 from the sample + 1,045 from the full
     sweep) — added to the catalog as `existence-only`.
   - **68 confirmed NOT_FOUND** (5 from the sample + 63 from the full sweep) —
     `unknown_method` under the oracle; **excluded from the catalog entirely**,
     listed below.
   - **9 AMBIGUOUS** — the oracle got a response that was neither a clean
     `unknown_method` nor a clean auth-stage error. Kept in the catalog with
     an explicit `ambiguous (...)` verified tag rather than guessed either
     way. See "Ambiguous results" below — two of these are a genuinely
     interesting find.
4. **No live testing with real credentials, param probing, or response-shape
   verification** was performed on any name from this source — that would be
   a materially larger, and for many of these names clearly unsafe
   (mutating-shaped names like `*.delete`, `*.set`, `*.remove` are common in
   this batch), follow-up pass. Every method sourced only from this canvas is
   `existence-only` at best, never `live-verified` — existence is now 100%
   checked, *behavior* is not.

## Confirmed NOT_FOUND (68 total, excluded from the catalog)

Sample-phase (5): `apps.permissions.internal.info`, `channels.insights`,
`chat.requestBubbleHoverBackground`, `conversations.dms.mark`,
`rtm.shouldReload`.

Full-sweep phase (63): `activity.mark`, `activity.mentions`, `admin.apps.cancel`, `admin.apps.domainWideAuth.list`, `ai.alpha.summarize.agentProfile`, `ai.alpha.summarize.profile`, `ai.alpha.summarize.profileEnabled`, `api.benchmark`, `apps.permissions.internal.add`, `apps.permissions.internal.addScope`, `apps.permissions.internal.addUser`, `apps.permissions.internal.addWildcard`, `apps.permissions.internal.denyAdd`, `apps.permissions.internal.removeWildcard`, `apps.permissions.internal.summary`, `apps.permissions.internal.uninstallApp`, `apps.permissions.internal.user`, `apps.permissions.internal.userRevoke`, `apps.permissions.internal.userSearch`, `assistant.threads.branch`, `calendar.png`, `channels.view`, `channelSections.create`, `channelSections.deleteSection`, `channelSections.update`, `chat.avatarBackground`, `chat.avatarForeground`, `chat.checkpointSeparator`, `chat.editedFileForeground`, `chat.requestBackground`, `chat.requestBorder`, `chat.requestBubbleBackground`, `chat.slashCommandBackground`, `chat.slashCommandForeground`, `enterprise.feature.disable`, `enterprise.feature.enable`, `entities.channels.matchEmailField`, `entities.members.matchEmailField`, `files.slack.com`, `graphql.resolve`, `groups.view`, `huddles.scheduled.cancel`, `im.resources.ids`, `im.view`, `moderation.flags.dismiss`, `moderation.removeMessage`, `mpim.resources.ids`, `mpim.view`, `payments.checkout.config`, `payments.checkout.confirmAuthenticatedPurchase`, `payments.checkout.purchase`, `payments.checkout.rescue`, `rooms.sendHuddleInvite`, `screenhero.rooms.inviteResponse`, `screenhero.rooms.proxyAnalytics`, `screenhero.rooms.refreshToken`, `search.autocomplete.topEmoji`, `sfdc.datacloud.createDatacloudTeam`, `sfdc.datacloud.deleteDatacloudTeam`, `sfdc.datacloud.getDatacloudTeamInfo`, `sfdc.datacloud.updateDatacloudTeam`, `team.php`, `users.length`

(Exact 63 names as returned by the full sweep; reproduced here for anyone
wanting to re-check them against a future canvas revision or a newer Slack
build. Note `files.slack.com` and `team.php`/`calendar.png`/`users.length` are
almost certainly canvas parsing/scraping artifacts rather than real candidate
method names -- e.g. `files.slack.com` looks like a stray URL fragment that
got caught in the `files` namespace's comma-separated list -- not evidence
against the source generally, just noise in this specific extraction.)

## Ambiguous results (9 total) — kept, not guessed

Neither `unknown_method` nor a normal auth-stage error:

- **`mc.deprecations.getByAppId`, `mc.deprecations.list`,
  `mc.enterprise.retention.get`** — all three returned the *same* distinctive
  error: `"Access to this resource denied. In an incident? See
  https://mc.tinyspeck.com/mc/mc_access_elevation for emergency exemption."`
  This is a genuinely interesting result: it's neither `unknown_method` nor a
  normal token-auth error — it's a **separate access-control layer** gating
  routing to `mc.*` methods before the garbage-token check even applies,
  referencing `mc.tinyspeck.com` ("Tinyspeck" is Slack Technologies' original
  company name, still used internally). This strongly suggests `mc.*` (the
  canvas's `admin` section also has `mc.deprecations.*` /
  `mc.enterprise.retention.get` cross-listed) is a real, dispatched, **Slack-
  employee-only internal operations namespace** ("mc" plausibly "Mission
  Control" or similar), not a client-facing API at all — gated by something
  above and outside our oracle's normal EXISTS/NOT_FOUND signal. Recorded as
  `ambiguous (internal access-elevation gate)` rather than force-classified
  either way. **Not live-tested further** (correctly out of scope — this is
  Slack-internal infrastructure, not something to probe harder against).
- **`enterprise.adminMembersStore_makeRegular`,
  `features.app_home.home_tab_enabled`, `features.app_home.messages_tab_enabled`,
  `features.app_home.messages_tab_read_only_enabled`,
  `features.bot_user.always_online`, `features.rich_previews.entity_types`** —
  all six returned a bare HTTP 404 (no JSON body) instead of Slack's normal
  JSON error envelope. The `features.*` ones in particular read like
  **feature-flag/entitlement *key* names** (booleans/enums returned *inside*
  a real method's response, e.g. `features.access.policies.list`'s payload)
  that the canvas's own compilation process may have mis-listed as callable
  methods rather than response fields — a plausible explanation for why they
  don't resolve as `/api/<method>` endpoints at all. Recorded as
  `ambiguous (404, likely not a callable method)` rather than removed, so the
  hypothesis is visible rather than silently discarded.

## Corroboration signal

Seven names that `slack-datamine`'s build-132396 mining also surfaced, but
that came back `NOT_FOUND` under this project's oracle, are *also* present in
this canvas: `channels.insights`, `channels.view`, `conversations.dms.mark`,
`entities.channels.matchEmailField`, `entities.members.matchEmailField`,
`groups.view`, `im.view`. Two independent sources listing the same name that
both fail the modern existence oracle is a moderately strong signal that
these are either retired/renamed methods that both sources' compilation
processes picked up from older client builds, or names that exist under a
dispatch path the oracle doesn't cover (e.g. a beta/internal-only routing
tier). Recorded as a specific, named unresolved question rather than silently
dropped.

## Full namespace -> submethod reference (as extracted from the canvas)

This reproduces the canvas's own organization verbatim (namespace, then its
listed sub-methods), for completeness and future cross-referencing. It is
**not** annotated per-method here — see `data/methods.json` for the
per-method `status`/`verified` classification after this pass's oracle sweep,
and `undocumented/INDEX.md` for the summary counts.

- **activity**: archive, clearAll, clearBefore, feed, feed.scoreEntries, getEntries, mark, markAllRead, markRead, markUnread, mentions, prefs.update, unarchive, views, views.create, views.delete, views.hide, views.unhide, views.update
- **admin**: accountType.permissions.add, accountType.permissions.list, accountType.permissions.orgEnforcements.add, accountType.permissions.orgEnforcements.remove, accountType.permissions.remove, accountType.permissions.set, activity.logs.list, advisor.recommendations.archive, advisor.recommendations.list, advisor.recommendations.unarchive, ai.connectorResources.list, analytics.ai.getAnalytics, analytics.ai.getAvailableDateRange, analytics.export, analytics.getAppsAnalytics, analytics.getAvailableDateRange, analytics.getCanvasAnalytics, analytics.getChannelAnalytics, analytics.getClipAnalytics, analytics.getHuddleAnalytics, analytics.getListAnalytics, analytics.getMemberAnalytics, analytics.getWorkflowAnalytics, analytics.slackbot.dashboard, apps.allowlist.scopesRating.configure, apps.allowlist.scopesRating.list, apps.allowlistAutomation.rules.create, apps.allowlistAutomation.rules.delete, apps.allowlistAutomation.rules.list, apps.allowlistAutomation.rules.reorder, apps.allowlistAutomation.rules.update, apps.approve, apps.approved.list, apps.bulkApprove, apps.bulkRestrict, apps.cancel, apps.certified.list, apps.clearResolution, apps.config.lookup, apps.config.set, apps.domainWideAuth.addDomain, apps.domainWideAuth.enable, apps.domainWideAuth.google.getAdminInstallUrl, apps.domainWideAuth.google.getAuthorizeUrl, apps.domainWideAuth.list, apps.getAiPrefs, apps.installed.list, apps.internal.list, apps.lookup, apps.mcp.servers.permissions.list, apps.permissions.list, apps.permissions.set, apps.productivity.getBanner, apps.productivity.list, apps.recommend.add, apps.recommend.list, apps.recommend.remove, apps.requests.bulkCancel, apps.requests.cancel, apps.requests.list, apps.restrict, apps.restricted.list, apps.search, apps.setAiPrefs, apps.teamAccess.getConfig, apps.teamAccess.grant, apps.teamAccess.revoke, apps.teamAccess.setConfig, apps.uninstall, assistant.chat, audit.anomalyResponse.allow.list, audit.anomalyResponse.allow.set, auth.policy.assignEntities, auth.policy.checkEntities, auth.policy.getEntities, auth.policy.removeEntities, barriers.create, barriers.delete, barriers.list, barriers.update, billing.settings.boot, canvases.publishTemplate, canvases.unpublishTemplate, conversations.archive, conversations.convertExternalLimited, conversations.convertToPrivate, conversations.convertToPublic, conversations.create, conversations.delete, conversations.disconnectShared, conversations.export, conversations.getConversationPrefs, conversations.getCustomRetention, conversations.getFileCountByType, conversations.getTeams, conversations.invite, conversations.kick, conversations.listOrgWide, conversations.remove, conversations.removeCustomRetention, conversations.rename, conversations.search, conversations.setConversationPrefs, conversations.setCustomRetention, conversations.setProperties, conversations.setTeams, conversations.unarchive, deprecations.getByAppId, deprecations.list, developers.list, developers.sandboxRequests.approve, developers.sandboxRequests.deny, developers.sandboxRequests.list, dlp.rules.create, dlp.rules.deactivate, dlp.rules.edit, dlp.rules.info, dlp.rules.list, dlp.rules.reactivate, dlp.systemDetectors.list, dlp.violations.archive, dlp.violations.delete, dlp.violations.info, dlp.violations.list, dlp.violations.restore, dlp.violations.unarchive, emailDomains.count, emailDomains.export, enterpriseSearch.connectors.deleteConfig, enterpriseSearch.connectors.email.setRenderDomains, enterpriseSearch.connectors.list, enterpriseSearch.connectors.setConfig, enterpriseSearch.connectors.setEnabled, enterpriseSearch.searchApps.list, enterpriseSearch.searchApps.setEnabled, features.list, features.permissions.list, files.transferOwnership, functions.list, functions.permissions.bulkSet, functions.permissions.lookup, functions.permissions.set, functions.settings.lookup, functions.settings.set, home.attritionStatus.get, home.posts.list, legalHold.entities.add, legalHold.entities.list, legalHold.entities.remove, legalHold.policies.activate, legalHold.policies.create, legalHold.policies.info, legalHold.policies.list, legalHold.policies.release, legalHold.policies.set, permissions.list, permissions.usergroups.assign, permissions.usergroups.list, permissions.usergroups.remove, permissions.users.assign, permissions.users.list, permissions.users.remove, quip.migration.approveOrgMappingRequest, quip.migration.deleteOrgMapping, quip.migration.denyOrgMappingRequest, quip.migration.getOrgMapping, quip.migration.getOrgMappings, quip.migration.tempDisableOrgMapping, roles.addMembers, roles.addUsergroups, roles.create, roles.delete, roles.edit, roles.editUsergroup, roles.entity.listAssignments, roles.getMemberAssignments, roles.getMembershipInfo, roles.list, roles.listMembers, roles.listUsergroups, roles.permissions.list, roles.removeMembers, roles.removeUsergroup, sandboxes.archive, sandboxes.delete, sandboxes.extendArchiveDate, sandboxes.list, sandboxes.processSafeSignin, sandboxes.setLimitAccess, sandboxes.unarchive, sessions.reset, settings.export, usergroups.addChannels, usergroups.addTeams, usergroups.addUsers, usergroups.create, usergroups.delete, usergroups.fetch, usergroups.listChannels, usergroups.removeChannels, usergroups.removeUsers, usergroups.update, usergroups.uploadUsers, users.conversations.counts, users.conversations.search, users.externalUsers.disconnect, users.externalUsers.removeFromAllConversations, users.removeFromAllExternalLimitedConversations, users.search, users.sendEmailToPending, users.session.info, users.session.reset, users.unsupportedVersions.export, workflows.collaborators.add, workflows.permissions.lookup, workflows.responses.export, workflows.search, workflows.triggers.types.list, workflows.triggers.types.permissions.lookup, workflows.triggers.types.permissions.set, workflows.triggers.types.permissionsWithStepRestrictions.lookup, workflows.triggers.types.permissionsWithStepRestrictions.set, workflows.unpublish
- **agents**: threads.archive, threads.pin, threads.unpin
- **ai**: agents.channelAgent.configure, agents.channelAgent.getConfiguration, alpha.agents.channels.list, alpha.agents.diveDeeper, alpha.agents.sessions.list, alpha.agents.stop, alpha.agents.threads.list, alpha.analyze.startThread, alpha.answer.previewShare, alpha.answer.share, alpha.audio.boot, alpha.audio.transcribe, alpha.audio.transcribeChunk, alpha.canvas.createContent, alpha.canvas.getTopicSuggestions, alpha.canvas.refineContent, alpha.canvas.reviseContentWithSources, alpha.digest.addToDigest, alpha.digest.info, alpha.digest.list, alpha.digest.listDigestChannelIds, alpha.digest.markComplete, alpha.digest.markUnread, alpha.digest.removeFromDigest, alpha.digest.triggerDigest, alpha.focus.summary, alpha.getChannelJoinReason, alpha.internal.feedbackDatasets, alpha.search.getNoResultsPrompts, alpha.sidekicks.create, alpha.sidekicks.delete, alpha.sidekicks.getOrCreateMemoryCanvas, alpha.sidekicks.rewritePrompt, alpha.sidekicks.testPrompt, alpha.sidekicks.update, alpha.slackbot.automationGroups.delete, alpha.slackbot.automationGroups.list, alpha.slackbot.automationGroups.setActive, alpha.slackbot.createSlackbotInitiatedThread, alpha.slackbot.skillSets.addToLibrary, alpha.slackbot.skillSets.listEnabled, alpha.slackbot.skillSets.removeFromLibrary, alpha.slackbot.skills.addToLibrary, alpha.slackbot.skills.createShareLink, alpha.slackbot.skills.getAggregateMetrics, alpha.slackbot.skills.getBuiltinInfo, alpha.slackbot.skills.listDiscoverable, alpha.slackbot.skills.listEnabled, alpha.slackbot.skills.listRecommended, alpha.slackbot.skills.listSkillEnablementDetails, alpha.slackbot.skills.previewShareLink, alpha.slackbot.skills.publishToCatalog, alpha.slackbot.skills.redeemShareLink, alpha.slackbot.skills.removeFromLibrary, alpha.slackbot.skills.revokeShareLinks, alpha.slackbot.skills.search, alpha.slackbot.skills.setAutoEnabled, alpha.slackbot.skills.setCanvasAsSkill, alpha.slackbot.skills.setDisabled, alpha.slackbot.skills.unpublishFromCatalog, alpha.slackbot.skills.unsetCanvasAsSkill, alpha.slackbot.skills.updateMetadata, alpha.slackbotNuxCarousel.addMemory, alpha.slackbotNuxCarousel.fetch, alpha.slackbotNuxCarousel.recommendations, alpha.slackiversary.fetch, alpha.summarize.agentProfile, alpha.summarize.channelUnreads, alpha.summarize.feedback, alpha.summarize.profile, alpha.summarize.profileEnabled, alpha.summarize.thread, alpha.summarize.unreadsSnapshot, alpha.surfaces.getContent, alpha.surfaces.getData, alpha.translate.fileSummary, alpha.translate.locales, alpha.translate.message, alpha.translate.promptSummary, alpha.widgets.info, channelKnowledge.disable, channelKnowledge.refresh, composer.invoke, crm.draftEmail, evaluation.requestSurveyEvaluation, feedback.request, savedPrompts.addTrigger, savedPrompts.create, savedPrompts.delete, savedPrompts.execute, savedPrompts.list, savedPrompts.update, savedPrompts.updateTrigger, workflows.steps.response
- **aiApps**: deletePhoto, editProfile, history, list, setPhoto
- **analytics**: clogData
- **api**: benchmark, features, getFlannelHttpUrl
- **apps**: actions.listForResource, actions.run, actions.v2.execute, actions.v2.list, activities.list, approvals.requests.create, auth.external.authMapping.update, auth.external.delete, auth.external.getFunctionAuth, auth.external.list, auth.external.start, auth.external.userAuths.get, certified.install, certified.list, context.changed, datasources.external.add, datasources.external.delete, datasources.external.fieldreferences.list, datasources.external.info, datasources.external.list, datasources.external.schema.info, datasources.external.schema.objects.list, datasources.external.schema.resync, datasources.external.update, home.dispatchOpenEvent, home.open, index.filters.list, index.list, index.search, limit, manifest.delete, manifest.export, manifest.update, manifest.validate, onboarding.list, permissions.internal.add, permissions.internal.addScope, permissions.internal.addUser, permissions.internal.addWildcard, permissions.internal.denyAdd, permissions.internal.info, permissions.internal.removeWildcard, permissions.internal.summary, permissions.internal.uninstallApp, permissions.internal.user, permissions.internal.userRevoke, permissions.internal.userSearch, productivity.list, profile.get, profile.lookup, recommendations.list, scopes.groupedInfo, scopes.info, team.variables.delete, team.variables.get, team.variables.set, user.connection.submit
- **assistant**: threads.branch, threads.changeContext, threads.rename, threads.startThread
- **audit**: actions, exportLogs, logs
- **auth**: emailToken, enterpriseSignout, findTeam, loginMagic, magicLogins.create, passkeys.register.begin, passkeys.register.complete, passkeys.register.list, removePendingTeam, signin, signout, test, twofactor.slackbotMessage
- **avatars**: crop, upload
- **bkb**: ai.generate
- **blocks**: actions, actionsPreview, format, suggestions, validate
- **bookmarks**: add, edit, list, preview, remove, reorder
- **bots**: info
- **calbootstrap**: contactsList
- **calendar**: alerts.ack, alerts.list, alerts.snooze, disconnect, event.copy, event.create, event.getByEventLinkId, event.info, event.list, event.listByDateRange, event.next, event.rsvp, event.setLocation, freebusy, getConnectedCalendars, getInstalledCalendars, getNotificationPrefs, meetingPrep, png, setNotificationPrefs, user.info, user.status, user.toggleOooStatusSync, user.toggleStatusSync
- **calls**: apps.list, reject, request
- **canvases**: getCannedTemplates, getEmbedToken, getTemplates, listHeaders, notificationSections
- **channelAudit**: exports.start
- **channelSections**: channels.recommend, create, deleteSection, recommend, update
- **channels**: insights, prefs.get, prefs.set, view
- **chat**: action, attachmentAction, attachmentSuggestion, avatarBackground, avatarForeground, checkpointSeparator, command, delete, deleteAttachment, deleteBulkJoinLeave, editedFileForeground, postMessage, refreshUnfurl, removeFile, removeUnfurlLink, requestBackground, requestBorder, requestBubbleBackground, requestBubbleHoverBackground, scheduleMessage, shareMessage, slashCommandBackground, slashCommandForeground, slugifyUrl, unfurlContact, unfurlLink, update
- **client**: appCommands, channels, codeChannels.getBlockKitView, codeChannels.join, counts, dms, extras, gantryBoot, getWebSocketURL, init, shouldReload, userBoot
- **codeChannels**: action, createAndStart, getDiff, getView, listSupportedApps
- **compliance**: exports.delete, exports.list, exports.listTokens, exports.reactivateTokens, exports.revokeAllTokens, exports.revokeTokens, exports.start
- **connectInvites**: list
- **connectableContacts**: lookup
- **contacts**: add
- **conversations**: acceptSharedInvite, addTab, archive, badgeCount, bulkFetchMetadata, bulkLeave, bulkReacjiTriggers, bulkRejoin, canCreateSharedInvite, canSetProperties, channelPrefixes.list, close, convertExternalLimited, convertToPrivate, convertToPublic, coreProdAIPrototype, create, createChild, createFromDmMpdm, delete, disconnectShared, disconnectSharedTeam, dms.mark, emailaddresses.create, emailaddresses.delete, emailaddresses.info, emailaddresses.update, export, findEligibleWorkspaces, genericInfo, getGeneral, getRetention, history, historyChanges, ignoreInvite, ignoreUser, info, invite, inviteShared, join, joinConnectedShared, joinContext, joinPendingShared, kick, leave, leave.recommendations, list, listPrefs, mark, meetingnotes.getLock, members, moveTab, open, pendingInvites.list, permissions.accountTypes.list, permissions.accountTypes.set, recommend, removeSharedLegacyRestriction, removeTab, rename, replies, requestSharedInvite.approve, requestSharedInvite.deny, revokeSharedInvite, revokeSharedInvitesBulk, searchLinks, setInviterJoinerProperties, setProperties, setPurpose, setRetention, setTeams, setTopic, sharedApprovals.bulkApprove, sharedApprovals.bulkDecline, sharedApprovals.list, sharedInviteAcceptanceEligibility, sharedInviteInfo, sharedInviteLinkCopied, suggestions, teamConnections, unarchive, updateDefaultState, updateTab, validateName, view
- **dataResidency**: backfillStatus, status
- **developer**: appdirectory.submissions.cancel, appdirectory.submissions.checks, appdirectory.submissions.info, appdirectory.submissions.publish, appdirectory.submissions.submit, appdirectory.submissions.update, apps.a2a.setCard, apps.actions.v2.create, apps.actions.v2.delete, apps.actions.v2.list, apps.actions.v2.save, apps.actions.v2.update, apps.appLevelTokens.create, apps.appLevelTokens.getTokenString, apps.appLevelTokens.list, apps.appLevelTokens.revoke, apps.assistant.update, apps.beta.create, apps.beta.info, apps.checkDuplicateName, apps.commands.clearToken, apps.commands.createToken, apps.commands.promoteToken, apps.config.getFunction, apps.config.listFunctions, apps.config.listInstalledScopes, apps.config.listSelectableAppCategories, apps.config.setAppIcon, apps.config.setDeveloperContactInfo, apps.config.setInstallPrefs, apps.config.setListingPageDescription, apps.config.setListingPageLinks, apps.credentials.info, apps.disableDistribution, apps.disableSocketMode, apps.enableDistribution, apps.enableSocketMode, apps.events.subscriptions.updateSubs, apps.events.subscriptions.verifyURL, apps.info, apps.mcp.add, apps.mcp.edit, apps.mcp.oauth.discover, apps.mcp.remove, apps.mcp.updateToolsSnapshot, apps.migration.convertToGranularBotApp, apps.migration.enablePkce, apps.migration.enableTokenManagement, apps.migration.tokenRotationReady, apps.migration.usersTranslate, apps.oauth.addRedirectUrls, apps.oauth.getAppStatus, apps.oauth.getTokens, apps.oauth.tokensRevoke, apps.oauth.validateRedirectUrl, apps.owners.add, apps.owners.list, apps.owners.remove, apps.ratelimits.list, apps.scope.list, apps.scope.update, apps.screenshots.delete, apps.screenshots.upload, apps.secret.regenerate, apps.securityCompliance.update, apps.suggestions.update, apps.update, apps.updateIPWhitelist
- **dialog**: get, notifyCancel, selectSuggestion, submit
- **directory**: disconnect, token.hasScopes, users.list
- **dnd**: endDnd, endSnooze, info, setSnooze, teamInfo
- **domains**: create, delete, list, verify
- **dotcom**: templates.search
- **drafts**: bulkDelete, create, delete, info, list, listActive, update
- **ekm**: backfill.info
- **email**: affiliations.info, digest, domains.create, domains.delete, domains.list, domains.updateExternalAccess, domains.verify, threads.share
- **emails**: info
- **emoji**: add, addCollection, adminList, collections.list, getInfo, remove, removeCollection, rename
- **enterprise**: adminMembersStore_makeRegular, apps.listAllTeams, apps.listTeams, apps.search, apps.searchInstallable, auth.idpconfig.apply, auth.idpconfig.list, auth.idpconfig.remove, auth.idpconfig.set, auth.idpconfig.setEma, auth.password.reset, auth.saml.authnSigningCerts.get, auth.session.set, auth.sso.get, auth.sso.rebind, auth.sso.set, auth.twofactor.disable, auth.twofactor.disableForOrgUser, auth.twofactor.enable, browserInfo, changeInfo, channels.admin.listDefault, channels.admin.removeDefault, channels.admin.removeMandatory, channels.admin.setDefault, channels.admin.setMandatory, channels.createShared, channels.listShared, channels.setShared, ekm.getClearCacheTs, ekm.setClearCacheTs, ekm.status, feature.disable, feature.enable, groups.createShared, info, migrations.add, migrations.approve, migrations.approveIntent, migrations.createIntent, migrations.decline, migrations.declineIntent, migrations.declineScheduledTime, migrations.exportInconsistencies, migrations.fetchIntents, migrations.getAvailableTimes, migrations.getDetailedStatus, migrations.getHistory, migrations.getStatus, migrations.markIntentChecklistItemComplete, mobile.versions.list, nameTaken, payments.companyGet, payments.contactsList, prefs.get, prefs.set, prefs.setAndLock, prefs.unlock, premigrations.preferences.acknowledge, premigrations.preferences.list, premigrations.users.bulkUndoEmailUpdates, premigrations.users.bulkUpdateResolution, premigrations.users.emailUpdates, premigrations.users.export, premigrations.users.info, premigrations.users.updateResolution, retention.get, security.alerts.list, setPhoto, signup.checkDomain, signup.checkPassword, signup.complete, stats.listTeams, teams.create, teams.creationrequests.create, teams.directory, teams.info, teams.join, teams.joinrequests.create, teams.leave, teams.nameValidation, teams.prefs.get, tos.admin.create, tos.admin.deactivate, tos.admin.get, usergroups.teams.add, usergroups.teams.get, usergroups.teams.remove, usergroups.teams.setProvisioning, users.admin.addUser, users.admin.bulkInviteOwners, users.admin.fetchPendingInvites, users.admin.reactivateUsers, users.admin.removeUser, users.admin.setAdmin, users.admin.setOwner, users.admin.setRegular, users.admin.setRestricted, users.admin.setStatus, users.admin.setUltraRestricted, users.profile.set
- **enterpriseSearch**: getConnectorFilters, getConnectors, getEmailConnectorStatus, getEntity, listConnectorActions, searchFilterResults
- **entities**: channels.matchEmailField, members.matchEmailField, refs.add, refs.list, refs.remove
- **experiments**: getByUser, getConfigById
- **export**: configuration.list, configuration.set, partners.list
- **externalWorkspaces**: invites.accept, invites.info, invites.revokeBulk, kick
- **feature**: usage.info
- **features**: access.policies.list, app_home.home_tab_enabled, app_home.messages_tab_enabled, app_home.messages_tab_read_only_enabled, bot_user.always_online, rich_previews.entity_types
- **feedback**: submitEnterpriseSearchFeedback, submitFeedback, submitPilotFeedback, submitSalesforceFeedback, submitSlackWrappedFeedback
- **files**: acceptPermissionRequest, canSee, canShare, canUndelete, close, collections.create, collections.delete, collections.list, collections.reorder, collections.update, completeUpload, completeUploadForFileStore, createCanvas, createExternal, createSkillCanvas, delete, disableCrossWorkspaceLinkSharing, disableRestrictedSharing, docs.create, docs.fetchAccessLevelForUsers, docs.setEditor, docs.setNonOwnerEditability, docs.unsetEditor, edit, embedWithPermissions, enableCrossWorkspaceLinkSharing, enableRestrictedSharing, external.checkPermission, external.getOrCreate, external.getProviders, external.preview, external.searchConnector, favorites.add, favorites.list, favorites.remove, generateAltText, generateProviderTokenForFileStore, generateThumbnails, getMetadata, getOverview, getProviderPreviewUrlForFileStore, getShares, getUploadURL, getUploadURLForFileStore, hasShares, ignorePermissionRequest, importFromExternalURL, info, isAccessRequestedByUser, list, markRead, open, ping, readStatus, recentlyDeleted, refresh, requestPermission, retranscribe, revokePermission, revokePublicURL, setExcludeFromSlackAi, share, sharedPublicURL, slack.com, suggestions.list, undelete, unlock, unshare, updatePermission, uploadExternal
- **folders**: create, items.add, items.remove, items.reorder, update
- **functions**: categories.steps.list, distributions.permissions.list, distributions.permissions.remove, distributions.permissions.set, get, list, shortcuts.copy, workflows.collaborators.add, workflows.collaborators.remove, workflows.create, workflows.delete, workflows.executions.confirmDelivery, workflows.executions.resume, workflows.export, workflows.findWorkflowForBotUsers, workflows.get, workflows.getIsRestricted, workflows.getLatest, workflows.import, workflows.list, workflows.permissions.copy.list, workflows.permissions.copy.set, workflows.publish, workflows.restoreFromVersion, workflows.steps.add, workflows.steps.aiFilePrecheck, workflows.steps.delete, workflows.steps.inputs.dynamicOptions.get, workflows.steps.inputs.dynamicOptions.validate, workflows.steps.list, workflows.steps.move, workflows.steps.responses.export, workflows.steps.run, workflows.steps.update, workflows.steps.variables.schema.get, workflows.unpublish, workflows.update
- **gif**: featured, search
- **google**: auth.disable, directory.groups.list
- **graphql**: resolve
- **groups**: view
- **help**: issues.ticketStats, productHelpCard.list
- **helpcenter**: getWhatsNew, postFeedback, track
- **helpdesk**: categories, get, getArticle, getSectionsAndArticlesByCategory
- **huddles**: cancelKnock, get, getIndirectHuddle, getTrackUrls, history, knock, knockResponse, listBackgrounds, readiness, recording.auditLog, recording.cancel, recording.setLanguage, recording.start, scheduled.cancel, scheduled.new, update
- **i18n**: translations.get
- **idpgroups**: list
- **im**: list, resources.ids, view
- **inprodsurveys**: get
- **insights**: messageStats, messageStats.export
- **instantSlack**: moveSession
- **lab**: features
- **links**: disconnectApps, getDomains, getInterstitialFields, getTransferPayload
- **lists**: addToList, cells.update, columns.create, columns.delete, columns.revert, columns.update, create, duplicate, edits.getLastForCell, edits.list, getApprovalReviewPending, getMyItems, getOrCreateTaskList, getThreadsForRecord, history.list, history.load, import, open, records.archive, records.count, records.create, records.delete, records.deleteMultiple, records.info, records.list, records.open, records.reorder, records.subscriptions.add, records.subscriptions.get, records.subscriptions.remove, records.updateDeletion, setupTodos, templates, update, updateApproval, updateMyItemReminder, upsertToTaskList, views.create, views.delete, views.update
- **mc**: deprecations.getByAppId, deprecations.list, enterprise.retention.get
- **media**: progress.update, reactions.add, reactions.get, reactions.remove
- **meetings**: channel.getOrCreate, list, processRecording, resolve, transcribeChunk, update, usersetdata
- **megaphone**: executeEvent, notifications.list, setNotificationAsSeen, visualizer.notifications.get, visualizer.notifications.list, visualizer.reducers.get, visualizer.reducers.list, visualizer.spaces.get, visualizer.spaces.list
- **messages**: list, sent.list
- **moderation**: flags.assignFlag, flags.comments.create, flags.comments.delete, flags.comments.set, flags.conversationReplies, flags.create, flags.dashboardDismiss, flags.dashboardModerate, flags.dismiss, flags.export, flags.getReviewers, flags.history.list, flags.info, flags.list, flags.restoreContent, flags.unassignFlag, locks.create, locks.remove, removeMessage, thread.hide
- **mpim**: list, resources.ids, view
- **oauth**: access, v2.access
- **onboarding**: fetch, updateTeam, updateUser
- **payments**: billing.addresses.get, billing.addresses.locations, billing.addresses.validateAndSet, checkout.cancelPlan, checkout.config, checkout.confirmAuthenticatedPurchase, checkout.downgradeToFree, checkout.purchase, checkout.rescue, status.get, stripe.config.get, stripe.customer.create, stripe.customer.get, stripe.paymentMethod.get, stripe.paymentMethod.list, stripe.setupIntent.create
- **pins**: add, list, remove
- **platform**: requests.create
- **polls**: create, vote
- **presence**: set
- **productui**: bulk.clone, bulk.delete, bulk.get, cms.create, cms.delete, cms.get, cms.update, static.get, ui.archive, ui.clone, ui.create, ui.delete, ui.export, ui.get, ui.publish, ui.search, ui.translate, ui.unpublish, ui.update
- **profiling**: addJSTrace, addLogging
- **promo**: campaigns.eligibilityInfo, campaigns.optOut, campaigns.redeem, codes.redeem
- **quip**: cloneCanvas, getCanvasBulkSectionIdsData, getMentions, history.getVersions, history.restoreVersion, lookupFileId, lookupThreadIds, thread.archive, thread.archiveAll, thread.mark, thread.synchronize, thread.unarchive, unfurl, updateRootComment
- **reactions**: add, get, remove
- **recordChannels**: configs.delete, configs.getObjectTypes, configs.info, configs.list, configs.set, create, digest, info, limitedAccess.set, link, objectTypes.getDefaultVisibility, objectTypes.getNamingFields, objectTypes.getRelatedLists, objectTypes.list, open, relatedConversations.list, requestAccess, unlink
- **records**: getTeamMembers, previewShare, relationships.list, share
- **reminders**: addFromMessage
- **retail**: cost, getAvailablePlans, plans
- **rooms**: appOptions.list, getLink, inviteResponse, join, notifyMember, request, sendHuddleInvite, startTranscription, stopTranscription
- **rtm**: shouldReload, start
- **salesHome**: admin.addMembers, admin.addOrg, admin.addValidatedMembers, admin.disconnectOrg, admin.exportMembers, admin.getAccessInfo, admin.getConfig, admin.getSuggestedListViews, admin.listMembers, admin.listOrgs, admin.removeMembers, admin.setConfig, admin.setDatasourceId, admin.setObjectMappings, admin.setSuggestedListViews, admin.validateEmails, auth.list, dealWinCelebrations.get, insights.get, insights.set, listViews.getAdminSuggested, notifications.formatShare, notifications.list, notifications.mutePrefs.list, notifications.mutePrefs.update, notifications.share, salesforceOrgs.getAdminConfig, salesforceOrgs.setDefault, workflows.get, workflows.list, workflows.update
- **saved**: add, bulkDelete, bulkUpdate, clearCompleted, delete, get, list, markCompleted, update
- **schemaless**: getClientLock
- **screenhero**: rooms.create, rooms.info, rooms.invite, rooms.inviteResponse, rooms.join, rooms.proxyAnalytics, rooms.proxyLogs, rooms.proxyMeetingEvents, rooms.refreshToken, rooms.rename, rooms.userEvent
- **search**: appDirectory, autocomplete, autocomplete.files, autocomplete.intentModel, autocomplete.model, autocomplete.offlineFeatures, autocomplete.tags, autocomplete.topEmoji, autocomplete.topEmojis, autocomplete.topEngagedFiles, autocomplete.triggers, delete, enterprise, feedback, inline, modules.ai, modules.channels, modules.dms, modules.external, modules.files, modules.messages, modules.people, modules.topResults, modules.workObjects, precache, save, saved.create, saved.delete, saved.list, team
- **searchQueryAudit**: exports.start
- **sessions**: checkRecent
- **sfdc**: activities.create, activities.getActionLayout, activities.getActivityTrackedObjects, activities.list, activities.update, admin.configs.get, admin.configs.set, agentforce.add, agentforce.admin.deleteMcpServers, agentforce.admin.enableMcpServer, agentforce.admin.getMcpServerDetails, agentforce.admin.listMcpServers, agentforce.admin.updateMcpServerConfig, agentforce.channelAgent.configure, agentforce.channelAgent.requestHelp, agentforce.channelAgent.tokenCount, agentforce.feedback, agentforce.getSlackbotPrefs, agentforce.list, agentforce.listGroupedScopes, agentforce.listInstalled, agentforce.provisionCka, agentforce.setSlackbotEnabled, agentforce.setSlackbotPref, approvals.getApprovalProgress, autoStarter.integration.admin.addMembers, autoStarter.integration.admin.getLicensedMembers, autoStarter.integration.admin.removeMembers, autoStarter.integration.admin.updateMemberProfile, captchaKeys.create, captchaKeys.list, checkUiApiCompatibility, datacloud.createDatacloudTeam, datacloud.deleteDatacloudTeam, datacloud.getDatacloudTeamInfo, datacloud.updateDatacloudTeam, domainVerification.activate, domainVerification.create, domainVerification.delete, domainVerification.get, domainVerification.list, eacConfigs.disconnect, eacConfigs.get, eacConfigs.init, emailToCaseConfigs.create, emailToCaseConfigs.delete, emailToCaseConfigs.get, emailToCaseConfigs.notifyCopy, emailToCaseConfigs.resendVerification, emails.composer.defaults, emails.history, emails.send, events.list, fields.create, fields.edit, fields.listEligible, fields.updateVisibility, files.download, files.upload, getContactDetails, getContactListInfo, getFrontdoorUrl, getGlobalActions, getImportObjectAvailableFields, getImportObjectCSVSample, getListViews, getListViewsV2, getObjectFields, getObjectsOfType, getOpportunity, getOwnerChangeOptions, getPicklistValuesV2, getRecordLayoutDetails, getRelatedListRecords, getRelatedLists, getReportAggregates, getReportAggregatesMetadata, integration.admin.activateOrg, integration.admin.addMembers, integration.admin.addValidatedMembers, integration.admin.checkProvisioningEligibility, integration.admin.disconnectOrg, integration.admin.exportUserMappings, integration.admin.listEligibleCkaOrgs, integration.admin.listMembers, integration.admin.listOrgs, integration.admin.previewUsers, integration.admin.requestConnection, integration.admin.syncConnectionUpdate, integration.admin.syncMemberPerms, integration.admin.updateOrgConfig, integration.admin.validateEmails, integration.auth.loginUrl, integration.authUser, integration.disconnectUser, integration.elevateMigration.complete, integration.elevateMigration.exportFailedUsers, integration.elevateMigration.start, integration.elevateMigration.startManual, integration.listOrgs, integration.setCurrentOrg, layouts.info, licenses.approval.list, licenses.approval.myRequest, licenses.approval.request, licenses.approval.review, listViews.loadPreferences, listViews.recommend, listViews.savePreferences, objects.list, orgInfo, records.changeOwner, records.create, records.delete, records.listRecent, records.performQuickAction, records.undelete, salesTracker.convertLead, salesTracker.getContent, salesTracker.getSchema, searchObjects, shareSalesTracker, startCSVImport, updateRecord, uploadCSVFile, userInfo, webToLeads.updateSettings
- **share**: prompts.add, prompts.checkAttachedSkills, prompts.info, prompts.listInvokedSkills
- **sharedInvites**: accept, canAccept, canGetLink, findTeamsEligibility, get, getLink, ignoreInvite, ignoreUser, revoke, sendDMRequest
- **sharedWorkspaces**: invites.sendByEmail
- **sidebar**: dms
- **signin**: confirmCode, findWorkspaces
- **signup**: checkSignupDomains, confirmEmail
- **slackAi**: permissions.getForUser
- **slackConnect**: domain.setPrimary
- **slackbot**: mcp.callTool, mcp.getToolResult, mcp.list, mcp.listResources, mcp.listTools, mcp.openLink, mcp.readResource, mcp.sendMessage, memories.delete, memories.import, memories.list, memories.updateSettings, precache, suggestions.list
- **slides**: addAttachment, update
- **solutions**: collaborators.add, collaborators.get, collaborators.remove, create, delete, get, getTemplates, list, update
- **stars**: add, list, remove
- **subscriptions**: thread.add, thread.clearAll, thread.get, thread.getTimestamps, thread.getView, thread.mark, thread.remove
- **subteams**: info, validateHandle, validateName
- **surveys**: submit
- **tableau**: embeds.list
- **team**: admins.list, approvedOrgs.add, approvedOrgs.remove, bmau.export, bmau.getAvailableDateRange, changeInfo, checkEmailDomains, connectedOrgs.export, connectedOrgs.get, connectedOrgs.list, counts, emailDomains.allowed.list, emailDomains.allowed.set, emailDomains.restricted.list, emailDomains.restricted.set, feature.getRequest, feature.request, info, listExternal, nav.get, newHires, paidfeatures.get, php, prefs.get, prefs.set, profile.get, slackConnectGuidelines.create, slackConnectGuidelines.get, slackConnectGuidelines.list, slackConnectGuidelines.setEnabled, slackConnectPrefs.list, slackConnectPrefs.remove, slackConnectPrefs.set, stats.export, stats.timeSeries, targetingCriteria
- **teams**: authorized.ip.range.checkIp, authorized.ip.range.list, authorized.ip.range.set, company.info, selfReportedSegmentation.create, trials.info, trials.usage
- **templates**: admins.list, integrations.get, provision
- **today**: focus, ignoreChannels, items.clear, items.delete, items.list, items.markRead, items.markUnread, items.update, unignoreChannels
- **transcripts**: feedback
- **ublockworkaround**: history
- **unfurl**: external.validateDomain
- **unread**: collapse, expand, markRead
- **userAlerts**: ack
- **usergroups**: create, disable, enable, list, membership, search, update, users.list, users.update
- **users**: admin.canAddUltraRestricted, admin.changeURAChannel, admin.createSharedInvite, admin.disable2FA, admin.fetchTeamUsers, admin.fetchTeamUsersCsv, admin.inviteBulk, admin.inviteSms, admin.profileDeidentify, admin.removeExpiration, admin.removeOwner, admin.resendInvitation, admin.sendSSOBind, admin.setAdmin, admin.setExpiration, admin.setInactive, admin.setOwner, admin.setRegular, admin.setRestricted, admin.setUltraRestricted, admin.updateSharedInvite, channelSections.channels.bulkUpdate, channelSections.channels.remove, channelSections.create, channelSections.createLink, channelSections.delete, channelSections.entities.update, channelSections.linkInfo, channelSections.list, channelSections.set, channelSections.validateShare, consent.add, consent.get, consent.remove, customStatus.deleteScheduled, customStatus.hide, customStatus.list, customStatus.schedule, deletePhoto, emailVerificationStatus.get, emailtoken.create, emailtoken.delete, emailtoken.get, getInviter, info, interactions.list, interactions.set, inviteRequests.create, invites.addToChannelBulk, invites.resend, isEarlyJoiner, length, list, listIgnoredUsers, listOutgoingInvites, markAllRead, prefs.get, prefs.set, prefs.setNotifications, preparePhoto, priority.add, priority.getRecommendations, priority.list, priority.remove, profile.get, profile.getAdminSections, profile.getExtras, profile.getSections, profile.getTrailheadRank, profile.relationships.getOrgChart, profile.set, profile.setAdminSections, profile.setSections, recommend, removeUserBlock, setPhoto, sharedInvites.list, sharedInvites.revoke, slackConnect.orgInfo, slackConnect.orgList, stateMachine, upgradeGuests.request
- **views**: close, get, submit, submitPreview
- **wmp**: components.usages.list, contentLibrary.create, contentLibrary.delete, contentLibrary.list, contentLibrary.update, documents.acquireLock, documents.create, documents.delete, documents.heartbeatLock, documents.heartbeats.list, documents.info, documents.list, documents.listTags, documents.publish, documents.releaseLock, documents.save, documents.sendTranslation, documents.unpublish, documents.update, icons.list, media.create, media.delete, media.folders.create, media.folders.list, media.folders.update, media.getFormatDensityMatrix, media.info, media.list, media.listGrouped, media.memberships.create, media.memberships.delete, media.replace, media.update, media.uploads.config, media.uploads.presign, routes.create, routes.info, routes.list, routes.update, sitemap.list, users.create, users.delete, users.info, users.list, users.update
- **workObjects**: editComment, editEntity, getComments, getEntity, postComment, publishEntity
- **workflows**: activity.export, activity.get, activity.list, ai.create, ai.feedback, ai.generate, channelOptIn.list, channelOptIn.set, createFromTemplate, featured.add, featured.remove, templates.collaborators.add, templates.collaborators.remove, templates.create, templates.delete, templates.describe, templates.get, templates.getAsDecoratedWorkflow, templates.getBuiltinTemplate, templates.list, templates.listAsDecoratedWorkflows, templates.listForUser, templates.localize, templates.setStatus, templates.update, templates.validate, triggers.auth.external.list, triggers.create, triggers.delete, triggers.info, triggers.list, triggers.listRecentlyRunForUser, triggers.permissions.list, triggers.permissions.set, triggers.prefs.get, triggers.preview, triggers.summarize, triggers.trip, triggers.types.list, triggers.update
