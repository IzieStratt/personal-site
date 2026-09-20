# `slack-datamine` build-132396 mining -- new undocumented methods (this pass)

**Source:** `3kh0/slack-datamine`, cloned read-only to scratch, build `132396` (captured 2026-09-20, committed in-repo under `build/` -- this repo mines Slack's own webpack client bundle and commits the extracted strings, so unlike the other sources this one comes with real, dated, citable build artifacts rather than a hand-written list). `build/api-methods.txt` lists 498 `namespace.method`-shaped strings extracted from the client bundle; 403 of those were not already in this project's catalog (documented + previously-known undocumented). Diffed and screened with the existence oracle (garbage token, zero real credentials -- see `README.md` methodology).

**Result of the oracle sweep:** 391 EXISTS, 12 NOT_FOUND, 0 ambiguous. Only the EXISTS set is added to this project's catalog below; NOT_FOUND names are recorded as noise (webpack strings that are not live `/api/<method>` dispatch targets -- could be client-side route/action names, retired methods, or names from a different dispatch path the oracle doesn't cover).

**Verification level for every method below: `existence-only`.** None of these were live-called with real tokens, and none had params/response shape investigated -- that would be a much larger follow-up pass. Purpose descriptions are inferred from the name alone and clearly marked as such.

## Checked and NOT_FOUND (webpack string, but not a live dispatch target)

`channels.insights`, `channels.view`, `conversations.dms.mark`, `entities.channels.matchEmailField`, `entities.members.matchEmailField`, `groups.view`, `im.view`, `mpim.view`, `rtm.shouldReload`, `screenhero.rooms.proxyAnalytics`, `screenhero.rooms.refreshToken`, `search.autocomplete.topEmoji`

## Confirmed to exist (oracle `EXISTS`), by namespace

### `activity.*`

`activity.archive`, `activity.clearAll`, `activity.clearBefore`, `activity.feed`, `activity.feed.scoreEntries`, `activity.markAllRead`, `activity.prefs.update`, `activity.unarchive`, `activity.views`, `activity.views.create`, `activity.views.delete`, `activity.views.hide`, `activity.views.unhide`, `activity.views.update`

### `admin.*`

`admin.advisor.recommendations.list`, `admin.apps.allowlist.scopesRating.configure`, `admin.apps.allowlist.scopesRating.list`, `admin.apps.allowlistAutomation.rules.create`, `admin.apps.allowlistAutomation.rules.delete`, `admin.apps.allowlistAutomation.rules.list`, `admin.apps.allowlistAutomation.rules.reorder`, `admin.apps.allowlistAutomation.rules.update`, `admin.apps.installed.list`, `admin.apps.internal.list`, `admin.apps.lookup`, `admin.apps.requests.bulkCancel`, `admin.apps.teamAccess.grant`, `admin.apps.teamAccess.revoke`, `admin.apps.updates.list`, `admin.features.list`, `admin.functions.permissions.bulkSet`, `admin.roles.delete`, `admin.roles.getMemberAssignments`, `admin.roles.listUsergroups`, `admin.workflows.triggers.types.list`

### `agents.*`

`agents.sunroof.get`, `agents.threads.archive`, `agents.threads.pin`, `agents.threads.unpin`

### `ai.*`

`ai.alpha.agents.sessions.list`, `ai.alpha.agents.threads.list`, `ai.alpha.canvas.computeDraftDiff`, `ai.alpha.digest.addToDigest`, `ai.alpha.digest.list`, `ai.alpha.digest.listDigestChannelIds`, `ai.alpha.digest.removeFromDigest`, `ai.alpha.digest.triggerDigest`, `ai.alpha.focus.summary`, `ai.alpha.search.getNoResultsPrompts`, `ai.alpha.slackbot.searchAnswerThreads.create`, `ai.alpha.slackiversary.fetch`, `ai.alpha.translate.locales`, `ai.alpha.translate.promptSummary`, `ai.composer.invoke`, `ai.crm.records.create`

### `api.*`

`api.getFlannelHttpUrl`

### `apps.*`

