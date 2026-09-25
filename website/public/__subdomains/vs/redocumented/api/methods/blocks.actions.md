# blocks.actions

- status: undocumented
- verified: live-verified
- tokens: enterprise xoxc only. Team xoxc: team_is_restricted on every host. Enterprise xoxc when not a member of the channel: invalid_container. Live-tested 2026-09-25; see methods/block-actions-and-modals-2026-09.md.
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/blocks.actions

Clicks a Block Kit button in an app's message as the user; Slack forwards a block_actions payload (with trigger_id) to the app. Response is just ok:true; any modal the app opens arrives as an RTM view_opened event.

## Params

| name | required | type | description |
|---|---|---|---|
| `service_id` | no | string |  |
| `service_team_id` | no | string |  |
| `actions` | no | string |  |
| `container` | no | string |  |
| `client_token` | no | string |  |
| `state` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/blocks.actions.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
