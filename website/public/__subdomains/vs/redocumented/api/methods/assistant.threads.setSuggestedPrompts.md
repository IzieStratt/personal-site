# assistant.threads.setSuggestedPrompts

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/assistant.threads.setSuggestedPrompts

Set suggested prompts for the given assistant thread

## Params

| name | required | type | description |
|---|---|---|---|
| `channel_id` | yes | string | Channel ID containing the assistant thread. |
| `thread_ts` | no | string | Message timestamp of the thread to set suggested prompts for. If not provided, the prompts will be set for the latest message in the channel. |
| `prompts` | yes | string | Each prompt should be supplied with its title and message attribute. |
| `title` | no | string | Title for the list of provided prompts. For example: Suggested Prompts, Related Questions. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/assistant.threads.setSuggestedPrompts.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
