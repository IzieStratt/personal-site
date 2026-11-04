# Realtime websocket: how to open one, keep it alive, and send `typing`

How a user-token (xoxc + `d` cookie) client opens the same realtime socket the Slack web client uses. **No headless browser is needed:** it is two plain requests and a WebSocket. Sources: [`jollyroger182/slack.ts`](https://github.com/jollyroger182/slack.ts/blob/main/src/receivers/rtm.ts) (read, not run) and huddlefm (see `huddles-and-chime.md`, which has a second, direct-URL variant). Nothing on this page was live-called by this project, and the "typing" send shape is **not verified for the web client** (see below).

## Not Bolt

In slack.ts's snippet `this.#client.request('client.getWebSocketURL', {})`, `client` is slack.ts's own `App` class (`src/client.ts`), **not Bolt** (`@slack/bolt`). `App.request(method, args)` is its generic Web API POST. `rtm.send(...)` is a method on slack.ts's `RTMReceiver` (the thing created when you pass `{ type: 'rtm' }` as the receiver). Neither is a Slack API method name. The only Slack method involved is `client.getWebSocketURL` (undocumented, in the catalog).

## Flow (slack.ts)

1. `POST client.getWebSocketURL` with the **xoxc** token and `Cookie: d=<xoxd>`. The response contains `primary_websocket_url`.
2. Append `?token=<xoxc>` to that URL (`url.searchParams.set('token', ...)`) and open a WebSocket with header `Cookie: d=<xoxd>`. (Node needs the `ws` package to set headers; the built-in `WebSocket` cannot send a Cookie header.)
3. Wait for `{"type":"hello", "region": ...}`.
4. Send `{"type":"ping","time":<Date.now()>}` about every **44 s**; the server answers `{"type":"pong","time":...}`, so `Date.now() - time` is the round trip. (huddlefm instead pings every 5 s with `id`.)
5. The server may send `{"type":"reconnect_url","url":"wss://..."}`. Store it and use it for the **next** reconnect instead of calling `client.getWebSocketURL` again.
6. On `close` or `error`, reconnect (retry loop). On `{"type":"error","error":...}` log it.
7. Strip `\0` bytes from message text before `JSON.parse` (slack.ts does `replaceAll('\0','')`).

Alternative: connect straight to `wss://wss-primary.slack.com/?token=<xoxc>&...` with the query string documented in `huddles-and-chime.md` (no `getWebSocketURL` call).

## Messages you can send

Every outgoing frame is JSON. slack.ts's `send()` adds an incrementing integer `id` and waits for a frame with `reply_to` equal to that id (`{"ok":true,"reply_to":<id>}` or `ok:false`).

| Send | Reply / effect |
|---|---|
| `{"type":"ping","time":<ms>}` | `{"type":"pong","time":<ms>}` |
| `{"type":"presence_sub","ids":["U..."]}` | Subscribes to `presence_change` events for those users. |
| `{"type":"presence_query","ids":["U..."]}` | One `presence_change` event with `presence: "active"|"away"` (batched in `users: [...]` or single `user`). |
| `{"id":1,"type":"typing","channel":"C..."}` | **Typing indicator**, see below. |

## Typing

**Receiving:** event `{"type":"user_typing","channel":"C...","user":"U..."}` (typed as `UserTypingEvent` in slack.ts, `src/receivers/rtm.ts` around line 351; listed in its event-type list around line 418). It is emitted like any other RTM event.

**Sending:** slack.ts has **no typing helper**; its `RTMReceiver` only exposes `start`, `stop`, `subscribe`, `presence`, and the generic `send`. The documented classic-RTM way to say "I am typing" is to write this frame on the socket:

```json
{"id": 1, "type": "typing", "channel": "C024BE91L"}
```

With slack.ts that is `await rtm.send({ type: 'typing', channel })`. Sources: Slack's classic RTM documentation (from memory, not re-checked this session). Treat it as **unverified for the current web client**: I searched Slack's client bundle (build 128106, `client-boot` plus ~400 async chunks, the last build for which the full chunk set could be fetched) for a `type:"typing"` frame or a `user_typing` send and found only UI-status uses of the word, no send. The chunk that likely holds the socket-send code (`gantry-v2.<hash>`) returns 403 from the CDN, so it could not be read. Best way to confirm: open the web client, DevTools -> Network -> WS, type in a channel, and read the outgoing frame. The web client may also send thread info (`thread_ts`) on thread replies; unknown.

Send it at most every few seconds per channel; the real client throttles it.

## Verified vs not

| Claim | Status |
|---|---|
| `getWebSocketURL` -> `primary_websocket_url`, token query param, `d` cookie header | read in slack.ts source |
| ping ~44 s, `reconnect_url`, `hello`, `presence_sub`/`presence_query` | read in slack.ts source; `presence_sub` string also found in client bundle build 128106 |
| `{"type":"typing"}` outgoing frame | classic RTM docs (memory); **not** found in the web client bundle |
| Whether Slack still accepts it on the user gateway | not tested |
