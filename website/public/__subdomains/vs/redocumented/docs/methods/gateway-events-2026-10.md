<!-- Source: Slack file F0CBSH98EP8 (GATEWAY_EVENTS.md, created 2026-10-24), fetched 2026-11-06. -->

# Slack web client — realtime ("gateway") events

Mined from the de-bundled `app.slack.com/client` JS in `slack-debundle/modules/`.
Slack has no component literally called "gateway"; the equivalent is the
**realtime websocket to the message server (MS)**, called **RTM** in the code.
Every inbound frame is JSON `{ type, subtype?, event_ts?, ...payload }`.

**Coverage:** 341 distinct inbound event types registered through the router
(`modern_vendor/4221__30LT.js`), plus `message` (documented first, with its subtypes),
plus the transport-level frames and the outbound frames below.

**Caveat on shapes:** payloads are reconstructed from how the client *reads* them
(no server schema exists in the bundle). Fields are those the client touches;
objects passed whole into a store are marked pass-through. The per-event sections
were produced by reading the handler and its direct helpers; most reducers/thunks
downstream were *not* followed, so "unverified"/"inferred" marks are meaningful.
Handler line numbers in the per-event sections are registration lines in the
named file unless stated.

## 1. Transport layer

### Socket (`modern_vendor/1609__1JlF.js`, class `SlackSocket`)
| Frame | Dir | Shape / behaviour |
|---|---|---|
| reply | in | any frame with `reply_to: number` resolves the pending send with that `id`; `ok === true` is treated as the reject branch in `handleReply` (code quirk) |
| `hello` | in | `{type:"hello", flannel?, region, self?, start?}`. Fires `onConnectCallback({useFlannel: flannel, region})`; if `start` present it resolves the start-data promise as `{self, region, ...start}`, otherwise start data is cancelled |
| `error` | in | `{type:"error", error:{...}}` → `onErrorMessageCallback(error)` → `handleErrorMessage`. Start-error codes handled: `user_removed_from_team`, `account_inactive`, `team_disabled`, `invalid_auth`, `two_factor_setup_required`, `force_reload`, `clear_cache`, `org_login_required`, `team_added_to_org`, `ratelimited`, `accesslimited`, `user_in_no_workspaces`; `started_with_org_token` is logged; anything else throws "Unknown start error" |
| everything else | in | passed to the message delegate → per-workspace queue → router |
| `ping` | out | `{type:"ping", id}` every 10 s; socket closed (code 4998) if no reply for 90 s |
| `tickle` | out | `{type:"tickle", reason, id}` ("ping the message server"), sent at most every ~19 s, fire-and-forget (no reply awaited) |

Every outbound frame gets an auto-increment `id` (starts at 16385); frames over 32768 bytes are rejected.
Close codes used locally: 4999 (default manual close), 4998 (pong timeout).

### Router / queue (`4221__30LT.js`, `4190__3avk.js`)
- Registrars: `addRtmHandler(type, fn(msg, dispatch, getState))` (per message), `addBatchRtmHandler(type, fn(msgs, dispatch, getState))`, `addSharedRtmHandler(type, fn(msgs, teamOrEnterpriseId))`. Duplicate registration throws.
- Queue per workspace/enterprise. Consecutive messages with the same `type`+`subtype` are batched (adaptive batch size 1–100). Event types in the "interleavable" set can be hopped over while batching: `accounts_changed, benchmark, bot_changed, channel_changed, channel_marked, client_logs_request, commands_changed, desktop_notification, draft_create, email_domain_changed, file_change, file_created, file_public, file_shared, file_unshared, group_marked, im_marked, manual_presence_change, mpim_marked, team_rename, user_change, user_invalidated, user_typing`.
- Frames with `_from_evt_log` were replayed from `eventlog.history` after a reconnect/resync; frames with `event_ts` advance the last-seen timestamp (not for replays).
- Before dispatch, `message` frames are preprocessed (30 s cap): ensures the channel model exists (`channel` string id), fetches member counts when text has mention patterns, and opens the conversation if needed.
- Unregistered types are silently dropped. Degraded mode can call handlers directly (`handleMessageImmediatelyWithoutPreprocessing`).

### Outbound frames (client → MS)
| `type` | Shape | Purpose |
|---|---|---|
| `presence_sub` | `{ids: string[]}` | subscribe to presence for these user ids (refcounted per member; re-sent on change, throttled 100 ms) |
| `subscription_update` | `{subtype, ids: string[]}`; subtypes `user_change_subscribe_request`, `user_change_unsubscribe_request`, `dnd_invalidated_subscribe_request`, `dnd_invalidated_unsubscribe_request` | subscribe to `user_change` / `dnd_invalidated` pushes for specific users (max ids per call enforced client side) |
| `flannel` | `{subtype: <method>, ...args}` | request to the Flannel cache service over the socket (args must not contain `type`/`subtype`); also available over HTTP |
| `temp_channel_sub` / `temp_channel_unsub` | `{channel_id}` | temporary subscription to a channel/file/canvas topic (used for awareness & file/canvas live updates) |
| `awareness` | `{channel, user, subtype: "query"\|"broadcast"\|"close", awareness_state?}` | collaborative presence on a topic; mirrored by the inbound `awareness` event |
| `document_change` | `{user, channel, payload: base64 string}` | canvas/doc collaborative edit update (binary op encoded with `btoa`); mirrored by inbound `document_change` / `document_update` |

## 2. `message` and its subtypes

- **Registrar:** shared (`addSharedRtmHandler`) → `messageReceived(msgs, dispatch, getState)`; also consumed in `modern_vendor` preprocessing.
- **Batching key is `type`+`subtype`**, so a batch is homogeneous; the first element's `subtype` picks the branch.
- **Base payload:** `{type:"message", subtype?, channel: string, ts: string, user?: string, text?: string, thread_ts?: string, client_msg_id?: string, files?: (string|{id})[], attachments?: any[], event_ts?: string, bot_id?, ai_context?: {uses_remaining?: number, result_status?: "streaming"|"complete", follow_up_suggestion?: string}, streaming_state?: string, ...}` (a full message object; unspecified fields are passed through to the message store).
- **Default path for all subtypes** (`messageReceivedDefault` + loop): reconciles with pending local sends via `client_msg_id` (undo-send deletion, placeholder file-id check), upserts message, upserts thread/agent-thread data when the channel is an agent conversation, tracks huddle-notes autostart, triggers desktop notification, activity-feed entries (`at_user`, `dm`, `internal_channel_invite`), "new message" toast, thread unread marks, unfurl/AI streaming bookkeeping.

Subtypes the client switches on (non-exhaustive: other subtypes are rendered but get only the default path):

| subtype | Extra payload read | Effect |
|---|---|---|
| `message_changed` | `channel`, `message` (new full message, needs `ts`), `previous_message?`, `event_ts`, `_from_evt_log` | upserts edited message; drops stale local state if message became hidden/unmentioned; AI-streaming transitions (`ai_context.result_status`, `follow_up_suggestion`), unfurl diffing, DLP rescans, Slackbot handoff navigation (`handoff_thread_ts=…`, `handoff_channel=…` in text) |
| `message_deleted` | `deleted_ts`, `channel`, `previous_message?`, `event_ts`, `_from_evt_log` | removes message + thread data, updates last-message state |
| `message_replied` | `channel`, `message` (parent with `ts`, `latest_reply?`, `replies?: {ts}[]`), `event_ts` | upserts the parent thread message; ignores event if older than local `latest_reply` |
| `message_locked` | `channel`, `thread_ts`, `is_locked: boolean`, `locked_by_team_id?` | marks thread locked/unlocked |
| `thread_broadcast` | message | default path only |
| `channel_history_changed` / `group_…` / `im_…` / `mpim_…` | – | ignored here (handled by the same-named top-level events) |
| `channel_purpose` / `group_purpose` | `channel`, `user`, `ts`, `purpose` | updates channel purpose `{creator, last_set, value}` |
| `channel_topic` / `group_topic` | `channel`, `user`, `ts`, `topic` | updates channel topic |
| `document_mention` | `user`, `channel`, `ts`, `document_mention:{file_id, mentioning_user_ids[], section_id}` | activity-feed `at_user` entry + canvas mention state |
| `channel_canvas_updated` | `channel`, `ts`, `canvas_update_user_ids: string[]` | marks channel canvas updated for current user |
| `tabbed_canvas_updated` | same | marks canvas tab updated |
| `channel_tab_added` | `channel`, `ts`, `tab_added_user_id` | marks channel dirty when added by self |
| `folder_item_added` | `channel`, `ts`, `item_added_user_id` | same |
| `channel_join` | `channel`, `ts`, `user`, `inviter?`, `thread_ts?` | internal_channel_invite feed entry |
| `prejoin_dm_welcome_party_notification` | `channel`, `ts` | `dm` feed entry |
| `automatic_ai_huddle_notes_enabled` / `_disabled` | `user`, `channel` | records huddle-notes autostart change |
| other subtypes the client special-cases elsewhere | – | `bot_message`, `pinned_item`, `unpinned_item`, `sh_room_created`, `sh_room_shared`, `huddle_thread`, `huddle_message`, `scheduled_huddle_message`, `scheduled_huddle_canceled`, `huddle_notes_started`, `tombstone`, `file_comment`, `file_share`, `reply_broadcast`, `assistant_app_thread`, `assistant_app_initial_thread`, `slackbot_response`, `app_conversation_join`, `group_join`, `joiner_notification_for_inviter`, `mpdm_move`, `list_record_comment`, `list_edit`, `document_comment_root`, `surface_card_comment`, `canvas_sharing_message`, `slack_assistant_progress`, `agent_view_added`, `ms_oauth_completed`, `retention`, `dashboard`, `poll`, `digest`, `bookmark_created`, `bookmark_removed`, `copy_link`, `click_link_in_canvas` (rendering/analytics logic keyed on subtype) |

---

# 3. Per-event reference (all 340 other registered events)

### `agentforce_agent_status_updated`
- **Registrar:** single
- **Handler:** `(anonymous arrow)` (modules/eager/application/0620__HVn0.js:35541)
- **Purpose:** An Agentforce agent app changed availability/status or description. Client dispatches two status-updating actions (Tm.vg, Tp.Fk) and, if a description is present, an assistant-description update (Tp.Ms).
- **Payload:**
  ```ts
  {
    type: "agentforce_agent_status_updated";
    app_id?: string;                 // agent app id; required for any action
    status?: string;                 // agent status (required with app_id for status actions)
    is_available?: boolean;          // passed through as isAvailable (inferred)
    assistant_description?: string;  // dispatches description update if present
  }
  ```
- **Notes:** Status actions need app_id and status both truthy; description action needs app_id and assistant_description.

### `agentforce_access_cache_stale`
- **Registrar:** single
- **Handler:** `(anonymous arrow)` (modules/eager/application/0620__HVn0.js:35567)
- **Purpose:** Tells the client the set of Agentforce agents the user can access. Client stores the list and derives `userHasAgentforceAccess = list.length > 0`.
- **Payload:**
  ```ts
  {
    type: "agentforce_access_cache_stale";
    accessible_agent_app_ids?: string[]; // defaults to []
  }
  ```

### `app_actions_updated`
- **Registrar:** single
- **Handler:** `appActionsUpdated` (modules/eager/application/0620__HVn0.js:35584)
- **Purpose:** An app's global actions/shortcuts changed. Client updates global actions state (and removes app on uninstall); otherwise triggers a refetch for the current team.
- **Payload:**
  ```ts
  {
    type: "app_actions_updated";
    app_id: string;          // ignored entirely if missing
    is_uninstall?: boolean;  // true -> remove app's actions; false -> refetch (Th.k6 with team id)
  }
  ```

### `dialog_opened`
- **Registrar:** single
- **Handler:** `(anonymous arrow)` (modules/eager/application/0620__HVn0.js:36812)
- **Purpose:** Server asks the client to open a legacy app dialog (after a slash command / interactive component trigger). Client verifies the `client_token` belongs to a pending local trigger and is fresh, then opens a modal dialog element.
- **Payload:**
  ```ts
  {
    type: "dialog_opened";
    app_id: string;
    client_token: string;         // matched against locally-registered pending triggers (Ty.A.check); embeds a timestamp (getTimeDelta)
    dialog_id: string;
    dialog_title: string;
    dialog_submit_label: string;
    timeout_range: number;        // max allowed age of the token; ignored if delta >= timeout_range
  }
  ```
- **Notes:** Ignored if token not found in local state. Tracks APP_DIALOG_OPEN_ATTEMPTED analytics. Calls token's onDialogOpen callback.

### `app_dwa_enablement_callback_error`
- **Registrar:** single
- **Handler:** `handleAppDwaEnablementCallbackError` (modules/eager/application/0620__HVn0.js:36849)
- **Purpose:** The app's DWA (dynamic workflow/auth) enablement callback failed. Client marks the app as signed out with `callbackError: true`.
- **Payload:**
  ```ts
  {
    type: "app_dwa_enablement_callback_error";
    app_id: string; // only acted on if T9.IM(app_id) resolves truthy (app known to DWA enablement state)
  }
  ```

### `app_dwa_enablement_status_changed`
- **Registrar:** single
- **Handler:** `handleAppDwaEnablementStatusChanged` (modules/eager/application/0620__HVn0.js:36863)
- **Purpose:** DWA enablement status for an app changed. Client updates the status and, when the status is terminal-success per T9.yE, dispatches a follow-up (Ie.l_) with the app's name (likely a toast).
- **Payload:**
  ```ts
  {
    type: "app_dwa_enablement_status_changed";
    app_id: string;
    status: string; // enablement status enum (values not resolved); T9.yE(status) decides whether to notify
  }
  ```
- **Notes:** The app name is looked up from existing store data by app_id, not from the payload.

### `app_wildcard_added`
- **Registrar:** single
- **Handler:** `updateMembershipAndCountsAfterAppWildcardChange` (modules/eager/application/0620__HVn0.js:37641)
- **Purpose:** An app user was granted the wildcard (all-channels) permission. Client refreshes the app user, adjusts the primary channel's app count (+1 if wasn't a member), and updates the service's wildcardEnabled flag.
- **Payload:**
  ```ts
  {
    type: "app_wildcard_added"; // compared with "app_wildcard_added" to derive wildcardEnabled = true
    app_user: string;           // app's bot/user id (U...); ignored if missing
  }
  ```
- **Notes:** Shares handler with `app_wildcard_removed`. Requires a current team id.

### `app_wildcard_removed`
- **Registrar:** single
- **Handler:** `updateMembershipAndCountsAfterAppWildcardChange` (modules/eager/application/0620__HVn0.js:37642)
- **Purpose:** The wildcard permission of an app user was revoked. Same handler: refreshes app user, decrements the channel's app count where applicable, sets wildcardEnabled = false.
- **Payload:**
  ```ts
  {
    type: "app_wildcard_removed"; // anything != "app_wildcard_added" -> wildcardEnabled=false
    app_user: string;
  }
  ```
- **Notes:** Shared handler with `app_wildcard_added`; the only difference is the `type` comparison.

### `app_permission_request`
- **Registrar:** single
- **Handler:** `startAppPermissionRequest` (modules/eager/application/0620__HVn0.js:37646)
- **Purpose:** An app requests additional scopes/permissions; client opens a permission-request modal if the token matches a local trigger and is not expired.
- **Payload:**
  ```ts
  {
    type: "app_permission_request";
    app_user: string;       // app user id
    client_token: string;   // verified via Ty.A.check, timestamp via getTimeDelta
    scope_info: object;     // scope info passed whole to the modal component (shape not inspected)
    timeout_range: number;  // ignored if token age >= this
    trigger_id: string;
  }
  ```
- **Notes:** All fields required (early return if any falsy). Shares handler with `app_permission_user_request`; here `isUserRequest` = false.

### `app_permission_user_request`
- **Registrar:** single
- **Handler:** `startAppPermissionRequest` (modules/eager/application/0620__HVn0.js:37647)
- **Purpose:** Same as `app_permission_request` but for user-scope permission; the modal is opened with `isUserRequest: true`.
- **Payload:**
  ```ts
  {
    type: "app_permission_user_request"; // === IW -> isUserRequest
    app_user: string;
    client_token: string;
    scope_info: object; // passed whole to modal
    timeout_range: number;
    trigger_id: string;
  }
  ```
- **Notes:** Shared handler; `hasChannelScopes` is always false.

### `app_conversation_invite_request`
- **Registrar:** single
- **Handler:** `startAppChannelInviteRequest` (modules/eager/application/0620__HVn0.js:37648)
- **Purpose:** An app asks to be invited to a conversation. Client (after validating token freshness) dispatches an invite-request flow (Il.A) with referring event MSG_LINK_CLICKED.
- **Payload:**
  ```ts
  {
    type: "app_conversation_invite_request";
    app_user: string;
    channel_id: string;
    client_token: string;       // validated via Ty.A.check
    invite_message_ts?: string; // message ts of the invite message (not required by guard)
    scope_info: object;         // passed through
    timeout_range: number;
  }
  ```

### `view_opened`
- **Registrar:** single
- **Handler:** `viewOpened` (modules/eager/application/0620__HVn0.js:37763)
- **Purpose:** A Block Kit view was opened/pushed by an app. For modals it validates the client token and freshness, shows the app-view modal (or stacks it); for home views it records the home view for the channel. The view is stored via the normalized-view reducer.
- **Payload:**
  ```ts
  {
    type: "view_opened";
    view?: object;           // full view object (has callback_id, type...), normalized by nT.A and stored (IQ.A)
    view_id: string;
    view_type: "modal" | "app_notification_subscription_configuration" | "home" | string; // ny.cs enum
    previous_view_id?: string; // if set, this is a push onto an existing stack
    client_token?: string;     // required for modal types (else ignored)
    timeout_range?: number;
    title?: object;           // modal title (passed to modal opener)
    submit?: object;          // submit button (passed through)
    close?: object;           // close button (passed through)
    app_id?: string;
    channel_id?: string;      // used for "home" views
    trace_id?: string;
  }
  ```
- **Notes:** For modals, ignored unless token matches local trigger (except special "search_and_ai_feedback:submit" callback id); also ignored when a gating predicate (Iz.A) is on. Tracks APPVIEW_RECEIVED/OPENED/STACKED.

### `view_updated`
- **Registrar:** single
- **Handler:** `viewUpdated` (modules/eager/application/0620__HVn0.js:37764)
- **Purpose:** An existing Block Kit view was updated by the app. Client marks the view's object as stale (refetch) and stores the new view.
- **Payload:**
  ```ts
  {
    type: "view_updated";
    view_id?: string;
    app_id?: string;
    view?: object; // full view object (view.type read for analytics), normalized and stored
  }
  ```

### `approval_response_requested`
- **Registrar:** single
- **Handler:** `handleApprovalNotification` (modules/eager/application/0620__HVn0.js:37813)
- **Purpose:** A Salesforce approval needs the user's response. If approvals are enabled and notifications are not suppressed (presence/DND), shows an approval desktop notification.
- **Payload:**
  ```ts
  {
    type: "approval_response_requested";
    reference: {
      sfdcRecord: { id: string; /* ... */ }; // passed to guards I0.sc/Vr/iB; shape otherwise unverified
      // other fields not resolved
    };
    user_id: string; // passed as userId to the notification action
  }
  ```
- **Notes:** Shared handler with `approval_response_reviewed`; isRequest = true here. Gated on approvals experiment (tN.ci).

### `approval_response_reviewed`
- **Registrar:** single
- **Handler:** `handleApprovalNotification` (modules/eager/application/0620__HVn0.js:37814)
- **Purpose:** An approval the user submitted was reviewed (approved/rejected). Same handler creates a notification with `isRequest: false`.
- **Payload:**
  ```ts
  {
    type: "approval_response_reviewed";
    reference: { sfdcRecord: { id: string; /* ... */ } }; // same as above
    user_id: string;
  }
  ```
- **Notes:** Shared handler; only differs by `type === "approval_response_requested"` check.

### `apps_installed`
- **Registrar:** shared
- **Handler:** `sharedUpsertAppFromImsg` (modules/eager/application/0620__HVn0.js:37851)
- **Purpose:** One or more apps were installed. Client upserts the app (or refetches by id when a flag predicate I6.T is on), marks the object stale when `apps_connection_status` pref is "on", and sets the home tab flag.
- **Payload:**
  ```ts
  {
    type: "apps_installed";
    app: {
      id: string;
      home_tab_enabled?: boolean; // if boolean, dispatches home-tab-enabled action
      // ...full app object, upserted with is_installed: true
    };
  }
  ```
- **Notes:** Handler receives an array of messages plus teamOrEnterpriseId. Shared with `apps_changed`.

### `apps_changed`
- **Registrar:** shared
- **Handler:** `sharedUpsertAppFromImsg` (modules/eager/application/0620__HVn0.js:37852)
- **Purpose:** An installed app's metadata changed; same upsert path as `apps_installed`.
- **Payload:**
  ```ts
  {
    type: "apps_changed";
    app: { id: string; home_tab_enabled?: boolean; /* full app object */ };
  }
  ```
- **Notes:** Identical handler to `apps_installed` (note it also sets is_installed: true on upsert).

### `apps_uninstalled`
- **Registrar:** shared
- **Handler:** `sharedAppUninstalled` (modules/eager/application/0620__HVn0.js:37853)
- **Purpose:** Apps were uninstalled. Client removes the app (Tp.oN) and dispatches a second cleanup action (I3.A) per message.
- **Payload:**
  ```ts
  {
    type: "apps_uninstalled";
    app_id: string;
  }
  ```

### `benchmark`
- **Registrar:** single
- **Handler:** `benchmark` (modules/eager/application/0620__HVn0.js:37929)
- **Purpose:** Server-driven load-test/diagnostic command. For "Sonic" methods (fast_disco, fetch_auth, reload, slow_disco, fast_failover, slow_failover, min_version, cancel_min_version, ...) it runs a websocket/reload benchmark; otherwise echoes an `api.benchmark` API call.
- **Payload:**
  ```ts
  {
    type: "benchmark";
    m: string;      // method name; if in Nn list -> sonicBenchmark
    pct: number;    // percentage gate; passed to sampling predicate I9.A
    sub: number;    // sub-percentage gate (I9.A)
    lt?: unknown;   // loadtest flag, forwarded as `lt`
    a?: unknown;    // args, forwarded as `a`
    id?: string;    // run id; sonic runs dedupe via sessionStorage `sonic_benchmarks_<id>`
  }
  ```
- **Notes:** Sonic path only for the specific workspace / unfocused tab per code; the exact Nn list is partially unseen (list continues past min_version/cancel_min_version).

### `bookmark_added`
- **Registrar:** single
- **Handler:** `handleBookmarkAdded` (modules/eager/application/0620__HVn0.js:37987)
- **Purpose:** A channel bookmark was added; client upserts it in the bookmarks store.
- **Payload:**
  ```ts
  {
    type: "bookmark_added";
    bookmark: string;                  // bookmark id (-> id)
    channel: string;                   // channel id
    image_url?: string;                // -> iconUrl
    emoji?: string;
    link?: string;                     // -> url
    title?: string;
    entity_id?: string;
    rank?: string;
    date_create?: number;
    date_update?: number;
    bookmark_type?: string;            // -> type (e.g. "link")
    parent_id?: string;
    last_updated_by_user_id?: string;
    last_updated_by_team_id?: string;
    app_id?: string;
    app_action_id?: string;
    shortcut_id?: string;
    quip_section_id?: string;
  }
  ```

### `bookmark_removed`
- **Registrar:** single
- **Handler:** `handleBookmarkRemoved` (modules/eager/application/0620__HVn0.js:37988)
- **Purpose:** A bookmark was deleted; client looks it up in state and removes it.
- **Payload:**
  ```ts
  {
    type: "bookmark_removed";
    channel: string;   // channel id
    bookmark: string;  // bookmark id
  }
  ```

### `bookmark_updated`
- **Registrar:** single
- **Handler:** `handleBookmarkUpdated` (modules/eager/application/0620__HVn0.js:37989)
- **Purpose:** A bookmark was edited; client applies update via the same extraction as `bookmark_added`.
- **Payload:** same fields as `bookmark_added`:
  ```ts
  {
    type: "bookmark_updated";
    bookmark: string; channel: string;
    image_url?: string; emoji?: string; link?: string; title?: string;
    entity_id?: string; rank?: string; date_create?: number; date_update?: number;
    bookmark_type?: string; parent_id?: string;
    last_updated_by_user_id?: string; last_updated_by_team_id?: string;
    app_id?: string; app_action_id?: string; shortcut_id?: string; quip_section_id?: string;
  }
  ```

### `bot_changed`
- **Registrar:** single
- **Handler:** `botChanged` (modules/eager/application/0620__HVn0.js:38004)
- **Purpose:** A bot's profile changed. Client upserts the bot and invalidates/refetches app info (by app_id when the I6.T flag is on, else by bot id).
- **Payload:**
  ```ts
  {
    type: "bot_changed";
    bot: { id: string; app_id?: string; /* full bot object, stored via No.s */ };
  }
  ```

### `bot_added`
- **Registrar:** shared
- **Handler:** `sharedBotUpserted` (modules/eager/application/0620__HVn0.js:38005)
- **Purpose:** New bot(s); client upserts bots for the team/enterprise store.
- **Payload:**
  ```ts
  {
    type: "bot_added";
    bot: object; // full bot object, passed through to the bots reducer
  }
  ```

### `draft_create`
- **Registrar:** single
- **Handler:** `handleDraftCreate` (modules/eager/application/0620__HVn0.js:38192)
- **Purpose:** A draft was created on another client. Client adds it to local drafts unless the event was caused by a local change.
- **Payload:**
  ```ts
  {
    type: "draft_create";
    draft: object; // full draft object (id, client_msg_id, destinations, file_ids, ...); ignored if empty; passed as fetchedDraft
  }
  ```