`apps.actions.listForResource`, `apps.actions.run`, `apps.actions.v2.list`, `apps.approvals.requests.create`, `apps.auth.external.authMapping.update`, `apps.auth.external.getFunctionAuth`, `apps.certified.install`, `apps.context.changed`, `apps.home.dispatchOpenEvent`, `apps.home.open`, `apps.index.filters.list`, `apps.profile.get`, `apps.recommendations.list`, `apps.scopes.info`, `apps.user.connection.status`, `apps.user.connection.submit`

### `assistant.*`

`assistant.threads.changeContext`, `assistant.threads.rename`

### `auth.*`

`auth.emailToken`, `auth.findTeam`, `auth.loginMagic`, `auth.magicLogins.create`, `auth.signin`

### `bookmarks.*`

`bookmarks.preview`, `bookmarks.reorder`

### `calbootstrap.*`

`calbootstrap.contactsList`

### `calendar.*`

`calendar.alerts.ack`, `calendar.alerts.list`, `calendar.alerts.snooze`, `calendar.event.create`, `calendar.event.getByEventLinkId`, `calendar.event.next`, `calendar.event.rsvp`, `calendar.event.setLocation`, `calendar.freebusy`, `calendar.meetingPrep`

### `calls.*`

`calls.request`

### `canvases.*`

`canvases.agents.list`, `canvases.drafts.get`, `canvases.getCannedTemplates`, `canvases.getTemplates`

### `channelSections.*`

`channelSections.recommend`

### `channelSuggestions.*`

`channelSuggestions.fileCollaborators.info`

### `channels.*`

`channels.prefs.get`, `channels.prefs.set`

### `chat.*`

`chat.attachmentAction`, `chat.attachmentSuggestion`, `chat.deleteAttachment`

### `client.*`

`client.appCommands`, `client.channels`, `client.codeChannels.create`, `client.codeChannels.getBlockKitView`, `client.gantryBoot`, `client.init`

### `codeChannels.*`

`codeChannels.createAndStart`, `codeChannels.getView`, `codeChannels.listSupportedApps`

### `connectInvites.*`

`connectInvites.list`

### `conversations.*`

`conversations.archive.recommendations`, `conversations.badgeCount`, `conversations.bulkArchive`, `conversations.bulkJoin`, `conversations.bulkLeave`, `conversations.bulkRejoin`, `conversations.convertToPrivate`, `conversations.convertToPublic`, `conversations.coreProdAIPrototype`, `conversations.createChild`, `conversations.createFromDmMpdm`, `conversations.delete`, `conversations.export`, `conversations.genericInfo`, `conversations.getGeneral`, `conversations.getRetention`, `conversations.historyChanges`, `conversations.ignoreInvite`, `conversations.ignoreUser`, `conversations.joinConnectedShared`, `conversations.joinPendingShared`, `conversations.leave.recommendations`, `conversations.permissions.accountTypes.list`, `conversations.permissions.accountTypes.set`, `conversations.revokeSharedInvite`, `conversations.searchLinks`, `conversations.setProperties`, `conversations.setRetention`, `conversations.suggestions`, `conversations.teamConnections`, `conversations.updateDefaultState`

### `dataResidency.*`

`dataResidency.status`

### `drafts.*`

`drafts.listActive`

### `email.*`

`email.digest`, `email.threads.share`

### `emailConnectorSelfServe.*`

`emailConnectorSelfServe.info`

### `emoji.*`

`emoji.add`, `emoji.addCollection`, `emoji.adminList`, `emoji.collections.list`, `emoji.getInfo`, `emoji.remove`, `emoji.removeCollection`, `emoji.rename`

### `enterprise.*`

