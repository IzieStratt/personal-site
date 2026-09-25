# users.setPhoto

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/users.setPhoto

Set the user profile photo

## Params

| name | required | type | description |
|---|---|---|---|
| `crop_w` | no | string | Width/height of crop box (always square). |
| `crop_x` | no | string | X coordinate of top-left corner of crop box. |
| `crop_y` | no | string | Y coordinate of top-left corner of crop box. |
| `image` | no | string | File contents via multipart/form-data. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

| field | type |
|---|---|
| `ok` | true |
| `profile` | { |
| `image_24` | string |
| `image_32` | string |
| `image_48` | string |
| `image_72` | string |
| `image_192` | string |
| `image_512` | string |
| `image_1024` | string |
| `image_original` | string |
| `avatar_hash` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/users.setPhoto.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
