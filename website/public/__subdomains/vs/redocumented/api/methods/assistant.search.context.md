# assistant.search.context

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/assistant.search.context

Searches messages, files, channels and users across your Slack organization.

## Params

| name | required | type | description |
|---|---|---|---|
| `query` | yes | string | User prompt or search query. |
| `action_token` | no | string | Send action_token as received in a message event. |
| `channel_types` | no | array | Mix and match channel types by providing a comma-separated list of any combination of public_channel, private_channel, mpim, im. |
| `content_types` | no | array | Content types to include, a comma-separated list of any combination of messages, files, channels, users. |
| `include_bots` | no | boolean | Whether the results should include bots. |
| `include_deleted_users` | no | boolean | Whether to include deleted users in the user search results. Defaults to false. |
| `before` | no | integer | UNIX timestamp filter. If present, filters for results before this date. |
| `after` | no | integer | UNIX timestamp filter. If present, filters for results after this date. |
| `include_context_messages` | no | boolean | Whether to include context messages surrounding the main message result. Defaults to false if unspecified. |
| `context_channel_id` | no | string | Context channel ID to support scoping the search when applicable. |
| `cursor` | no | string | The cursor returned by the API. Leave this blank for the first request and use this to get the next page of results. |
| `limit` | no | integer | Number of results to return, up to a max of 20. Defaults to 20. |
| `sort` | no | enum | The field to sort the results by. Defaults to score. Can be one of: score, timestamp. |
| `sort_dir` | no | enum | The direction to sort the results by. Defaults to desc. |
| `include_message_blocks` | no | boolean | Whether to return the message blocks in the response. |
| `highlight` | no | boolean | Whether to highlight the search query in the results. Defaults to false if unspecified. |
| `term_clauses` | no | array | A list of term clauses. A term clause is a string with search terms. Search results returned will match every term clause specified (i.e., conjunctive normal form). |
| `modifiers` | no | string | A string containing only modifiers in the format of modifier:value. Search results returned will match the modifier value. For now modifiers only affect term clauses. |
| `include_archived_channels` | no | boolean | Whether to include archived channels in the search results. |
| `disable_semantic_search` | no | boolean | Whether to disable semantic search. When true, only keyword-based search is used. Defaults to false. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

Unknown.

---
JSON: https://vs.izie.top/redocumented/api/methods/assistant.search.context.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
