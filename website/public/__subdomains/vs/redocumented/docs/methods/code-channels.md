# Code channels

Slack's client has a **code channel** conversation type: "a multiplayer coding environment designed for everyone, not just developers", with pull requests, diffs and review built in. Everything here comes from Slack's client code (the `slack-datamine-plus` miner, and `3kh0/slack-datamine` history for the early builds). **Nothing was live-called.** Method names and the argument names below are real; descriptions are inferred from names and client strings.

## Methods

| Method | First seen (build) | Last seen | State | Observed argument names |
|---|---|---|---|---|
| `client.codeChannels.action` | 54e9692853f0 (2026-10-19) | current | in current client | - |
| `client.codeChannels.addReviewComment` | 54e9692853f0 (2026-10-19) | current | in current client | - |
| `client.codeChannels.create` | 130603 (2026-08-26) | current | in current client | `appId`, `blocks`, `entrypoint`, `isPrivate`, `name`, `reason`, `teamId` |
| `client.codeChannels.createAndStart` | 54e9692853f0 (2026-10-19) | current | in current client | `appId`, `blocks`, `entrypoint`, `isPrivate`, `reason`, `teamId` |
| `client.codeChannels.getBlockKitView` | 126949 (2026-07-02) | 133442 (2026-10-02) | not in current client | - |
| `client.codeChannels.getDiff` | 54e9692853f0 (2026-10-19) | current | in current client | - |
| `client.codeChannels.getMergeStatus` | 54e9692853f0 (2026-10-19) | current | in current client | - |
| `client.codeChannels.getPrWorkObject` | 54e9692853f0 (2026-10-19) | current | in current client | `channelId`, `prUrl`, `reason` |
| `client.codeChannels.getPullRequestConnection` | 54e9692853f0 (2026-10-19) | current | in current client | - |
| `client.codeChannels.getSummary` | 54e9692853f0 (2026-10-19) | current | in current client | - |
| `client.codeChannels.join` | 126807 (2026-06-30) | current | in current client | - |
| `client.codeChannels.listSupportedApps` | 54e9692853f0 (2026-10-19) | current | in current client | `reason` |
| `client.codeChannels.mergePullRequest` | 54e9692853f0 (2026-10-19) | current | in current client | `channelId`, `headSha`, `prUrl`, `reason` |
| `client.codeChannels.requestReviewers` | 54e9692853f0 (2026-10-19) | 98e38c8a6354 (2026-10-19) | not in current client | `channelId`, `inviteToChannel`, `noteBlocks`, `postMention`, `prUrl`, `reason`, `userIds` |
| `client.codeChannels.submitReview` | 54e9692853f0 (2026-10-19) | current | in current client | `channelId`, `event`, `prUrl`, `reason`, `revision`, `text` |
| `codeChannels.action` | 125635 (2026-06-08) | 128164 (2026-07-24) | not in current client | - |
| `codeChannels.createAndStart` | 126668 (2026-06-26) | 133442 (2026-10-02) | not in current client | - |
| `codeChannels.getDiff` | 125207 (2026-06-02) | 130501 (2026-08-25) | not in current client | - |
| `codeChannels.getView` | 125694 (2026-06-09) | 133442 (2026-10-02) | not in current client | - |
| `codeChannels.listSupportedApps` | 126668 (2026-06-26) | 133442 (2026-10-02) | not in current client | - |

"Observed argument names" are names passed at call sites in the client's code: real, but partial, and not a schema (see `datamine-2026-10.md`). Required/optional is unknown. camelCase names may be snake_case on the wire.

## What the pieces do (inferred)

- **Create / join:** `createAndStart` creates a channel and starts its agent session; `create` and `join` are the client-side variants ("join from an origin the user can see" is a client string); `listSupportedApps` lists which apps/agents can back one.
- **Views:** `getView` / `getBlockKitView` render the channel surface.
- **Pull requests:** `getPullRequestConnection`, `getPrWorkObject`, `getSummary`, `getDiff`, `getMergeStatus`, `requestReviewers`, `addReviewComment`, `submitReview` and `mergePullRequest` cover the PR lifecycle inside the channel. Their observed arguments (`prUrl`, `headSha`, `channelId`, `revision`, `event`, `text`) fit that.
- **`action`:** a generic action endpoint for the channel (older builds).

## Related client strings

- Naming: "Code channel", "Code channels", "Public code channel", "Code Channel Command".
- Lifecycle: "Create a code channel", "New code channel", "Search code channels", "No code channels yet", "Auto-close stale code channels", "When a code channel is archived", "Close an MPIM, IM, or code channel".
- Pull requests: "PR status", "PR approved / closed / merged / feedback", "Create PR", "Filter pull requests".
- Diffs and comments: "Loading diff", "Adds a line-level code comment to the store".
- Adjacent: "Agent sessions" strings suggest code channels are backed by agent sessions.

Code channel UI strings last appear in 3kh0's build 134419 (2026-10-14).

## Not known

Whether the endpoints answer outside the client, token types, response shapes, and whether code channels are generally available or gated. If you can verify any of it, see the contribute note in the explorer.