- **Notes:** Skipped if the draft's client id is a known local change (NY.eh).

### `draft_delete`
- **Registrar:** single
- **Handler:** `handleDraftDelete` (modules/eager/application/0620__HVn0.js:38193)
- **Purpose:** A draft was deleted elsewhere; client removes it locally (and any sent-draft tracking).
- **Payload:**
  ```ts
  {
    type: "draft_delete";
    draft_id: string;        // server draft id
    client_msg_id?: string;  // used to clear local pending-draft record
  }
  ```
- **Notes:** Shared handler with `draft_send`.

### `draft_update`
- **Registrar:** single
- **Handler:** `handleDraftUpdate` (modules/eager/application/0620__HVn0.js:38194)
- **Purpose:** A draft was updated elsewhere; client applies the fetched draft to the matching local draft unless the change originated locally.
- **Payload:**
  ```ts
  {
    type: "draft_update";
    draft: object; // full draft object; ignored if empty
  }
  ```

### `draft_send`
- **Registrar:** single
- **Handler:** `handleDraftDelete` (modules/eager/application/0620__HVn0.js:38195)
- **Purpose:** A draft was sent as a message (on another client); same handling as `draft_delete`.
- **Payload:**
  ```ts
  {
    type: "draft_send";
    draft_id: string;
    client_msg_id?: string;
  }
  ```
- **Notes:** Shares handler with `draft_delete`.

### `file_created`
- **Registrar:** batch
- **Handler:** `filesCreated` (modules/eager/application/0620__HVn0.js:38780)
- **Purpose:** Files were created; client fetches the file info for each unique id (N3.D1) and does an extra call (NO.hC) for the first.
- **Payload:**
  ```ts
  {
    type: "file_created";
    file_id: string;
  }
  ```

### `file_public`
- **Registrar:** batch
- **Handler:** `filesChanged` (modules/eager/application/0620__HVn0.js:38781)
- **Purpose:** A file was made public; client refreshes (invalidates/refetches) file info, plus handles membership changes and AI alt-text status.
- **Payload:**
  ```ts
  {
    type: "file_public";
    file_id: string;                // if any msg lacks it the whole batch is aborted
    event_ts?: string;              // used by the cuddles-button heuristic
    membership_change?: boolean;    // if true also refresh canvas channel (dP.p(file_id))
    ai_alt_text?: { status: string; reason?: string }; // "success" triggers a refetch
  }
  ```
- **Notes:** Shared handler `filesChanged` also used by `file_change`, `file_unshared` (plus extra), `file_enable_link_sharing`.

### `file_change`
- **Registrar:** batch
- **Handler:** `filesChanged` (modules/eager/application/0620__HVn0.js:38782)
- **Purpose:** A file's metadata/content changed; client refreshes it.
- **Payload:** same as `file_public`:
  ```ts
  {
    type: "file_change";
    file_id: string;
    event_ts?: string;
    membership_change?: boolean;
    ai_alt_text?: { status: string; reason?: string };
  }
  ```

### `file_shared`
- **Registrar:** batch
- **Handler:** `filesShared` (modules/eager/application/0620__HVn0.js:38783)
- **Purpose:** A file was shared into a conversation; client refreshes file info, and related caches (NQ.D1, N4.D1), removes Quip thread ids for canvases/docs, and clears processing state (NX.ye).
- **Payload:**
  ```ts
  {
    type: "file_shared";
    file_id: string; // only file_id is read (messages without it are skipped)
  }
  ```

### `file_unshared`
- **Registrar:** batch
- **Handler:** `filesUnshared` (modules/eager/application/0620__HVn0.js:38784)
- **Purpose:** A file was unshared from a conversation. Runs `filesChanged` then invalidates an additional cache (N4.D1) for the files.
- **Payload:**
  ```ts
  {
    type: "file_unshared";
    file_id: string;
    event_ts?: string;
    membership_change?: boolean;
    ai_alt_text?: { status: string; reason?: string };
  }
  ```

### `file_permissions_removed`
- **Registrar:** batch
- **Handler:** `filesPermissionsRevoked` (modules/eager/application/0620__HVn0.js:38785)
- **Purpose:** Access to a file was revoked for an entity (user/channel). Client drops cached file data, recomputes who can still view the doc (removing viewers), removes grants, refetches files, closes UI if the file is gone, and cleans Quip mentions if the current user is affected.
- **Payload:**
  ```ts
  {
    type: "file_permissions_removed";
    file_id: string;
    entity_id: string;      // user (rj.A) or channel (tQ.A) id
    entity_type: string;    // mapped via N6.W (e.g. user/channel/...), unknown -> skipped
  }
  ```
- **Notes:** Shares handler with `file_disable_link_sharing`; grant removal only occurs when `msg.type === "file_permissions_removed"`.

### `file_deleted`
- **Registrar:** batch
- **Handler:** `filesDeleted` (modules/eager/application/0620__HVn0.js:38786)
- **Purpose:** Files were deleted. Client removes them from stores, drafts (file_ids), lists, mentions, custom sections.
- **Payload:**
  ```ts
  {
    type: "file_deleted";
    file_id?: string;
    file_ids?: string[]; // preferred when present (file_ids ?? [file_id])
  }
  ```
- **Notes:** Extra work gated on `dlp_async_file_processing`, `file_trash_updates`, `custom_file_sections` flags.

### `file_processing_failed`
- **Registrar:** batch
- **Handler:** `filesProcessingFailed` (modules/eager/application/0620__HVn0.js:38787)
- **Purpose:** File processing failed. If the first message's reason is MalwareDetected, shows a malware error modal and removes the file ids from drafts.
- **Payload:**
  ```ts
  {
    type: "file_processing_failed";
    file_id?: string;
    file_ids?: string[];
    reason: string; // compared against NF.R.MalwareDetected (only the first msg's reason is checked)
  }
  ```

### `file_opened`
- **Registrar:** batch
- **Handler:** `fileOpened` (modules/eager/application/0620__HVn0.js:38788)
- **Purpose:** A viewer opened a canvas/doc. Client records presence; for others adds the viewer, for the current user updates last-read and clears mention badges.
- **Payload:**
  ```ts
  {
    type: "file_opened";
    event_ts: string;                  // converted to ms for lastRead
    file: { id: string };
    viewer: { user_id: string };
  }
  ```
- **Notes:** Ignored when the gating predicate mE.A() is false (likely not-a-sonic/enabled client).

### `file_closed`
- **Registrar:** batch
- **Handler:** `fileClosed` (modules/eager/application/0620__HVn0.js:38789)
- **Purpose:** A viewer closed a canvas/doc; client removes presence and clears badge for self.
- **Payload:**
  ```ts
  {
    type: "file_closed";
    file: { id: string };
    viewer: { user_id: string };
  }
  ```

### `file_enable_link_sharing`
- **Registrar:** batch
- **Handler:** `filesChanged` (modules/eager/application/0620__HVn0.js:38790)
- **Purpose:** Link sharing enabled on a file; client refreshes file info.
- **Payload:**
  ```ts
  {
    type: "file_enable_link_sharing";
    file_id: string;
    event_ts?: string;
    membership_change?: boolean;
    ai_alt_text?: { status: string; reason?: string };
  }
  ```

### `file_disable_link_sharing`
- **Registrar:** batch
- **Handler:** `filesPermissionsRevoked` (modules/eager/application/0620__HVn0.js:38791)
- **Purpose:** Link sharing disabled; processed via the same revocation path (drops cached data, updates viewers, refetches).
- **Payload:**
  ```ts
  {
    type: "file_disable_link_sharing";
    file_id: string;
    entity_id?: string;
    entity_type?: string;
  }
  ```
- **Notes:** Shared handler with `file_permissions_removed`; per-entity grant removal is skipped (it requires msg.type === "file_permissions_removed"), so only the cache/viewer refresh happens.

### `file_comment_deleted`
- **Registrar:** single
- **Handler:** `fileCommentDeleted` (modules/eager/application/0620__HVn0.js:38792)
- **Purpose:** A comment on a file was deleted; client removes it if it exists locally.
- **Payload:**
  ```ts
  {
    type: "file_comment_deleted";
    file_id: string;
    comment: string; // comment id
  }
  ```

### `document_change`
- **Registrar:** shared
- **Handler:** `documentChanged` via `fanOutSharedEvent` (modules/eager/application/0620__HVn0.js:38793)
- **Purpose:** Transient realtime document (canvas/Quip) event. Client resolves the file's Quip thread id and fans it out to all workspaces in the org via `onReceiveDocumentEvent(threadId, payload, "transient")`.
- **Payload:**
  ```ts
  {
    type: "document_change";
    channel: string;   // actually the file id of the document
    payload?: string;  // opaque document event payload, default ""
  }
  ```

### `document_update`
- **Registrar:** shared
- **Handler:** `documentUpdated` via `fanOutSharedEvent` (modules/eager/application/0620__HVn0.js:38794)
- **Purpose:** Persistent document update. Same fan-out with kind "update".
- **Payload:**
  ```ts
  {
    type: "document_update";
    file_id: string;
    payload?: string; // opaque, default ""
  }
  ```

### `file_channel_canvas_reset`
- **Registrar:** single
- **Handler:** `fileChanged` (modules/eager/application/0620__HVn0.js:38795)
- **Purpose:** A channel canvas was reset; client refreshes the file (and its channel entry on membership change).
- **Payload:**
  ```ts
  {
    type: "file_channel_canvas_reset";
    file_id: string;
    membership_change?: boolean;
  }
  ```

### `file_permissions_added`
- **Registrar:** batch
- **Handler:** `filePermissionsAdded` (modules/eager/application/0620__HVn0.js:38796)
- **Purpose:** Permission grants were added on files; client stores the grant (entity, access level) per file.
- **Payload:**
  ```ts
  {
    type: "file_permissions_added";
    file_id: string;
    entity_id: string;     // user/channel id
    entity_type: string;   // mapped by N6.W; unknown -> skipped
    access_level: "read" | "comment" | "write" | "owner" | string; // N1.z enum; comment downgraded to read unless canvas_comment_only_mode is on
    grant_exists?: boolean;
  }
  ```
- **Notes:** Deduped by file_id+entity_id. Only for canvas-enabled orgs (feature check rD.Q7).

### `file_permissions_edited`
- **Registrar:** batch
- **Handler:** `filePermissionsEdited` (modules/eager/application/0620__HVn0.js:38797)
- **Purpose:** An existing grant's access level changed; client updates it (isUpdate: true, grantExists: true).
- **Payload:**
  ```ts
  {
    type: "file_permissions_edited";
    file_id: string;
    entity_id: string;
    entity_type: string;
    access_level: "read" | "comment" | "write" | "owner" | string;
  }
  ```

### `file_undeleted`
- **Registrar:** batch
- **Handler:** `filesUndeleted` (modules/eager/application/0620__HVn0.js:38798)
- **Purpose:** Files restored from trash. With `file_trash_updates` on, client refetches the files in chunks of 30; otherwise just restores them in local state.
- **Payload:**
  ```ts
  {
    type: "file_undeleted";
    file_id?: string;
    file_ids?: string[];
  }
  ```

### `file_favorite_updated`
- **Registrar:** single
- **Handler:** `fileFavoriteUpdated` (modules/eager/application/0620__HVn0.js:38799)
- **Purpose:** File was (un)favorited elsewhere; client updates favorites and custom file section (collection) membership.
- **Payload:**
  ```ts
  {
    type: "file_favorite_updated";
    file_id: string;
    is_favorited: boolean;
    collection_id?: string; // custom section; only used when `custom_file_sections` flag is on
  }
  ```

### `dlp_user_warning`
- **Registrar:** single
- **Handler:** `fileDlpUserWarning` (modules/eager/application/0620__HVn0.js:38800)
- **Purpose:** Async DLP scan flagged an upload with a user-overridable warning. Client cleans up the pending-file placeholder and shows a DLP warning modal that can send the draft anyway.
- **Payload:**
  ```ts
  {
    type: "dlp_user_warning";
    client_msg_id?: string;       // locates the pending message placeholder
    custom_message?: string;      // admin DLP message
    draft_create?: {
      draft?: { id?: string; destinations?: unknown[]; /* full draft object, passed to handleDraftCreate */ };
      draft_id?: string;
    };
  }
  ```
- **Notes:** Ignored unless `dlp_async_file_processing` is "on". "Go" action resends with overrideAndSkipDlpUserWarning: true.

### `dlp_error_processing`
- **Registrar:** single
- **Handler:** `fileDlpCatastrophicErrorProcessing` (modules/eager/application/0620__HVn0.js:38801)
- **Purpose:** Async DLP scan failed catastrophically. Client cleans up placeholder files and shows an error modal that offers a retry send.
- **Payload:**
  ```ts
  {
    type: "dlp_error_processing";
    client_msg_id?: string;
    channel_id?: string;   // used when no draft was found (destination fallback)
    draft_create?: { draft?: { id?: string; /* full draft */ }; draft_id?: string };
  }
  ```
- **Notes:** Gated on `dlp_async_file_processing`; retry resends with overrideAndSkipDlpUserWarning: false.

### `file_thumbnail_generated`
- **Registrar:** single
- **Handler:** `fileThumbnailGenerated` (modules/eager/application/0620__HVn0.js:38802)
- **Purpose:** Thumbnails for a file are ready; client merges the thumbnail URLs (and permalink) into the file in the store.
- **Payload:**
  ```ts
  {
    type: "file_thumbnail_generated";
    file_id: string;       // ignored if file unknown locally
    thumb_url?: string;
    thumb_64?: string; thumb_80?: string; thumb_160?: string; thumb_360?: string;
    thumb_480?: string; thumb_720?: string; thumb_800?: string; thumb_960?: string; thumb_1024?: string;
    permalink?: string;
  }
  ```

### `canvas_ai_sections_highlighted`
- **Registrar:** single
- **Handler:** `canvasAiSectionsHighlighted` (modules/eager/application/0620__HVn0.js:38803)
- **Purpose:** AI edited sections of a canvas; client highlights those sections (isAiEdit: true).
- **Payload:**
  ```ts
  {
    type: "canvas_ai_sections_highlighted";
    file_id: string;
    section_ids: string[];
  }
  ```
- **Notes:** Gated on `slackbot_canvas_update_highlight` flag being "on".

### `channel_archive`
- **Registrar:** single
- **Handler:** `channelArchived` (modules/eager/application/0620__HVn0.js:39431)
- **Purpose:** A public channel was archived. Client marks it archived (noting whether this session archived it) and dispatches a follow-up (jb.d3 with channelId).
- **Payload:**
  ```ts
  {
    type: "channel_archive";
    channel: string;          // channel id (string, not object)
    is_moved?: boolean;       // only honored when true-ish and valid; false/undefined handled
    is_frozen?: boolean;
    frozen_reason?: string;   // used when is_frozen is true
  }
  ```
- **Notes:** Warns and ignores unknown channels or already-archived ones. Shares handler with `group_archive` (see below).

### `channel_created`
- **Registrar:** single
- **Handler:** `channelCreated` (modules/eager/application/0620__HVn0.js:39432)
- **Purpose:** A channel was created. Client upserts it; if the check tg.LI(channel) passes (likely created by the current user / DM-like) it also marks it opened this session.
- **Payload:**
  ```ts
  {
    type: "channel_created";
    channel: { id: string; /* full channel object, passed to upsert v3.F */ };
  }
  ```
- **Notes:** Non-opened channels are skipped when predicate N_.DM(state) holds (likely a restricted client mode).

### `channel_rename`
- **Registrar:** single
- **Handler:** `channelRenamed` (modules/eager/application/0620__HVn0.js:39433)
- **Purpose:** A channel was renamed; client updates its name fields (and marks MPDM as having a custom name).
- **Payload:**
  ```ts
  {
    type: "channel_rename";
    channel: {
      id: string;
      name: string;
      name_normalized?: string;
      // is_mpim derived from tg.yz(channel) (mpim check on the object)
    };
  }
  ```
- **Notes:** Ignored with a warning if channel unknown locally.

### `channel_unarchive`
- **Registrar:** single
- **Handler:** `channelUnarchived` (modules/eager/application/0620__HVn0.js:39434)
- **Purpose:** A channel was unarchived; client clears archived flags and, if the current user is the unarchiver and `public_channel_retain_membership_on_archive` is on, sets is_member.
- **Payload:**
  ```ts
  {
    type: "channel_unarchive";
    channel: string;        // channel id
    user: string;           // user who unarchived
    is_moved?: boolean;
    is_frozen?: boolean;
    frozen_reason?: string;
  }
  ```

### `group_archive`
- **Registrar:** single
- **Handler:** `channelArchived` (modules/eager/application/0620__HVn0.js:39435)
- **Purpose:** A private channel (group) was archived; same handler as `channel_archive`, which branches on the local channel type (public vs private) to compute `wasArchivedThisSession`.
- **Payload:**
  ```ts
  {
    type: "group_archive";
    channel: string;          // group/channel id
    is_moved?: boolean;
    is_frozen?: boolean;
    frozen_reason?: string;
  }
  ```
- **Notes:** Identical code path to `channel_archive`; the difference lies only in the local channel's type (tg.rW public vs tg.Zp private).
### `group_rename`
- **Registrar:** single
- **Handler:** `channelRenamed` (modules/eager/application/0620__HVn0.js:39436)
- **Purpose:** A private channel / mpim was renamed. Client dispatches a channel-update with the new name fields; if the channel is unknown it only logs a warning.
- **Payload:**
  ```ts
  {
    type: "group_rename";
    channel: {
      id: string;                 // channel id, must already be in store
      name: string;               // new name (also lower-cased into _name_lc)
      name_normalized?: string;
      is_mpim?: boolean;          // read via isMpim(channel) helper
    };
  }
  ```
- **Notes:** For mpims (when a pref/flag helper `t$.kH` is true) it also sets `properties.has_custom_mpdm_name = true` (custom MPDM name). Exact field consumed by isMpim helper (tg.yz) is the channel object itself (unverified).

### `group_unarchive`
- **Registrar:** single
- **Handler:** `channelUnarchived` (modules/eager/application/0620__HVn0.js:39437)
- **Purpose:** A private channel was unarchived. Client clears `is_archived` on the stored channel (only if currently archived) and optionally marks the current user as member.
- **Payload:**
  ```ts
  {
    type: "group_unarchive";
    channel: string;          // channel id (must be known and archived)
    user: string;             // user who unarchived; if equal to self and pref public_channel_retain_membership_on_archive=="on", is_member set true
    is_moved?: boolean;       // if true -> is_moved=true; if present and falsy -> false
    is_frozen?: boolean;      // if true -> is_frozen=true; if present and falsy -> false
    frozen_reason?: string;   // used only when is_frozen is truthy
  }
  ```
- **Notes:** Also sets `was_archived_this_session=false`. Unknown channel only logs a warning.

### `mpim_open`
- **Registrar:** single
- **Handler:** `channelOpened` (modules/eager/application/0620__HVn0.js:39438)
- **Purpose:** The user opened an mpim (possibly from another client). Client marks the conversation `is_open: true` and `opened_this_session: true`.
- **Payload:**
  ```ts
  {
    type: "mpim_open";
    channel: string;   // conversation id; must be known
    user: string;      // user id; for IMs it must be a known member else a warning is logged and opened_this_session is not set
  }
  ```
- **Notes:** Shares handler with `im_open`. The `user` check only applies to IM-type channels.

### `record_channel_open`
- **Registrar:** single
- **Handler:** `recordChannelOpened` (modules/eager/application/0620__HVn0.js:39439)
- **Purpose:** Another client opened a "record" channel (Slack Lists/records-style conversation). Client adds the channel from the store to the channel store if not already tracked, with reason `record-channel-opened-rtm`.
- **Payload:**
  ```ts
  {
    type: "record_channel_open";
    channel: string;   // channel id, looked up in the store
  }
  ```
- **Notes:** Skipped if the looked-up channel passes a predicate (t_.nT, likely "is missing/already open"; unverified).

### `im_created`
- **Registrar:** single
- **Handler:** `channelCreated` (modules/eager/application/0620__HVn0.js:39440)
- **Purpose:** A new conversation was created. Client upserts the channel; if it is an IM it is also marked open and opened this session.
- **Payload:**
  ```ts
  {
    type: "im_created";
    channel: {
      id: string;
      // full channel/IM object, passed through to the channel upsert (v3.F)
      [k: string]: unknown;
    };
  }
  ```
- **Notes:** For non-IM channels the upsert is skipped when `N_.DM(state)` is true (a mode flag, likely enterprise/org-shared client; unverified).

### `im_open`
- **Registrar:** single
- **Handler:** `channelOpened` (modules/eager/application/0620__HVn0.js:39441)
- **Purpose:** The user opened a DM (possibly from another client). Client sets `is_open: true` and `opened_this_session: true`.
- **Payload:**
  ```ts
  {
    type: "im_open";
    channel: string;   // IM id, must be known
    user: string;      // other user id; must be a known user for IMs
  }
  ```
- **Notes:** Same handler as `mpim_open`.

### `mpim_close`
- **Registrar:** single
- **Handler:** `channelClosed` (modules/eager/application/0620__HVn0.js:39442)
- **Purpose:** An mpim was closed (or converted into a private channel). Client sets `is_open:false`, navigates away if it is the currently displayed primary view, and handles conversion redirect.
- **Payload:**
  ```ts
  {
    type: "mpim_close";
    channel: string;        // conversation id, must be known
    converted_to?: string;  // id of the new channel the mpim was converted into; triggers channel-id remap (old->new) and clears the mark ts, and navigates to it when applicable
  }
  ```
- **Notes:** Shared handler with `im_close`, `record_channel_close`. If pref `code_channels_auto_close` is "on" and the channel is a code channel, it is removed as well. Unknown channel only logs.

### `im_close`
- **Registrar:** single
- **Handler:** `channelClosed` (modules/eager/application/0620__HVn0.js:39443)
- **Purpose:** The user closed a DM from some client. Client sets `is_open:false` and moves the main view away if it is currently shown.
- **Payload:**
  ```ts
  {
    type: "im_close";
    channel: string;
    converted_to?: string;   // see mpim_close
  }
  ```
- **Notes:** Same handler as `mpim_close`.

### `record_channel_close`
- **Registrar:** single
- **Handler:** `channelClosed` (modules/eager/application/0620__HVn0.js:39444)
- **Purpose:** A record channel was closed on another client; client sets `is_open:false` and navigates away if it was the current view.
- **Payload:**
  ```ts
  {
    type: "record_channel_close";
    channel: string;
    converted_to?: string;   // see mpim_close
  }
  ```
- **Notes:** Same handler as `mpim_close`.

### `channel_marked`
- **Registrar:** single
- **Handler:** `conversationMarked` (modules/eager/application/0620__HVn0.js:39445)
- **Purpose:** Read marker (last-read ts) of a channel moved, e.g. read on another client. Client updates the channel's last-read via an action; if a flag (eJ.Jz) is on it also calls a side helper (IJ.uV) with ts and channel.
- **Payload:**
  ```ts
  {
    type: "channel_marked";
    channel: string;   // conversation id
    ts: string;        // new last-read timestamp, e.g. "1700000000.000100"
  }
  ```
- **Notes:** Shared handler with group/mpim/im_marked. Ignored entirely if the type is "group_marked" and the channel is an mpim-like type (tg.yz) in store.

### `group_marked`
- **Registrar:** single
- **Handler:** `conversationMarked` (modules/eager/application/0620__HVn0.js:39446)
- **Purpose:** Read marker moved for a private channel. Same effect as `channel_marked`.
- **Payload:**
  ```ts
  {
    type: "group_marked";
    channel: string;
    ts: string;
  }
  ```
- **Notes:** Event is skipped when the known channel matches tg.yz (mpim); mpims use `mpim_marked`.

### `mpim_marked`
- **Registrar:** single
- **Handler:** `conversationMarked` (modules/eager/application/0620__HVn0.js:39447)
- **Purpose:** Read marker moved for an mpim. Same as `channel_marked`.
- **Payload:**
  ```ts
  {
    type: "mpim_marked";
    channel: string;
    ts: string;
  }
  ```

### `im_marked`
- **Registrar:** single
- **Handler:** `conversationMarked` (modules/eager/application/0620__HVn0.js:39448)
- **Purpose:** Read marker moved for a DM. Same as `channel_marked`.
- **Payload:**
  ```ts
  {
    type: "im_marked";
    channel: string;
    ts: string;
  }
  ```

### `teams_joined_shared_channel`
- **Registrar:** single
- **Handler:** `channelOrgAccessChanged` (modules/eager/application/0620__HVn0.js:39449)
- **Purpose:** Additional workspaces of the org were added to an org-shared channel (Enterprise Grid). Client updates the channel's internal team ids / org-wide flag.
- **Payload:**
  ```ts
  {
    type: "teams_joined_shared_channel";
    channel: string;            // channel id; must be known and org-shared
    is_global_shared?: boolean; // maps to orgWide
    teams: string[];            // team ids that now have access
  }
  ```
- **Notes:** Ignored on non-enterprise orgs or unknown/non-org-shared channels. When `is_global_shared` is falsy, the new team list is unioned with the teams already known on the channel.

### `teams_left_shared_channel`
- **Registrar:** single
- **Handler:** `channelOrgAccessChanged` (modules/eager/application/0620__HVn0.js:39450)
- **Purpose:** Workspaces were removed from an org-shared channel. If none of the current user's workspaces remain in `teams`, the channel is removed from the store; otherwise team access is updated.
- **Payload:**
  ```ts
  {
    type: "teams_left_shared_channel";
    channel: string;
    is_global_shared?: boolean;
    teams: string[];     // teams removed (checked via includes against my workspaces)
  }
  ```
