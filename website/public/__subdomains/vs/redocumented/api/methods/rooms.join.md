# rooms.join

- status: undocumented
- verified: existence-only
- tokens: unknown - not live-tested
- write-shaped name: yes, do not call without a human in the loop
- source: 3kh0/slack-datamine, build 132396 (committed webpack mining); ingoau/huddlefm (source read, commit 2097946; not live-tested); LeafdTK/huddlecast (source read, commit 65a041d; not live-tested); deployor/hq-fishbowl (source read; trusted)
- call: POST https://slack.com/api/rooms.join

Join (or start) a huddle in a channel as the calling user; returns an AWS Chime meeting+attendee under call.free_willy for the media layer. Joins a real call visibly -- do not call without a human in the loop.

## Params

| name | required | type | description |
|---|---|---|---|
| `channel_id` | yes | string | Channel to join/start the huddle in. |
| `regions` | no | string | Chime media region to request. Working clients use ap-southeast-2 (huddlefm), us-west-1 (huddlecast), us-east-2 (hq-fishbowl). |
| `multidevice` | no | string | Sent as "true" by huddlefm and "false" by huddlecast; omitted by deployor/hq-fishbowl, so not required. Meaning unconfirmed. |
| `token` | yes | string | xoxc client token; also needs Cookie: d=<xoxd>. Host must be <workspace>.slack.com. |

Source: ingoau/huddlefm (source read, commit 2097946; not live-tested); LeafdTK/huddlecast (source read, commit 65a041d; not live-tested) -- 'required' is inferred from these clients always sending them; deployor/hq-fishbowl (source read, commit c1619f1, 2025-08-06; trusted source): only channel_id, regions, token + Cookie header are sent, no _x_* fields

## Response

| field | type |
|---|---|
| `ok` | boolean |
| `call` | { |
| `call.call_id` | string |
| `call.free_willy.meeting` | Chime Meeting object (MeetingId, MediaRegion, ExternalMeetingId, MediaPlacement, MeetingFeatures/null) |
| `call.free_willy.attendee` | Chime Attendee object (AttendeeId, ExternalUserId, JoinToken, Capabilities) |
| `canvas.thread_channel_id` | string |
| `canvas.root_thread_ts` | string |
| `huddle.id` | string |
| `huddle.created_by` | string |
| `huddle.participants` | string[] / {user_id: string}[] |

Source: ingoau/huddlefm (source read, commit 2097946; not live-tested); LeafdTK/huddlecast (source read, commit 65a041d; not live-tested) -- partial: only fields these clients read

---
JSON: https://vs.izie.top/redocumented/api/methods/rooms.join.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
