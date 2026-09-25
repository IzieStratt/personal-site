# apps.managed.permissions.set

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/apps.managed.permissions.set

Set who can interact with a managed app. Lets the builder who created a managed app on a partner platform configure the app's permissions as themselves, using a user token from the manager app. Permissions can only be set before the app is installed: if the app is already installed, this method makes no change and returns the app's current permissions.

## Params

| name | required | type | description |
|---|---|---|---|
| `app_id` | yes | string | Encoded ID of the managed app to configure. |
| `permissions` | yes | enum | Who can interact with the app. Use everyone to allow all members, or app_owner to restrict access to the app's owner. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

Unknown.

---
JSON: https://vs.izie.top/redocumented/api/methods/apps.managed.permissions.set.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
