# files.completeUploadExternal

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/files.completeUploadExternal

Finishes an upload started with files.getUploadURLExternal

## Params

| name | required | type | description |
|---|---|---|---|
| `files` | yes | array | Array of file ids and their corresponding (optional) titles. |
| `channel_id` | no | string | Channel ID where the file will be shared. If not specified the file will be private. |
| `thread_ts` | no | string | Provide another message's ts value to upload this file as a reply. Never use a reply's ts value; use its parent instead. Also make sure to provide only one channel when using 'thread_ts'. |
| `channels` | no | string | Comma-separated string of channel IDs or user IDs where the file will be shared. |
| `initial_comment` | no | string | The message text introducing the file in specified channels. |
| `blocks` | no | string | A JSON-based array of structured rich text blocks, presented as a URL-encoded string. If the initial_comment field is provided, the blocks field is ignored. |
| `username` | no | string | Set your bot's user name for the file share message. Requires the chat:write.customize scope. |
| `icon_url` | no | string | URL to an image to use as the icon for the file share message. Requires the chat:write.customize scope. |
| `icon_emoji` | no | string | Emoji to use as the icon for the file share message. Overrides icon_url. Requires the chat:write.customize scope. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "files": [
        {
            "id": "F123ABC456",
            "title": "slack-test"
        }
    ]
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/files.completeUploadExternal.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
