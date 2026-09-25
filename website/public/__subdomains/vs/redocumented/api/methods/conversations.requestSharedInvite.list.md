# conversations.requestSharedInvite.list

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/conversations.requestSharedInvite.list

Lists requests to add external users to channels with ability to filter.

## Params

| name | required | type | description |
|---|---|---|---|
| `user_id` | no | string | Optional filter to return invitation requests for the inviting user. |
| `include_expired` | no | boolean | When true expired invitation requests will be returned, otherwise they will be excluded. |
| `include_approved` | no | boolean | When true approved invitation requests will be returned, otherwise they will be excluded. |
| `include_denied` | no | boolean | When true denied invitation requests will be returned, otherwise they will be excluded. |
| `invite_ids` | no | array | An optional list of invitation ids to look up. |
| `limit` | no | integer | The number of items to return. Must be between 1 - 1000 (inclusive). |
| `cursor` | no | string | Paginate through collections of data by setting the cursor parameter to a next_cursor attribute returned by a previous request's response_metadata. See pagination for more detail. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "invite_requests": [
        {
            "date_last_updated": 1722372331,
            "id": "I12345",
            "date_created": 1722372331,
            "expires_at": 1723581931,
            "inviting_team": {
                "id": "E12345",
                "name": "Acme corp",
                "icon": {
                    "image_34": "https://.../avatar/avatars-teams/ava_0011-34.png",
                    "image_44": "https://.../avatar/avatars-teams/ava_0011-44.png",
                    "image_68": "https://.../avatar/avatars-teams/ava_0011-68.png",
                    "image_88": "https://.../avatar/avatars-teams/ava_0011-88.png",
                    "image_102": "https://.../avatar/avatars-teams/ava_0011-102.png",
                    "image_132": "https://.../avatar/avatars-teams/ava_0011-132.png",
                    "image_230": "https://.../avatar/avatars-teams/ava_0011-230.png",
                    "image_default": true
                },
                "avatar_base_url": "https://dev.slack.com/avatarsource/",
                "is_verified": false,
                "domain": "acme-corp",
                "date_created": 1637947110,
                "requires_sponsorship": false
            },
            "inviting_user": {
                "id": "U12345",
                "team_id": "E12345",
                "name": "acme-corp-user",
                "updated": 1721741979,
                "who_can_share_contact_card": "EVERYONE",
                "profile": {
                    "real_name": "acme-corp-user",
                    "display_name": "acme-corp-user",
                    "real_name_normalized": "acme-corp-user",
                    "display_name_normalized": "acme-corp-user",
                    "team": "E12345",
                    "avatar_hash": "hash",
                    "email": "acme-corp-user@acme-corp.com",
                    "image_24": "https://secure.gravatar.com/avatar/...0001-24.png",
                    "image_32": "https://secure.gravatar.com/avatar/...0001-32.png",
                    "image_48": "https://secure.gravatar.com/avatar/...0001-48.png",
                    "image_72": "https://secure.gravatar.com/avatar/...0001-72.png",
                    "image_192": "https://secure.gravatar.com/avatar/...0001-192.png",
                    "image_512": "https://secure.gravatar.com/avatar/...0001-512.png"
                }
            },
            "is_external_limited": false,
            "is_sponsored": true,
            "recipient_email": "external-user@other-corp.com",
            "target_user": {
                "recipient_email": "external-user1@other-corp.com",
                "recipient_user_id": "U123456"
            }
        },
        {
            "id": "I12345",
            "date_created": 1722372331,
            "expires_at": 1723581931,
            "date_denied": 1723581901,
            "inviting_team": {
                "id": "E12345",
                "name": "Acme Corp.",
                "icon": {
                    "image_34": "https://.../avatars-teams/ava_0011-34.png",
                    "image_44": "https://.../avatars-teams/ava_0011-44.png",
                    "image_68": "https://.../avatars-teams/ava_0011-68.png",
                    "image_88": "https://.../avatars-teams/ava_0011-88.png",
                    "image_102": "https://.../avatars-teams/ava_0011-102.png",
                    "image_132": "https://.../avatars-teams/ava_0011-132.png",
                    "image_230": "https://.../avatars-teams/ava_0011-230.png",
                    "image_default": true
                },
                "avatar_base_url": "https://dev.slack.com/avatarsource/",
                "is_verified": false,
                "domain": "acme-corp",
                "date_created": 1637947110,
                "requires_sponsorship": false
            },
            "inviting_user": {
                "id": "U12345",
                "team_id": "E12345",
                "name": "acme-corp-user",
                "updated": 1721741979,
                "who_can_share_contact_card": "EVERYONE",
                "profile": {
                    "real_name": "acme-corp-user",
                    "display_name": "acme-corp-user",
                    "real_name_normalized": "acme-corp-user",
                    "display_name_normalized": "acme-corp-user",
                    "team": "E12345",
                    "avatar_hash": "hash",
                    "email": "acme-corp-user@acme-corp.com",
                    "image_24": "https://secure.gravatar.com/avatar/...0001-24.png",
                    "image_32": "https://secure.gravatar.com/avatar/...0001-32.png",
                    "image_48": "https://secure.gravatar.com/avatar/...0001-48.png",
                    "image_72": "https://secure.gravatar.com/avatar/...0001-72.png",
                    "image_192": "https://secure.gravatar.com/avatar/...0001-192.png",
                    "image_512": "https://secure.gravatar.com/avatar/...0001-512.png"
                }
            },
            "is_external_limited": false,
            "channel": {
                "id": "C12345",
                "is_im": false,
                "is_private": true,
                "date_created": 1721764754,
                "name": "channel-name",
                "connections": [
                    {
                        "team": {
                            "id": "E12345",
                            "name": "Acme Corp.",
                            "icon": {
                                "image_34": "https://.../ava_0011-34.png",
                                "image_44": "https://.../ava_0011-44.png",
                                "image_68": "https://.../ava_0011-68.png",
                                "image_88": "https://.../ava_0011-88.png",
                                "image_102": "https://.../ava_0011-102.png",
                                "image_132": "https://.../ava_0011-132.png",
                                "image_230": "https://.../ava_0011-230.png",
                                "image_default": true
                            },
                            "avatar_base_url": "https://dev.slack.com/avatarsource/",
                            "is_verified": false,
                            "domain": "acme-corp",
                            "date_created": 1637947110,
                            "requires_sponsorship": false
                        },
                        "is_private": true
                    }
                ],
                "pending_connections": [],
                "previous_connections": []
            },
            "target_user": {
                "recipient_email": "external-user@other-corp.com"
            },
            "reviewing_user": {
                "id": "U12345",
                "team_id": "E12345",
                "name": "acme-corp-user",
                "updated": 1721741979,
                "who_can_share_contact_card": "EVERYONE",
                "profile": {
                    "real_name": "acme-corp-user",
                    "display_name": "acme-corp-user",
                    "real_name_normalized": "acme-corp-user",
                    "display_name_normalized": "acme-corp-user",
                    "team": "E12345",
                    "avatar_hash": "hash",
                    "email": "acme-corp-user@acme-corp.com",
                    "image_24": "https://secure.gravatar.com/avatar/...0001-24.png",
                    "image_32": "https://secure.gravatar.com/avatar/...0001-32.png",
                    "image_48": "https://secure.gravatar.com/avatar/...0001-48.png",
                    "image_72": "https://secure.gravatar.com/avatar/...0001-72.png",
                    "image_192": "https://secure.gravatar.com/avatar/...0001-192.png",
                    "image_512": "https://secure.gravatar.com/avatar/...0001-512.png"
                }
            }
        }
    ],
    "response_metadata": {
        "next_cursor": "aWQ6STAxNkszN0FBQUU="
    }
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/conversations.requestSharedInvite.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
