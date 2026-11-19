# Block Kit — every block type, including undocumented ones

Slack's [Block Kit reference](https://docs.slack.dev/reference/block-kit/blocks) lists 20 block
types. Slack's web client registers **108** renderers
(blocks, elements and rich-text types) and its `prototype` block hides about 20 more unreleased blocks
behind experiments. Several of the hidden ones are accepted by
`chat.postMessage` and render normally, and Block Kit Builder will preview them (that is where
`fallback_canary` shows up) even though no docs page mentions them.

Sources, cross-checked 2026-11-18:

- **Client names**: `block-kit-types.txt` from [slack-datamine-plus](https://slackdatamineplus.izie.top),
  the block/element/rich-text type names in the current web client build.
- **Decoded from the client**: the block registry in web client build `2bdd7e246c53`
  (fetched 2026-11-18). Each block is registered as `{type, component, processProps}`, and
  `processProps` converts the block's snake_case fields to camelCase props, so the props a component
  destructures are the block's fields. These are **source-read, not live-posted**: they tell you
  what the client renders, not what `chat.postMessage` accepts.
- **Schemas**: [`jollyroger182/slack.ts`](https://github.com/jollyroger182/slack.ts)
  `src/types/blocks/blocks.ts` (commit `9e380b8`), which types the undocumented blocks from
  testing against Block Kit Builder and the client. Field notes below are theirs unless marked.

Undocumented blocks can change or vanish without notice, and they often render differently (or
not at all) on mobile. Always send a `text` fallback with the message.

## Status of every block type

| Block | Status | Notes |
|---|---|---|
| `actions`, `alert`, `card`, `carousel`, `container`, `context`, `context_actions`, `data_table`, `divider`, `file`, `header`, `image`, `input`, `markdown`, `plan`, `rich_text`, `section`, `table`, `task_card`, `video` | documented | In the official reference. |
| `call` | semi-documented | Only mentioned in the [Calls API docs](https://docs.slack.dev/apis/web-api/using-the-calls-api). Schema below. |
| `callout` | undocumented, schema known | Colored card wrapping other blocks. |
| `canvas_table` | undocumented, schema known | Table whose cells are blocks. Broken on mobile. |
| `channel_section` / `channel_set` | undocumented, schema known | Sidebar channel-section share card. |
| `condition` | undocumented, schema known | Renders different blocks per client/team. Not on Android. |
| `contact_card` | undocumented, schema known | User card. |
| `data_visualization` | undocumented, schema known | Pie / bar / line / area charts. |
| `event` | undocumented, schema known | Calendar event (Google/Outlook integration). |
| `fallback_canary` | undocumented, schema known | Always fails, so always renders its `fallback`. |
| `loading` | undocumented, schema known | Loading spinner, no fields. |
| `message_embed` | undocumented, schema known | Embedded message card. |
| `share_prompt` | undocumented, schema known | AI-agent prompt share card. |
| `share_shortcut` | undocumented, schema known | Workflow share card. |
| `timeline` | undocumented, schema known | Slackbot "used N tools" timeline. |
| `attachment_reference`, `auth_provider`, `layout`, `mcp_app`, `page`, `prototype`, `related_automation_decorator`, `salesforce_record_card`, `search_top_results`, `share_skill`, `share_workflow` | undocumented, fields decoded | Fields read from the client's components; see [decoded from the client](#decoded-from-the-client). |
| `message`, `canvas` | undocumented, name only | `message` renders a stored message; `canvas` is a rich-text element, not a top-level block. |
| `error`, `expandable`, `group`, `sticker` | in the type enum, no renderer | Listed in the client's block-type enum but nothing registers a renderer in build `2bdd7e246c53` (`sticker` had one in an earlier cached build). |

## The fallback convention

Blocks in the client can carry a `fallback` array. When the client cannot render a block (unknown
type, unsupported platform, failed lookup) it renders the `fallback` blocks in its place instead of
"This content can't be displayed". `fallback_canary` exists to test that path: it never renders, so
you always see the fallback.

Allowed in `fallback`: `divider`, `header`, `context`, `image`, `table`, `contact_card`, `video`,
`section`, `rich_text`.

```json
{
  "blocks": [{
    "type": "fallback_canary",
    "fallback": [
      { "type": "header", "text": { "type": "plain_text", "text": "Fallback demo" } },
      { "type": "section", "text": { "type": "mrkdwn", "text": "Your client does not recognize this block, so it shows the *fallback*." } }
    ]
  }]
}
```

## Schemas

Every block also takes the usual optional `block_id` (max 255 chars).

### `call`

| Field | Type | Notes |
|---|---|---|
| `call_id` | string, required | From `calls.add`. |
| `call` | `{ v1: CallV1, media_backend_type }` | Always set by the server; rejected if you send it. |
| `api_decoration_available` | boolean | |

### `callout`

| Field | Type | Notes |
|---|---|---|
| `background_color` | `indigo` \| `blue` \| `jade` \| `pink` \| `gray` \| `purple` \| `orange` \| `brown` \| `green` | required |
| `child_blocks` | block[] | `section`, `divider`, `image`, `header`, `rich_text`, `contact_card`, `file` |

### `canvas_table`

`rows`: array of `{ type: "canvas_table_row", cells: [...] }`, each row with at least one cell.
A cell is `{ type: "canvas_table_cell", header: boolean, child_blocks: block[], width?: number }`.
Cell blocks: `section`, `divider`, `image`, `contact_card`, `rich_text`, `file`. Only the first
row's `width` values are used. On mobile it renders as a broken "open in canvas" link.

### `channel_section` / `channel_set`

Only `channel_ids` is validated by the server; every other field accepts any type.

| Field | Type | Notes |
|---|---|---|
| `channel_set_name` | string | Section name. |
| `channel_ids` | string[] | |
| `emoji` | string | |
| `link_id` | string | `Csl…` ID. If unset, copying the link creates a new section. |
| `destination_channel_id`, `target_user_ids`, `accepted_user_ids`, `is_channel_set_preview` | | Meaning untested. |

### `condition`

| Field | Type | Notes |
|---|---|---|
| `cases` | `{ conditions, blocks }[]` | All `conditions` in a case must match. |
| `default` | block[] | Shown when no case matches. |

A condition is `{ op: "=" | "!=", type, value }` with `type` one of `client` (`desktop`, `ios`,
`android`, …), `content_type` (`condition_demo`, …) or `team` (team ID). Allowed child blocks:
`actions`, `context`, `divider`, `image`, `section`, `header`, `video`, `rich_text`, `input`,
`event`, `file`, `call`. Not supported on Android.

### `contact_card`

`contact_user_id` (string, required): the user to show.

### `data_visualization`

| Field | Type | Notes |
|---|---|---|
| `title` | string, required | Max 50 chars. |
| `chart` | chart, required | See below. |
| `size` | `small` \| `large` | Currently no effect. |
| `preview_images` | object | Server-set light/dark preview image URLs and file IDs; ignored if sent. |

Pie: `{ type: "pie", segments: [{ label (≤20), value }] }`, max 12 segments.
Axes: `{ type: "bar" | "line" | "area", axis_config: { categories[], x_label (≤50), y_label (≤50) }, series: [{ name (≤20), data: [{ label, value }] }] }`;
each point's `label` must be one of `axis_config.categories`.

### `event`

| Field | Type | Notes |
|---|---|---|
| `block_id` | string, required | Required for this block. |
| `event_id` | string, required | From `meetings.list` (session token) or `calendar.event.create`. |
| `event` | CalendarEvent | Overrides the server lookup. Shown on desktop even if `event_id` doesn't exist. |
| `is_deleted` | boolean | Server-set when `event_id` doesn't exist; errors if you send it. |

CalendarEvent: `start` and `end` (`{ date_time: unix, date? }`) are required by the schema. To
actually show, it also needs `organizer` (`{ email, name, user_id? }`) and `attendees`
(`{ email, name, rsvp?, user_id? }[]`), and for a future event the viewer must be an attendee by
`user_id`, or it shows "We can't fully display this message". Optional: `title`, `status`
(`confirmed` / `tentative` / `cancelled`), `app_type` (`gcal` / `ocal` / `ocal_gcc`),
`meeting_url`, `meeting_provider`, `web_link`, `copies`, `attendee_count` (shows NaN without it),
`needs_refetch`, `location`, `description` (last two are not shown).

### `fallback_canary`

`fallback` (block[], required). See [the fallback convention](#the-fallback-convention).

### `loading`

No fields. Shows a loading animation.

### `message_embed`

`team_id`, `channel`, `ts` (all strings, required). Renders the message as a card, like an
unfurl/forward. If the viewer isn't in the channel or the message doesn't exist, it renders as an
empty bubble.

### `share_prompt`

| Field | Type | Notes |
|---|---|---|
| `prompt` | string, required | Plain-text prompt. Ignored if `prompt_rich_text` is set. |
| `label` | string, required | Card title. |
| `prompt_rich_text` | rich_text[] | |
| `app_id` | string | Agent app to look up. |
| `bot_user_id` | string | Overrides `app_id`. |
| `is_slackbot` | boolean | Overrides both, unless Slackbot is disabled in the workspace. |
| `prompt_id` | string | From `share.prompts.add`; used for copy link / forward. |
| `attached_skills` | `{ id, name }[]` | |
| `turn_number` | number | Not sent or rendered by the client. |

### `share_shortcut`

Required: `app_id`, `function_trigger_id` (`Ft…`), `owning_team_id`. Optional: `is_workflow_app`,
`sales_home_workflow_app_type`, `app_collaborators`, `title`, `description`, `bot_user_id`,
`workflow_id`, `developer_trace_id`, `trigger_type`, `trigger_subtype`, `share_url`,
`contains_ai_steps`, `button_label`, `url`. Missing `title`/`description` are left out, not
fetched from the workflow.

### `timeline`

| Field | Type | Notes |
|---|---|---|
| `points` | point[], required | |
| `summary` | rich_text | Replaces "Used N tools". |
| `start_ts`, `end_ts` | number | Not rendered. |

A point: `id`, `status` (`in_progress` / `complete` / `error` / `canceled`), `text`,
`rich_text_title?` (overrides `text`), `icon?` (e.g. `ai-sparkle`, `calendar`, `search`,
`canvas-content`, `lists`, `email`, `ai-workflow`, …), `icon_url?` (overrides `icon`), `steps?`.
A step: `{ id, sections: [{ rich_text_title, sources }] }`, where a source is
`{ type: "message", channel_id, timestamp }`, `{ type: "file", url }` or
`{ type: "web", url, title? }`.

## Decoded from the client

Field names are the snake_case form of the component props (`fileId` → `file_id`). Values listed
are ones the client compares against; other values may exist.

| Block | Fields |
|---|---|
| `layout` | `label`, `is_label_visible`, `grid_lines` (`none` / `rows` / `outer`), `rows: [{ items: [{ block, width?, horizontal_alignment? }] }]`. `width` is `narrow` / `standard` / `wide`; `horizontal_alignment` is `start` / `center` / `end`. Each item holds one block. |
| `mcp_app` | `uri`, `mime_type` (rendered only if `text/html;profile=mcp-app`), `service_type`, `executor_id`, `app_id`, `tool_name`, `tool_use_id`. An MCP Apps UI resource rendered in a sandboxed frame. Forwarded copies show "This content is only available in the original conversation." |
| `page` | `file_id`, `fallback_text`, `app_id`, `has_ai_generated_content`. |
| `auth_provider` | `name`, `description`, `icon_url`, `auth_url`, `disconnect_url`, `is_connected`, `connected_identity`, `connected_context`, `accessory`, `is_loading`, `fallback`, `value`. A connect/disconnect account card. |
| `salesforce_record_card` | `salesforce_org_id`, `sobject_api_name`, `record_id`, `record_name`, `object_label`, `total_field_count`, `fields[]` (each with `rich_text`, `html_formatted`, `previous_value`, `aria_label`). |
| `search_top_results` | `query`, `results`. |
| `share_skill` | `label`, `file_id`, `description`, `team_id`, `source_org_name`, `share_code`. Slackbot skill share card. |
| `share_workflow` | `app_id`, `blocks`. |
| `attachment_reference` | `url`. |
| `related_automation_decorator` | `text`. Stripped when the message is shown as an attachment. |

Documented blocks also read fields the docs don't list: `container` takes `rich_text_title`,
`subtitle`, `icon`, `width`, `is_collapsible`, `default_collapsed`, `has_header_divider`; `carousel`
takes `label`, `is_label_visible`; `data_table` takes `page_size`, `row_header_column_index`,
`caption`; `task_card` takes `task_id`, `details`, `output`, `sources`; `header` takes `level` and
`style`; `table` takes `column_settings`, `caption`, `is_caption_visible`; `contact_card` takes
`contact_card_id`; `section` reads `should_stack_text_fields`, `should_truncate_text`,
`should_stack_accessory`. Some props (`is_in_app_view`, `sender_member_id`, `container_id`, …) are
set by the client, not by the block.

slack-datamine-plus regenerates this from every new build as `block-registry.txt`. The full output
for build `2bdd7e246c53` (186 lines: every registered renderer, its fields, and each prototype
candidate with its gate) is in [`data/block-registry-2bdd7e246c53.txt`](data/block-registry-2bdd7e246c53.txt).

### `prototype`: unreleased blocks behind experiments

`{ "type": "prototype", "candidate_type": "<name>", ... }` renders an unreleased block. Each
candidate only renders when its experiment is on for the viewer: `block_kit_revamp_blocks` (A),
`bk_prototype_next` (N) or `block_kit_card_block` (C). A dash means no gate.

| `candidate_type` | Gate | Fields |
|---|---|---|
| `alert` | A | `text`, `level` (`default` / `info` / `success` / `warning` / `error`) |
| `card_v2` | A | the card block |
| `suggested_prompts_button` | N | `text`, `prompt`, `privately`, `style`, `accessibility_label` |
| `handoff_button` | N | `text`, `prompt`, `icon_url`, `status`, `complete_text`, `link_channel_id`, `link_thread_ts`, `link_text` |
| `chart` | N | `chart_type` (`bar` / `line` / `pie` / `number`), `title`, `series`, `segments`, `axis_config`, `color_family`, `show_legend` |
| `inline_form` | N | `mode`, `title`, `subtitle`, `submit_label`, `cancel_label`, `callback_id`, `submit_action_id`, `form_blocks`, `submitted_values`, `is_editable` |
| `entity` | N | collapsible entity card (`collapsible`, `is_expanded_by_default`, …) |
| `key_value` | N | `pairs`, `direction` |
| `tag` | N | `text`, `tag_style` (`indigo`, `aubergine`, `lagoon`, `jade`, `honeycomb`, …) |
| `entity_list` | N | `entities` |
| `canvas_diff` | C | `contents`, `child_blocks` |
| `list_diff` | – | `contents`, `child_blocks` |
| `mcp_app` | N | as the `mcp_app` block |
| `widget` | N | `widget_id`, `title`, `status`, `created_by`, `cards`, `version`, `display_mode` (`inline` / `compact` / `full`) |
| `agent_permissions_card` | – | `title`, `body`, `disclaimer`, `actions`, `icon`, `show_confirm_dialog`, `container_id` |
| `ask_user_question` | N | `questions`, `submitted`, `answers`, `answered_by` |
| `answer_comparison` | – | `answers`, `child_blocks`, `is_generating`, `is_read_only` |
| `form_card` | – | `title`, `child_blocks`, `accessibility_label` |
| `slide_template_picker` | – | `title`, `template_options`, `default_template_id`, `child_blocks` |
| `attachment_reference` | – | `url` |
| `checklist` | N | `title`, `element`, `group_completed_items`, `show_progress` |
| `today_item` | – | `child_blocks` (rendered as-is; nothing if empty) |
| `slackbot_onboarding_guided` | – | Slackbot's guided-onboarding flow |

## Elements and rich-text types

The client's element and rich-text element names (including internal ones like `_variable`,
`work_object_mention`, `citation`, `skill`) are in slack-datamine-plus's `block-kit-types.txt`.
slack.ts `src/types/blocks/elements.ts` has the typed element / action payload / `state.values`
shapes for every interactive element.
