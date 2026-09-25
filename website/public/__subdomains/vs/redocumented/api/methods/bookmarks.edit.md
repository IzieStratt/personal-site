# bookmarks.edit

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/bookmarks.edit

Edit bookmark.

## Params

| name | required | type | description |
|---|---|---|---|
| `channel_id` | no | string | Channel to update bookmark in. Required for public channels. |
| `bookmark_id` | no | string | Bookmark to update. Required for public channels. |
| `title` | no | string | Title for the bookmark. |
| `link` | no | string | Link to bookmark. |
| `emoji` | no | string | Emoji tag to apply to the link. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "bookmark": {
        "id": "Bk033XFJ9BTJ",
        "channel_id": "C1RQ000",
        "title": "bookmark-1",
        "link": "https://google.com",
        "emoji": ":clap:",
        "icon_url": "https://www.google.com/favicon.ico",
        "type": "link",
        "entity_id": null,
        "date_created": 1644956055,
        "date_updated": 0,
        "rank": "g",
        "last_updated_by_user_id": "U0334B6G6G5",
        "last_updated_by_team_id": "T018DF03GHY",
        "shortcut_id": null,
        "app_id": null
    }
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/bookmarks.edit.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