- **Notes:** Same gating as `teams_joined_shared_channel`. Note semantics: for "left" the code treats `teams` as the removed teams in the "all my workspaces removed" check, then also dispatches it as internalTeamIds (unverified).

### `channel_history_changed`
- **Registrar:** single
- **Handler:** `channelHistoryChanged` (modules/eager/application/0620__HVn0.js:39451)
- **Purpose:** History of a channel changed server-side (e.g. bulk deletion / migration). Client records a new history-invalid timestamp so history is refetched, and for mpim/IM-type channels marks cached objects stale.
- **Payload:**
  ```ts
  {
    type: "channel_history_changed";
    channel: string;     // conversation id, must be known
    latest?: string;     // ts passed as timestamp to a latest-ts update action (jA.fp)
    event_ts: string;    // stored as historyInvalidTs if greater than the current value
  }
  ```
- **Notes:** Shared handler with im_/mpim_/group_history_changed. historyInvalidTs update happens only when a flag (rB.wq) is on.

### `im_history_changed`
- **Registrar:** single
- **Handler:** `channelHistoryChanged` (modules/eager/application/0620__HVn0.js:39452)
- **Purpose:** DM history changed. Same as channel_history_changed; additionally if the IM is migrating (Np.f5) it refetches the channel info and upserts it with `is_migrating`.
- **Payload:**
  ```ts
  {
    type: "im_history_changed";
    channel: string;
    latest?: string;
    event_ts: string;
  }
  ```

### `mpim_history_changed`
- **Registrar:** single
- **Handler:** `channelHistoryChanged` (modules/eager/application/0620__HVn0.js:39453)
- **Purpose:** mpim history changed; same flow as `im_history_changed`, with refetch reason `mpimHistoryChanged_isMigrating`.
- **Payload:**
  ```ts
  {
    type: "mpim_history_changed";
    channel: string;
    latest?: string;
    event_ts: string;
  }
  ```

### `group_history_changed`
- **Registrar:** single
- **Handler:** `channelHistoryChanged` (modules/eager/application/0620__HVn0.js:39454)
- **Purpose:** Private channel history changed; same as `channel_history_changed` (no migrating refetch branch).
- **Payload:**
  ```ts
  {
    type: "group_history_changed";
    channel: string;
    latest?: string;
    event_ts: string;
  }
  ```

### `im_deleted`
- **Registrar:** single
- **Handler:** `imDeleted` (modules/eager/application/0620__HVn0.js:39455)
- **Purpose:** A DM was deleted (e.g. other user deactivated/removed). Client removes the IM channel from the store, removes the other member user (if known and not a placeholder), and clears channel-related state.
- **Payload:**
  ```ts
  {
    type: "im_deleted";
    channel: string;   // IM id; ignored if unknown or not an IM
  }
  ```

### `channel_left`
- **Registrar:** single
- **Handler:** `channelLeft` (modules/eager/application/0620__HVn0.js:39456)
- **Purpose:** The current user left a channel. Client performs cleanup: temporary-section removal, agent-session cleanup, removes the channel from the store for private channels (or in some org mode), and schedules file cache eviction.
- **Payload:**
  ```ts
  {
    type: "channel_left";
    channel: string;   // channel id (ignored if not known)
  }
  ```
- **Notes:** Shared handler with `group_left`. Public channels are kept in store unless `N_.DM` mode is on; private ones are removed.

### `channels_bulk_leave_completed`
- **Registrar:** single
- **Handler:** `bulkLeaveChannelsCompleted` (modules/eager/application/0620__HVn0.js:39457)
- **Purpose:** A bulk "leave channels" job finished. Client shows a toast (with undo) summarising how many channels, and how many private ones, were left; logs failures.
- **Payload:**
  ```ts
  {
    type: "channels_bulk_leave_completed";
    successes?: string[];  // channel ids left
    failures?: string[];   // channel ids that failed
  }
  ```

### `channel_changed`
- **Registrar:** single
- **Handler:** `channelChanged` (modules/eager/application/0620__HVn0.js:39458)
- **Purpose:** Membership of a channel changed (backfill signal). Client marks channel members/info as stale so they are refetched on demand.
- **Payload:**
  ```ts
  {
    type: "channel_changed";
    channel: { id: string };   // only id is read; event ignored (logged) if missing
  }
  ```

### `channel_deleted`
- **Registrar:** single
- **Handler:** `channelDeleted` (modules/eager/application/0620__HVn0.js:39459)
- **Purpose:** A channel was deleted (or converted to another channel). Client removes it from the store, closes views showing it (or redirects to the new channel), and clears the channel's email address.
- **Payload:**
  ```ts
  {
    type: "channel_deleted";
    channel: string;            // channel id, must be known
    new_channel_id?: string;    // when set (conversion), channel id is remapped old->new and open views are redirected to the new channel
  }
  ```
- **Notes:** Shared handler with `group_deleted`.

### `channel_joined`
- **Registrar:** single
- **Handler:** `channelJoined` (modules/eager/application/0620__HVn0.js:39460)
- **Purpose:** The current user joined a channel. Client upserts the channel with `is_member:true`, records join date, handles temporary channel sections and agent sessions, and schedules file refresh.
- **Payload:**
  ```ts
  {
    type: "channel_joined";
    channel: {
      id: string;
      properties?: { agent_session?: unknown; [k: string]: unknown };
      // full channel object, upserted into the channel store
      [k: string]: unknown;
    };
    old_channel_id?: string;              // if defined, channel is flagged isConverted (conversion from old id)
    temp_membership_expiration_ts?: number; // when set (with feature on) creates a temporary-membership entry; 0 removes it
  }
  ```
- **Notes:** Shared handler with group_joined, mpim_joined. Logs a warning for already-known mpim/group.

### `group_deleted`
- **Registrar:** single
- **Handler:** `channelDeleted` (modules/eager/application/0620__HVn0.js:39461)
- **Purpose:** A private channel was deleted/converted; same behaviour as `channel_deleted`.
- **Payload:**
  ```ts
  {
    type: "group_deleted";
    channel: string;
    new_channel_id?: string;
  }
  ```

### `group_joined`
- **Registrar:** single
- **Handler:** `channelJoined` (modules/eager/application/0620__HVn0.js:39462)
- **Purpose:** The user joined (or was added to) a private channel; same as `channel_joined`.
- **Payload:**
  ```ts
  {
    type: "group_joined";
    channel: { id: string; [k: string]: unknown };  // full group object
    old_channel_id?: string;
    temp_membership_expiration_ts?: number;
  }
  ```

### `group_left`
- **Registrar:** single
- **Handler:** `channelLeft` (modules/eager/application/0620__HVn0.js:39463)
- **Purpose:** The user left a private channel; same cleanup as `channel_left`.
- **Payload:**
  ```ts
  {
    type: "group_left";
    channel: string;
  }
  ```

### `mpim_joined`
- **Registrar:** single
- **Handler:** `channelJoined` (modules/eager/application/0620__HVn0.js:39464)
- **Purpose:** The user was added to an mpim; same flow as `channel_joined`.
- **Payload:**
  ```ts
  {
    type: "mpim_joined";
    channel: { id: string; [k: string]: unknown };  // full mpim object
    old_channel_id?: string;
    temp_membership_expiration_ts?: number;
  }
  ```

### `channel_converted_to_shared`
- **Registrar:** single
- **Handler:** `channelConvertedToShared` (modules/eager/application/0620__HVn0.js:39465)
- **Purpose:** A channel became a shared channel (org-shared or global-shared). Client replaces the stored channel with the new object (keeping local `is_member`).
- **Payload:**
  ```ts
  {
    type: "channel_converted_to_shared";
    channel: {
      id: string;
      // full channel object, passed to the channel upsert (reason CONVERT_TO_SHARED)
      [k: string]: unknown;
    };
  }
  ```
- **Notes:** Ignored if channel unknown, archived, or neither org-shared nor global-shared.

### `group_converted_to_shared`
- **Registrar:** single
- **Handler:** `groupConvertedToShared` (modules/eager/application/0620__HVn0.js:39466)
- **Purpose:** Private channel converted to shared; wrapper that renames `group` to `channel` and delegates to channelConvertedToShared.
- **Payload:**
  ```ts
  {
    type: "group_converted_to_shared";
    group: { id: string; [k: string]: unknown };  // full group object (same as channel above)
  }
  ```
- **Notes:** Warns and ignores if `group` is missing.

### `channel_contextbar`
- **Registrar:** single
- **Handler:** `handleChannelContextBar` (modules/eager/application/0620__HVn0.js:39502)
- **Purpose:** Server asks the client to show a context-bar override in a channel. Only `toast_type: "dnd-override"` is handled: stores an override URL for the channel.
- **Payload:**
  ```ts
  {
    type: "channel_contextbar";
    toast_type: "dnd-override" | string;  // other values are logged as unrecognized
    channel: string;                       // channel id
    action_url?: string;                   // overrideUrl
  }
  ```

### `channel_address_added`
- **Registrar:** single
- **Handler:** `handleChannelEmailAdded` (modules/eager/application/0620__HVn0.js:39503)
- **Purpose:** An email address was created for a channel (email-to-channel). Client stores it only if that channel is the one currently shown in the primary view.
- **Payload:**
  ```ts
  {
    type: "channel_address_added";
    conversation_id: string;      // channel id (becomes channelId)
    // remaining fields (except type, event_ts, ts) are passed whole to the channel-email store action (jb.$G); shape not visible here
    [k: string]: unknown;
  }
  ```

### `channel_address_changed`
- **Registrar:** single
- **Handler:** `handleChannelEmailChanged` (modules/eager/application/0620__HVn0.js:39504)
- **Purpose:** A channel's email address settings changed; client updates the stored channel email record.
- **Payload:**
  ```ts
  {
    type: "channel_address_changed";
    conversation_id: string;
    // other fields passed through to channel-email update (jb.J6); not visible
    [k: string]: unknown;
  }
  ```

### `channel_address_removed`
- **Registrar:** single
- **Handler:** `handleChannelEmailRemoved` (modules/eager/application/0620__HVn0.js:39505)
- **Purpose:** A channel's email address was removed; client deletes the stored record.
- **Payload:**
  ```ts
  {
    type: "channel_address_removed";
    conversation_id: string;
  }
  ```

### `channel_section_upserted`
- **Registrar:** single
- **Handler:** `ArrowFunctionExpression` (modules/eager/application/0620__HVn0.js:39641)
- **Purpose:** A sidebar channel section was created or updated. Client normalizes the payload into a section object and upserts it; for user-group sections it also loads the usergroup and may show a coachmark.
- **Payload:**
  ```ts
  {
    type: "channel_section_upserted";
    channel_section_type: string;   // section type enum (td.Ri; includes UserGroup)
    usergroup_id?: string;          // for UserGroup sections
    // remaining section fields (id, name, emoji, channel_ids_page, etc.) are passed whole to a section normalizer (j3.t) with type=channel_section_type; not visible here
    [k: string]: unknown;
  }
  ```
- **Notes:** UserGroup sections are ignored unless a feature flag (eJ.cq) is on.

### `channel_section_deleted`
- **Registrar:** single
- **Handler:** `ArrowFunctionExpression` (modules/eager/application/0620__HVn0.js:39652)
- **Purpose:** A sidebar section was deleted; client removes it.
- **Payload:**
  ```ts
  {
    type: "channel_section_deleted";
    channel_section_id: string;
  }
  ```

### `channel_sections_channels_upserted`
- **Registrar:** single
- **Handler:** `ArrowFunctionExpression` (modules/eager/application/0620__HVn0.js:39658)
- **Purpose:** Channels were added to a sidebar section; client updates section membership.
- **Payload:**
  ```ts
  {
    type: "channel_sections_channels_upserted";
    channel_section_id: string;
    channel_ids: string[];
  }
  ```

### `channel_sections_channels_removed`
- **Registrar:** single
- **Handler:** `ArrowFunctionExpression` (modules/eager/application/0620__HVn0.js:39662)
- **Purpose:** Channels were removed from a sidebar section.
- **Payload:**
  ```ts
  {
    type: "channel_sections_channels_removed";
    channel_section_id: string;
    channel_ids: string[];
  }
  ```

### `channel_section_reset`
- **Registrar:** single
- **Handler:** `ArrowFunctionExpression` (modules/eager/application/0620__HVn0.js:39668)
- **Purpose:** All channel sections were reset server-side; client marks the section data stale/refetches for the current team.
- **Payload:**
  ```ts
  {
    type: "channel_section_reset";
  }
  ```
- **Notes:** No payload fields are read.

### `channel_sections_entities_upserted`
- **Registrar:** single
- **Handler:** `ArrowFunctionExpression` (modules/eager/application/0620__HVn0.js:39672)
- **Purpose:** Non-channel entities (e.g. CRM accounts/contacts lists) were added to a sidebar section. Client upserts them and, under a CRM feature flag, advances the bulk-grid setup status and may show a "contacts ready" toast.
- **Payload:**
  ```ts
  {
    type: "channel_sections_entities_upserted";
    channel_section_id: string;
    entities: Array<{
      entity_id: string;
      entity_type?: string;
      [k: string]: unknown;   // other fields passed through, with channel_section_id merged in
    }>;
  }
  ```
- **Notes:** In the CRM branch, entities[0] is treated as the accounts list and entities[1] as the contacts list (entity_id used as composite list ids).

### `channel_sections_entities_removed`
- **Registrar:** single
- **Handler:** `ArrowFunctionExpression` (modules/eager/application/0620__HVn0.js:39694)
- **Purpose:** Entities were removed from a sidebar section; client removes each.
- **Payload:**
  ```ts
  {
    type: "channel_sections_entities_removed";
    channel_section_id: string;
    entities: Array<{ entity_type: string; entity_id: string }>;
  }
  ```

### `channel_toast`
- **Registrar:** single
- **Handler:** `handleChannelToast` (modules/eager/application/0620__HVn0.js:39706)
- **Purpose:** Server asks the client to show a toast with text; optionally clears a channel's context-bar snackbar.
- **Payload:**
  ```ts
  {
    type: "channel_toast";
    text: string;                     // required; warns if missing
    channel?: string;                 // channel whose snackbar is dismissed
    dismissed_snackbar_ts?: string;   // truthy -> dismiss snackbar for `channel`
  }
  ```

### `commands_changed`
- **Registrar:** single
- **Handler:** `commandsChanged` (modules/eager/application/0620__HVn0.js:39729)
- **Purpose:** Slash commands changed. With deltas, client removes/updates commands; without, it triggers a throttled (trailing, ~60s with jitter) reload of all slash commands.
- **Payload:**
  ```ts
  {
    type: "commands_changed";
    commands_removed?: Array<{ name: string }>;
    commands_updated?: unknown[];     // command objects, passed to the commands store
    commands_cache_ts?: string;       // cacheTs stored with the update
  }
  ```

### `recent_status_changed`
- **Registrar:** single
- **Handler:** `handleRecentStatusChanged` (modules/eager/application/0620__HVn0.js:39758)
- **Purpose:** The user's recent custom statuses changed; client replaces the recent list and the inactive scheduled statuses.
- **Payload:**
  ```ts
  {
    type: "recent_status_changed";
    statuses: unknown[];                                  // recent statuses, stored whole
    scheduled_statuses?: Array<{ is_active: boolean; [k: string]: unknown }>;  // only !is_active kept
  }
  ```

### `dlp_user_warning_file_update`
- **Registrar:** single
- **Handler:** `dlpUserWarningFileUpdateOnMessageEdit` (modules/eager/application/0620__HVn0.js:39759)
- **Purpose:** DLP async scan of files in an edited message found violations. Client removes/flags the files and shows a DLP warning error with a "go to" action opening the Slackbot warning message.
- **Payload:**
  ```ts
  {
    type: "dlp_user_warning_file_update";
    channel_id: string;
    slackbot_channel_id?: string;   // used to navigate to the Slackbot warning message
    warned_files: Array<{
      file_id: string;
      custom_message?: string;       // only [0] is used
      slackbot_message_ts?: string;  // only [0] is used
    }>;
  }
  ```
- **Notes:** Ignored unless pref/feature `dlp_message_update_async_scan` is "on" and warned_files is non-empty.

### `dnd_updated`
- **Registrar:** single
- **Handler:** `dndUpdated` (modules/eager/application/0620__HVn0.js:39782)
- **Purpose:** DND status of the current user changed; client marks that user's DND info stale to be refetched.
- **Payload:**
  ```ts
  {
    type: "dnd_updated";
    user: string;   // user id
  }
  ```
- **Notes:** Other fields (dnd_status) exist on the wire but the client only refetches.

### `dnd_updated_user`
- **Registrar:** single
- **Handler:** `dndUpdatedUser` (modules/eager/application/0620__HVn0.js:39783)
- **Purpose:** DND status of another user changed; client marks it stale for refetch.
- **Payload:**
  ```ts
  {
    type: "dnd_updated_user";
    user: string;   // user id
  }
  ```

### `dnd_invalidated`
- **Registrar:** shared
- **Handler:** `dndInvalidatedRtmHandler` (modules/eager/application/0620__HVn0.js:39784)
- **Purpose:** DND info for a set of users is invalidated; client marks them stale for the given team/org id.
- **Payload:**
  ```ts
  {
    type: "dnd_invalidated";
    user: { id: string };   // handler receives an array of such messages
  }
  ```
- **Notes:** Receives `(msgs[], teamOrEnterpriseId)`. Messages without `user` are filtered out.

### `downmarket_crm_enabled`
- **Registrar:** single
- **Handler:** `downmarketCrmEnabled` (modules/eager/application/0620__HVn0.js:39802)
- **Purpose:** The downmarket CRM (Salesforce-based) feature was enabled/disabled for the workspace. Client updates the flag, loads Salesforce org info when enabled (else resets related flags), and requests a refresh of the sidebar menu header space.
- **Payload:**
  ```ts
  {
    type: "downmarket_crm_enabled";
    is_enabled: boolean;
  }
  ```

### `emoji_changed`
- **Registrar:** shared
- **Handler:** `batchEmojiChanged` (modules/eager/application/0620__HVn0.js:39839)
- **Purpose:** Custom emoji were added, removed or renamed. Client removes the stale emoji from the store and invalidates cached emoji entries (including aliases of a renamed emoji) so they are refetched.
- **Payload:**
  ```ts
  {
    type: "emoji_changed";
    subtype: "add" | "remove" | "rename";
    name?: string;       // subtype "add": added emoji name
    names?: string[];    // subtype "remove": removed emoji names
    old_name?: string;   // subtype "rename": previous name (aliases of it are also invalidated)
  }
  ```
- **Notes:** Receives `(msgs[], teamOrEnterpriseId)`; operates on the matching store.

### `emoji_collection_added`
- **Registrar:** single
- **Handler:** `ArrowFunctionExpression` (modules/eager/application/0620__HVn0.js:39841)
- **Purpose:** An emoji collection was added; client stores the collection's emoji under its id.
- **Payload:**
  ```ts
  {
    type: "emoji_collection_added";
    collection: {
      collection_id: string | number;   // stringified
      emoji: unknown;                   // passed to the emoji-collection store (Ex.o2); shape not visible here
    };
  }
  ```

### `emoji_collection_removed`
- **Registrar:** single
- **Handler:** `ArrowFunctionExpression` (modules/eager/application/0620__HVn0.js:39856)
- **Purpose:** An emoji collection was removed; client deletes it.
- **Payload:**
  ```ts
  {
    type: "emoji_collection_removed";
    collection_id: string | number;   // stringified
  }
  ```

### `enterprise_rename`
- **Registrar:** single
- **Handler:** `enterpriseRename` (modules/eager/application/0620__HVn0.js:39869)
- **Purpose:** The enterprise org was renamed; client updates the enterprise name in two stores.
- **Payload:**
  ```ts
  {
    type: "enterprise_rename";
    name: string;
  }
  ```

### `external_org_migration_finished`
- **Registrar:** single
- **Handler:** `externalOrgMigrationFinished` (modules/eager/application/0620__HVn0.js:39888)
- **Purpose:** A team's migration into an external org finished; client marks it migrated (not migrating) and triggers a follow-up refresh action (Ew.eF).
- **Payload:**
  ```ts
  {
    type: "external_org_migration_finished";
    team: { id: string };
  }
  ```

### `external_org_migration_started`
- **Registrar:** single
- **Handler:** `externalOrgMigrationStarted` (modules/eager/application/0620__HVn0.js:39889)
- **Purpose:** A team's external org migration started; client sets its migrating flag and triggers the follow-up refresh action.
- **Payload:**
  ```ts
  {
    type: "external_org_migration_started";
    team: { id: string; is_migrating: boolean };
  }
  ```

### `file_collection_updated`
- **Registrar:** single
- **Handler:** `fileCollectionUpdated` (modules/eager/application/0620__HVn0.js:39909)
- **Purpose:** A file collection (e.g. a Lists/collection of files) changed; client normalizes it (ET.a1), drops `sort`, and upserts it in the store.
- **Payload:**
  ```ts
  {
    type: "file_collection_updated";
    collection: {
      id: string;
      // full collection object, normalized by ET.a1 then stored; other fields not visible here
      [k: string]: unknown;
    };
  }
  ```
- **Notes:** Ignored when `collection.id` is missing.
Note: line numbers are the registration lines in modules/eager/application/0620__HVn0.js (handler bodies are defined earlier in the same file).

### `file_collection_deleted`
- **Registrar:** single
- **Handler:** `fileCollectionDeleted` (modules/eager/application/0620__HVn0.js:39910)
- **Purpose:** A file collection (e.g. starred files collection) was deleted; the client dispatches a remove-collection action for that id.
- **Payload:**
  ```ts
  {
    type: "file_collection_deleted";
    collection?: { id?: string }; // only collection.id is read; ignored if absent
  }
  ```

### `file_collection_created`
- **Registrar:** single
- **Handler:** `fileCollectionCreated` (modules/eager/application/0620__HVn0.js:39911)
- **Purpose:** A file collection was created; the client normalizes it (`ET.a1`) and stores it, and if it is the STARRED type also dispatches an "incoming collection" action.
- **Payload:**
  ```ts
  {
    type: "file_collection_created";
    collection?: {
      id: string;
      type?: string;   // compared with EI.$o.STARRED
      // ...full collection object, passed through to normalizer ET.a1 then a store action (fields unverified)
    };
  }
  ```
- **Notes:** Ignored when `collection.id` is missing.

### `force_reload`
- **Registrar:** single
- **Handler:** `forceReload` (wrapped in `_.once`) (modules/eager/application/0620__HVn0.js:39982)
- **Purpose:** Server asks the client to reload. The client waits until it is online and the window is blurred (plus a 10s delay and re-check), then performs a cold-boot reload (reason key `rtm_force_reload`).
- **Payload:**
  ```ts
  {
    type: "force_reload";
    // no payload fields read
  }
  ```
- **Notes:** Handler wrapped in `once`, so only the first force_reload per page lifetime has an effect.

### `hermes_trigger_updated`
- **Registrar:** single
- **Handler:** `workflowTriggerUpdated` (modules/eager/application/0620__HVn0.js:40009)
- **Purpose:** A Workflow Builder (hermes) trigger changed. The client marks trigger/workflow cached objects stale and, if the trigger was deleted or its workflow is unpublished, clears the trigger's cached/derived state.
- **Payload:**
  ```ts
  {
    type: "hermes_trigger_updated";
    trigger_id: string;           // trigger id
    is_deleted?: boolean;         // if true, purge trigger state
    is_workflow_published?: boolean; // if falsy, purge trigger state
  }
  ```
- **Notes:** Looks up workflow_id from cached trigger (`workflow.workflow_id`) locally, not from the event.

### `ai_workflow_request`
- **Registrar:** single
- **Handler:** `handleAiWorkflowRequest` (modules/eager/application/0620__HVn0.js:40041)
- **Purpose:** Result of an AI-generated workflow request. On completion the client stores the workflow preview data; on error stores an error code.
- **Payload:**
  ```ts
  {
    type: "ai_workflow_request";
    id: string;                  // request id
    status: "completed" | "error"; // other values ignored
    workflow?: unknown;          // when completed; full workflow object, stored as preview data
    trigger?: unknown;           // when completed
    available_data?: unknown;    // when completed
    message?: string;            // when error; stored as errorCode
  }
  ```

### `invited_user_created`
- **Registrar:** single
- **Handler:** inline arrow (modules/eager/application/0620__HVn0.js:40046)
- **Purpose:** An invited user (by email) now has a user id. The client finds compose drafts that have a pending destination for that email, adds the user id to the draft's destinations, removes the pending destination, tracks a COMPOSE_FLOW event and, if no pending destinations remain, advances the draft (resolves/sends per draft state).
- **Payload:**
  ```ts
  {
    type: "invited_user_created";
    email: string;            // invited email; both fields required
    user_encoded_id: string;  // new user id (U...)
  }
  ```

### `issue_change`
- **Registrar:** single
- **Handler:** `issueChange` (modules/eager/application/0620__HVn0.js:40108)
- **Purpose:** An issue (Slack "issues" / flagged item) changed; the client upserts it in the store and then dispatches a follow-up (`nO.Qw` with `Ez.w()`, likely a refetch/refresh of issue counts; unverified).
- **Payload:**
  ```ts
  {
    type: "issue_change";
    issue: {
      state: "open" | "resolved" | "read" | "unread"; // anything else coerced to "open"
      // ...rest of issue object spread into the store action (fields unverified)
    };
  }
  ```

### `list_record_removed`
- **Registrar:** single
- **Handler:** inline arrow (modules/eager/application/0620__HVn0.js:40111)
- **Purpose:** A record was removed from a Slack List; the client removes it from the list store.
- **Payload:**
  ```ts
  {
    type: "list_record_removed";
    list_id: string;  // list file id
    id: string;       // record id
  }
  ```
- **Notes:** Only acts when Lists is enabled (`tN.Fh(state)`).