`enterprise.apps.listAllTeams`, `enterprise.apps.search`, `enterprise.apps.searchInstallable`, `enterprise.channels.admin.listDefault`, `enterprise.channels.admin.removeDefault`, `enterprise.channels.admin.removeMandatory`, `enterprise.channels.admin.setDefault`, `enterprise.channels.admin.setMandatory`, `enterprise.channels.createShared`, `enterprise.groups.createShared`, `enterprise.info`, `enterprise.migrations.add`, `enterprise.migrations.fetchIntents`, `enterprise.migrations.getAvailableTimes`, `enterprise.migrations.getHistory`, `enterprise.migrations.getStatus`, `enterprise.nameTaken`, `enterprise.prefs.set`, `enterprise.prefs.setAndLock`, `enterprise.retention.get`, `enterprise.signup.checkDomain`, `enterprise.signup.checkPassword`, `enterprise.signup.complete`, `enterprise.teams.create`, `enterprise.teams.creationrequests.create`, `enterprise.teams.directory`, `enterprise.teams.info`, `enterprise.teams.join`, `enterprise.teams.joinrequests.create`, `enterprise.teams.leave`

### `entities.*`

`entities.refs.add`, `entities.refs.list`, `entities.refs.remove`

### `feedback.*`

`feedback.submitSalesforceFeedback`, `feedback.submitSlackWrappedFeedback`, `feedback.submitUserFeedback`

### `files.*`

`files.collections.delete`, `files.createExternal`, `files.docs.create`, `files.docs.setEditor`, `files.docs.setNonOwnerEditability`, `files.docs.unsetEditor`, `files.external.preview`, `files.external.searchConnector`, `files.refresh`, `files.suggestions.list`, `files.unshare`, `files.uploadExternal`

### `functions.*`

`functions.categories.steps.list`, `functions.list`, `functions.shortcuts.copy`, `functions.workflows.create`, `functions.workflows.executions.confirmDelivery`, `functions.workflows.executions.resume`, `functions.workflows.get`, `functions.workflows.list`, `functions.workflows.steps.add`, `functions.workflows.steps.inputs.dynamicOptions.validate`

### `help.*`

`help.productHelpCard.list`

### `helpcenter.*`

`helpcenter.getWhatsNew`

### `helpdesk.*`

`helpdesk.categories`, `helpdesk.get`, `helpdesk.getSectionsAndArticlesByCategory`

### `huddles.*`

`huddles.external.generate`, `huddles.external.new`, `huddles.getTrackUrls`, `huddles.scheduled.new`

### `i18n.*`

`i18n.translations.get`

### `lab.*`

`lab.features`

### `links.*`

`links.getDomains`

### `lists.*`

`lists.addToList`, `lists.edits.getLastForCell`, `lists.records.info`, `lists.records.infoBatch`, `lists.records.list`

### `megaphone.*`

`megaphone.setNotificationAsSeen`

### `messages.*`

`messages.list`, `messages.sent.list`

### `onboarding.*`

`onboarding.fetch`, `onboarding.updateUser`

### `polls.*`

`polls.create`

### `profiling.*`

`profiling.addJSTrace`

### `promo.*`

`promo.campaigns.eligibilityInfo`, `promo.campaigns.redeem`

### `quip.*`

`quip.getCanvasBulkSectionIdsData`, `quip.lookupThreadIds`, `quip.updateRootComment`

### `recordChannels.*`

`recordChannels.digest`, `recordChannels.objectTypes.list`, `recordChannels.open`, `recordChannels.relatedConversations.list`

### `records.*`

`records.share`

### `retail.*`

`retail.cost`, `retail.getAvailablePlans`, `retail.plans`

### `rooms.*`

`rooms.getLink`, `rooms.inviteResponse`, `rooms.join`, `rooms.leave`, `rooms.notifyMember`, `rooms.startTranscription`, `rooms.stopTranscription`

### `salesHome.*`

`salesHome.notifications.list`, `salesHome.salesforceOrgs.getAdminConfig`, `salesHome.salesforceOrgs.setDefault`

### `saved.*`

`saved.add`, `saved.bulkUpdate`, `saved.clearCompleted`, `saved.delete`, `saved.get`, `saved.markCompleted`, `saved.update`

### `screenhero.*`

`screenhero.rooms.info`, `screenhero.rooms.invite`, `screenhero.rooms.join`, `screenhero.rooms.proxyLogs`, `screenhero.rooms.proxyMeetingEvents`, `screenhero.rooms.rename`, `screenhero.rooms.userEvent`

