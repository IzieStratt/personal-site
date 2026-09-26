# Huddles: Chime data-channel peer messages (drawing, reactions, awareness, …)

**Provenance: source-read (2026-09-25) and then live-tested (2026-09-26).** The schema and receive-side behavior
below come from reading Slack's shipped webapp JavaScript. The screenshare-drawing parts were then tested against a
real huddle on this workspace, with a from-scratch client (no browser, no Slack app): Slack Web API for `rooms.join`,
a raw Chime signaling websocket, and a pure-JS WebRTC stack for the audio leg. Each claim says which it is:
**[live]** = observed in a real huddle, **[source]** = read from the client code only.

These are **not** Web API methods, so there are no `data/methods.json` entries. This page picks up where
[`huddles-and-chime.md`](huddles-and-chime.md) ends: that page covers joining and the Chime media layer (including
joining without a browser); this one covers what travels *inside* the Chime session.

## The short version (screenshare drawing)

- Drawing is a `PeerMessage.draw` protobuf sent as a Chime **data message** on topic `data-channel`. Any attendee
  that Slack clients know about can draw on anyone's **screen** share. **[live]**
- One message = one cubic Bézier segment. Coordinates are 0..1 over the shared video. **[live]**
- Every sender (attendee) owns **exactly one line in one hue**. More colours need more attendees, which means more
  *accounts*: repeated joins from one account get the same attendee id and share one line. **[live]**
- Lines **can't be erased**; they only fade (0.7 s after `END`, or 5 s after the last stroke, then a 3 s fade). **[live]**
- Chime delivers about **150 data messages/s per meeting** (all senders together), with a burst allowance of about
  200. Anything above is dropped silently. **[live]**
- The drawings are **not in the share's video**: every Slack client renders them itself. **[live]**

## Live-tested behavior (2026-09-26)

Everything in this section was observed in a real huddle on the Hack Club workspace, drawn by bot attendees
(browser-session accounts joined with `rooms.join`, see [`huddles-and-chime.md`](huddles-and-chime.md)) and watched
both by people in the huddle and by another bot attendee receiving a screen share's video.

### Sending

- Wrap each draw as `PeerMessage{ draw: {...}, fromPeerIdString: <own attendeeId> }` and send it as a Chime
  `DATA_MESSAGE` on topic `data-channel` (lifetime 0). A hand-written protobuf encoder is enough; there's nothing
  else in the frame.
- **`itemId` must be the sharer's attendeeId** (the screen share's source is listed in Chime's `INDEX` frame as
  `<sharerAttendeeId>#content`; strip `#content`). Confirmed: drawings with that `itemId` show up; with any other
  `itemId` they don't.
- **The sender has to be a present attendee.** Slack clients drop draws from attendees they don't know, and they only
  learn about attendees Chime reports in `AUDIO_STREAM_ID_INFO`, which only happens once the attendee's **audio
  connection is up** (sending near-silent Opus is enough). A signaling-only connection can send data messages, but
  its drawings never appear.
- Drawing works on **screen** shares (`desktop:screen`). A share's attendeeId changes every time the share is
  restarted, so long-running drawers should follow `INDEX` updates.
- Stay under 2048 bytes per message; a draw message is ~100 bytes.

### Lines, colours and accounts

- **One line per attendee, one hue per line.** `CHANGE_HUE` recolours the sender's *whole* current line (drawn red,
  green and blue bars from one attendee all turned blue). The colour is always `hsla(hue, 100%, 75%)`: only the hue
  varies, so every colour is a pastel, and nothing can be drawn dark, grey or white.
- **Multiple connections from one account don't give more lines.** `rooms.join` returns the *same* AttendeeId and
  JoinToken to the same user every time while the room lives, whatever the params. Chime happily accepts several
  websocket connections for that attendee (none were kicked), but Slack keys lines by attendee, so all of them draw
  onto one line with one colour. **N colours at once need N accounts.**