### `list_records_archived`
- **Registrar:** single
- **Handler:** inline arrow (modules/eager/application/0620__HVn0.js:40115)
- **Purpose:** One or more list records were archived (or restored); client updates each record's archive state.
- **Payload:**
  ```ts
  {
    type: "list_records_archived";
    list_id: string;
    ids?: string[];     // record ids
    restore?: boolean;  // true = unarchive (inferred from name)
  }
  ```
- **Notes:** Gated on Lists enabled; `listsPerfTwoEnabled` derived from state.

### `list_record_updated`
- **Registrar:** single
- **Handler:** inline arrow (modules/eager/application/0620__HVn0.js:40129)
- **Purpose:** A list record changed. If `deleted`, removes it; otherwise normalizes and upserts the record, and if it is assigned to the current user ("my item") also dispatches a my-item action.
- **Payload:**
  ```ts
  {
    type: "list_record_updated";
    list_id: string;
    id: string;            // record id (used for delete)
    deleted?: boolean;
    record?: {
      fields?: unknown[];  // inspected to decide if it concerns current user
      // ...full record object, normalized by hR.jG (fields unverified)
    };
  }
  ```
- **Notes:** Gated on Lists enabled. Ignored if `record` missing and not deleted.

### `list_record_created`
- **Registrar:** single
- **Handler:** inline arrow (modules/eager/application/0620__HVn0.js:40151)
- **Purpose:** A new record was created in a list; client normalizes and upserts it (and dispatches my-item action if it concerns the current user).
- **Payload:**
  ```ts
  {
    type: "list_record_created";
    list_id: string;
    record: {
      fields?: unknown[];
      // ...full record object, normalized by hR.jG (fields unverified)
    };
  }
  ```
- **Notes:** Gated on Lists enabled.

### `list_cells_updated`
- **Registrar:** single
- **Handler:** inline arrow (modules/eager/application/0620__HVn0.js:40171)
- **Purpose:** Cell values (and optionally a column definition) changed in a list. Client replaces the matching schema column in the list's metadata and applies cell updates to the cached list records.
- **Payload:**
  ```ts
  {
    type: "list_cells_updated";
    list_id: string;
    column?: { key: string; /* ...full column schema object, replaces entry in list_metadata.schema */ };
    cells: unknown; // cell update objects, passed to N9.VR (shape unverified)
  }
  ```
- **Notes:** Does nothing if the list is not in the local store. Schema replacement skipped when matching index is 0 or -1 (quirk of `s &&`).

### `list_contents_merged`
- **Registrar:** single
- **Handler:** inline arrow (modules/eager/application/0620__HVn0.js:40204)
- **Purpose:** List contents were merged server-side; if the list is loaded locally, client triggers a refresh (action `EY.D`) for it.
- **Payload:**
  ```ts
  {
    type: "list_contents_merged";
    list_id: string;
  }
  ```
- **Notes:** Gated on Lists enabled.

### `media_reaction_added`
- **Registrar:** single
- **Handler:** `mediaReactionAdded` (modules/eager/application/0620__HVn0.js:40242)
- **Purpose:** A timestamped reaction was added to a media (audio/video clip) file. If the message/file is cached locally, adds the reaction to it.
- **Payload:**
  ```ts
  {
    type: "media_reaction_added";
    media: {
      channel: string;     // channel id
      file: string;        // file id
      message_ts: string;
    };
    reaction: {
      name: string;        // emoji name
      offset_ms: number;   // playback offset
      user: string;        // reacting user id
    };
  }
  ```
- **Notes:** Gated by feature check `E$.v`. No fetch if content not cached.

### `media_reaction_removed`
- **Registrar:** single
- **Handler:** `mediaReactionRemoved` (modules/eager/application/0620__HVn0.js:40243)
- **Purpose:** Inverse of `media_reaction_added`: removes the reaction from the cached media item.
- **Payload:**
  ```ts
  {
    type: "media_reaction_removed";
    media: { channel: string; file: string; message_ts: string };
    reaction: { name: string; offset_ms: number; user: string };
  }
  ```

### `user_change`
- **Registrar:** single
- **Handler:** `userChange` (modules/eager/application/0620__HVn0.js:40534)
- **Purpose:** A user profile changed. For other users, their member record is marked stale/refetched. For the current user, the member is applied eagerly (when experiment `eager_apply_user_change` is on) or refetched, team permissions are marked stale, and role flags (primary owner/owner/admin) are updated in the store.
- **Payload:**
  ```ts
  {
    type: "user_change";
    user: {
      id: string;
      team_id?: string;
      enterprise_id?: string;          // if set, treated as org-scoped member
      is_primary_owner?: boolean;
      is_owner?: boolean;
      is_admin?: boolean;
      enterprise_user?: {              // org-level roles
        is_primary_owner?: boolean;
        is_owner?: boolean;
        is_admin?: boolean;
      };
      // ...full user/member object (passed to members reducer when eager apply is on)
    };
  }
  ```
- **Notes:** Logs a warning if event scope (org vs workspace) differs from stored member. Ignored if `user` missing.

### `member_joined_channel`
- **Registrar:** batch
- **Handler:** `batchMemberJoinedChannel` (modules/eager/application/0620__HVn0.js:40535)
- **Purpose:** Users joined channels. Shares `batchProcessChannelMembers` with `member_left_channel`; the client updates channel membership maps, member counts, per-event join handling, and refetches members that may be missing from local store.
- **Payload:**
  ```ts
  // handler receives Array of:
  {
    type: "member_joined_channel";
    channel: string;   // channel id
    user: string;      // user id
    // other fields (e.g. channel_type, team, inviter) possibly read by memberJoinedChannel (unverified)
  }
  ```
- **Notes:** Differences from left: `isJoined: true`.

### `member_left_channel`
- **Registrar:** batch
- **Handler:** `batchMemberLeftChannel` (modules/eager/application/0620__HVn0.js:40536)
- **Purpose:** Users left channels. Same shared helper as `member_joined_channel` with `isJoined: false`; updates membership info and member-left side effects.
- **Payload:**
  ```ts
  // handler receives Array of:
  {
    type: "member_left_channel";
    channel: string;
    user: string;
    // other fields possibly read by memberLeftChannel (unverified)
  }
  ```

### `user_invalidated`
- **Registrar:** shared
- **Handler:** `userInvalidated` (modules/eager/application/0620__HVn0.js:40561)
- **Purpose:** Cached user data is invalid; client marks the listed users stale for the team/enterprise, causing refetch.
- **Payload:**
  ```ts
  // handler receives Array of:
  {
    type: "user_invalidated";
    user?: { id: string };  // events without user are filtered out
  }
  ```

### `meeting_event`
- **Registrar:** single
- **Handler:** `meetingEventRtmHandler` (modules/eager/application/0620__HVn0.js:40584)
- **Purpose:** A calendar/huddle meeting object was created, updated or deleted. Client upserts or removes it from the meetings store, and registers event-link mapping.
- **Payload:**
  ```ts
  {
    type: "meeting_event";
    subtype: "created" | "updated" | "deleted";
    meeting?: {
      meeting_id?: string;           // used on delete
      event_info?: {
        id?: string;                 // calendar event id (used on delete)
        event_link_id?: string;      // used on created/updated to map link -> meeting
      };
      // ...full meeting object, stored as-is (fields unverified)
    };
  }
  ```
- **Notes:** Gated on a feature check `Md.wh`.

### `desktop_notification`
- **Registrar:** single
- **Handler:** `maybeShowNotification` (modules/eager/application/0620__HVn0.js:41322)
- **Purpose:** Server-pushed notification payload. Same handler also used for message notifications; client applies notification prefs, DND, mute, membership checks and, if allowed, shows an OS/browser notification (with skip_formatting) and records beacons/clog events.
- **Payload:**
  ```ts
  {
    type: "desktop_notification";
    channel: string;            // channel id used for pref/mute/membership checks
    ts?: string;                // message ts (also used as notification timestamp)
    msg?: string;               // alt message ts
    subtype?: string;
    launchUri?: string;         // passed as launch_uri
    imageUri?: string;          // passed as image_uri
    avatarImage?: string;       // passed as avatar_image
    // ...other fields consumed by notification builder IJ.Ds / title/content helpers (unverified)
  }
  ```
- **Notes:** Skipped if notification pref disabled, channel muted, user in DND, not a member, or streaming in progress (flag `defer_notification_3p_streaming`). Uses `tM.gA` (desktop-notification-specific decision).

### `dnd_override`
- **Registrar:** single
- **Handler:** `handleDndOverride` (modules/eager/application/0620__HVn0.js:41323)
- **Purpose:** A message that was suppressed by DND should now notify anyway (e.g. urgent override). Client sets `_ignore_dnd` on the cached message and re-runs the notification logic; also may dispatch a focus-mode related action for the channel.
- **Payload:**
  ```ts
  {
    type: "dnd_override";
    channel: string;     // channel id
    timestamp: string;   // message ts
  }
  ```
- **Notes:** No-op if message not in the local store or already flagged.

### `thread_subscribed`
- **Registrar:** single
- **Handler:** `threadSubscribed` (modules/eager/application/0620__HVn0.js:41482)
- **Purpose:** The user is now subscribed to a thread. Client stores the subscription and, if the All Threads view is showing, increments new reply count / prepends the thread.
- **Payload:**
  ```ts
  {
    type: "thread_subscribed";
    subscription: {
      channel: string;
      thread_ts: string;
      last_read?: string;   // ts
    };
  }
  ```

### `thread_unsubscribed`
- **Registrar:** single
- **Handler:** `threadUnsubscribed` (modules/eager/application/0620__HVn0.js:41483)
- **Purpose:** The user unsubscribed from a thread; client stores `subscribed: false`.
- **Payload:**
  ```ts
  {
    type: "thread_unsubscribed";
    subscription: { channel: string; thread_ts: string; last_read?: string };
  }
  ```

### `thread_marked`
- **Registrar:** single
- **Handler:** `threadMarked` (modules/eager/application/0620__HVn0.js:41484)
- **Purpose:** Thread read marker changed (marked read/unread elsewhere). Client updates last-read cursor, thread unread state, and recomputes unread highlight counts for the channel.
- **Payload:**
  ```ts
  {
    type: "thread_marked";
    subscription: {
      channel: string;
      thread_ts: string;
      last_read: string;   // ts
    };
  }
  ```

### `update_thread_state`
- **Registrar:** single
- **Handler:** `updateThreadState` (modules/eager/application/0620__HVn0.js:41485)
- **Purpose:** Server pushes aggregate thread unread/mention state for the workspace; client stores it (and channel badges).
- **Payload:**
  ```ts
  {
    type: "update_thread_state";
    has_unreads: boolean;
    unread_count_by_channel?: Record<string, number>;
    mention_count?: number;                          // only logged
    mention_count_by_channel?: Record<string, number>;
    timestamp: string;                               // last updated ts
    channel_badges?: unknown;                        // passed to Rx.$m (shape unverified)
    org_wide?: boolean;
  }
  ```
- **Notes:** Shares handler with `update_global_thread_state`. Rejected if org-unified mode is enabled, or if `!!org_wide` differs from whether the current context is org-wide.

### `update_global_thread_state`
- **Registrar:** single
- **Handler:** `updateThreadState` (modules/eager/application/0620__HVn0.js:41486)
- **Purpose:** Same as `update_thread_state` but for the org-unified (global, cross-workspace) thread state.
- **Payload:**
  ```ts
  {
    type: "update_global_thread_state";
    has_unreads: boolean;
    unread_count_by_channel?: Record<string, number>;
    mention_count?: number;
    mention_count_by_channel?: Record<string, number>;
    timestamp: string;
    channel_badges?: unknown;
  }
  ```
- **Notes:** Shares handler; only accepted when org-unified is enabled (rejected otherwise). `org_wide` not checked in this branch.

### `user_permissions_added`
- **Registrar:** single
- **Handler:** `permissionsAdded` (modules/eager/application/0620__HVn0.js:42708)
- **Purpose:** Permissions were granted to the current user on a team/org or channel; client adds them to the permission store and marks cached permission queries stale. May refresh enterprise search state.
- **Payload:**
  ```ts
  {
    type: "user_permissions_added";
    entity_type: "TEAM_OR_ORG" | "CHANNEL";
    entity_id: string;       // team/org id or channel id
    permissions: string[];   // permission names (shape inferred)
  }
  ```
- **Notes:** Enterprise-search handling gated on `enterprise_search_rtm_events` flag and only filters enterprise-search permissions. Enterprise (org) ids are also applied to the org-level permission cache.

### `user_permissions_removed`
- **Registrar:** single
- **Handler:** `permissionsRemoved` (modules/eager/application/0620__HVn0.js:42709)
- **Purpose:** Permissions were revoked; client removes them from the store and marks permission queries stale.
- **Payload:**
  ```ts
  {
    type: "user_permissions_removed";
    entity_type: "TEAM_OR_ORG" | "CHANNEL";
    entity_id: string;
    permissions: string[];
  }
  ```
- **Notes:** For CHANNEL only marks channel permission queries stale (no direct removal).

### `user_permissions_invalidated`
- **Registrar:** single
- **Handler:** `permissionsInvalidated` (modules/eager/application/0620__HVn0.js:42710)
- **Purpose:** Permissions may have changed; client marks them stale for refetch (no direct add/remove besides the enterprise-search removal path).
- **Payload:**
  ```ts
  {
    type: "user_permissions_invalidated";
    entity_type: "TEAM_OR_ORG" | "CHANNEL";
    entity_id: string;
    permissions: string[];
  }
  ```

### `account_type_permissions_changed`
- **Registrar:** single
- **Handler:** `accountTypePermissionsChanged` (modules/eager/application/0620__HVn0.js:42711)
- **Purpose:** Permissions granted to an account type (role) changed. If the current user matches that account type, the client adds/removes the permissions locally and marks them stale.
- **Payload:**
  ```ts
  {
    type: "account_type_permissions_changed";
    entity_type: "TEAM_OR_ORG" | "CHANNEL";
    entity_id: string;
    permissions: string[];
    account_type?: string;   // TEAM_OR_ORG only; one of workspacePrimary/workspaceOwner/workspaceAdmin/orgOwner/orgAdmin/mcg/scg/member (enum constants Ph.UH / Ph.bW; exact strings unverified)
    is_allowed?: boolean;    // true = granted, false = revoked
    is_deleted?: boolean;    // used for enterprise search removal
  }
  ```
- **Notes:** CHANNEL branch only marks channel permissions stale.

### `account_type_permissions_refreshed`
- **Registrar:** single
- **Handler:** `accountTypePermissionsRefreshed` (modules/eager/application/0620__HVn0.js:42715)
- **Purpose:** Account-type permissions were refreshed server-side; client re-queries `slackAi.permissions.getForUser` for ACCESS_SLACK_AI_SLACKBOT and updates the store.
- **Payload:**
  ```ts
  {
    type: "account_type_permissions_refreshed";
    // no payload fields read
  }
  ```
- **Notes:** Skipped when `dT.gT(state)` is true (unverified meaning).

### `pin_added`
- **Registrar:** single
- **Handler:** `pinAdded` (modules/eager/application/0620__HVn0.js:42896)
- **Purpose:** An item was pinned in a channel. Client updates the pinned flag on the underlying message/file/file comment, adds it to the channel's pins list (if loaded), updates pin count and the channel's updated timestamp.
- **Payload:**
  ```ts
  {
    type: "pin_added";
    channel_id: string;
    item: {
      type: "message" | "file" | "file_comment";
      // ...full item (message/file/comment) object, passed to pin handlers
    };
    pin_count: number;
    pinned_info?: { pinned_by: string; pinned_ts: string | number };
    event_ts: string;
  }
  ```
- **Notes:** Ignored if channel unknown locally.

### `pin_removed`
- **Registrar:** single
- **Handler:** `pinRemoved` (modules/eager/application/0620__HVn0.js:42896)
- **Purpose:** An item was unpinned; client clears the pinned flag, removes from the channel's pin list, updates count.
- **Payload:**
  ```ts
  {
    type: "pin_removed";
    channel_id: string;
    item: { type: "message" | "file" | "file_comment"; /* full item */ };
    pin_count: number;
    pinned_info?: unknown;  // read but not used when unpinning
    event_ts: string;
  }
  ```

### `onboarding_pref_change`
- **Registrar:** single
- **Handler:** `onboardingPrefChange` (modules/eager/application/0620__HVn0.js:42907)
- **Purpose:** An onboarding-related user pref changed; client writes it into the prefs store.
- **Payload:**
  ```ts
  {
    type: "onboarding_pref_change";
    name: string;
    value: unknown;
  }
  ```

### `onboarding_team_pref_change`
- **Registrar:** single
- **Handler:** `onboardingTeamPrefChange` (modules/eager/application/0620__HVn0.js:42918)
- **Purpose:** An onboarding-related team pref changed; client writes it into the team prefs store.
- **Payload:**
  ```ts
  {
    type: "onboarding_team_pref_change";
    name: string;
    value: unknown;
  }
  ```

### `pref_change`
- **Registrar:** single
- **Handler:** `prefChange` (modules/eager/application/0620__HVn0.js:43184)
- **Purpose:** A user pref changed. Client stores it (parsed via `PW.Lr`) and applies pref-specific side effects (muted channels, hidden users, onboarding state, quick reactions, later/todo UI refresh, focus-mode expiration, desktop deeplink signals).
- **Payload:**
  ```ts
  {
    type: "pref_change";
    name: string;     // pref name
    value: string;    // serialized pref value (numbers e.g. focus_mode_expiration_ts are parsed with Number())
  }
  ```
- **Notes:** Ignored entirely for `media_muted`, `enable_media_captions`, and `arrow_history` (when `mE.A()`). Special handling for the muted-channels pref (JSON with `channels`, each `muted`/`temp_mute_expiration_ts`), `hidden_users` (comma-separated ids), `onboarding_state`, `desktop_deeplink_signals`, `user_customized_quick_reactions_*`, `edu_discount_opt_out`, `later_*`, `focus_mode_expiration_ts`, and a pinned-threads related pref (a4.q0).

### `team_pref_change`
- **Registrar:** single
- **Handler:** `teamPrefChange` (modules/eager/application/0620__HVn0.js:43233)
- **Purpose:** A team/org pref changed; client updates team prefs (and org/locked pref slices for known names) and triggers side effects for `who_can_dm_anyone` and `admin_customized_quick_reactions`.
- **Payload:**
  ```ts
  {
    type: "team_pref_change";
    team_id?: string;
    name: string;
    value: unknown;
  }
  ```
- **Notes:** Rejected if org-unified is off and `team_id` differs from the current team.

### `manual_presence_change`
- **Registrar:** shared
- **Handler:** `manualPresenceChange` (modules/eager/application/0620__HVn0.js:43279)
- **Purpose:** The current user's manual presence (away/auto) changed elsewhere; client applies the last event's presence to the current member.
- **Payload:**
  ```ts
  // only last msg of the batch is used
  {
    type: "manual_presence_change";
    presence: "active" | "away";  // validated by P0.o; unknown values logged as error
  }
  ```

### `presence_change`
- **Registrar:** shared
- **Handler:** `presenceChange` (modules/eager/application/0620__HVn0.js:43280)
- **Purpose:** Presence of one or more users changed; batched into a userId -> presence map and applied to the store.
- **Payload:**
  ```ts
  // handler receives Array of:
  {
    type: "presence_change";
    presence: "active" | "away"; // validated; invalid values skipped with error log
    users: string[];             // user ids
  }
  ```
- **Notes:** Events with empty/missing `users` log an error (a singular `user` form is not read here).

### `megaphone_notifications_team_refresh`
- **Registrar:** single
- **Handler:** inline arrow (modules/eager/application/0620__HVn0.js:43282)
- **Purpose:** Server asks client to refresh team-level megaphone (in-app announcement) notifications; client dispatches refresh actions and, if a channel view is open, re-requests the channel-open event for it.
- **Payload:**
  ```ts
  {
    type: "megaphone_notifications_team_refresh";
    // no payload fields read
  }
  ```

### `megaphone_notifications_user_refresh`
- **Registrar:** single
- **Handler:** inline arrow (modules/eager/application/0620__HVn0.js:43300)
- **Purpose:** Refresh user-level megaphone notifications, optionally for specific spaces.
- **Payload:**
  ```ts
  {
    type: "megaphone_notifications_user_refresh";
    spaces?: string[];  // megaphone space names; if absent, a general refresh is requested
  }
  ```

### `clear_megaphone_notification`
- **Registrar:** single
- **Handler:** inline arrow (modules/eager/application/0620__HVn0.js:43317)
- **Purpose:** Clear a megaphone notification; the whole message is passed to the clear action `a$.i0`.
- **Payload:**
  ```ts
  {
    type: "clear_megaphone_notification";
    // full msg passed through to a$.i0 (fields unverified; likely space/notification name)
  }
  ```

### `megaphone_delayed_notification_ready`
- **Registrar:** single
- **Handler:** inline arrow (modules/eager/application/0620__HVn0.js:43320)
- **Purpose:** A delayed megaphone notification is ready to show; client stores it for the given space.
- **Payload:**
  ```ts
  {
    type: "megaphone_delayed_notification_ready";
    space: string;                 // must be a known megaphone space name (av.xu values) else ignored
    notification_name: string;
    notification_data?: unknown;   // normalized by P3.A (shape unverified)
  }
  ```

### `reaction_removed`
- **Registrar:** single
- **Handler:** `reactionRemoved` (modules/eager/application/0620__HVn0.js:43378)
- **Purpose:** A reaction was removed from a message, file, or file comment; client removes the user's reaction from the store if the content is cached, and bumps channel updated-ts.
- **Payload:**
  ```ts
  {
    type: "reaction_removed";
    user: string;           // user who removed
    reaction: string;       // emoji name
    event_ts: string;
    item: {
      type: "message" | "file" | "file_comment";
      channel?: string;     // for message
      ts?: string;          // required for message
      file?: string;        // file id (file, file_comment)
      comment?: string;     // comment id (file_comment)
    };
  }
  ```
- **Notes:** Ignored unless item is in "simple format"; no-op if the target is not cached.

### `reaction_added`
- **Registrar:** shared
- **Handler:** inline arrow (modules/eager/application/0620__HVn0.js:43425)
- **Purpose:** A reaction was added. For message items, client adds the reaction to the store; if the content's author is the current user and the reactor is someone else, shows a reaction toast.
- **Payload:**
  ```ts
  // handler receives Array of:
  {
    type: "reaction_added";
    user: string;         // reactor
    reaction: string;     // emoji name
    item: { type: string; channel: string; ts: string };  // channel and ts required; only "message" processed
    item_user?: string;   // author of reacted content
    event_ts: string;
    url?: string;         // passed to reaction store/toast
  }
  ```
- **Notes:** Items without string channel/ts are logged as errors and skipped. Non-"message" types are not handled.

### `sales_home_report_run_complete`
- **Registrar:** single
- **Handler:** inline arrow (modules/eager/application/0620__HVn0.js:43490)
- **Purpose:** A Sales Home (Salesforce) report run finished; client finds the matching user insight and triggers a refresh for that report (skipping the SFDC API).
- **Payload:**
  ```ts
  {
    type: "sales_home_report_run_complete";
    report_id: string;
  }
  ```
- **Notes:** Logs an error if no insight matches `report_id`.

### `sales_home_notification_updated`
- **Registrar:** single
- **Handler:** inline arrow (modules/eager/application/0620__HVn0.js:43508)
- **Purpose:** Sales Home notification updated; client stores it keyed by creation ts.
- **Payload:**
  ```ts
  {
    type: "sales_home_notification_updated";
    notification_ts: string;
    notification_body: unknown;  // stored as `body` (shape unverified)
  }
  ```

### `saved_added`
- **Registrar:** single
- **Handler:** inline arrow (modules/eager/application/0620__HVn0.js:43574)
- **Purpose:** An item was saved for Later. Client normalizes `saved` (`Op.x`), adds it to the saved store (or replaces an optimistic item by `client_id`), decorates the cached message/file/list record/field/canvas section with saved info, and updates counts.
- **Payload:**
  ```ts
  {
    type: "saved_added";
    saved: {
      // raw saved item, normalized by Op.x into { itemType, itemId, ts?, recordId?, columnId?, sectionId?, state, ... }
      // itemType in: message | file | list_record | list_record_field | canvas_section | reminder (enum Om.ll)
      // exact raw field names unverified
    };
    client_id?: string;   // matches an optimistic local item
    counts: unknown;      // saved counts object, passed to Oy.L
  }
  ```

### `saved_updated`
- **Registrar:** single
- **Handler:** inline arrow (modules/eager/application/0620__HVn0.js:43645)
- **Purpose:** A saved item was modified (e.g. completed, due date, archived). Client replaces the item in the store and refreshes saved decoration on the underlying message/file/list/canvas, and updates counts.
- **Payload:**
  ```ts
  {
    type: "saved_updated";
    saved: { /* raw saved item, normalized by Op.x (same shape as saved_added) */ };
    counts: unknown;
  }
  ```

### `saved_deleted`
- **Registrar:** single
- **Handler:** inline arrow (modules/eager/application/0620__HVn0.js:43713)
- **Purpose:** A saved item was removed. Client deletes it from the saved store and strips saved decoration from the underlying message/file/list record/field/canvas section; updates counts.
- **Payload:**
  ```ts
  {
    type: "saved_deleted";
    saved: {
      item_id: string;     // channel id for messages, file/list id otherwise
      item_type: "message" | "file" | "list_record" | "list_record_field" | "canvas_section" | "reminder"; // values per Om.ll enum (strings inferred)
      item_detail?: string; // columnId (list_record_field) or sectionId (canvas_section)
      ts?: string;          // message ts or record id
    };
    counts: unknown;
  }
  ```