### `search.*`

`search.appDirectory`, `search.autocomplete.intentModel`, `search.autocomplete.model`, `search.autocomplete.offlineFeatures`, `search.autocomplete.topEngagedFiles`, `search.autocomplete.triggers`, `search.delete`, `search.enterprise`, `search.feedback`, `search.modules.ai`, `search.modules.external`, `search.modules.topResults`, `search.modules.workObjects`, `search.team`

### `sfdc.*`

`sfdc.activities.listForUser`, `sfdc.agentforce.listInstalled`, `sfdc.approvals.getApprovalProgress`, `sfdc.fields.create`, `sfdc.fields.edit`, `sfdc.fields.listEligible`, `sfdc.fields.updateVisibility`, `sfdc.files.list`, `sfdc.getContactDetails`, `sfdc.getImportObjectAvailableFields`, `sfdc.getImportObjectCSVSample`, `sfdc.getRecordLayoutDetails`, `sfdc.getRelatedListRecords`, `sfdc.getReportAggregates`, `sfdc.getReportAggregatesMetadata`, `sfdc.integration.setCurrentOrg`, `sfdc.listViews.loadPreferences`, `sfdc.listViews.savePreferences`, `sfdc.records.delete`, `sfdc.records.listRecent`, `sfdc.records.undelete`, `sfdc.salesTracker.getContent`, `sfdc.salesTracker.getStageSettings`, `sfdc.salesTracker.updateStageSettings`, `sfdc.searchObjects`, `sfdc.shareSalesTracker`, `sfdc.startCSVImport`, `sfdc.uploadCSVFile`

### `sharedInvites.*`

`sharedInvites.canAccept`, `sharedInvites.get`, `sharedInvites.ignoreInvite`, `sharedInvites.ignoreUser`, `sharedInvites.revoke`

### `signup.*`

`signup.checkSignupDomains`

### `slackbot.*`

`slackbot.suggestions.listForDesktop`

### `solutions.*`

`solutions.create`

### `subscriptions.*`

`subscriptions.thread.add`, `subscriptions.thread.clearAll`, `subscriptions.thread.get`, `subscriptions.thread.getTimestamps`, `subscriptions.thread.getView`, `subscriptions.thread.mark`, `subscriptions.thread.remove`

### `subteams.*`

`subteams.info`

### `team.*`

`team.admins.list`, `team.checkEmailDomains`, `team.feature.getRequest`, `team.feature.request`, `team.listExternal`, `team.newHires`, `team.paidfeatures.get`, `team.prefs.set`, `team.stateMachine`, `team.targetingCriteria`

### `today.*`

`today.focus`, `today.ignoreChannels`, `today.items.blocks.dismiss`, `today.items.clear`, `today.items.delete`, `today.items.markRead`, `today.items.markUnread`, `today.items.update`, `today.unignoreChannels`

### `unread.*`

`unread.markRead`

### `usergroups.*`

`usergroups.membership`, `usergroups.search`

### `users.*`

`users.admin.inviteSms`, `users.channelSections.channels.bulkUpdate`, `users.channelSections.channels.remove`, `users.channelSections.create`, `users.channelSections.delete`, `users.channelSections.set`, `users.channelSuggestions.list`, `users.interactions.list`, `users.interactions.set`, `users.isEarlyJoiner`, `users.markAllRead`, `users.prefs.setNotifications`, `users.profile.relationships.getOrgChart`, `users.slackConnect.orgList`, `users.stateMachine`

### `views.*`

`views.close`, `views.get`, `views.submit`

### `visits.*`

`visits.list`, `visits.record`

### `workObjects.*`

`workObjects.editComment`, `workObjects.getComments`, `workObjects.postComment`

### `workflows.*`

`workflows.activity.get`, `workflows.activity.list`, `workflows.ai.create`, `workflows.ai.generate`, `workflows.templates.get`, `workflows.templates.list`, `workflows.templates.listAsDecoratedWorkflows`, `workflows.templates.listForUser`, `workflows.triggers.create`, `workflows.triggers.info`, `workflows.triggers.listRecentlyRunForUser`
