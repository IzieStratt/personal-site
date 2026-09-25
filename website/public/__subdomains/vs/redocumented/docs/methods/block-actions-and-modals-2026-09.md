# Pressing app buttons and submitting app modals as a user (2026-09)

How Slack's web client clicks a Block Kit button in someone else's app
message, and how it submits the modal that app opens, all from a session
(`xoxc` + `d` cookie). Three methods work together: `blocks.actions`,
`views.submit` and the RTM websocket from `rtm.connect`.

**Provenance.** Live-tested on 2026-09-25 against the Hack Club workspace
(Enterprise Grid). The test used a third-party Bolt app's message buttons and
`views.open` modal. It was repeated across a few dozen messages in several
channels.

**Verified.** Every call shape, token choice, error and event field below was
seen in a real response.

**Not verified.**
- Buttons in ephemeral messages, app unfurls, App Home or modals (only
  `container.type: "message"` was tried).
- Select menus and other non-button elements.
- Modals that use `response_action: "push"` or `"update"`.

## The flow

1. **Connect the websocket.** Call `rtm.connect` with the **team** xoxc and
   open the returned `url`, sending the `d=` cookie as a header. Connect
   before clicking, because the modal only arrives on this socket.
2. **Click.** Call `blocks.actions` with the **enterprise** xoxc. The response
   is only `{"ok": true}`; the modal is not in it.
3. **Receive the modal.** A `view_opened` event arrives on the socket about a
   second later, if the app calls `views.open` with the click's `trigger_id`.
4. **Submit.** Call `views.submit` with the **enterprise** xoxc, the
   `view_id` from that event, and the input values in `state`.

## `blocks.actions`

```
POST https://slack.com/api/blocks.actions      (hackclub.slack.com and
token=xoxc-ENTERPRISE-REDACTED                  hackclub.enterprise.slack.com
service_id=B0XXXXXXXX                           behave the same)
actions=[{"action_id":"<button action_id>","block_id":"<block_id>",
          "text":{"type":"plain_text","text":"<button label>","emoji":true},
          "value":"<button value>","type":"button","action_ts":"1790000000.000000"}]
container={"type":"message","message_ts":"<msg ts>","channel_id":"C0XXXXXXXX",
           "is_ephemeral":false,"thread_ts":"<parent ts, if a reply>"}
client_token=web-<ms timestamp><4 digits>
```

- **`service_id`** is the message's `bot_id` (`B…`).
- **`actions[0]`** is copied from the button element in the message's
  `blocks`, plus that block's `block_id`. The app receives exactly this, so
  `value` must be the button's real value.
- **`container.is_ephemeral`** is required. Leaving it out gives
  `invalid_arguments` with `missing required field: is_ephemeral
  [json-pointer:/container]`.
- **`client_token`** is echoed back on the `view_opened` event, so it is the
  way to tell which click opened which modal. Use a fresh one per click.

### Tokens and errors

| Condition | Result |
|---|---|
| **team** xoxc (any host, with or without `slack_route` / `_x_*` params) | `team_is_restricted` |
| **enterprise** xoxc, you are not a member of the channel | `invalid_container` |
| **enterprise** xoxc, member, `container` without `is_ephemeral` | `invalid_arguments` (schema error, above) |
| **enterprise** xoxc, member, `action_id` the app doesn't handle | `post_error`, `"message": "App took too long to respond. Please try again, or contact the app's developer."` |
| **enterprise** xoxc, member, real button | `{"ok": true}` |

- **`invalid_container` means channel membership.** It is not about the JSON.
  Adding `team_id` to the container or as a parameter doesn't help. The same
  container works once the caller is in the channel, including for thread
  replies.
- **`post_error` confirms the app got the click.** This is what the app did
  with the payload: Slack forwarded it, and the app never sent a 3-second
  `ack()` for an unknown `action_id`.

## `view_opened` (RTM event)

This arrives on the **team** xoxc's RTM socket. `rtm.connect` with the
enterprise xoxc returns `enterprise_is_restricted`.

The view's fields are **flat on the event**, not nested under `view`. The ID
is `view_id`, not `id`:

```json
{"type": "view_opened", "view_id": "V0XXXXXXXXX", "root_view_id": "V0XXXXXXXXX",
 "previous_view_id": null, "timeout_range": 10000,
 "client_token": "web-17900000000000000",
 "title": {"type": "plain_text", "text": "…"}, "submit": {…}, "callback_id": "…",
 "private_metadata": "…", "blocks": [ … ]}
```

- **`client_token`** is the value sent to `blocks.actions`.
- **`timeout_range`** (10000 ms here) is how long the client waits for the
  view.

## `views.submit`

```
POST https://slack.com/api/views.submit
token=xoxc-ENTERPRISE-REDACTED
view_id=V0XXXXXXXXX
client_token=web-<new token>
state={"values":{"<block_id>":{"<action_id>":{"type":"plain_text_input","value":"…"}}}}
```

- **`state.values`** has the same shape an app sees in
  `view.state.values`, keyed by the input block's `block_id` and then the
  element's `action_id`. Include the element's `type`.
- **The enterprise xoxc returned `ok: true`** and the app handled the
  submission. The team xoxc was not tried.

## Finding the message to click

- **`search.messages` works with the team xoxc.** Matches include `blocks`,
  but they may be stale.
- **Thread replies need their parent.** A match doesn't carry `thread_ts`,
  but its `permalink` ends in `?thread_ts=<parent ts>`.
- **Re-fetch the live message before clicking.** Its current blocks tell you
  whether the button is still there:
  - thread reply: `conversations.replies` with `channel`,
    `ts=<parent>`, `latest=oldest=<msg ts>`, `inclusive=true`
  - top-level message: `conversations.history` with the same range
- **Edits arrive on RTM** as `message` events with
  `subtype: "message_changed"`. The new blocks are in `event.message`.