### `saved_due`
- **Registrar:** single
- **Handler:** `handleSavedDue` (modules/eager/application/0620__HVn0.js:43769)
- **Purpose:** A saved item's reminder is due. Client ensures the item is in the store, fetches related files/channels/messages, then (subject to notification prefs) shows a Later desktop notification and updates counts.
- **Payload:**
  ```ts
  {
    type: "saved_due";
    saved: { /* raw saved item, normalized by Op.x (itemType, itemId, ts, state, ...) */ };
    counts: unknown;
  }
  ```

### `saved_clear`
- **Registrar:** single
- **Handler:** inline arrow (modules/eager/application/0620__HVn0.js:43770)
- **Purpose:** Saved items cleared; client dispatches a clear action for the Later view/store (`PY.IU`).
- **Payload:**
  ```ts
  {
    type: "saved_clear";
    // no payload fields read (message only logged)
  }
  ```

### `search_frecency`
- **Registrar:** single
- **Handler:** `handleSearchFrecencyPrefsUpdate` (modules/eager/application/0620__HVn0.js:43806)
- **Purpose:** Search frecency prefs changed server-side; client refetches the frecency prefs (deduped in-flight) and updates the prefs store.
- **Payload:**
  ```ts
  {
    type: "search_frecency";
    value: "updated";   // only this value triggers a refetch
  }
  ```

### `search_recents`
- **Registrar:** single
- **Handler:** `handleSearchRecentsPrefsUpdate` (modules/eager/application/0620__HVn0.js:43839)
- **Purpose:** Recent-searches pref changed server-side; client refetches the recents pref and updates prefs store.
- **Payload:**
  ```ts
  {
    type: "search_recents";
    value: "updated";
  }
  ```
- **Notes:** Gated by a search feature check `Pd.OP(state)`.

### `slackbot_ai_project_updated`
- **Registrar:** single
- **Handler:** `handleSlackbotAiProjectUpdated` (modules/eager/application/0620__HVn0.js:43870)
- **Purpose:** A Slackbot AI project was created, updated, deleted, or had a thread added/removed; client updates the projects store and thread->project mapping.
- **Payload:**
  ```ts
  {
    type: "slackbot_ai_project_updated";
    action: "created" | "updated" | "deleted" | "thread_added" | "thread_removed";
    project_id?: string;                     // deleted / thread_added / thread_removed
    thread?: { channel_id: string; thread_ts: string }; // thread_* actions
    project?: {                              // created / updated
      id: string;
      name: string;
      description?: string;
      system_prompt?: string;
      date_created?: number;
      date_updated?: number;
    };
  }
  ```
- **Notes:** created/updated ignored unless `project.id` and `project.name` present.

### `skill_added`
- **Registrar:** single
- **Handler:** `handleSkillAdded` (modules/eager/application/0620__HVn0.js:43878)
- **Purpose:** A skill (AI skill file) was added; client adds an entry with that file id to the skills store.
- **Payload:**
  ```ts
  {
    type: "skill_added";
    skill_file_id: string;
  }
  ```
### `skill_state_changed`
- **Registrar:** single
- **Handler:** `handleSkillStateChanged` (modules/eager/application/0620__HVn0.js:43879)
- **Purpose:** Server says a Slackbot skill was enabled/disabled; client dispatches an action to update that skill's disabled flag in the store.
- **Payload:**
  ```ts
  {
    type: "skill_state_changed";
    skill_file_id: string; // skill file id -> skillId
    is_disabled: boolean;  // new disabled state
  }
  ```

### `slackbot_memories_import_completed`
- **Registrar:** single
- **Handler:** `handleSlackbotMemoriesImportCompleted` (modules/eager/application/0620__HVn0.js:44894)
- **Purpose:** Result of an async Slackbot memories import; client stores the result object in state (to show success/error UI).
- **Payload:**
  ```ts
  {
    type: "slackbot_memories_import_completed";
    ok: boolean;
    imported_count?: number;  // default 0
    skipped_count?: number;   // default 0
    is_cap_reached?: boolean; // default false
    error?: string;           // present on failure (inferred string)
  }
  ```

### `open_agent_conversation`
- **Registrar:** single
- **Handler:** `handleOpenAgentConversation` (modules/eager/application/0620__HVn0.js:44136)
- **Purpose:** A workflow "send to agent" step asks this client to open an agent conversation. For a 3p agent it posts `prompt_blocks` as a DM to the agent and navigates to the thread; otherwise it opens the Slackbot DM in split view and sends the prompt as a Slackbot AI message. Afterwards it calls `functions.workflows.executions.confirmDelivery` with delivered true/false.
- **Payload:**
  ```ts
  {
    type: "open_agent_conversation";
    client_token?: string;          // if set, must be in the client's pending-token queue, else discarded
    timeout_ms?: number;            // if token age >= this, treated as expired (delivered=false)
    agent_user_id?: string;         // if set: third-party agent flow (DM with that agent); else Slackbot flow
    prompt_blocks: object[];        // Block Kit blocks; posted as message blocks (3p) or converted to delta (Slackbot)
    workflow_id?: string;           // sent in client_context for Slackbot flow
    function_execution_id?: string; // if set, confirmDelivery is called and thread is linked to the execution
  }
  ```
- **Notes:** Response from confirmDelivery (`workflow_name`, `is_continuable`) is used to register a continuable thread. Without function_execution_id no confirmation is made.

### `slack_connect_guidelines_updated`
- **Registrar:** single
- **Handler:** `handleGuidelinesUpdate` (modules/eager/application/0620__HVn0.js:44161)
- **Purpose:** Slack Connect guidelines of a given type changed; client invalidates/refetches them for the current team (via `OP.Sc(teamId, guideline_type)`; exact behavior unverified).
- **Payload:**
  ```ts
  {
    type: "slack_connect_guidelines_updated";
    guideline_type: string; // which guideline set changed (enum values not visible)
  }
  ```

### `slack_connect_pref_changed`
- **Registrar:** single
- **Handler:** `handleSlackConnectPrefsUpdate` (modules/eager/application/0620__HVn0.js:44162)
- **Purpose:** A Slack Connect workspace pref changed; for certain prefs the client runs `handlePrefUpdated`, which collects the ids of the connected-channel-type channels in state and passes them with the team id to `jP.YO` (likely marks those channel objects stale/refetch; unverified).
- **Payload:**
  ```ts
  {
    type: "slack_connect_pref_changed";
    pref_name: "allow_sc_file_uploads" | "external_awareness_context_bar" | "shared_channel_invite_requested" | string;
  }
  ```
- **Notes:** Other pref_name values are ignored.

### `solution_started`
- **Registrar:** single
- **Handler:** anonymous arrow (modules/eager/application/0620__HVn0.js:44164)
- **Purpose:** Solution (template) provisioning started for a channel; client sets the channel's provisioning state to `{templateId}`.
- **Payload:**
  ```ts
  {
    type: "solution_started";
    solution: {
      channel_id: string;
      channel_template_id: string;
    };
  }
  ```

### `solution_completed`
- **Registrar:** single
- **Handler:** anonymous arrow (modules/eager/application/0620__HVn0.js:44172)
- **Purpose:** Solution provisioning finished; client sets provisioning state to `{templateId, complete:true}` or `{templateId, error}` and emits a SOLUTIONS_SETUP tracking event.
- **Payload:**
  ```ts
  {
    type: "solution_completed";
    solution: {
      channel_id: string;
      channel_template_id: string;
    };
    error?: string; // if truthy -> failure (provisioning_error), else success
  }
  ```
- **Notes:** State update happens only if the selector `gA.L6(state, channel_id)` is truthy (channel is tracked for provisioning); tracking only if `gA.iX` returns a tracking id.

### `solution_template_deleted`
- **Registrar:** single
- **Handler:** anonymous arrow (modules/eager/application/0620__HVn0.js:44211)
- **Purpose:** A solution template was deleted; client removes it from store.
- **Payload:**
  ```ts
  {
    type: "solution_template_deleted";
    template_id: string;
  }
  ```

### `solution_template_updated`
- **Registrar:** single
- **Handler:** anonymous arrow (modules/eager/application/0620__HVn0.js:44214)
- **Purpose:** A solution template changed; client marks that object stale in the current team's object cache so it is refetched.
- **Payload:**
  ```ts
  {
    type: "solution_template_updated";
    template_id: string;
  }
  ```

### `solution_assets_created`
- **Registrar:** single
- **Handler:** anonymous arrow (modules/eager/application/0620__HVn0.js:44219)
- **Purpose:** Assets for a solution were created; client dispatches an action with reason "solutions_rtm_assets_created" (a refresh of assets; exact action unverified).
- **Payload:**
  ```ts
  {
    type: "solution_assets_created";
    // no fields read
  }
  ```

### `star_added`
- **Registrar:** single
- **Handler:** anonymous arrow (modules/eager/application/0620__HVn0.js:44229)
- **Purpose:** An item was starred (saved); client adds it to the stars store and updates the relevant object (message, file or channel starred state).
- **Payload:**
  ```ts
  {
    type: "star_added";
    item: {
      type: "message" | "file" | "channel" | "im" | "group"; // constants OB/OU/OH/OV (values inferred from classic Slack)
      channel?: string;  // channel id (message and channel/im/group items)
      message?: object;  // full message object; imported as imsg then message-store action
      file?: object;     // full file object, passed to file-store action
    };
  }
  ```
- **Notes:** If `item` missing, logs and returns. Constant values OB/OU/OH/OV not resolved (unverified).

### `star_removed`
- **Registrar:** single
- **Handler:** anonymous arrow (modules/eager/application/0620__HVn0.js:44256)
- **Purpose:** An item was unstarred; client removes it from stars and clears starred state on the message (`is_starred:false`), file or channel.
- **Payload:**
  ```ts
  {
    type: "star_removed";
    item: {
      type: "message" | "file" | "channel" | "im" | "group"; // see star_added
      channel?: string;
      message?: object;       // full message object
      file?: { id: string; }; // only id is read
    };
  }
  ```

### `accounts_changed`
- **Registrar:** single
- **Handler:** `accountsChanged` (modules/eager/application/0620__HVn0.js:44505)
- **Purpose:** The signed-in accounts set changed (multi-workspace/desktop); if running in the multi-workspace client, the client refetches auth/accounts and records the event timestamp.
- **Payload:**
  ```ts
  {
    type: "accounts_changed";
    event_ts?: string; // parseInt'd, 0 if missing
  }
  ```
- **Notes:** Only acts when `mE.A()` (multi-workspace client check) is true.

### `user_added_to_team`
- **Registrar:** single
- **Handler:** `addedToTeam` (modules/eager/application/0620__HVn0.js:44506)
- **Purpose:** Current (enterprise) user was added to a workspace; client adds team id to enterprise_user.teams in member store and refetches auth for that team.
- **Payload:**
  ```ts
  {
    type: "user_added_to_team";
    team_id: string;
  }
  ```
- **Notes:** Only in multi-workspace client (`mE.A()`).

### `user_removed_from_team`
- **Registrar:** single
- **Handler:** `removedFromTeam` (modules/eager/application/0620__HVn0.js:44507)
- **Purpose:** Current user removed from a workspace; client removes the team id from enterprise_user.teams, then either opens a "removed from workspace" modal (when flags allow) or refetches auth if the team is relevant (known team in multi-workspace, or equals current team).
- **Payload:**
  ```ts
  {
    type: "user_removed_from_team";
    team_id: string;
  }
  ```

### `team_plan_change`
- **Registrar:** single
- **Handler:** `teamPlanChanged` (modules/eager/application/0620__HVn0.js:44508)
- **Purpose:** Workspace billing plan changed; client updates the team's plan/can_add_ura, refetches plan-dependent data (several refetch thunks), applies paid_features, and for PLUS shows plan-specific UI; dismisses a Slack Connect launch modal pref when relevant.
- **Payload:**
  ```ts
  {
    type: "team_plan_change";
    plan: string;            // plan enum (ix.F2: FREE, STD, PLUS, ... exact strings unverified)
    can_add_ura?: boolean;   // stored on team
    paid_features?: object;  // passed to a paid-features store action (shape unseen)
  }
  ```

### `team_plan_freeze_state_changed`
- **Registrar:** single
- **Handler:** `teamPlanFreezeStateChanged` (modules/eager/application/0620__HVn0.js:44509)
- **Purpose:** Plan frozen/unfrozen; client stores the flag and dispatches a refetch (`O1.uJ`).
- **Payload:**
  ```ts
  {
    type: "team_plan_freeze_state_changed";
    is_plan_frozen: boolean;
  }
  ```

### `team_rename`
- **Registrar:** single
- **Handler:** `teamRenamed` (modules/eager/application/0620__HVn0.js:44510)
- **Purpose:** Workspace renamed; client updates team name in store, and if it is the current team also updates the displayed name (`y4.ec1`, e.g. document title/UI).
- **Payload:**
  ```ts
  {
    type: "team_rename";
    name: string;
    team_id?: string;     // target team; falls back to source_team, then current team id
    source_team?: string;
  }
  ```

### `team_icon_change`
- **Registrar:** single
- **Handler:** `teamIconChanged` (modules/eager/application/0620__HVn0.js:44511)
- **Purpose:** Workspace icon changed; client updates icon for the team in store.
- **Payload:**
  ```ts
  {
    type: "team_icon_change";
    icon: object;         // team icon object (image_* urls, image_default), stored as-is
    team_id?: string;     // falls back to source_team, then current team
    source_team?: string;
  }
  ```

### `team_profile_reorder`
- **Registrar:** single
- **Handler:** `teamProfileReorder` (modules/eager/application/0620__HVn0.js:44512)
- **Purpose:** Custom profile fields were reordered; client updates the team profile field list.
- **Payload:**
  ```ts
  {
    type: "team_profile_reorder";
    profile: { fields: object[] }; // full field definitions in new order (shape unseen)
  }
  ```

### `team_profile_change`
- **Registrar:** single
- **Handler:** `teamProfileChanged` (modules/eager/application/0620__HVn0.js:44513)
- **Purpose:** Custom profile fields added/changed; client merges them into team profile field store.
- **Payload:**
  ```ts
  {
    type: "team_profile_change";
    profile: { fields: object[] }; // changed field definitions (passed through, shape unseen)
  }
  ```

### `team_profile_delete`
- **Registrar:** single
- **Handler:** `teamProfileDelete` (modules/eager/application/0620__HVn0.js:44514)
- **Purpose:** Custom profile fields deleted; client removes them from the team profile fields and strips the corresponding values from all cached user profiles.
- **Payload:**
  ```ts
  {
    type: "team_profile_delete";
    profile: { fields: string[] }; // ids of deleted fields (used as keys into user.profile.fields)
  }
  ```

### `email_domain_changed`
- **Registrar:** single
- **Handler:** `teamEmailDomainChanged` (modules/eager/application/0620__HVn0.js:44515)
- **Purpose:** Workspace email domain(s) changed; client updates `email_domain` on the current team object.
- **Payload:**
  ```ts
  {
    type: "email_domain_changed";
    email_domain: string; // comma-separated domains (inferred)
  }
  ```

### `team_domain_change`
- **Registrar:** single
- **Handler:** `teamDomainChanged` (modules/eager/application/0620__HVn0.js:44516)
- **Purpose:** Workspace subdomain/URL changed; client updates domain and url on the team, updates the stored URL (`y4.v1z`) and notifies a registered callback.
- **Payload:**
  ```ts
  {
    type: "team_domain_change";
    domain: string;
    url: string;        // new workspace URL
    team_id?: string;   // ignored unless absent or equals current team
  }
  ```

