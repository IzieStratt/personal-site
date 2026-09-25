# Rate limits

## Documented tiers (official Web API, apply to xoxb/xoxp)

Slack publishes named tiers for documented methods (per-method, per-app,
roughly-per-minute):

- Tier 1: ~1 req/min (rare, very sensitive methods)
- Tier 2: ~20 req/min
- Tier 3: ~50 req/min
- Tier 4: ~100 req/min
- `chat.postMessage` and a few others have their own special (higher, per-channel)
  limits.
- Exceeding any tier returns HTTP 429 with a `Retry-After` header (seconds).

We did not independently re-verify these tier numbers this session (no sustained
high-rate testing was done — out of scope and unsafe for a personal-account pass);
treat them as documented-source values, not re-measured here.

## Session-token (xoxc/xoxd) behavior — observed

- No 429s were encountered during this entire pass (~90 requests total: ~55
  existence-oracle probes with a garbage token + ~35 live read-only calls with real
  session tokens), self-throttled to ≥1.1s between requests via `tools/probe.py`.
- No evidence either way on whether xoxc/xoxd session tokens share the documented
  xoxb/xoxp tiers or have their own (undocumented) internal limits — the client
  itself clearly makes bursts of concurrent calls on page load (`client.boot` +
  `client.userBoot` + several `client.counts`/`search.*` calls essentially at once),
  so any internal limit is presumably burst-tolerant. Not something to test further
  on a personal, single-owner account.

## Message/attachment text length limits (cross-referenced from `ErikKalkoken/slackApiDoc`)

Not a rate limit, but adjacent enough to record here — this repo's
`message_limits.md` documents hard text-length limits that apply to any way of
sending a message (`chat.postMessage`, incoming webhooks, slash-command /
interactive-message replies). Cross-referenced, not independently verified
this pass:

| Property | Limit | Effect | Their source |
|---|---|---|---|
| message text | 4,000 chars | message gets split into multiple messages | undocumented |
| message text | 40,000 chars | message truncated + warning returned | [Slack changelog 2018-04](https://api.slack.com/changelog/2018-04-truncating-really-long-messages) |
| attachment text | 700 chars | attachment rendered shortened (expandable via "Show more") | unknown |
| attachment text | 8,000 chars | attachment text truncated | undocumented |

## Our self-imposed limit for this project

`tools/probe.py` enforces a hardcoded `MIN_INTERVAL = 1.1` seconds between requests
regardless of token/method, plus honors `Retry-After` on 429 with `time.sleep()`
before retrying (max 3 attempts, then gives up rather than hammering). This was a
safety choice for this task, not a measured Slack limit.

## `admin.apps.uninstall` — observed (sixth pass)

With a real admin xoxp on a Grid sandbox, roughly ten `admin.apps.uninstall`
calls over a few minutes (each successful `enterprise_id` call preceded by a
failed `team_ids` one) started returning `ratelimited`. Honouring
`Retry-After` meant the next attempt went through after about a minute. So a
bot that uninstalls things should retry on `Retry-After`, not give up. See
`methods/grid-admin-sandbox-2026-09.md`.
