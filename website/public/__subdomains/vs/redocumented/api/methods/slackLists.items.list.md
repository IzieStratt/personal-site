# slackLists.items.list

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/slackLists.items.list

Get records from a List.

## Params

| name | required | type | description |
|---|---|---|---|
| `list_id` | yes | string | ID of the List. |
| `limit` | no | integer | The maximum number of records to return. |
| `cursor` | no | string | Next cursor for pagination. |
| `archived` | no | boolean | Boolean indicating whether archived items or normal items should be returned. |
| `include_list` | no | boolean | Set to true to also return the parent list object, including its title, column schema, and total row count. Defaults to false to keep the response small. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "items": [
        {
            "id": "Rec018B8X2B3M",
            "list_id": "F1234567",
            "date_created": 1758744346,
            "created_by": "W0AB1CDE2",
            "updated_by": "W0AB1CDE2",
            "fields": [
                {
                    "key": "rich_text_notes",
                    "value": "[{\"type\":\"rich_text\",\"block_id\":\"08jc0\",\"elements\":[{\"type\":\"rich_text_section\",\"elements\":[{\"type\":\"text\",\"text\":\"Onboard new hire\"}]}]}]",
                    "text": "Onboard new hire",
                    "rich_text": [
                        {
                            "type": "rich_text",
                            "block_id": "08jc0",
                            "elements": [
                                {
                                    "type": "rich_text_section",
                                    "elements": [
                                        {
                                            "text": "Onboard new hire",
                                            "type": "text"
                                        }
                                    ]
                                }
                            ]
                        }
                    ],
                    "column_id": "Col018B8C91TM"
                },
                {
                    "key": "estimate",
                    "value": 3,
                    "number": [
                        3
                    ],
                    "column_id": "Col018B8C91U3"
                }
            ],
            "updated_timestamp": "1758744346"
        },
        {
            "id": "Rec018B8RR603",
            "list_id": "F1234567",
            "date_created": 1758744346,
            "created_by": "W0AB1CDE2",
            "updated_by": "W0AB1CDE2",
            "fields": [],
            "updated_timestamp": "1758744346"
        },
        {
            "id": "Rec018ALFLP2N",
            "list_id": "F1234567",
            "date_created": 1758744346,
            "created_by": "W0AB1CDE2",
            "updated_by": "W0AB1CDE2",
            "fields": [],
            "updated_timestamp": "1758744346"
        },
        {
            "id": "Rec018ALA7RPU",
            "list_id": "F1234567",
            "date_created": 1758744346,
            "created_by": "W0AB1CDE2",
            "updated_by": "W0AB1CDE2",
            "fields": [
                {
                    "key": "status",
                    "value": "completed",
                    "select": [
                        "completed"
                    ],
                    "column_id": "Col018AL7649G"
                },
                {
                    "key": "date",
                    "value": "2025-09-19",
                    "date": [
                        "2025-09-19"
                    ],
                    "timestamp": [
                        -1
                    ],
                    "column_id": "Col018AL764AE"
                },
                {
                    "key": "owner",
                    "value": "U014W31KQMR",
                    "user": [
                        "U014W31KQMR"
                    ],
                    "column_id": "Col018B8C91V1"
                }
            ],
            "updated_timestamp": "1758744346"
        },
        {
            "id": "Rec018B8LPLG3",
            "list_id": "F1234567",
            "date_created": 1758744345,
            "created_by": "W0AB1CDE2",
            "updated_by": "W0AB1CDE2",
            "fields": [
                {
                    "key": "rich_text_notes",
                    "value": "[{\"type\":\"rich_text\",\"block_id\":\"UXkfa\",\"elements\":[{\"type\":\"rich_text_section\",\"elements\":[{\"type\":\"text\",\"text\":\"Onboard new hire \"},{\"type\":\"text\",\"text\":\"(week 1)\",\"style\":{\"bold\":true}}]}]}]",
                    "text": "Onboard new hire *(week 1)*",
                    "rich_text": [
                        {
                            "type": "rich_text",
                            "block_id": "UXkfa",
                            "elements": [
                                {
                                    "type": "rich_text_section",
                                    "elements": [
                                        {
                                            "text": "Onboard new hire ",
                                            "type": "text"
                                        },
                                        {
                                            "text": "(week 1)",
                                            "type": "text",
                                            "style": {
                                                "bold": true
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    ],
                    "column_id": "Col018B8C91TM"
                }
            ],
            "updated_timestamp": "1758744345"
        },
        {
            "id": "Rec018ALFLNTU",
            "list_id": "F1234567",
            "date_created": 1758744345,
            "created_by": "W0AB1CDE2",
            "updated_by": "W0AB1CDE2",
            "fields": [
                {
                    "key": "rich_text_notes",
                    "value": "[{\"type\":\"rich_text\",\"block_id\":\"k0zIi\",\"elements\":[{\"type\":\"rich_text_section\",\"elements\":[{\"type\":\"text\",\"text\":\"Fix bug\"}]}]}]",
                    "text": "Fix bug",
                    "rich_text": [
                        {
                            "type": "rich_text",
                            "block_id": "k0zIi",
                            "elements": [
                                {
                                    "type": "rich_text_section",
                                    "elements": [
                                        {
                                            "text": "Fix bug",
                                            "type": "text"
                                        }
                                    ]
                                }
                            ]
                        }
                    ],
                    "column_id": "Col018B8C91TM"
                }
            ],
            "updated_timestamp": "1758744345"
        },
        {
            "id": "Rec018ALE9718",
            "list_id": "F1234567",
            "date_created": 1758744345,
            "created_by": "W0AB1CDE2",
            "updated_by": "W0AB1CDE2",
            "fields": [],
            "updated_timestamp": "1758744345"
        }
    ],
    "response_metadata": {
        "next_cursor": ""
    }
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/slackLists.items.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
