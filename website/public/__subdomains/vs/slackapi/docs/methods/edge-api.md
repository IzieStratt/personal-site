# The Edge API (`edgeapi.slack.com`) — a separate, out-of-scope-for-our-oracle system

**Source-only. Not live-tested. Existence oracle does not apply as built.**

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
