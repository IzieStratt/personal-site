# assistant.threads.setTitle

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/assistant.threads.setTitle

Set the title for the given assistant thread

## Params

| name | required | type | description |
|---|---|---|---|
| `channel_id` | yes | string | Channel ID containing the assistant thread. |
| `thread_ts` | yes | string | Message timestamp of the thread to set suggested prompts for. |
| `title` | yes | string | The title to use for the thread. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/assistant.threads.setTitle.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
