# screenhero.rooms.info

- status: undocumented
- verified: existence-only
- tokens: unknown - not live-tested
- write-shaped name: no
- source: 3kh0/slack-datamine, build 132396 (committed webpack mining); ingoau/huddlefm (source read, commit 2097946; not live-tested); LeafdTK/huddlecast (source read, commit 65a041d; not live-tested)
- call: POST https://slack.com/api/screenhero.rooms.info

Read a huddle/room's state by call id (participants, camera/screenshare state, thread, ended). Used to join an invited huddle and to poll room state.

## Params

| name | required | type | description |
|---|---|---|---|
| `room` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified); ingoau/huddlefm (source read, commit 2097946; not live-tested); LeafdTK/huddlecast (source read, commit 65a041d; not live-tested) (confirm 'room' param; huddlefm also sends _x_reason=all-calls-store/conditional-fetch)

## Response

| field | type |
|---|---|
| `ok` | true |
| `room` | { |
| `id` | string |
| `name` | string |
| `media_server` | string |
| `created_by` | string |
| `date_start` | number |
| `date_end` | number |
| `participants` | string[] |
| `participant_history` | string[] |
| `participants_events` | Record<UserId, { |
| `user_team` | Record<string, unknown> |
| `joined` | boolean |
| `camera_on` | boolean |
| `camera_off` | boolean |
| `screenshare_on` | boolean |
| `screenshare_off` | boolean |
| `participants_camera_on` | unknown[] |
| `participants_camera_off` | unknown[] |
| `participants_screenshare_on` | string[] |
| `participants_screenshare_off` | unknown[] |
| `canvas_thread_ts` | string |
| `thread_root_ts` | string |
| `channels` | string[] |
| `is_dm_call` | boolean |
| `was_rejected` | boolean |
| `was_missed` | boolean |
| `was_accepted` | boolean |
| `has_ended` | boolean |
| `background_id` | string |
| `canvas_background` | string |
| `is_prewarmed` | boolean |
| `is_scheduled` | boolean |
| `recording` | { |
| `can_record_summary` | string |
| `locale` | string |
| `attached_file_ids` | unknown[] |
| `media_backend_type` | string |
| `display_id` | string |
| `app_id` | string |
| `call_family` | string |
| `pending_invitees` | Record<UserId, string> |
| `last_invite_status_by_user` | Record<UserId, string> |
| `knocks` | Record<string, unknown> |
| `huddle_link` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/screenhero.rooms.info.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