### `team_connection_severed`
- **Registrar:** single
- **Handler:** `teamConnectionSevered` (modules/eager/application/0620__HVn0.js:44517)
- **Purpose:** Connections to other teams were severed; for each team id other than the current team, client dispatches `OK.P8({teamId})` (removing/clearing that team's connection data; exact effect unverified).
- **Payload:**
  ```ts
  {
    type: "team_connection_severed";
    team_ids: string[];
  }
  ```

### `team_verified_changed`
- **Registrar:** single
- **Handler:** `teamVerifiedChanged` (modules/eager/application/0620__HVn0.js:44518)
- **Purpose:** Workspace verified status changed; client updates `is_verified` and `public_url` on the team (current team, or the one named by source_team).
- **Payload:**
  ```ts
  {
    type: "team_verified_changed";
    is_verified: boolean;
    public_url?: string;  // required for verified to stay true; cleared when not verified
    source_team?: string; // target team if not the current one
  }
  ```

### `migration_unblocked`
- **Registrar:** single
- **Handler:** `migrationUnblocked` (modules/eager/application/0620__HVn0.js:44519)
- **Purpose:** Enterprise migration completed; client shows a "refresh to continue" banner (dispatches `OZ.o(true)`).
- **Payload:**
  ```ts
  {
    type: "migration_unblocked";
    enterprise_id: string; // only logged
  }
  ```

### `team_description_changed`
- **Registrar:** single
- **Handler:** anonymous arrow (modules/eager/application/0620__HVn0.js:44549)
- **Purpose:** Workspace description changed; client updates `description` on that team in store (only if team is known).
- **Payload:**
  ```ts
  {
    type: "team_description_changed";
    team_id: string;
    description: string;
  }
  ```

### `desync`
- **Registrar:** single
- **Handler:** `desync` (modules/eager/application/0620__HVn0.js:44715)
- **Purpose:** Channel topics for given channels are out of date on the server; client marks them desynced (filtering out those already desynced/known) so they are refetched lazily.
- **Payload:**
  ```ts
  {
    type: "desync";
    channel_ids?: string[]; // default []
  }
  ```

### `resync`
- **Registrar:** single
- **Handler:** `resync` (modules/eager/application/0620__HVn0.js:44716)
- **Purpose:** Channel topics should be resynced; client adds these channel ids to the team's tracked list and triggers a sync (`Du.Wz`, `Dm`).
- **Payload:**
  ```ts
  {
    type: "resync";
    channel_ids?: string[]; // default []
  }
  ```
- **Notes:** Semantics of Du/Dm inferred (topic subscription list); unverified.

### `user_alert`
- **Registrar:** single
- **Handler:** `userAlertRtmHandler` (modules/eager/application/0620__HVn0.js:44845)
- **Purpose:** Generic per-user alert that bumps an alert/badge count and (for Slack Connect invites) updates invites state and the activity feed. Switches on `alert_type`.
- **Payload:**
  ```ts
  {
    type: "user_alert";
    alert_type: string; // Dy.e enum: shared_workspace_invite (no-op), external_channel_invite, external_dm_invite, sales_home_notification, lists_user_mentioned, lists_record_assigned, lists_todo_notification, lists_record_edited, huddles_missed_huddle, saved_reminder, calendar_upcoming_event, unjoined_channel_mention, lists_approval_request, lists_approval_reviewed, team_joiner_invite, generic_system_alert, prejoin_dm_welcome_party_alert, quietly_added_to_channel (snake_case values inferred from member names; unverified)
    unread_count: number;
    event_ts?: string;  // used as feed_ts / messageTs for invite feed items
    external_dm_invite?: ExternalInvite;      // when alert_type=external_dm_invite
    external_channel_invite?: ExternalInvite; // when alert_type=external_channel_invite
  }
  type ExternalInvite = {
    action: string;        // "invite_received"-like constant D_, Dg ("invite_declined"?), "invite_accepted" | "invite_approved" | "invite_rejected" | "invite_expired" | "invite_removed"
    invite_id: string;
    connect_invite?: object; // full Connect invite object stored in invites store
  };
  ```
- **Notes:** Output was truncated in the dossier for the activity feed helper; D_/Dg constants not resolved. Unknown alert_type hits an exhaustiveness helper. The count is stored via `Db.g6({alertType, unreadCount})`.

### `user_alert_notification`
- **Registrar:** single
- **Handler:** `user_alert_notifications_maybeShowNotification` (modules/eager/application/0620__HVn0.js:44846)
- **Purpose:** Asks the client to show a desktop/web notification for an alert. Only for `prejoin_dm_welcome_party_alert` (web push, unless suppressed), `unjoined_channel_mention`, and `generic_system_alert`.
- **Payload:**
  ```ts
  {
    type: "user_alert_notification";
    alert_type: "prejoin_dm_welcome_party_alert" | "unjoined_channel_mention" | "generic_system_alert" | string;
    // prejoin_dm_welcome_party_alert:
    title?: string;
    body?: string;
    deeplink_url?: string;
    notification_id?: string;
    // unjoined_channel_mention / generic_system_alert: entire msg passed to notification thunks (fields unseen)
  }
  ```
- **Notes:** Gated by a user-signed-in/notifications selector (`rR.TZ`) and, for non-welcome alerts, by `fx.zO`.

### `subteam_updated`
- **Registrar:** single
- **Handler:** `subteamUpdated` (modules/eager/application/0620__HVn0.js:44923)
- **Purpose:** A user group (subteam) was edited; client merges the new group into the user-groups store only if the group is already known, keeping its existing `users` list.
- **Payload:**
  ```ts
  {
    type: "subteam_updated";
    subteam: { id: string; /* full user group object, passed through */ };
  }
  ```

### `subteam_members_changed`
- **Registrar:** single
- **Handler:** `subteamMembersChanged` (modules/eager/application/0620__HVn0.js:44924)
- **Purpose:** Membership of a user group changed; client applies the added/removed lists to the known group's `users`.
- **Payload:**
  ```ts
  {
    type: "subteam_members_changed";
    subteam_id: string;
    added_users?: string[];   // default []
    removed_users?: string[]; // default []
  }
  ```
- **Notes:** Ignored in multi-workspace client (`mE.A()`); warns on unknown group.

### `subteam_created`
- **Registrar:** single
- **Handler:** `subteamCreated` (modules/eager/application/0620__HVn0.js:44925)
- **Purpose:** New user group; client adds it to the user-groups store.
- **Payload:**
  ```ts
  {
    type: "subteam_created";
    subteam: object; // full user group object, passed through
  }
  ```

### `subteam_deleted`
- **Registrar:** single
- **Handler:** `subteamDeleted` (modules/eager/application/0620__HVn0.js:44926)
- **Purpose:** User group deleted; client removes it from the store.
- **Payload:**
  ```ts
  {
    type: "subteam_deleted";
    subteam: { id: string };
  }
  ```

### `subteam_self_added`
- **Registrar:** single
- **Handler:** `subteamSelfAdded` (modules/eager/application/0620__HVn0.js:44927)
- **Purpose:** Current user was added to a user group; client adds self as member and sets `isMember: true` for that group.
- **Payload:**
  ```ts
  {
    type: "subteam_self_added";
    subteam_id: string;
  }
  ```

### `subteam_self_removed`
- **Registrar:** single
- **Handler:** `subteamSelfRemoved` (modules/eager/application/0620__HVn0.js:44928)
- **Purpose:** Current user removed from a user group; client removes self from the group and sets `isMember: false`.
- **Payload:**
  ```ts
  {
    type: "subteam_self_removed";
    subteam_id: string;
  }
  ```

### `user_interaction_changed`
- **Registrar:** single
- **Handler:** anonymous arrow (modules/eager/application/0620__HVn0.js:44930)
- **Purpose:** A user-interaction record (frequent-contact/interaction signal) changed; client camel-cases it and stores it.
- **Payload:**
  ```ts
  {
    type: "user_interaction_changed";
    interaction: object; // full interaction object, passed through hI.XK (snake->camel) to store (fields unseen)
  }
  ```

### `ai_summary_trigger`
- **Registrar:** single
- **Handler:** `handleAiSummaryTrigger` (modules/eager/application/0620__HVn0.js:45551)
- **Purpose:** Server announces a Slack AI summary/answer is starting for a client request; client creates a pending search or canvas summary entry, updates remaining samples, and shows the AI NFX component.
- **Payload:**
  ```ts
  {
    type: "ai_summary_trigger";
    summary_id?: string;
    has_summary?: boolean;
    client_req_id?: string;
    num_samples_remaining?: number; // remaining AI search samples
    focused_section_id?: string;    // canvas type only
    summary_metadata?: {
      type?: "search" | "canvas" | string;
      is_keywords?: boolean;
      query?: string;                 // search query, or canvas prompt
      has_source_different_from_user_lang?: boolean;
      search_ai_feature?: string;
    };
  }
  ```
- **Notes:** If neither search nor canvas with summary_id, and `has_summary` false, creates a placeholder keyword-search summary with a client-generated id.

### `ai_summary_started`
- **Registrar:** single
- **Handler:** `handleAiSummaryStart` (modules/eager/application/0620__HVn0.js:45552)
- **Purpose:** Summary generation started; only acted on for a channel-join summary (push summary), where the client registers a channel summary entry and fires an event.
- **Payload:**
  ```ts
  {
    type: "ai_summary_started";
    summary_id: string;
    summary_metadata: {
      type: "channel" | string;
      channel?: { type: "channel_join" | string };
      channel_id?: string;
      has_source_different_from_user_lang?: boolean;
    };
  }
  ```

### `ai_summary_completed`
- **Registrar:** single
- **Handler:** `handleAiSummaryCompletion` (modules/eager/application/0620__HVn0.js:45553)
- **Purpose:** Final result of a Slack AI summary; client branches on `summary.metadata.type` (crm_email_draft, ai_explain, search, canvas, today_topic, composer, else channel/thread/recap summary) and stores content/status/errors.
- **Payload:**
  ```ts
  {
    type: "ai_summary_completed";
    event_ts?: string; // today_topic: floor(parseFloat) -> dateUpdated
    summary: {
      id: string;
      ai_context_result_status: "complete" | "no_answer" | "failed" | "pending" | string;
      error?: string;                // e.g. "channel_excluded"
      suggested_prompts?: string[];  // search (inferred)
      result?: {
        text?: string;
        blocks?: object[];
        description_blocks?: object[];                          // channel/thread
        topics?: { id: string; topic?: string; blocks?: object[] }[];
      };
      file_sources?: object[];       // canvas
      message_sources?: object[];    // canvas
      metadata?: {
        type?: "crm_email_draft" | "ai_explain" | "search" | "canvas" | "today_topic" | "composer" | string; // other => channel/thread summary
        channel_id?: string;
        thread?: { start_ts: string; end_ts?: string };
        channel?: { thread_count?: number; start_ts?: string; end_ts?: string };
        is_keywords?: boolean;
        query?: string;               // search/canvas prompt
        relevant_entities?: object;
        has_source_different_from_user_lang?: boolean;
        message_count?: number;
        file_count?: number;
        info_message?: string;
        canvas?: { id: string };      // canvas file id; id "SLACKBOT_CANVAS_AUTO_OPEN" special-cases auto-opening the canvas
        most_active_users?: unknown;
        total_involved_users?: unknown;
        total_message_count?: number;
        channels?: object[];
      };
    };
  }
  ```
- **Notes:** Handler source was truncated in the dossier near the end of the channel/thread branch, so remaining fields there are unverified. For ai_explain, ignored unless the summary id is known locally.

### `ai_summary_tokens_added`
- **Registrar:** single
- **Handler:** `handleAiSummaryTokensAdded` (modules/eager/application/0620__HVn0.js:45554)
- **Purpose:** Streaming partial result of a summary; client updates the in-progress summary (channel/recap, thread, search, canvas content creation, composer, ai_explain, crm_email_draft) with the text so far.
- **Payload:**
  ```ts
  {
    type: "ai_summary_tokens_added";
    summary_metadata?: { total_message_count?: number };
    summary: {
      id: string;
      ai_context_result_status: "pending" | "complete" | "no_answer" | string; // pending => in progress
      error?: string;
      result?: {
        text?: string;
        blocks?: object[];
        topics?: { id: string; topic?: string; blocks?: object[] }[];
      };
      metadata?: {
        type?: "crm_email_draft" | "ai_explain" | "composer" | string;
        message_count?: number;
        total_message_count?: number;
        file_count?: number;
        info_message?: string;
        channels?: object[];
        relevant_entities?: object;
      };
    };
  }
  ```
- **Notes:** Skipped when the `a11y_animations` setting is on or `slack_ai_channel_thread_summary_streaming_disabled` flag is on (except crm_email_draft and ai_explain which return earlier). Only processes status pending or error.

### `ai_tool_status`
- **Registrar:** single
- **Handler:** `handleAiToolStatus` (modules/eager/application/0620__HVn0.js:45555)
- **Purpose:** Status/progress text for a running AI tool; client shows it for CRM tasks, search-answers summaries or ai_explain.
- **Payload:**
  ```ts
  {
    type: "ai_tool_status";
    source: "slack_crm" | "slackbot_ai_search_answers" | "slackbot_search_answers" | "ai_explain" | string;
    task_id?: string;
    text?: string;       // status text
    blocks?: object[];   // CRM blocks / ai_explain tool progress
  }
  ```

### `ai_assistant_progress`
- **Registrar:** single
- **Handler:** `handleAiAssistantProgress` (modules/eager/application/0620__HVn0.js:45756)
- **Purpose:** Tool output from the AI assistant. For `list_refinements` (when pref `ai_assistant_lists` is "on") it applies filters/sorts to the current list view; when a canvas AI feature is on and a `preview_canvas_update` output arrives, it dispatches a canvas preview update.
- **Payload:**
  ```ts
  {
    type: "ai_assistant_progress";
    source?: "list_refinements" | string;
    status?: "output_available" | string;
    payload?: string; // JSON string: { result: string (JSON), arguments?: { section_id } }
                      // list_refinements result: { refinements: { listId, filters?, sorts? } }
                      // canvas result: { ui_action: "preview_canvas_update", canvas_id, content, section_id_mapping: object }
    event_ts?: string; // must be truthy for canvas preview branch
  }
  ```
- **Notes:** JSON parse errors are swallowed.

### `ai_assistant_status`
- **Registrar:** single
- **Handler:** `handleAiAssistantStatus` (modules/eager/application/0620__HVn0.js:45757)
- **Purpose:** Typing/status indicator for an AI assistant (app agent) in a thread/channel; client shows status, loading messages and identity, or clears it when status empty. May also auto-open the thread in a split view if the user just created an empty thread.
- **Payload:**
  ```ts
  {
    type: "ai_assistant_status";
    bot_user_id: string;      // required, else ignored
    channel_id: string;
    thread_ts?: string;
    status?: string;          // empty/absent clears the indicator
    status_type?: string;     // enum unseen
    is_using_sessions?: boolean; // if true, status cleared/ignored for this key
    loading_messages?: string[]; // (inferred)
    username?: string;
    icon_emoji?: string;
    icon_url?: string;
  }
  ```
- **Notes:** Ignored unless AI assistant feature enabled (`Mh.wP`). Thread key is `channel_id-thread_ts` (or just channel_id with the animated streaming flag and no thread_ts).

### `ai_assistant_threads_suggested_prompts`
- **Registrar:** single
- **Handler:** `handleAiAssistantThreadsSuggestedPrompts` (modules/eager/application/0620__HVn0.js:45758)
- **Purpose:** Suggested prompts for an assistant thread/DM; client stores them by thread key, or by agent channel, or for the assistant DM channel.
- **Payload:**
  ```ts
  {
    type: "ai_assistant_threads_suggested_prompts";
    channel_id: string;
    thread_ts?: string;
    prompts: { title?: string; message?: string }[]; // inferred, passed through
    title?: string;
    bot_user_id?: string;
  }
  ```

### `ai_digest_ready`
- **Registrar:** single
- **Handler:** `handleAiDigestReady` (modules/eager/application/0620__HVn0.js:45829)
- **Purpose:** A new AI daily digest is ready; client refetches the digest (and additional data when a second flag is on) and clears the "loading" flags.
- **Payload:**
  ```ts
  {
    type: "ai_digest_ready";
    // no fields read
  }
  ```
- **Notes:** Gated by digest feature selector `ad.hS`.

### `ai_digest_channels_added`
- **Registrar:** single
- **Handler:** `handleAiDigestChannelsAdded` (modules/eager/application/0620__HVn0.js:45830)
- **Purpose:** Channels were added to the digest; client updates digest channel selection.
- **Payload:**
  ```ts
  {
    type: "ai_digest_channels_added";
    channel_ids: string[];
  }
  ```

### `ai_digest_channels_removed`
- **Registrar:** single
- **Handler:** `handleAiDigestChannelsRemoved` (modules/eager/application/0620__HVn0.js:45831)
- **Purpose:** Channels were removed from the digest; client updates selection.
- **Payload:**
  ```ts
  {
    type: "ai_digest_channels_removed";
    channel_ids: string[];
  }
  ```

### `ai_digest_marked_read`
- **Registrar:** single
- **Handler:** `handleAiDigestMarkedRead` (modules/eager/application/0620__HVn0.js:45832)
- **Purpose:** A daily digest was marked read (from another client); client sets read state true.
- **Payload:**
  ```ts
  {
    type: "ai_digest_marked_read";
    digest_id: string;
  }
  ```

### `ai_digest_marked_unread`
- **Registrar:** single
- **Handler:** `handleAiDigestMarkedUnread` (modules/eager/application/0620__HVn0.js:45833)
- **Purpose:** A daily digest was marked unread; client sets read state false.
- **Payload:**
  ```ts
  {
    type: "ai_digest_marked_unread";
    digest_id: string;
  }
  ```

### `ai_digest_channels_marked_read`
- **Registrar:** single
- **Handler:** `handleAiDigestChannelsMarkedRead` (modules/eager/application/0620__HVn0.js:45834)
- **Purpose:** Specific channel digests marked read; client sets both read and interacted state true for each.
- **Payload:**
  ```ts
  {
    type: "ai_digest_channels_marked_read";
    digest_id: string;
    channel_digest_ids: string[];
  }
  ```

### `ai_digest_channels_marked_unread`
- **Registrar:** single
- **Handler:** `handleAiDigestChannelsMarkedUnread` (modules/eager/application/0620__HVn0.js:45838)
- **Purpose:** Specific channel digests marked unread; client sets read state false (interacted state untouched).
- **Payload:**
  ```ts
  {
    type: "ai_digest_channels_marked_unread";
    digest_id: string;
    channel_digest_ids: string[];
  }
  ```

### `ai_digest_channel_summary_ready`
- **Registrar:** single
- **Handler:** `handleAiDigestChannelSummaryReady` (modules/eager/application/0620__HVn0.js:45842)
- **Purpose:** A single channel's digest summary finished generating; client adds it to the digest, removes the channel from the pending list and marks it done.
- **Payload:**
  ```ts
  {
    type: "ai_digest_channel_summary_ready";
    digest_id: string;
    channel_digest: {
      channel_id: string;
      // rest: full channel digest object, camel-cased and stored (fields unseen)
    };
  }
  ```
- **Notes:** Requires both digest flags (`ad.hS` and `ad.YX`).

### `ai_provision_changed`
- **Registrar:** single
- **Handler:** `handleAiProvisionChanged` (modules/eager/application/0620__HVn0.js:45850)
- **Purpose:** Slack AI was enabled/disabled for the user; client updates `isSlackAiEnabled`.
- **Payload:**
  ```ts
  {
    type: "ai_provision_changed";
    enabled: boolean;
  }
  ```

### `huddle_invite`
- **Registrar:** single
- **Handler:** `huddleInviteRtmHandler` (modules/eager/application/0620__HVn0.js:46514)
- **Purpose:** The user was invited to a huddle; client records the pending invite, optionally pre-joins the huddle (using media credentials), shows a notification, and after 30s shows a "Huddle missed" notification if still pending.
- **Payload:**
  ```ts
  {
    type: "huddle_invite";
    channel_id: string;
    call_id: string;
    sender_user_id: string;
    team_id?: string;     // team of the invite
    free_willy?: object;  // media-server join credentials (passed through as mediaServerCredentials / joinCredentials)
  }
  ```
- **Notes:** Only handled in the desktop/huddle-capable client (`mE.A()` true). Ignored if channel is a suppressed org channel, or if already in/invited to this huddle. If user is already waiting to join this channel, `free_willy` auto-accepts. Notification may be suppressed by notification prefs for the channel.
### `huddle_invite_cancel`
- **Registrar:** single
- **Handler:** `huddleInviteCancelRtmHandler` (modules/eager/application/0620__HVn0.js:46515)
- **Purpose:** Server cancels a pending huddle invite for a channel. Client (only if huddles are enabled and the feature gate passes) logs and dispatches a client-store action (`L_.u8`) to cancel/dismiss the invite for that channel.
- **Payload:**
  ```ts
  {
    type: "huddle_invite_cancel";
    channel_id: string; // channel whose huddle invite is cancelled
  }
  ```
- **Notes:** Ignored unless `tI.pt(state)` and `mE.A()` pass. The action body (`L_.u8`) was not opened (unverified beyond channel_id).

### `huddle_recommend`
- **Registrar:** single
- **Handler:** `huddleRecommendRtmHandler` (modules/eager/application/0620__HVn0.js:46516)
- **Purpose:** Server recommends joining an ongoing huddle in a channel. Client shows a huddle-recommendation notification unless it is already in that huddle or notifications are suppressed.
- **Payload:**
  ```ts
  {
    type: "huddle_recommend";
    channel_id: string;       // channel with the active huddle
    talking_users?: string[]; // user ids currently talking (inferred), passed to notification as talkingUsers
  }
  ```
- **Notes:** Dropped if the current active huddle channel equals `channel_id`, or if the notification-suppression check (`tM.HW`) returns anything other than NONE (logged as warn).

### `room_update`
- **Registrar:** single
- **Handler:** `huddleRoomUpdatedHandler` (modules/eager/application/0620__HVn0.js:46517)
- **Purpose:** Updates on a huddle "knock" (request to join) room. Handles request accepted (joins with media credentials), expired (resets knock UI), and the list of users currently waiting to be let in.
- **Payload:**
  ```ts
  {
    type: "room_update";
    channel_id: string;
    knock_status?: "accepted" | "expired" | string; // only these two values are acted upon
    free_willy?: object;       // media server credentials, passed through as mediaServerCredentials (opaque)
    knocking_users?: string[]; // user ids waiting to join; used for expiry check (includes own id) and waiting list
  }
  ```
- **Notes:** Only acted on if `tI.pt(state)` (huddle-enabled). "accepted" requires `free_willy`; shows toast "Your request to join the huddle is approved". "expired" only if own user id is in `knocking_users`; shows "huddle request has expired" toast. The waiting list is stored only if the user is a huddle host-like (`oH.$V`) and not (`Le.U`). Note `knocking_users.includes` is called unguarded on "expired".

### `ended_huddle_update`
- **Registrar:** single
- **Handler:** `endedHuddleUpdateHandler` (modules/eager/application/0620__HVn0.js:46518)
- **Purpose:** A huddle has ended. Client dispatches two refresh/cleanup actions (`Lp.VZ`, `Lh.T({})`) and, if the calendar JIT feature is on, dismisses the matching "just-in-time" calendar huddle notification.
- **Payload:**
  ```ts
  {
    type: "ended_huddle_update";
    huddle: {
      channels: string[]; // channel ids; first element is used to find the matching JIT calendar event
      // other huddle fields not read
    };
  }
  ```
- **Notes:** JIT dismissal finds the earliest calendar event with `meeting_provider === Huddle` whose meeting URL maps to that channel id, then dispatches `Lo.cM({eventId})`.

### `huddle_start`
- **Registrar:** single
- **Handler:** `huddleStartRtmHandler` (modules/eager/application/0620__HVn0.js:46519)
- **Purpose:** A huddle has started in a channel. Client marks `hasHuddleStarted` for that channel in huddle state (so UI shows an active huddle).
- **Payload:**
  ```ts
  {
    type: "huddle_start";
    channel_id: string;
  }
  ```
- **Notes:** Ignored if huddles disabled, if channel is a suppressed org channel, or if a selector (`oU.bb`) says already handled for that channel.

### `ai_automatic_huddle_notes_error`
- **Registrar:** single
- **Handler:** `huddleAiNotesAutostartErrorHandler` (modules/eager/application/0620__HVn0.js:46520)
- **Purpose:** Automatic AI notes failed to start for a huddle. Client records the error with a local timestamp (probably to show an error toast/banner).
- **Payload:**
  ```ts
  {
    type: "ai_automatic_huddle_notes_error";
    error: string;      // error code/reason (opaque; unverified values)
    channel_id: string;
    huddle_id: string;
  }
  ```

### `call_block_updated`
- **Registrar:** single
- **Handler:** `updateCallBlockState` (modules/eager/application/0620__HVn0.js:46524)
- **Purpose:** A call block (call card in a message) changed. Client normalizes the call and upserts it into calls state.
- **Payload:**
  ```ts
  {
    type: "call_block_updated";
    block?: {
      call: {
        v1: object;                // call (v1) object, passed to normalizer Lr.a
        media_backend_type: string; // passed to normalizer
      };
    };
  }
  ```
- **Notes:** No-op if `block` is missing. Inner call fields not inspected (unverified).

### `sh_room_join`
- **Registrar:** single
- **Handler:** `updateCallState` (modules/eager/application/0620__HVn0.js:46525)
- **Purpose:** A participant joined a Slack call/huddle room. Client normalizes `room` and upserts it in call state; for huddles it also drives recording-notice, transcript and UI state. Shares handler with `sh_room_leave` and `sh_room_update`.
- **Payload:**
  ```ts
  {
    type: "sh_room_join";
    user?: string;                 // user id of the participant who joined; compared with own id
    room: {
      id: string;                  // call/room id
      name?: string;               // if changed, triggers updateCallName on the live call
      has_ended?: boolean;
      participants?: any[];        // length is logged
      knocks?: any;                // passed via normalizer
      last_invite_status_by_user?: Record<string, any>; // passed via normalizer
      // full room object passed to normalizer Lr.Q; other fields not enumerated
    };
    huddle?: {
      channel_id: string;          // present => huddle path (when huddles on)
    };
  }
  ```
- **Notes:** If `huddle` is present and huddles/other flag are on, runs `updateHuddleRtmHandler`; otherwise generic call path. When the own user joins and a local huddle state exists, waits 10s and aborts if the stored call changed. Own join may dismiss calendar JIT and trigger recording-on sound/notice.

### `sh_room_leave`
- **Registrar:** single
- **Handler:** `updateCallState` (modules/eager/application/0620__HVn0.js:46526)
- **Purpose:** A participant left a call/huddle room. Same handler as `sh_room_join`; updates the room, and for huddles when `activeParticipants` is empty dispatches a client-store action (`L_.WB`) for the channel (huddle emptied).
- **Payload:**
  ```ts
  {
    type: "sh_room_leave";
    user?: string;        // user id who left
    room: { id: string; name?: string; has_ended?: boolean; participants?: any[]; /* ...see sh_room_join */ };
    huddle?: { channel_id: string };
  }
  ```
- **Notes:** The tail of `updateHuddleRtmHandler` was truncated in the dossier (unverified: further handling after the leave/empty-participants branch).

### `sh_room_update`
- **Registrar:** single
- **Handler:** `updateCallState` (modules/eager/application/0620__HVn0.js:46527)
- **Purpose:** The call/huddle room object changed (participants, name, recording state, etc). Same handler as `sh_room_join`; upserts room, and for huddles may trigger recording notices.
- **Payload:**
  ```ts
  {
    type: "sh_room_update";
    user?: string;
    room: { id: string; name?: string; has_ended?: boolean; participants?: any[]; /* ...see sh_room_join */ };
    huddle?: { channel_id: string };
  }
  ```

### `reminder_added`
- **Registrar:** single
- **Handler:** `reminderAddedRtmEventHandler` (modules/eager/application/0620__HVn0.js:46549)
- **Purpose:** A reminder was added. Server sends the reminder as a message item; client ingests the message (`M3.A`) and processes it (`rO.Kc`) so the reminder shows in Later/saved lists.
- **Payload:**
  ```ts
  {
    type: "reminder_added";
    item?: {
      type: "message";     // other item types ignored
      channel: string;
      message: object;     // full message object (imsg), passed through to message ingestion
    };
  }
  ```
- **Notes:** Shares `processMessageItem` with the other `reminder_*` events; ignored when `item.type !== "message"`.

### `reminder_deleted`
- **Registrar:** single
- **Handler:** `reminderRemovedRtmEventHandler` (modules/eager/application/0620__HVn0.js:46550)
- **Purpose:** A reminder was deleted; the message item is re-ingested to refresh its reminder state.
- **Payload:**
  ```ts
  {
    type: "reminder_deleted";
    item?: { type: "message"; channel: string; message: object };
  }
  ```
- **Notes:** Same `processMessageItem` as `reminder_added`.

### `reminder_completed`
- **Registrar:** single
- **Handler:** `reminderCompletedRtmEventHandler` (modules/eager/application/0620__HVn0.js:46551)
- **Purpose:** A reminder was marked complete; message item re-ingested.
- **Payload:**
  ```ts
  {
    type: "reminder_completed";
    item?: { type: "message"; channel: string; message: object };
  }
  ```

### `reminder_snoozed`
- **Registrar:** single
- **Handler:** `reminderSnoozedRtmEventHandler` (modules/eager/application/0620__HVn0.js:46552)
- **Purpose:** A reminder was snoozed; message item re-ingested.
- **Payload:**
  ```ts
  {
    type: "reminder_snoozed";
    item?: { type: "message"; channel: string; message: object };
  }
  ```

### `reminder_fired`
- **Registrar:** single
- **Handler:** `reminderFiredRtmEventHandler` (modules/eager/application/0620__HVn0.js:46553)
- **Purpose:** A reminder came due; message item re-ingested so it appears as due.
- **Payload:**
  ```ts
  {
    type: "reminder_fired";
    item?: { type: "message"; channel: string; message: object };
  }
  ```

### `user_typing`
- **Registrar:** shared
- **Handler:** `ArrowFunctionExpression` (anonymous, batch-of-msgs + teamOrEnterpriseId) (modules/eager/application/0620__HVn0.js:46557)
- **Purpose:** Users are typing in channels/threads. Client groups messages by channel then thread_ts and, if the channel/thread is currently visible (or the activity inbox is showing that thread), records typing member ids.
- **Payload:** (handler receives an array of these)
  ```ts
  {
    type: "user_typing";
    channel: string;       // channel id
    user: string;          // typing user id
    thread_ts?: string;    // thread parent ts if typing in a thread; undefined => channel-level
  }
  ```
- **Notes:** Only in gantry (org-wide) context else throws; skipped when document hidden, when the `show_typing` pref is off, when the channel is unknown, or the user isn't a valid target (`aZ.TO` filter, e.g. self/muted). Dispatches `Mt.W({channelId, threadTs, memberIds})`.

### `canvas_created`
- **Registrar:** single
- **Handler:** `canvasCreatedRtmHandler` (modules/eager/application/0620__HVn0.js:46638)
- **Purpose:** A canvas was created in the current huddle (huddle notes canvas thread). If `call_id` matches the active huddle, client records the thread on the huddle, marks it read and fetches its replies.
- **Payload:**
  ```ts
  {
    type: "canvas_created";
    call_id: string;           // huddle/call id; must equal current huddle id
    thread: {
      channel_id: string;
      ts: string;              // thread parent ts
    };
  }
  ```

### `agent_canvas_created`
- **Registrar:** single
- **Handler:** `agentCanvasCreatedRtmHandler` (modules/eager/application/0620__HVn0.js:46639)
- **Purpose:** An agent (AI) created a canvas; client dispatches `LW` with the canvas id and creation date (helper not opened; likely registers it for display/refresh).
- **Payload:**
  ```ts
  {
    type: "agent_canvas_created";
    canvas_id: string;      // ignored if falsy
    date_created?: number | string; // creation timestamp (unverified type)
  }
  ```

### `canvas_content_draft_view_triggered`
- **Registrar:** single
- **Handler:** `canvasContentDraftViewTriggeredRtmHandler` (modules/eager/application/0620__HVn0.js:46859)
- **Purpose:** Slackbot produced a proposed canvas edit (draft). Client stores a draft record and fetches the diff of the proposed operations against the canvas, storing sections/thread sequence, or an error code.
- **Payload:**
  ```ts
  {
    type: "canvas_content_draft_view_triggered";
    canvas_id: string;
    invocation_id: string;   // key for the draft in state
    operations: object[];    // canvas edit operations (converted via toFetcherOperations; shape not inspected)
    draft_id?: string;
    title?: string;
  }
  ```
- **Notes:** Gated by experiment `canvas_content_drafts_slackbot === "on"`. Skipped if a draft with this invocation_id already exists without errorCode.

### `canvas_content_draft_resolved`
- **Registrar:** single
- **Handler:** `canvasContentDraftResolvedRtmHandler` (modules/eager/application/0620__HVn0.js:46863)
- **Purpose:** A canvas content draft was resolved (accepted/rejected); client dispatches `L1` with the invocation id (to clear/resolve the draft).
- **Payload:**
  ```ts
  {
    type: "canvas_content_draft_resolved";
    invocation_id: string;
  }
  ```

### `channel_updated`
- **Registrar:** single
- **Handler:** `channelUpdated` (modules/eager/application/0620__HVn0.js:47080)
- **Purpose:** Partial update to one or more channels. Client merges `updates` into the cached channel (upsert) plus side effects: archive/unarchive, permissions (read-only/thread-only), space prefs, topic, canvas/meeting-notes properties, membership stale-marking, removal if converted to private without membership.
- **Payload:**
  ```ts
  {
    type: "channel_updated";
    channel?: string;     // single channel id
    channels?: string[];  // or list of channel ids (takes priority)
    updates: {            // partial channel fields, merged into the channel (also has any other channel field)
      is_archived?: boolean;          // true => archive path, false => unarchive path
      user?: string;                  // (from top-level spread on archive) see Notes
      permissions?: { post?: any; thread?: any }; // converted to is_read_only / is_thread_only
      space?: { space_icon?: string; space_file_id?: string; space_is_primary?: boolean }; // stored as channel prefs
      is_migrating?: boolean;         // true->false triggers reload
      is_mpim?: boolean;              // false => mpim converted to private channel
      unlinked?: any;                 // presence => connected-teams refresh
      connected_team_ids?: string[];  // presence => connected-teams refresh
      membership?: any;               // presence => mark channel stale and refetch
      topic?: { value: string; creator: string; last_set: number|string };
      properties?: {
        has_slack_connect_invite_created?: boolean;
        canvas?: { file_id: string };
        meeting_notes?: { file_id: string }; // "" clears meeting notes view
        record_channel?: { minimum_access_level?: any };
      };
      [other: string]: any;           // any other channel field merged as-is
    };
  }
  ```
- **Notes:** Ignored for unknown channels or if `updates` is missing. For `is_archived` it calls the archive/unarchive logic with `{channel, ...updates}` (so archive moved/frozen data may be taken from updates; unarchive reads `user` and compares to own id with pref `public_channel_retain_membership_on_archive`). Channel converted to private where user is not a member is removed. The `user` field in `updates` for unarchive is inferred from the helper reading `e.user` on the merged object (unverified).

### `calendar_reminder`
- **Registrar:** single
- **Handler:** `calendarReminderRtmHandler` (modules/eager/application/0620__HVn0.js:47098)
- **Purpose:** Calendar reminder (upcoming meeting) pushed to the client; the whole message is passed to the calendar reminder reducer/thunk (`Fl.DY`) when calendar feature is enabled.
- **Payload:**
  ```ts
  {
    type: "calendar_reminder";
    // full reminder object passed through as `calendarReminder` (fields not inspected here)
    [k: string]: any;
  }
  ```
- **Notes:** Gated by `Fs.A(state)` and `mE.A()`.

### `calendar_event`
- **Registrar:** single
- **Handler:** `ArrowFunctionExpression` (modules/eager/application/0620__HVn0.js:47099)
- **Purpose:** A calendar event was created/updated/deleted; client upserts the event (`Fi.R`) or removes it (`Mc.ag`).
- **Payload:**
  ```ts
  {
    type: "calendar_event";
    subtype: "created" | "updated" | "deleted";
    event?: object;      // full calendar event, for created/updated, passed to Fi.R
    event_id?: string;   // for deleted
  }
  ```

### `calendar_user_status`
- **Registrar:** single
- **Handler:** `ArrowFunctionExpression` (modules/eager/application/0620__HVn0.js:47106)
- **Purpose:** The user's calendar-app connection status changed. Client stores per-calendar-app status; a `provider_connected` for gcal/ocal flips the authentication state to ProviderConnected instead.
- **Payload:**
  ```ts
  {
    type: "calendar_user_status";
    status?: {
      cal_app_type: string;  // e.g. "gcal", "ocal", "ocal_gcc" (lowercased for comparison; original used as key)
      user_status: string;   // e.g. "provider_connected" (other values opaque)
      is_dwa?: boolean;
      calapp_user_id?: string;
      auth_url?: string;
      user_can_install_app?: boolean;
      is_calendar_app_installed?: boolean;
      is_calendar_app_restricted?: boolean;
      restriction_source?: string;
      is_app_request_submitted?: boolean;
      app_request_resolution?: string;
      calendar?: object;     // primary calendar info, passed through
    };
  }
  ```

### `calendar_event_updated`
- **Registrar:** single
- **Handler:** `ArrowFunctionExpression` (modules/eager/application/0620__HVn0.js:47144)
- **Purpose:** Calendar (JIT/calendar-tab) event changed. Client upserts/removes the event in the calendar events store, or if event id format (contains ":" or not) mismatches existing cached ids, resets calendar events and refetches days.
- **Payload:**
  ```ts
  {
    type: "calendar_event_updated";
    subtype: "created" | "updated" | "deleted";
    event: { id: string; [k: string]: any }; // full event object (for created/updated stored whole)
  }
  ```
- **Notes:** Only when calendar JIT/`D7._c` feature is on. Distinct from `calendar_event`.

### `calendar_events_changed`
- **Registrar:** single
- **Handler:** `ArrowFunctionExpression` (modules/eager/application/0620__HVn0.js:47160)
- **Purpose:** Calendar events changed in bulk; client clears cached events and refetches (`Lo.W()` and `Fd.ZO()`).
- **Payload:**
  ```ts
  {
    type: "calendar_events_changed";
  }
  ```
- **Notes:** No fields read; gated by `D7._c`.

### `calendar_days_changed`
- **Registrar:** single
- **Handler:** `ArrowFunctionExpression` (modules/eager/application/0620__HVn0.js:47163)
- **Purpose:** Specific calendar day ranges changed; client expands ranges to a list of YYYY-MM-DD days and invalidates/refetches those days (`Fd.c9`).
- **Payload:**
  ```ts
  {
    type: "calendar_days_changed";
    ranges: Array<{
      start_date: string; // "YYYY-MM-DD" (inclusive, UTC)
      end_date: string;   // "YYYY-MM-DD" (inclusive)
    }>;
  }
  ```

### `calendar_jit_notification`
- **Registrar:** single
- **Handler:** `ArrowFunctionExpression` -> `handleCalendarJitNotificationRTMEvent` (modules/eager/application/0620__HVn0.js:47210)
- **Purpose:** Just-in-time calendar notification (upcoming meeting) entry created/updated/dismissed. Client transforms the entry to a JIT event and upserts it with its unread state (dismissed => marked read).
- **Payload:**
  ```ts
  {
    type: "calendar_jit_notification";
    subtype: "created" | "updated" | "dismissed";
    entry: {
      is_unread: boolean;
      item?: { linked_item_id?: string; [k: string]: any }; // activity-style item; transformed by Fu.H
      [k: string]: any;
    };
  }
  ```
- **Notes:** Ignored when `D7._c` (calendar events feature) is ON (the opposite gate to the other calendar events); unknown subtype logs a warning.

### `badge_counts_updated`
- **Registrar:** single
- **Handler:** `handleBadgeCountsUpdatedRTMEvent` (modules/eager/application/0620__HVn0.js:47270)
- **Purpose:** Unread badge counts changed. In activity-v2 mode, updates activity counts (and marks unread activity items as locally read if all counts are zero); otherwise stores `counts` and per-alert-type unread counts, and marks activity items read if everything is zero.
- **Payload:**
  ```ts
  {
    type: "badge_counts_updated";
    activity_v2?: Record<string, number>; // counts per activity category (v2 mode)
    counts?: Record<string, number>;      // legacy badge counts (all values numeric)
    alerts?: Record<string, number>;      // per alert type unread counts; only keys known to enum Dy.e are used
  }
  ```
- **Notes:** Branch chosen by `fx.Lh(state)` (activity v2 enabled).

### `widget_run_completed`
- **Registrar:** single
- **Handler:** `ArrowFunctionExpression` (modules/eager/application/0620__HVn0.js:47360)
- **Purpose:** A widget run finished; client dispatches `Ff` with blocks or error for that widget placement.
- **Payload:**
  ```ts
  {
    type: "widget_run_completed";
    widget_placement_id: string;
    blocks?: object[]; // Block Kit blocks result
    error?: string;    // error code/reason (unverified)
  }
  ```

### `external_auth_required`
- **Registrar:** single
- **Handler:** `externalAuthRequiredRtmHandler` (modules/eager/application/0620__HVn0.js:47534)
- **Purpose:** A workflow step needs the user to authenticate with third parties. Client opens a `WorkflowStepSpeedbumpModal` with the required auths.
- **Payload:**
  ```ts
  {
    type: "external_auth_required";
    show_speedbump: boolean;
    workflow: { id: string };
    trigger_id: string;
    third_party_auths: any[];     // normalized with nT.t(..., 3)
    channel?: string;
    message_ts?: string;
    button_text: { text: string };
    client_token?: string;        // checked against this client (Ty.A.check) so only the initiating client shows the modal
  }
  ```
- **Notes:** Ignored if `Iz.A()` is true, `show_speedbump` falsy, ids missing, or client_token check fails.

### `workflow`
- **Registrar:** single
- **Handler:** `workflowChanged` (modules/eager/application/0620__HVn0.js:47552)
- **Purpose:** A workflow was changed/deleted. For `deleted` removes the item from the agent-tasks/managed-workflows/workflows browsers; for any other subtype marks those browser lists stale for refetch.
- **Payload:**
  ```ts
  {
    type: "workflow";
    subtype?: "deleted" | string; // only "deleted" is distinguished
    workflow_id?: string;
  }
  ```

### `workflow_execution_outcome_changed`
- **Registrar:** single
- **Handler:** `ArrowFunctionExpression` (modules/eager/application/0620__HVn0.js:47557)
- **Purpose:** A workflow run's outcome changed. Whole message is stored as a workflow history item; if it matches a pending trigger execution the user kicked off, completes that execution in the UI.
- **Payload:**
  ```ts
  {
    type: "workflow_execution_outcome_changed";
    workflow_id: string;
    trigger_execution_id?: string;
    workflow_instance_status?: string; // checked against a terminal-status list FE (values unverified)
    // full message is passed as `workflowHistoryItem`; further fields not enumerated
    [k: string]: any;
  }
  ```

### `feature_access_policies_updated`
- **Registrar:** single
- **Handler:** `featureAccessUpdate` (modules/eager/application/0620__HVn0.js:47579)
- **Purpose:** Feature access policies changed; client stores the list.
- **Payload:**
  ```ts
  {
    type: "feature_access_policies_updated";
    feature_access_policies: object; // passed whole to reducer FM.$3 (shape not inspected)
  }
  ```

### `feature_usage_updated`
- **Registrar:** single
- **Handler:** `handleFeatureUsageUpdated` (modules/eager/application/0620__HVn0.js:47593)
- **Purpose:** Usage quota of a feature changed; client stores the entry keyed by feature.
- **Payload:**
  ```ts
  {
    type: "feature_usage_updated";
    feature_key: string;
    total_usages: number;
    usage_remaining: number;
    store_type: string;
    event_ts?: string;              // defaults to ""
    expiration_timestamp?: number;  // included only if non-null (unit unverified)
  }
  ```

### `template_created`
- **Registrar:** single
- **Handler:** `workflowTemplateCreated` (modules/eager/application/0620__HVn0.js:47628)
- **Purpose:** A workflow template was created; client marks "your templates" and "templates" browser lists stale.
- **Payload:**
  ```ts
  {
    type: "template_created";
  }
  ```
- **Notes:** No payload fields read; gated by `Iq.kY` (workflow templates feature) and having a team id.

### `template_updated`
- **Registrar:** single
- **Handler:** `workflowTemplateUpdated` (modules/eager/application/0620__HVn0.js:47629)
- **Purpose:** A workflow template was updated; client marks that template object stale so it is refetched.
- **Payload:**
  ```ts
  {
    type: "template_updated";
    template_id: string;
    template_type: "workflow" | string; // only "workflow" handled
    collaborator_ids: string[];         // user ids
    published_state: "draft" | "published" | string;
  }
  ```
- **Notes:** The code marks `template_id` stale in both branches, so the collaborator/published check is effectively redundant.

### `template_deleted`
- **Registrar:** single
- **Handler:** `workflowTemplateDeleted` (modules/eager/application/0620__HVn0.js:47630)
- **Purpose:** A workflow template was deleted; client marks lists stale (your templates if user is a collaborator, public templates if it was draft/published).
- **Payload:**
  ```ts
  {
    type: "template_deleted";
    collaborator_ids: string[];
    published_state: "draft" | "published" | string;
  }
  ```

### `resurrected_user_web_push_summary_notification`
- **Registrar:** single
- **Handler:** `ArrowFunctionExpression` (modules/eager/application/0620__HVn0.js:47631)
- **Purpose:** Activity summary web-push for a returning user. Client shows a desktop/web notification with the summary item unless suppressed (then tracks a rejection metric).
- **Payload:**
  ```ts
  {
    type: "resurrected_user_web_push_summary_notification";
    event_ts: string;  // used as eventId
    data: object;      // summary item, passed to notification thunk IJ.kt as summaryItem (shape not inspected)
  }
  ```

### `vip_users_updated`
- **Registrar:** single
- **Handler:** `vipUsersUpdated` (modules/eager/application/0620__HVn0.js:47659)
- **Purpose:** The user's VIP users list changed; client replaces it.
- **Payload:**
  ```ts
  {
    type: "vip_users_updated";
    vip_users: string[]; // (inferred) user ids, passed to FO.DU
  }
  ```

### `ai_message_translation_ready`
- **Registrar:** single
- **Handler:** `ArrowFunctionExpression` (modules/eager/application/0620__HVn0.js:47663)
- **Purpose:** An AI translation of a message is ready (or failed). Client upserts the translation (blocks, text, language, completion status) for that message, or records the error.
- **Payload:**
  ```ts
  {
    type: "ai_message_translation_ready";
    channel_id: string;
    ts: string;                 // message ts
    error?: string;             // if set, error stored and nothing else processed
    blocks?: object[];          // translated blocks; ignored if absent
    text?: string;
    num_translations: number;   // total expected; status COMPLETE when completed >= this
    translation_id: string;
    target_language: string;
    source_language?: { locale: string; locale_label: string; is_reliable: boolean };
    event_ts: string;
  }
  ```
- **Notes:** Ignored if translation feature disabled or message not in store.

### `ai_attached_message_translation_ready`
- **Registrar:** single
- **Handler:** `ArrowFunctionExpression` (modules/eager/application/0620__HVn0.js:47711)
- **Purpose:** Translation of an attached message (attachment) of a parent message is ready. Client attaches translated blocks to the parent translation and, once all parts are complete, marks it complete.
- **Payload:**
  ```ts
  {
    type: "ai_attached_message_translation_ready";
    channel_id: string;
    parent_message_ts: string;
    attached_message_ts: string;
    blocks: object[];
  }
  ```
- **Notes:** Ignored if parent message unknown or `blocks` missing; creates a PENDING translation record if none exists.

### `ai_file_summary_translation_ready`
- **Registrar:** single
- **Handler:** `ArrowFunctionExpression` (modules/eager/application/0620__HVn0.js:47748)
- **Purpose:** AI translation of a file summary is ready; client stores it with COMPLETE status.
- **Payload:**
  ```ts
  {
    type: "ai_file_summary_translation_ready";
    file_id: string;
    summary_id: string;
    translation_id: string;
    text: string;       // ignored if empty
    blocks: object[];
    file_name: string;
  }
  ```

### `ai_today_item_created`
- **Registrar:** single
- **Handler:** `handleAiTodayItemCreated` (modules/eager/application/0620__HVn0.js:47913)
- **Purpose:** New AI "Today" items were created. Client filters out dismissed ids, upserts the rest (via `hI.XK` transform), and updates focus-topic / latest-unread loading flags.
- **Payload:**
  ```ts
  {
    type: "ai_today_item_created";
    items: Array<{
      id: string;
      type: string; // includes "FocusTopic" and "LatestUnreadAndActivity" enum values (FU.S); other fields transformed by hI.XK, not enumerated
      [k: string]: any;
    }>;
  }
  ```
- **Notes:** Gated by `FH.fo || FH.gC`. Empty array resets loading state.

### `ai_today_item_updated`
- **Registrar:** single
- **Handler:** `handleAiTodayItemUpdated` (modules/eager/application/0620__HVn0.js:47914)
- **Purpose:** Existing AI Today items changed; client filters dismissed ids and upserts.
- **Payload:**
  ```ts
  {
    type: "ai_today_item_updated";
    items: Array<{ id: string; [k: string]: any }>;
  }
  ```

### `ai_today_item_deleted`
- **Registrar:** single
- **Handler:** `handleAiTodayItemDeleted` (modules/eager/application/0620__HVn0.js:47915)
- **Purpose:** AI Today items removed; client removes them by id (`DK.q5`).
- **Payload:**
  ```ts
  {
    type: "ai_today_item_deleted";
    item_ids: string[];
  }
  ```

### `ai_today_item_errored`
- **Registrar:** single
- **Handler:** `handleAiTodayItemErrored` (modules/eager/application/0620__HVn0.js:47916)
- **Purpose:** Generating an AI Today item failed. For focus-topic items clears the loading flag and sets an error or "empty" flag depending on error code.
- **Payload:**
  ```ts
  {
    type: "ai_today_item_errored";
    item_type: string; // acted on only for FocusTopic enum value
    error?: "today_error_converting_topics_to_blocks" | "today_error_converting_context_to_blocks" | "other"
          | "no_topics_found" | "no_context_found" | "no_messages_found" | string;
  }
  ```
- **Notes:** First group of errors -> error flag (`DK.Ib`); second group -> empty-state flag (`DK.ub`).

### `ai_today_item_state_changed`
- **Registrar:** single
- **Handler:** `handleAiTodayItemStateChanged` (modules/eager/application/0620__HVn0.js:47917)
- **Purpose:** State of an AI Today item changed. "responded" removes the item (reason "responded to"), any other state is set on the item.
- **Payload:**
  ```ts
  {
    type: "ai_today_item_state_changed";
    item_id: string;
    state: "responded" | string; // other values opaque
  }
  ```

### `llm_task_stream_updated`
- **Registrar:** single
- **Handler:** `handleLlmTaskStreamUpdated` (modules/eager/application/0620__HVn0.js:47918)
- **Purpose:** Streaming lifecycle of an LLM task for the Today view. Client toggles streaming start/stop markers and, on success, records the completion ts; on failure, flags an error.
- **Payload:**
  ```ts
  {
    type: "llm_task_stream_updated";
    task_type: "today_unreads_and_activity" | string; // only this value handled
    event: "STREAM_START" | "STREAM_SUCCESS" | "STREAM_ERROR" | "STREAM_FAILURE";
    event_ts?: string;
  }
  ```

### `ai_calendar_prep_created`
- **Registrar:** single
- **Handler:** `handleAiCalendarPrepCreated` (modules/eager/application/0620__HVn0.js:47928)
- **Purpose:** AI meeting-prep content is ready for a calendar event; client stores the blocks keyed by event link id.
- **Payload:**
  ```ts
  {
    type: "ai_calendar_prep_created";
    event_link_id: string;
    prep_blocks: object[]; // Block Kit blocks; must be non-empty
  }
  ```
- **Notes:** Gated by `D7.hx(state)`.

### `apps_permissions_changed`
- **Registrar:** single
- **Handler:** `appsPermissionsChanged` (modules/eager/application/0620__HVn0.js:47951)
- **Purpose:** App permissions/ACLs changed. Client refreshes the app's ACL info (when `app_acls_for_all_apps` is "on") and forces a fresh reload of the app permissions list.
- **Payload:**
  ```ts
  {
    type: "apps_permissions_changed";
    app_id?: string; // used only when the experiment is on
  }
  ```

### `mcp_servers_changed`
- **Registrar:** single
- **Handler:** `mcpServersChanged` (modules/eager/application/0620__HVn0.js:47952)
- **Purpose:** MCP server configuration changed. Client removes servers, refreshes tool ACLs, or marks server list stale depending on action.
- **Payload:**
  ```ts
  {
    type: "mcp_servers_changed";
    action?: "removed" | "tool_acl_updated" | "acl_updated" | string; // other values => just mark list stale
    server_keys?: string[]; // required for removed/tool_acl_updated/acl_updated
  }
  ```

### `entity_details_present`
- **Registrar:** single
- **Handler:** `workObjectEntityResponseRtmHandler` (modules/eager/application/0620__HVn0.js:48082)
- **Purpose:** Work-object (third-party entity) details arrived. Client stores them in the entity store and clears loading/refresh/save flags; on edit errors it shows error state and refetches the form.
- **Payload:**
  ```ts
  {
    type: "entity_details_present";
    entity_id: string;
    entity_url?: string;
    data_freshness?: "live" | string; // handler only proceeds if ext_error present or "live"
    ext_error?: { status: "edit_error" | "user_not_authed" | string; message?: string };
    source?: "unfurl_action" | string;
    // the whole message plus id=entity_id is upserted into the entity store (FX.Fy); other fields not enumerated
    [k: string]: any;
  }
  ```
- **Notes:** Update to the store only happens if there is no cached entity or it is in a refresh/saving/unfurl-cache state (or `user_not_authed`). For `user_not_authed` from an unfurl action, opens an auth prompt.

### `ai_channel_join_reason_completed`
- **Registrar:** single
- **Handler:** `handleAiChannelJoinReasonCompleted` (modules/eager/application/0620__HVn0.js:48083)
- **Purpose:** AI-generated "why you were added to this channel" summary finished. Client stops loading and stores the reason data, or sets error if the result is not complete.
- **Payload:**
  ```ts
  {
    type: "ai_channel_join_reason_completed";
    channel_id: string;
    message_ts: string;
    inviter_id?: string; // handler returns early if falsy
    summary: {
      id: string;
      result?: { blocks?: object[]; [k: string]: any };
      ai_context_result_status: "complete" | string;
    };
  }
  ```
- **Notes:** Gated by `ad.JJ(state)`. Success requires `result.blocks` and status "complete".

### `channel_join_slackbot_summary`
- **Registrar:** single
- **Handler:** `handleChannelJoinSlackbotSummary` (modules/eager/application/0620__HVn0.js:48087)
- **Purpose:** Slackbot channel-join summary text arrived; client stores it for that channel.
- **Payload:**
  ```ts
  {
    type: "channel_join_slackbot_summary";
    channel_id: string;
    text: string;
    trigger_source: string; // opaque enum
    inviter_id?: string;
  }
  ```
- **Notes:** Gated by `ad.kY(state)`.

### `external_file_tab_ready`
- **Registrar:** single
- **Handler:** `handleExternalFileTabReady` (modules/eager/application/0620__HVn0.js:48129)
- **Purpose:** A third-party-file channel tab finished adding (or failed). Client shows a toast with a "go to tab" action on success, or a failure toast.
- **Payload:**
  ```ts
  {
    type: "external_file_tab_ready";
    channel_id: string;
    tab_id: string;
    ok: boolean;
  }
  ```
- **Notes:** Gated by experiment `tab_3p_files_fe_allow_add === "on"`. File title resolved from the tab's file or label.

### `file_view_ready`
- **Registrar:** single
- **Handler:** `ArrowFunctionExpression` (modules/eager/application/0620__HVn0.js:48150)
- **Purpose:** A file preview/view is ready (or failed). Client stores the preview; on `rate_limited` shows a throttled "Synced too soon" toast; for third-party files may refresh the entity.
- **Payload:**
  ```ts
  {
    type: "file_view_ready";
    error?: "rate_limited" | string;
    file?: { id: string; [k: string]: any };
    // entire message is stored as `filePreview`; other fields not enumerated
    [k: string]: any;
  }
  ```
- **Notes:** Toast is debounced to once per second. With `tab_3p_files === "treatment"` and no error, may mark/refresh the matching work-object entity.
### `salesforce_contacts_imported`
- **Registrar:** single
- **Handler:** `handleSalesforceContactsCompleted` (modules/eager/application/0620__HVn0.js:48593)
- **Purpose:** A Salesforce contacts CSV import job finished. Client clears import-in-progress/awaiting-mapping flags, triggers a full refresh of the sales-tracker view, optionally updates the CRM provisioning status (to COMPLETE or keeps AWAITING_CANDIDATES), and shows a failure / partial-success / completion toast by `state`.
- **Payload:**
  ```ts
  {
    type: "salesforce_contacts_imported";
    state: "failed" | "aborted" | "partial_success" | "job_complete"; // selects toast
    contacts_list_composite_id?: string; // if present, status/list ids are stored
    number_records_processed?: number;   // partial_success toast
    number_records_failed?: number;
    number_records_duplicated?: number;
    notification_channel_id?: string;    // passed to the toast
  }
  ```

### `salesforce_leads_imported`
- **Registrar:** single
- **Handler:** `handleSalesforceLeadsCompleted` (modules/eager/application/0620__HVn0.js:48637)
- **Purpose:** Same as contacts import but for Leads: resets import flags, full refresh of the tracker, shows failure/partial/complete toast, then calls `Bp.c5(msg, getState)` with the whole message (unverified internals).
- **Payload:**
  ```ts
  {
    type: "salesforce_leads_imported";
    state: "failed" | "aborted" | "partial_success" | "job_complete";
    number_records_processed?: number;
    number_records_failed?: number;
    number_records_duplicated?: number;
    notification_channel_id?: string;
    // whole message additionally passed to Bp.c5 (unverified fields)
  }
  ```

### `sales_tracker_record_updated`
- **Registrar:** single
- **Handler:** anonymous arrow (modules/eager/application/0620__HVn0.js:48639)
- **Purpose:** Sales tracker records changed server-side; the client refreshes tracker content and re-runs a Salesforce-org-scoped refetch.
- **Payload:**
  ```ts
  {
    type: "sales_tracker_record_updated";
    salesforce_org_id: string;
  }
  ```

### `salesforce_org_provisioning_failed`
- **Registrar:** single
- **Handler:** anonymous arrow (modules/eager/application/0620__HVn0.js:48660)
- **Purpose:** CRM org provisioning failed. Client sets provisioning status to ERROR and shows a CrmProvisioningFailureToast.
- **Payload:**
  ```ts
  {
    type: "salesforce_org_provisioning_failed";
  }
  ```
- **Notes:** No fields read.

### `crm_candidate_extraction_completed`
- **Registrar:** single
- **Handler:** anonymous arrow (modules/eager/application/0620__HVn0.js:48666)
- **Purpose:** Candidate-record extraction for CRM onboarding finished. Unless status is already COMPLETE/ERROR, sets status COMPLETE and, on success (and a state predicate), shows a "bulk grid contacts ready" toast.
- **Payload:**
  ```ts
  {
    type: "crm_candidate_extraction_completed";
    outcome: string; // "success" is the only value checked; others just complete the status
  }
  ```
- **Notes:** Toast only if tracker-related gates (`tN.Ix`, `o4.WS`) pass.

### `crm_onboarding_state_machine_updated`
- **Registrar:** single
- **Handler:** `handleCrmOnboardingStateMachineUpdated` (modules/eager/application/0620__HVn0.js:48811)
- **Purpose:** The CRM onboarding state machine changed. Always refetches state-machine data; for `user_input` runs a follow-up thunk, for `slack_data` (after awaiting the refetch) may show an "onboarding ready" toast.
- **Payload:**
  ```ts
  {
    type: "crm_onboarding_state_machine_updated";
    source: "user_input" | "slack_data" | string;
    is_candidate_records_ready?: boolean; // if defined, true => treated as prewarm refresh (no toast)
    outcome?: string;                      // "success" used as fallback prewarm heuristic
    salesforce_org_id?: string;            // undefined + outcome success => prewarm
  }
  ```
- **Notes:** Toast variant `records_created` or `no_candidates`; suppressed on SalesTracker view or if the current channel differs.

### `crm_provisioning_core_completed`
- **Registrar:** single
- **Handler:** anonymous arrow (modules/eager/application/0620__HVn0.js:48822)
- **Purpose:** Core CRM provisioning completed. Sets status COMPLETE (unless already COMPLETE/ERROR) and, if previously PROVISIONING/AWAITING_CANDIDATES and the sales tracker entity isn't already in the sidebar, refetches channel sections.
- **Payload:**
  ```ts
  {
    type: "crm_provisioning_core_completed";
    salesforce_org_id: string; // used to build entity id `sales_tracker:<id>`
  }
  ```

### `crm_provisioning_step_landed`
- **Registrar:** single
- **Handler:** `crmProvisioningStepLanded` (modules/eager/application/0620__HVn0.js:48839)
- **Purpose:** An intermediate provisioning step landed; client refreshes sales-tracker content and performs a team-scoped side effect (`j4.D1(teamId)`).
- **Payload:**
  ```ts
  {
    type: "crm_provisioning_step_landed";
  }
  ```
- **Notes:** No fields read.

### `admin_advisor_count_change`
- **Registrar:** single
- **Handler:** anonymous arrow (modules/eager/application/0620__HVn0.js:48842)
- **Purpose:** The admin advisor's "number to review" count changed. If the advisor feature is active, client updates stored advisor state `numToReview`, keeping existing recommendations.
- **Payload:**
  ```ts
  {
    type: "admin_advisor_count_change";
    count: number; // new numToReview
  }
  ```

### `new_team_launchpad_updated`
- **Registrar:** single
- **Handler:** anonymous arrow (modules/eager/application/0620__HVn0.js:48978)
- **Purpose:** New-team launchpad progress changed. Client refetches the launchpad state machines and, under a gate, boots the unified-files-tab space request.
- **Payload:**
  ```ts
  {
    type: "new_team_launchpad_updated";
  }
  ```
- **Notes:** No fields read; refetch reason "new-team-launchpad-rtm-handler".

### `onboarding_tasks_updated`
- **Registrar:** single
- **Handler:** anonymous arrow (modules/eager/application/0620__HVn0.js:49057)
- **Purpose:** Onboarding task completion changed. Client re-requests the relevant notification spaces (sidebar onboarding-tasks link or sidebar header for the pro-upgrade pocket guide v3), diffs task completion, and fires celebration/UI effects for newly completed tasks.
- **Payload:**
  ```ts
  {
    type: "onboarding_tasks_updated";
  }
  ```
- **Notes:** No fields read; entirely driven by which notification is active in client state.

### `trial_engagement_pocket_guide_updated`
- **Registrar:** single
- **Handler:** anonymous arrow (modules/eager/application/0620__HVn0.js:49107)
- **Purpose:** Trial-engagement pocket guide state changed; for each configured space whose active notification matches, client re-requests that space.
- **Payload:**
  ```ts
  {
    type: "trial_engagement_pocket_guide_updated";
  }
  ```
- **Notes:** No fields read.

### `sc_trial_onboarding_next_day_nudge`
- **Registrar:** single
- **Handler:** anonymous arrow (modules/eager/application/0620__HVn0.js:49113)
- **Purpose:** Slack Connect trial next-day nudge; client dispatches an SC_TRIAL_ONBOARDING_NEXT_DAY_NUDGE notification event for the channel.
- **Payload:**
  ```ts
  {
    type: "sc_trial_onboarding_next_day_nudge";
    channel_id: string;
  }
  ```

### `sc_trial_onboarding_state_machine_changed`
- **Registrar:** single
- **Handler:** anonymous arrow (modules/eager/application/0620__HVn0.js:49129)
- **Purpose:** State machines for SC trial onboarding changed. If the list includes SC_TRIAL_TEAM_ONBOARDING, client refetches those machines whose server state differs from local state.
- **Payload:**
  ```ts
  {
    type: "sc_trial_onboarding_state_machine_changed";
    state_machines: Array<{
      state_machine: string; // machine name
      state: string;         // server's state, compared with local selector
    }>;
  }
  ```
- **Notes:** `type` is used as the refetch reason.

### `onboarding_tasks_reminder`
- **Registrar:** single
- **Handler:** anonymous arrow (modules/eager/application/0620__HVn0.js:49145)
- **Purpose:** Server requests a web-push-style reminder about remaining onboarding tasks. Unless suppressed (suppression reason tracked via analytics), client dispatches a notification with the count and event id.
- **Payload:**
  ```ts
  {
    type: "onboarding_tasks_reminder";
    event_ts: string;       // used as eventId
    tasks_remaining: number;
  }
  ```

### `seasonal_delight_web_push_notification`
- **Registrar:** single
- **Handler:** anonymous arrow (modules/eager/application/0620__HVn0.js:49174)
- **Purpose:** Seasonal-delight web push. Ignored unless this window's team matches the current team and pref `seasonal_delight_push` is "on"; then dispatches a per-type notification builder or logs a suppression analytics event.
- **Payload:**
  ```ts
  {
    type: "seasonal_delight_web_push_notification";
    event_ts: string; // eventId
    data: {
      header: string;                // notification title
      content: string;               // notification body
      seasonal_delight_type: string; // key into a local builder map (values not enumerated here)
    };
  }
  ```

### `welcome_party_web_push_notification`
- **Registrar:** single
- **Handler:** anonymous arrow (modules/eager/application/0620__HVn0.js:49209)
- **Purpose:** Welcome-party web push for a joiner. Unless suppressed, dispatches a welcome-party notification; else tracks a rejected-impression analytics event.
- **Payload:**
  ```ts
  {
    type: "welcome_party_web_push_notification";
    event_ts: string;
    joiner_id: string;   // user id
    channel_id: string;
    message_ts: string;
  }
  ```

### `app_owners_changed`
- **Registrar:** single
- **Handler:** `handleAppOwnersChanged` (modules/eager/application/0620__HVn0.js:49247)
- **Purpose:** An app's owners/collaborators changed; client debounces 500ms per app id then stores the collaborator list.
- **Payload:**
  ```ts
  {
    type: "app_owners_changed";
    app: { id: string; /* other app fields ignored */ };
    owner_ids: string[]; // user ids; stored as collaborators
  }
  ```
- **Notes:** Ignored if either `app.id` or `owner_ids` missing.

### `app_user_connection_changed`
- **Registrar:** single
- **Handler:** `handleAppUserConnectionChanged` (modules/eager/application/0620__HVn0.js:49261)
- **Purpose:** A user's connection to an app changed. Marks that app's cached objects stale for the team and refreshes search results (external-user-connection-updated) or runs a default refresh.
- **Payload:**
  ```ts
  {
    type: "app_user_connection_changed";
    app_id: string;
  }
  ```

### `enterprise_search_github_cloud_orgs_updated`
- **Registrar:** single
- **Handler:** `handleEnterpriseSearchGithubCloudOrgsUpdated` (modules/eager/application/0620__HVn0.js:49350)
- **Purpose:** GitHub Cloud orgs configured for enterprise search changed; when feature flag `enterprise_search_mds_github_multiorg_enabled` is "on", client refetches data for the GitHub app (`pg.pn`).
- **Payload:**
  ```ts
  {
    type: "enterprise_search_github_cloud_orgs_updated";
  }
  ```
- **Notes:** No fields read. Gated by the flag.

### `external_auth_completed`
- **Registrar:** single
- **Handler:** `handleExternalAuthCompleted` (modules/eager/application/0620__HVn0.js:49437)
- **Purpose:** An external app auth flow finished. Client stores the event (`Ui.D(msg)`), refreshes search results or default state, clears connector-app mapping in work-object search tabs, and dismisses the email-connector NUX banner/badge for email connector apps.
- **Payload:**
  ```ts
  {
    type: "external_auth_completed";
    app_id: string;
    // whole message passed to Ui.D (other fields unverified)
  }
  ```

### `record_channel_digest_summary_updated`
- **Registrar:** single
- **Handler:** `handleRecordChannelDigestSummaryUpdate` (modules/eager/application/0620__HVn0.js:49517)
- **Purpose:** A channel digest summary was updated; client normalizes the summary (`Ud.uR([summary])`) and stores it.
- **Payload:**
  ```ts
  {
    type: "record_channel_digest_summary_updated";
    summary?: object; // full channel digest summary object, shape not visible here
  }
  ```

### `service_auth_completed`
- **Registrar:** single
- **Handler:** `handleServiceAuthCompleted` (modules/eager/application/0620__HVn0.js:49659)
- **Purpose:** A service auth flow completed for a user. If it is the current user and the configured provider's app matches, marks that provider as connected.
- **Payload:**
  ```ts
  {
    type: "service_auth_completed";
    provider_key: string;
    user_id: string;  // must equal the current user
    app_id: string;   // must equal the provider's configured app_id
  }
  ```

### `entity_comments_present`
- **Registrar:** single
- **Handler:** `workObjectCommentsRtmHandler` (modules/eager/application/0620__HVn0.js:49790)
- **Purpose:** Top-level comments for a work object entity are delivered. Gated by a feature check; stores the comments object, triggers a follow-up (`F1.xm` for entityId), and logs an analytics event.
- **Payload:**
  ```ts
  {
    type: "entity_comments_present";
    entity_id: string; // like "W:<appId>:..."; app id parsed from it
    // rest of the message is the comments collection object passed whole to FJ.X_ (contains `comments: Comment[]`, per the acknowledged handler)
  }
  ```

### `entity_comment_thread_present`
- **Registrar:** single
- **Handler:** `workObjectThreadCommentsRtmHandler` (modules/eager/application/0620__HVn0.js:49791)
- **Purpose:** Replies of a comment thread for a work object are delivered; stored via thread-comments action, with analytics.
- **Payload:**
  ```ts
  {
    type: "entity_comment_thread_present";
    entity_id: string;
    // whole message passed to FJ.Jz as thread comments; includes `comments: Comment[]` (inferred from the ack handler)
  }
  ```

### `entity_comment_action_acknowledged`
- **Registrar:** single
- **Handler:** `workObjectCommentActionAcknowledgedRtmHandler` (modules/eager/application/0620__HVn0.js:49795)
- **Purpose:** Server acknowledges a post/edit/delete comment action on a work object. Client updates the stored comment list (or thread), reply counts and reply users, marks errors, and refreshes entity state.
- **Payload:**
  ```ts
  {
    type: "entity_comment_action_acknowledged";
    comment_action: "post" | "edit" | "delete"; // UR.OI enum Post/Edit/Delete (exact strings unverified)
    entity_id: string;
    comment_id?: string;      // edit/delete
    thread_root_id?: string;  // present => comment is a thread reply
    comment?: {               // posted/edited comment, merged into the store
      id?: string;
      sender?: object;        // used for reply_users
      [k: string]: unknown;
    };
    error?: string | object;  // failure marker
  }
  ```
- **Notes:** Gated by a feature check. Post w/ error sets entity error; edit w/ error sets comment error; delete error calls `UM.B8(comment_id, error)`; success delete calls `FJ.Vh` + `UM.El`.

### `channel_action_updated`
- **Registrar:** single
- **Handler:** anonymous arrow (modules/eager/application/0620__HVn0.js:50223)
- **Purpose:** A channel action (app-provided) was updated; client upserts the action for the channel. Shares `formatActionPayload` with added/removed.
- **Payload:**
  ```ts
  {
    type: "channel_action_updated";
    channel: string;
    app_id: string;
    action_id: string | number; // toString()'d
    app?: object;                // full app object, stored on action
    action: {
      name: string;
      description: string;
      type: string;
      install_team_id?: string;
      install_team_name?: string;
    };
  }
  ```

### `channel_action_added`
- **Registrar:** single
- **Handler:** anonymous arrow (modules/eager/application/0620__HVn0.js:50231)
- **Purpose:** A channel action was added; same upsert as `channel_action_updated`, with different log text.
- **Payload:**
  ```ts
  {
    type: "channel_action_added";
    channel: string;
    app_id: string;
    action_id: string | number;
    app?: object;
    action: { name: string; description: string; type: string; install_team_id?: string; install_team_name?: string };
  }
  ```

### `channel_action_removed`
- **Registrar:** single
- **Handler:** anonymous arrow (modules/eager/application/0620__HVn0.js:50239)
- **Purpose:** A channel action was removed; client removes `action_id` from the channel's action list.
- **Payload:**
  ```ts
  {
    type: "channel_action_removed";
    channel: string;
    app_id: string;
    action_id: string | number;
    app?: object;
    action?: object; // optional, not used for removal
  }
  ```
- **Notes:** Shares `formatActionPayload`.

### `unfurl_preview_updated`
- **Registrar:** single
- **Handler:** `unfurlPreviewUpdatedHandler` (modules/eager/application/0620__HVn0.js:50247)
- **Purpose:** Server-generated unfurl previews for links in a draft/edit session are ready. Client finds the matching draft (by client_msg_id or url set), and for each URL with a pending unfurl stores the data and status (auth_required vs success); remote file blocks are also stored.
- **Payload:**
  ```ts
  {
    type: "unfurl_preview_updated";
    client_msg_id: string;
    attachments: {
      [url: string]: {
        user_auth_required?: boolean; // => status auth_required
        blocks?: Array<{ type: string; source?: string; file?: object; [k: string]: unknown }>; // "file"/"remote" block file is saved
        [k: string]: unknown;         // full unfurl attachment, passed to store
      };
    };
  }
  ```
- **Notes:** Ignored if no matching draft or unfurl is not pending.

### `identity_links_prefs_permission_change`
- **Registrar:** single
- **Handler:** `identityLinksPrefsPermissionChangeHandler` (modules/eager/application/0620__HVn0.js:50248)
- **Purpose:** Identity-links preference/permission changed; client dispatches `Uo.tk()` (a refetch/refresh of identity link prefs; internals unverified).
- **Payload:**
  ```ts
  {
    type: "identity_links_prefs_permission_change";
  }
  ```

### `user_session_expiration`
- **Registrar:** single
- **Handler:** anonymous arrow (modules/eager/application/0620__HVn0.js:50252)
- **Purpose:** Session expiration info changed; client re-requests the CLIENT_FOOTER notification space (to show/hide the expiration banner).
- **Payload:**
  ```ts
  {
    type: "user_session_expiration";
  }
  ```

### `salesforce_org_access_changed`
- **Registrar:** single
- **Handler:** anonymous arrow (modules/eager/application/0620__HVn0.js:50260)
- **Purpose:** Access flags of a Salesforce org changed. If org known locally, merges the changed fields into the stored org, refreshes connections, and re-requests sidebar header notifications.
- **Payload:**
  ```ts
  {
    type: "salesforce_org_access_changed";
    salesforce_org: {
      salesforce_org_id: string;
      can_access_elevate_features?: boolean;
      [k: string]: unknown; // merged into the stored org object
    };
  }
  ```

### `salesforce_org_authed`
- **Registrar:** single
- **Handler:** anonymous arrow (modules/eager/application/0620__HVn0.js:50269)
- **Purpose:** The user authenticated a Salesforce org. Stores the org (with `is_migrating: false`), optionally forwards to workflow-config handler under flag `sfdc_sales_home_user_config_workflow_support`, and if the org is connected runs connect tasks (home refresh, fetch, tracker refresh).
- **Payload:**
  ```ts
  {
    type: "salesforce_org_authed";
    salesforce_org_id: string;
    // remaining fields = full Salesforce org object (stored as-is; connected-ness checked by Uf.Yv); shape not visible
  }
  ```

### `salesforce_org_disconnected`
- **Registrar:** single
- **Handler:** `handleSalesforceOrgDisconnected` (modules/eager/application/0620__HVn0.js:50283)
- **Purpose:** A Salesforce org was disconnected for the user. Removes it from local state (unless a check says otherwise) and runs cleanup thunk `Ux.p`; flag-gated workflow handler also receives the message.
- **Payload:**
  ```ts
  {
    type: "salesforce_org_disconnected";
    salesforce_org_id: string;
    // whole message passed to UC.t under flag sfdc_sales_home_user_config_workflow_support
  }
  ```

### `salesforce_org_unavailable`
- **Registrar:** single
- **Handler:** anonymous arrow (modules/eager/application/0620__HVn0.js:50284)
- **Purpose:** A Salesforce org became unavailable (disconnected team-wide). Client runs org-unavailable cleanup (several clears, org removal, connection refresh).
- **Payload:**
  ```ts
  {
    type: "salesforce_org_unavailable";
    salesforce_org_id: string;
  }
  ```

### `workflow_permissions_warning`
- **Registrar:** single
- **Handler:** anonymous arrow (modules/eager/application/0620__HVn0.js:50293)
- **Purpose:** Warns that a workflow needs permissions; client (if a gating selector `rR.TZ` passes) opens WorkflowPermissionsPromptModal.
- **Payload:**
  ```ts
  {
    type: "workflow_permissions_warning";
    trigger_id: string;
    is_workflow_collaborator: boolean;
    collaborator_ids: string[];
    permissions: unknown; // passed to modal as-is (shape unverified)
  }
  ```

### `hermes_channel_reacji_trigger_updated`
- **Registrar:** single
- **Handler:** anonymous arrow (modules/eager/application/0620__HVn0.js:50305)
- **Purpose:** Reacji triggers for a channel changed; client marks that channel's cached object stale for the current team.
- **Payload:**
  ```ts
  {
    type: "hermes_channel_reacji_trigger_updated";
    channel_id: string;
  }
  ```

### `salesforce_org_config_updated`
- **Registrar:** single
- **Handler:** anonymous arrow (modules/eager/application/0620__HVn0.js:50312)
- **Purpose:** Org config changed; client updates `is_global_login_enabled` on the stored org (if known).
- **Payload:**
  ```ts
  {
    type: "salesforce_org_config_updated";
    salesforce_org_id: string;
    is_global_login_enabled: boolean;
  }
  ```

### `workflow_ai_step_response_updated`
- **Registrar:** single
- **Handler:** anonymous arrow (modules/eager/application/0620__HVn0.js:50320)
- **Purpose:** AI workflow step response progress; client records status COMPLETE if `completed` else PENDING for the reference.
- **Payload:**
  ```ts
  {
    type: "workflow_ai_step_response_updated";
    completed: boolean;
    reference_id: string;
  }
  ```

### `workflow_ai_step_response_changed`
- **Registrar:** single
- **Handler:** anonymous arrow (modules/eager/application/0620__HVn0.js:50328)
- **Purpose:** Full AI step response content update; same store action as above with content.
- **Payload:**
  ```ts
  {
    type: "workflow_ai_step_response_changed";
    event_ts: string;
    reference_id: string;
    status: string; // status enum from server (values not enumerated here)
    blocks?: unknown[];       // Block Kit blocks of response
    response_counter?: number;
    error?: unknown;
    error_message?: string;
  }
  ```

### `workflow_execution_step_started`
- **Registrar:** single
- **Handler:** anonymous arrow (modules/eager/application/0620__HVn0.js:50341)
- **Purpose:** A workflow execution step started. If feature selector passes and the trigger execution is not in a dismissed/ignored set, stores a workflow execution status (with workflow icon/title looked up locally), starts tracking it, and refreshes UI.
- **Payload:**
  ```ts
  {
    type: "workflow_execution_step_started";
    workflow_execution_id: string;
    workflow_id: string;
    trigger_execution_id: string;
    trigger_id: string;
    step_id: string;
    step_number: number;
    step_title: string;
    total_steps: number;
    has_conditional_branching: boolean;
    callback_id: string;
  }
  ```

### `reconnect_grace_period_started`
- **Registrar:** single
- **Handler:** `handleReconnectGracePeriodStarted` (modules/eager/application/0620__HVn0.js:50371)
- **Purpose:** Server tells the client that some channels were disconnected and a reconnect grace period began. Client refetches team info and `conversations.genericInfo` for those channels and updates stores.
- **Payload:**
  ```ts
  {
    type: "reconnect_grace_period_started";
    team_id: string;
    disconnected_channel_ids: string[];
  }
  ```
- **Notes:** Ignored if either is empty/missing.

### `eac_oauth_completed`
- **Registrar:** single
- **Handler:** anonymous arrow (modules/eager/application/0620__HVn0.js:50379)
- **Purpose:** EAC (CRM contact record) OAuth finished. On success stores the config, opens a "syncing-data-pane", and dismisses the footer flexpane space; otherwise logs an error.
- **Payload:**
  ```ts
  {
    type: "eac_oauth_completed";
    success: boolean;
    eac_config?: object; // full config passed to B8.OH (shape not visible)
  }
  ```

### `one_drive_app`
- **Registrar:** single
- **Handler:** `d` (modules/eager/application/0842__kRLZ.js:573)
- **Purpose:** OneDrive app events; on subtype `ms_oauth_completed` runs a refresh action and callback `i(msg)`.
- **Payload:**
  ```ts
  {
    type: "one_drive_app";
    subtype?: "ms_oauth_completed"; // other subtypes ignored
    // whole message forwarded to callback `i` (unverified)
  }
  ```

### `signin_refresh_qr_code`
- **Registrar:** single
- **Handler:** `signInRefreshQrCodeHandler` (modules/eager/application/0903__U5yn.js:19)
- **Purpose:** Server asks the sign-in page to refresh its QR code; client dispatches a SignInRefreshQRCodeEvent on an event target.
- **Payload:**
  ```ts
  {
    type: "signin_refresh_qr_code";
  }
  ```

### `activity`
- **Registrar:** single
- **Handler:** `handleActivityRTMEvent` (modules/eager/application/0902__Xy_z.js:586)
- **Purpose:** Activity feed updates, dispatched by `subtype`: deleted, updated (adds/updates an entry; V1 or V2 path by experiment; calendar upcoming events handled specially), invalidated (refetch). Unknown subtype logs a warning.
- **Payload:**
  ```ts
  {
    type: "activity";
    subtype: "activity_deleted" | "activity_updated" | "activity_invalidated";
    entry?: {
      key?: string;
      feed_ts?: string;
      is_unread?: boolean;
      is_breakthrough?: boolean;
      item: { type: string; /* e.g. CalendarUpcomingEvent */ [k: string]: unknown };
      [k: string]: unknown; // full activity entry, passed to activity reducers
    };
  }
  ```
- **Notes:** Delete/updated V1/V2/invalidated helper internals not inspected; `entry` required for updated, and used for deleted (key/feed_ts) (inferred).

### `activity_mark_all_read_completed`
- **Registrar:** single
- **Handler:** `activityMarkAllReadCompleted` (modules/eager/application/0902__Xy_z.js:589)
- **Purpose:** Mark-all-read finished; shows ActivityMarkAllAsReadToast with undo.
- **Payload:**
  ```ts
  {
    type: "activity_mark_all_read_completed";
    undo_key?: string; // toast shown only if truthy
  }
  ```

### `activity_clear_all_completed`
- **Registrar:** single
- **Handler:** `activityClearAllCompleted` (modules/eager/application/0902__Xy_z.js:590)
- **Purpose:** Clear-all finished; shows ActivityClearAllToast with undo (if a feature gate selector passes).
- **Payload:**
  ```ts
  {
    type: "activity_clear_all_completed";
    undo_key?: string | null; // nothing happens if null/undefined
  }
  ```

### `activity_views_updated`
- **Registrar:** single
- **Handler:** `activityViewsUpdated` (modules/eager/application/0902__Xy_z.js:591)
- **Purpose:** Activity view tabs changed; client rebuilds the view list from API views, removes views no longer present, resets the all-view, updates the default/hidden view types, and keeps the selection.
- **Payload:**
  ```ts
  {
    type: "activity_views_updated";
    views: Array<{
      view_type: string;
      [k: string]: unknown; // full view object, normalized by C.Cz
    }>;
  }
  ```
- **Notes:** Ignored if views missing/empty.

### `slackbot_ai_voice_tool_approval_requested`
- **Registrar:** single
- **Handler:** anonymous arrow (modules/eager/modern_vendor/10025__l2UX.js:569)
- **Purpose:** A voice Slackbot session needs the user to approve tool use. If `client_session_id` matches the active voice session, calls the listener's `onRequested`; otherwise ignored.
- **Payload:**
  ```ts
  {
    type: "slackbot_ai_voice_tool_approval_requested";
    client_session_id: string;
    approval_id: string;
    channel: string;
    expires_ts: string | number; // (inferred) expiry timestamp
    tools: Array<{ name: string; display_name: string; is_destructive: boolean }>;
    details?: unknown; // passed through unverified
  }
  ```

### `slackbot_ai_voice_context_added`
- **Registrar:** single
- **Handler:** anonymous arrow (modules/eager/modern_vendor/10025__l2UX.js:592)
- **Purpose:** Additional context was added for the live voice model; forwarded to listener `onContextAdded` for the matching session.
- **Payload:**
  ```ts
  {
    type: "slackbot_ai_voice_context_added";
    client_session_id: string;
    delegation_id: string;
    context_channel: string;
    text: string;
    signature: string;
  }
  ```

### `slackbot_ai_voice_tool_approval_resolved`
- **Registrar:** single
- **Handler:** anonymous arrow (modules/eager/modern_vendor/10025__l2UX.js:607)
- **Purpose:** A pending tool approval was resolved; listener `onResolved(approval_id, decision)` for the matching session.
- **Payload:**
  ```ts
  {
    type: "slackbot_ai_voice_tool_approval_resolved";
    client_session_id: string;
    approval_id: string;
    decision: string; // enum values not visible (e.g. approved/denied, unverified)
  }
  ```

### `slackbot_ai_voice_text_added`
- **Registrar:** single
- **Handler:** anonymous arrow (modules/eager/modern_vendor/10025__l2UX.js:2057)
- **Purpose:** Streamed Slackbot reply text to be spoken in an active voice session. Ignored unless active and channel (and thread, if set) match; skipped while ducking (barge-in); otherwise de-duplicates and sends text to the voice client, flushing when complete.
- **Payload:**
  ```ts
  {
    type: "slackbot_ai_voice_text_added";
    channel: string;
    thread_ts?: string; // compared if the session has a thread
    text: string;
    is_complete: boolean;
  }
  ```

### `awareness`
- **Registrar:** single
- **Handler:** anonymous arrow (modules/eager/modern_vendor/4260__NQN4.js:493)
- **Purpose:** Collaborative-awareness (e.g. canvas/topic presence) messages from other users, by subtype. Messages from the current user are ignored.
- **Payload:**
  ```ts
  {
    type: "awareness";
    subtype: "query" | "broadcast" | "close"; // anything else throws
    user: string;    // sender user id
    channel: string; // topic/channel id
    awareness_state?: unknown; // broadcast only: awarenessEntries, stored via eA.zZ
  }
  ```
- **Notes:** query => mark topic changed; broadcast => store entries; close => remove user from topic.

