# The Edge API (`edgeapi.slack.com`) — a separate, out-of-scope-for-our-oracle system

**Live-tested (2026-11-02), read-only, one workspace (Hack Club, Enterprise Grid `E09V5…`), session credentials (`xoxc` + `xoxd`) of a single test account.** 17 paths exist; the rest of the write-up below is source-derived. See "Live test results" at the end.

Everything else in `methods/` goes through the standard dispatcher:
`POST https://slack.com/api/<method>` (or the workspace-hosted equivalent),
form-encoded, `Authorization: Bearer <token>`. The Slack web client *also* talks
to a structurally different system, the **Edge API**, at:

```
POST https://edgeapi.slack.com/cache/<enterprise_id>/<resource>/<action>
```

This is not `/api/<namespace>.<method>` — it's a REST-ish path per
resource/action, keyed by the Enterprise Grid **org id** (`E...`) in the URL
itself, and (per source material) supports JSON body in addition to
form-encoding. Our existence oracle (garbage token -> compare `unknown_method`
vs. an auth error) was built and validated only against the `/api/<method>`
dispatcher; it was never adapted or tested against this path scheme, so **none
of the endpoints below have been confirmed to exist by us** — they're recorded
purely from the reverse-engineering gist (sshh12) that documented them from
live Enterprise Grid network traffic.

## Endpoints reported (all under `/cache/<enterprise_id>/...`)

| Path | Inferred purpose |
|---|---|
| `users/info` | Single user lookup (Edge-cached variant of `users.info`). |
| `users/list` | Bulk user listing (Edge-cached variant of `users.list`). |
| `users/counts` | User-related counts. |
| `users/search` | User search. |
| `channels/info` | Single channel lookup. |
| `channels/membership` | Channel membership data. |
| `channels/search` | Channel search. |
| `permissions/info` | Permission info for some resource. |
| `huddles/info` | Huddle (Slack's voice/video call feature) info. |
| `emojis/info` | Custom emoji info. |

## Why these exist as a separate system (per source material)

The Edge API appears to be Slack's caching/fan-out layer for Enterprise Grid —
built so the client can query "give me info on user X" without re-fetching
across every team in a large org each time, keyed by a shared cache under the
enterprise id rather than per-team. `korotovsky/slack-mcp-server`'s docs
describe "intelligent API routing based on authentication type" where the
client prefers Edge API endpoints when session tokens are available (they're
faster/richer for Enterprise Grid) and falls back to the standard `/api/`
methods otherwise.

## What would be needed to properly document this

1. Adapt the existence-oracle technique (or find an equivalent) for this host —
   unclear whether a garbage token on `edgeapi.slack.com` distinguishes
   real/fake resource paths the same way, since the URL structure itself
   (not just a `method` form field) determines dispatch. Untested.
2. Confirm the actual enterprise id (`E...`) format requirement and whether a
   wrong-but-well-formed id changes the error signature in a way that leaks
   path validity.
3. Only then consider narrow read-only live tests, under the same safety rules
   as everywhere else in this project.

This is flagged in `README.md`'s honest-coverage section as a known gap, not
silently omitted.

## Live test results

**Method.** Each path was POSTed with `Authorization: Bearer <xoxc>`,
`Cookie: d=<xoxd>`, JSON body. Nonexistent paths return HTTP 404 with body
`Not Found`, so any other status means the path exists. The sweep covered 49
resource names × 21 read-style actions (`info`, `list`, `search`, `counts`,
`membership`, `get`, `fetch`, `lookup`, `status`, `members`, `metadata`,
`history`, `read`, `permissions`, `all`, `batch`, `bulk`, `details`,
`summary`, `state`, `recent`). Write-style actions (`create`, `set`, `update`,
`delete`, `send`, `join`, …) were not sent. The sweep covers only the names
guessed here, so "every endpoint" means every one that could be found, not a
complete inventory.

**Result: 17 existing paths, all returning `ok: true` with a working body.**

| Path | Working body (keys) | Response keys | Notes |
|---|---|---|---|
| `users/info` | `{"ids":[user_id]}` | `results` | `user`/`user_ids` → `invalid_request` |
| `users/list` | `{"channels":[id],"present_first":true,"filter":"everyone AND NOT bots AND NOT apps","count":N}` | `results`, `next_marker` | Returned 20 channel members, no bots/apps/deleted. No presence field, so `present_first` order not verified. |
| `users/counts` | `{}`-style (ok with `channels`) | `counts` | |
| `users/search` | `{"query":str,"count":N}` | `results` | |
| `channels/info` | `{"ids":[channel_id]}` | `results` | `channel`/`channel_ids` → `invalid_request` |
| `channels/list` | `{"count":N}` | `results`, `next_marker` | |
| `channels/search` | `{"query":str,"count":N}` | `results` | |
| `channels/membership` | `{"channel":id,"user":id}` | `channel` | Single pair only; `channels:[…]` → `invalid_request` |
| `permissions/info` | `{}` | `allowed`, `allowed_per_team` | |
| `huddles/info` | `{"channel_ids":[id]}` | `huddles` | `channel`/`channels` → `invalid_request` |
| `huddles/list` | `{"channel_ids":[id]}` | `huddles` | |
| `emojis/info` | `{"ids":[name]}` | `results`, `failed_ids` | Name-based `names`/`emoji` → `invalid_request`. `ids` with `white_check_mark` returned no results (`failed_ids`), so the id form is not confirmed to resolve standard emoji names. |
| `emojis/list` | `{"count":N}` | `results`, `next_marker` | |
| `emojis/search` | `{"query":str,"count":N}` | `results` | |
| `usergroups/info` | `{"ids":[id]}` | `results`, `failed_ids` | Probed with a fake id `S01`, so only the shape is confirmed. |
| `usergroups/search` | `{"query":str,"count":N}` | `results` | |
| `apps/info` | `{"ids":[id]}` | `results`, `failed_ids` | Probed with a fake id `A01`, so only the shape is confirmed. |

Newly found and not in the original write-up: `channels/list`, `emojis/list`,
`emojis/search`, `huddles/list`, `usergroups/info`, `usergroups/search`,
`apps/info`.

**Not found** (404) for the other combinations tried, for example
`nosuchresource/info`, `users/nosuchaction`, `zzz/zzz`, and any `*/create|set|…`
(not sent).

### Reported client behaviour (face stack in the channel header)

A description of Slack's web client (`BaseAvatarStack`) was checked against the
API data above.

- **Confirmed**: the Edge `users/list` call with the reported body returns
  channel members with bots and apps filtered out.
- **Partly confirmed**: the top-3 faces are the most recent distinct non-bot
  posters who are still members (checked against `conversations.history` and
  `conversations.members` on 15 channels). Some channels had no matching
  recent poster among their first 1,000 members, which fits a fallback to the
  Edge list. The fallback was not triggered in testing.
- **Not verified**: `present_first` ordering (no presence field returned), the
  lookback depth of recent messages, and the "5 faces / View all 5 members"
  label, which comes from a different selector.
- **Caveat**: `conversations.members` returns at most 1,000 IDs per page and was
  not paginated, so channels with more members are truncated in those
  comparisons.

### Safety notes

- The `users/list` probe used a channel with 387 members and `count: 20`.
- All calls were read-style. Nothing was posted, joined, or changed.
- The token pair belongs to an automation account (`auto-accountsjohnfloc`).
  Results were not written anywhere except this document.