- **Each attendee shows a pencil cursor and a name tag** (the account's display name) at its last point.
  `POSITION` with a point far off-screen (e.g. `-5,-5`) **hides it** until the next `NEW`/`EDIT` moves it back.
  `POSITION` doesn't touch the line or its fade timer. A NaN point parks the tag in the top-left corner.

### Fading, and why you can't erase

Observed timing matches the source: after `END` the line starts fading 0.7 s later; with no `END`, it starts fading
5 s after the last non-`POSITION` message; the fade lasts 3 s, then the line is cleared.

**Nothing removes a line early.** Tried, each on its own line, next to a control line that just got `END`:

| Attempt | Result |
|---|---|
| send a `NEW` with a different `itemId` | line stayed, normal fade |
| send a segment with NaN coordinates | line stayed, normal fade (and the name tag jumped to the top-left) |
| `END`, then immediately a `NEW` far off-screen | line stayed, normal fade |
| a draw with an unknown `type` (0) | line stayed, normal fade |

Consequences, found the hard way while playing video as a flipbook:

- **Any stroke before the fade has finished brings the whole old line back** at full opacity. An account can only
  start a fresh picture once its previous line is completely gone.
- To keep a drawing up, keep sending something (an `EDIT` that repeats the last segment is a no-op for the picture)
  well inside 5 s. Keep-alives count against the rate limit below and get dropped with everything else if you're
  over it, so leave headroom.
- If an `END` is dropped, the line lives ~8 s instead of ~3.7 s. Sending `END` twice (a few hundred ms apart) and
  waiting ~8.5 s before reusing an account avoided every "old frame came back" glitch.
- So the fastest honest flipbook is limited by accounts, not by Slack: frames per second × ~8 s = accounts needed
  (plus one per extra colour layer per frame).

### Throughput

Measured by one attendee sending on a throwaway topic (Slack clients ignore unknown topics) and a second attendee
counting what arrived:

| Test | Delivered |
|---|---|
| steady 100-160/s | all |
| steady 250/s for 4 s | ~150/s |
| 2 senders at 160/s each | ~163/s combined |
| burst of 50 / 100 / 200 after 6 s idle | all |
| burst of 400 after 6 s idle | ~200 |

So the limit is a **per-meeting token bucket: ~200 capacity, refilling at ~150/s**, shared by all senders. Excess is
**dropped silently** (receivers never see a `throttled` flag). Sustained 800+/s gets the sender disconnected (close
1006). The limit counts **payloads**, not bytes or frames: 1900-byte payloads at 150/s all arrive, and packing 10
payloads into one `DATA_MESSAGE` frame doesn't help. Since each `draw` carries one segment, drawing tops out at about
150 segments/s per huddle, however many accounts draw.

Ways to get more picture per message:
- **Curves.** A segment is a full cubic Bézier, so outlines traced as smooth curves (contours → simplification →
  Catmull-Rom) need a small fraction of the messages that straight hatching does.
- **Hairpins.** For filled areas, one Bézier `a=(x0,y), b=c=(x1',y)…(x1',y+1), d=(x0,y+1)` runs out along one row and
  back along the next, filling a band two pens tall per message: half the messages of plain hatching.

### Seeing what was drawn (from outside a Slack client)

- A share's **video stream never contains the drawings**: each viewer's Slack client draws them over the video
  itself. (Recording the sharer's own screen doesn't show drawings on their share either.)
- An attendee can **receive a share's video** with no browser: take the share's `streamId` from `INDEX` and put it in
  `receiveStreamIds` in the `SUBSCRIBE` (the offer already has a `recvonly` video section). The RTP comes in as
  H.264 (payload type 102 in the offer used) and can be forwarded to ffmpeg with an SDP file. Send an RTCP PLI now
  and then so a decoder gets keyframes. The same connection also receives the huddle's **mixed audio** (Opus).
- Every attendee also receives everyone else's data messages, so a recorder can log the draw messages and re-render
  them onto the recorded video with the rules on this page (one line per sender, pastel hue, 7 px round pen, the
  fade timings above).

## Provenance (source reading, 2026-09-25)

| Source | Detail |
|---|---|
| `a.slack-edge.com/bv1-13-br/client-boot.083fadc6a9b0600a.min.js` | `AudioVideoFacadeSubscriber` (send/receive, topic names, draw converters), transcript catch-up and awareness managers |
| `a.slack-edge.com/bv1-13-br/gantry-v2-async-gantry-v2-shared-boot-async.080032942d9a3cd0.min.js` | Same code (second copy), plus `ProgressiveCurveTransformer` (how draw coordinates are produced) |
| `a.slack-edge.com/bv1-13-br/gantry-v2-vendors-client.8e92a1d8e3272dd2.min.js` | Webpack module `px0L`: protobuf-es v2 embedded file descriptor for `calls/client/peer_message.proto` (proto3). Decoded from base64 into the schema below |
| Desktop client | Slack for Mac 4.52.162 (bundles taken from its HTTP cache on 2026-09-25) |

Method: I downloaded the bundles (they're brotli-precompressed), searched them, and decoded the
`FileDescriptorProto` by hand. Field numbers and enum values come from the descriptor itself, not
guesses.

## Transport

Huddle peers exchange small app-level messages with the AWS Chime SDK's realtime data messages
(`audioVideo.realtimeSendDataMessage(topic, bytes)` and
`realtimeSubscribeToReceiveDataMessage(topic, cb)`). These messages go through Chime signaling,
not the Slack websocket and not any `slack.com/api` method.

| Topic | Used by | Payload |
|---|---|---|
| `data-channel` | `AudioVideoFacadeSubscriber`: draw, reacji, capabilities, background, mute requests, jukebox, content-share details, recording notice, kick notice | `PeerMessage` (binary protobuf) |
| `awareness-sync-channel` | Awareness broadcaster/listener (`awarenessBroadcast` / `awarenessQuery` / `awarenessClose`) | `PeerMessage` |
| `transcript-catchup` | Transcript catch-up manager | `PeerMessage` with `transcriptCatchUp` |

Receive-side behavior on `data-channel`:
- Messages from your own attendee ID are ignored. The only exception is logging when `throttled` is set.
- `draw`, `reacji`, `muteRequest` and `jukeboxRequest` are **dropped when the sender isn't in the
  receiver's peer cache** ("Dropping draw message from unknown peer"). A sender has to be a
  joined attendee.
- Incoming mute requests aimed at you are rate-limited per sender: at most one per 10 s, and at
  most 50 in total.
- Before sending, the client checks `audioVideoController.meetingSessionContext.signalingClient.ready()`.
  If it isn't ready, it logs "Data channel is not ready to use" and drops the message.

Every outgoing message sets `fromPeerIdString` to the sender's Chime `attendeeId`.

## Schema (`calls/client/peer_message.proto`, proto3)

```proto
message PeerMessage {
  Reacji reacji = 1;
  Draw draw = 2;
  uint64 fromPeerId = 3;               // legacy; client sends fromPeerIdString
  string fromPeerIdString = 4;
  Capabilities capabilities = 5;
  Background background = 6;
  MuteRequest muteRequest = 10;
  AwarenessBroadcast awarenessBroadcast = 11;
  AwarenessQuery awarenessQuery = 12;
  AwarenessClose awarenessClose = 13;
  JukeboxRequest jukeboxRequest = 14;
  ContentShareDetails contentShareDetails = 15;
  RecordingStartNotification recordingStartNotification = 16;
  TranscriptCatchUp transcriptCatchUp = 17;
  KickNotification kickNotification = 18;

  message Reacji {
    enum Type { Unknown_reaction_type = 0; Effect = 1; Standard = 2; Gif = 3; }
    string emoji = 1; Type type = 2; string emojiUrl = 3;
  }
  message Point   { double x = 1; double y = 2; }
  message Segment { Point a = 1; Point b = 2; Point c = 3; Point d = 4; }   // cubic Bézier
  message Draw {
    enum Type { UNKNOWN_DRAW_TYPE = 0; NEW = 1; EDIT = 2; END = 3; CHANGE_HUE = 4; POSITION = 5; }
    Type type = 1; Segment segment = 2; int32 hue = 3; string itemId = 4; double x = 5; double y = 6;
  }
  message Capabilities        { bool isDrawEnabled = 1; }
  message ContentShareDetails { string sourceType = 1; string itemId = 2; }
  message Background          { string url = 1; }
  message MuteRequest         { string peerId = 1; }
  message JukeboxRequest      { string songKey = 1; bool stop = 2; }
  message RecordingStartNotification {
    enum Type { UNKNOWN_TYPE = 0; SUMMARY = 1; }
    Type type = 1; string recordingType = 2;
  }
  message KickNotification    { string kickedUserId = 1; }
  message TranscriptCatchUp {
    enum Type { SOLICIT = 0; OFFER = 1; REQUEST_FROM = 2; RESPONSE = 3; RESPONSE_CHUNK = 4; }
    Type type = 1; repeated TranscriptLine lines = 2; uint32 chunk_index = 3;
    uint32 total_chunks = 4; string request_id = 5; uint64 earliest_transcript_timestamp_ms = 6;
  }
  message TranscriptLine { string user_id = 1; string content = 2; uint64 start_time_ms = 3; uint64 end_time_ms = 4; }
  message AwarenessPayload {
    string field_name = 1; string field_value = 2; optional int64 field_timestamp_ms = 3;
  }
  message AwarenessBroadcast { string channel = 1; string user = 2; repeated AwarenessPayload awarenessState = 3; }
  message AwarenessQuery     { string channel = 1; string user = 2; }
  message AwarenessClose     { string channel = 1; string user = 2; }
}
```

## Every message: what to send, and how receivers respond

These are fire-and-forget broadcasts to everyone in the Chime meeting. There is no
request/response pairing, except for the transcript catch-up and awareness handshakes below.
"Receiver" means the stock Slack client (4.52.x webapp code). Every message is wrapped as
`PeerMessage{ <field>: {...}, fromPeerIdString: <sender attendeeId> }`.

### Topic `data-channel`

| Field | Sender passes | Receiver does | Checks |
|---|---|---|---|
| `draw` (2) | `{type, segment?, hue?, itemId, x?, y?}`. See the drawing section | Publishes `{id: senderAttendeeId, ...draw}` to the draw renderer | sender must be a known peer |
| `capabilities` (5) | `{isDrawEnabled: bool}`. Sent when screenshare starts or stops, and on `propagateDrawEnabled` | Stores `isDrawEnabled` on that peer's state (ignored if the field is unset) | none |
| `reacji` (1) | `{emoji: "<name>", type?: Effect\|Standard\|Gif, emojiUrl?}` | Shows the reaction on the sender's tile (`emojiUrl` is resolved through the client's own emoji-URL lookup) and logs a `SEND_REACTION` activity event for the sender's userId | known peer; `emoji` required |
| `muteRequest` (10) | `{peerId: <target attendeeId>}` | **If `peerId` is the receiver's own attendeeId, it turns off the receiver's microphone** (source `PeerMuteRequest`) and shows a "peer muted you" alert. Everyone else ignores it | known peer; per sender, at most 1 per 10 s and 50 in total |
| `jukeboxRequest` (14) | `{songKey}` or `{stop: true}` | Only the current **DJ** acts on it, and only when the jukebox feature is on: it looks up `songKey` in the song table, then plays it or stops | known peer |
| `contentShareDetails` (15) | `{sourceType, itemId: <sender attendeeId>}`. Sent with `capabilities` when a share starts | Sets the peer's `contentShareSource` and `isDrawEnabled`. Drawing is allowed only for `desktop:screen` and `desktop:window` (window needs desktop ≥ 4.30.79) | `itemId` and `sourceType` required |
| `kickNotification` (18) | `{kickedUserId: "U…"}` | Everyone except the sender dispatches a "X removed Y" notice and the kick handling for `kickedUserId` | known peer |
| `background` (6) | `{url}` | **No receive branch** in this build, so it's sent and then ignored | none |
| `recordingStartNotification` (16) | `{type: SUMMARY, recordingType?}` | **No receive branch** in this build | none |

`sourceType` values (enum `ContentShareSource`): `desktop:screen`, `desktop:window`,
`desktop:unknown`, `browser:content`, `mobile:screen`, `unknown`.

### Topic `transcript-catchup` (late joiners fetching earlier transcript)

1. The joiner sends `SOLICIT {requestId: "<self>-<ms>"}` (a probe uses `"<self>-probe-<ms>"`).
2. Every peer that has transcript lines replies `OFFER {requestId, earliestTranscriptTimestampMs}`.
3. After 2 s the joiner sorts the offers (earliest first) and sends
   `REQUEST_FROM {requestId: "<chosenAttendeeId>:<requestId>"}`.
4. The chosen peer (the prefix before `:` must be its own attendeeId) replies with lines from the
   **last 20 minutes**. It sends one `RESPONSE {lines, requestId}` if the wire size is under 2048 bytes,
   otherwise several `RESPONSE_CHUNK {lines, chunkIndex, totalChunks, requestId}` messages,
   each under 2032 bytes (long lines are split).
5. The joiner waits 5 s per chunk, and tries up to 3 candidates before giving up.

`TranscriptLine = {user_id, content, start_time_ms, end_time_ms}`.

### Topic `awareness-sync-channel` (per-channel presence state)

- On connect, a broadcaster sends `awarenessQuery {channel, user}`.
- When it has changes, it sends `awarenessBroadcast {channel, user, awarenessState: [{field_name, field_value, field_timestamp_ms?}]}`.
  Changes are batched every 250 ms (at most one flush per 500 ms, with 0-15 s jitter per topic), and
  there's a full rebroadcast every 30 s. Timestamps are only included when
  `isHuddlesAwarenessTimestampEnabled` is set.
- Queries go out at most every 15 s. Entries expire through a TTL sweep every 5 s.
- On shutdown it sends `awarenessClose {channel, user}`.
- Listeners dispatch query/broadcast/close into the team store. The broadcaster ignores incoming messages.
- The `field_name` values were not enumerated.

## Screenshare drawing in detail (source)

- **Capability toggle:** when someone turns drawing on or off, the client sends
  `{capabilities:{isDrawEnabled}}`. Receivers store it per peer as `isDrawEnabled`, which also
  appears as `is_draw_enabled` in the participant-state JSON schema.
- **Coordinates are normalized to 0..1** over the shared video's bounding rect
  (`ProgressiveCurveTransformer.add`: `[(x-left)/width, (y-top)/height]`), with points smoothed
  into cubic Bézier segments:
  - first point of a stroke: `NEW` with a degenerate segment (`a=b=c=d`)
  - later points: `NEW` when the smoothed segment's start point moves (appends a segment),
    otherwise `EDIT` (replaces the last segment)
  - stroke finished: `END`
- `CHANGE_HUE` (`hue`, int32): **degrees 0-359** on the HSL wheel. The client starts each huddle
  with `drawHue = Math.floor(360*Math.random())`, and the renderer draws
  `hsla(hue, 100%, 75%, opacity)` with an `hsla(hue, 80%, 50%, 1)` shadow (blur 5). Only the hue is
  controllable. Saturation, lightness, width (7 px) and caps (round) are fixed.
- `POSITION` (`x`,`y`, normalized): moves the sender's cursor and name tag. It doesn't affect
  lines or fade timers.
- **Rendering model** (`BaseDrawRenderer` / `DrawLine`): there is **one line per sender attendee**
  (`peerLines[senderId]`), drawn as a single path. Every segment gets its own `moveTo(a)`, so
  segments don't have to connect. A `CHANGE_HUE` recolors the sender's whole current line.
  - `NEW` appends a segment and cancels any fade. `EDIT` replaces the last segment.
  - `END` starts a 700 ms inactivity timer. Any non-`POSITION` message also resets a 5 s
    "vestigial" timer. When either fires, the line fades over 3 s (width 7→4, opacity 1→0) and is
    then cleared.
  - The renderer drops messages whose `itemId` doesn't match the share it's drawing over, so
    `itemId` should be the **sharer's attendeeId**. That's inferred from the filter and the `"self"` swap, not observed on the wire. For the sharer drawing on their own screen,
    that's `"self"` → their attendeeId.
- `itemId`: locally the client uses `"self"`, which is swapped for the sender's attendeeId on
  send and swapped back on receive.
- Desktop builds **older than 4.18.0** divide coordinates by the zoom scale factor on send and
  multiply on receive (`getScaleFactorForCurrentZoomLevel`). Newer builds use 1.

## Open questions

- Whether any other message type can clear a line early (only the four attempts above were tried).
- Whether the per-meeting rate limit differs by region or meeting size.
- `Background.url` format (no receiver in this build), and the awareness `field_name` values.
- `reacji`, `muteRequest`, `jukeboxRequest`, `kickNotification` and the transcript/awareness flows are source-read
  only; none were sent live.

## Safety

Everything above was done on dedicated, clearly-labelled accounts, in a huddle whose participants were in on it.
Draws, reactions and especially `muteRequest` / `kickNotification` act on other people's clients; don't send them
into a huddle whose participants haven't agreed to it.
