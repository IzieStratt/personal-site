# Our own miner (`slack-datamine-plus`), "not in the current client", and observed params -- 2026-10-20

## Sources

- **`IzieStratt/slack-datamine-plus`** (this project's own miner, AGPL-3.0, runs from GitHub Actions every ~40 minutes): downloads the ~1,800 public JavaScript chunks of Slack's web client for the logged-in throwaway account's build, extracts API method names and the argument names used at call sites. It is listed in each entry's `source` as `IzieStratt/slack-datamine-plus (own miner)`; 1467 entries carry it.
- **`3kh0/slack-datamine`** (full git history, 2026-06-02 -> 2026-10-19): the earlier source for most undocumented names. Its recent builds only list ~250 methods because its chunk discovery broke around 2026-07-24 (see below); that is why this project built its own miner.

## "Not in the current client" (was called "removed")

`methods.json` field `not_in_client: true` means: the method name was seen in an earlier client build but is **missing from the most recent builds**. It does **not** mean Slack deleted the endpoint. The client may have stopped using it, moved it behind a flag or an A/B test, or loads it lazily in a chunk the miner did not reach. Many such methods may still answer.

- A method only gets the flag after it has been missing from **3 consecutive mined builds**, so one odd build does not flip it. It loses the flag as soon as it is seen again.
- A method the client still *mentions* (for example in log text such as "failed to call search.team") counts as present.
- Right now **392** of 2211 methods carry the flag. Documented (official) methods never do.
- The explorer hides them by default. Tick **Show methods not in the current client** to see them; they carry a grey "not in client" tag. They are also in `api/index.json` / `api/methods.txt` (`not_in_client`) and marked in the master index.

The old field names `removed` / `removed_note` no longer exist.

## Observed request parameters (`params_observed`)

Slack's client declares its API calls as "fetchers", for example `(0,S.r)("slackbotProjectsCreateFetcher","slackbot.projects.create")`, and passes the arguments where the fetcher is called. The miner collects those argument names per method.

- **441** undocumented methods now have `params_observed` (name, a type hint if the value is a literal, and how many call sites pass it). Example: `client.codeChannels.mergePullRequest` -> `channelId`, `headSha`, `prUrl`, `reason`.
- It is **not a schema**: it is stored separately and `params_known` stays `false`. The names are real (taken from Slack's own code) but the set is partial (spread arguments and values built elsewhere are invisible), nothing says which are required, types are mostly unknown, and camelCase names in the client may be snake_case on the wire. The explorer shows these as "observed (N)".
- Methods the client calls through another mechanism, or from a chunk where the fetcher is imported under a different name, have none yet.

## Why the 3kh0 miner lost most methods (checked 2026-10-19)

- Slack's client shell no longer lists the async chunks in its HTML. The chunk list lives in the public `webpack.manifest` script as a name->hash map (`__webpack_require__.u`), about 1,800 entries, and the old discovery pattern did not match that format. The collapse is visible in her history: 1,526 chunks (until 2026-07-24) -> 14.
- The 12 "failed" names (`gantry-v2.<hash>.min.js`) return `403 AccessDenied` even for old builds that mined fine, so they were never fetchable and are probably not real files.
- The real chunks are **brotli-compressed** (the `-br` in the CDN path).

| window | method names per 3kh0 build |
|---|---|
| 2026-06 -> 2026-07-14 | ~1,650 -> 1,760 |
| 2026-07-24 -> 2026-10-01 | ~450 -> 475 |
| 2026-10-15 -> now | 250 |

The miner here reads the manifest instead, which yields ~600 names from ~1,800 chunks. The older, larger counts included names that are no longer in the client.

## Code channels

See `code-channels.md`.
