# Code channels

Slack's client has (or had) a **code channel** conversation type. The bundle describes it as "a multiplayer coding environment designed for everyone, not just developers." Everything here comes from `3kh0/slack-datamine` (method names and UI strings across builds 125207 -> 134791); **nothing was live-called**, and params/response shapes are unknown. Purposes are inferred from names and strings.

## Methods

| Method | First seen | Last seen | State |
|---|---|---|---|
| `codeChannels.getDiff` | build 125207 (2026-06-02) | 130501 (2026-08-25) | removed |
| `codeChannels.action` | 125635 (2026-06-08) | 128164 (2026-07-24) | removed |
| `codeChannels.getView` | 125694 (2026-06-09) | 133442 (2026-10-02) | removed |
| `codeChannels.createAndStart` | 126668 (2026-06-26) | 133442 (2026-10-02) | removed |
| `codeChannels.listSupportedApps` | 126668 (2026-06-26) | 133442 (2026-10-02) | removed |
| `client.codeChannels.join` | 126807 (2026-06-30) | 128164 (2026-07-24) | removed |
| `client.codeChannels.getBlockKitView` | 126949 (2026-07-02) | 133442 (2026-10-02) | removed |
| `client.codeChannels.create` | 130603 (2026-08-26) | 133442 (2026-10-02) | removed |

All eight were confirmed to exist by the existence oracle in earlier passes (`existence-only`). None are in the latest build, so the explorer hides them unless **Show removed** is on. See `datamine-2026-10.md` for why "removed" is a weak signal.

Likely roles: `createAndStart` creates a channel and kicks off its agent session; `listSupportedApps` lists which apps/agents can back one; `getView` / `getBlockKitView` render the channel surface; `getDiff` fetches the diff pane; `action` performs actions (the pull-request lifecycle); `join` joins "from an origin the user can see".

## Related client strings (UI, from `ui-strings.txt`)

- Naming: "Code channel", "Code channels", "Code Channel Command", "Public code channel", "Code channel details / results / views".
- Lifecycle: "Create a code channel", "New code channel", "Search code channels", "No code channels yet", "Something went wrong creating the code channel.", "Auto-close stale code channels", "When a code channel is archived", "Close an MPIM, IM, or code channel", "Record timestamp when a closed code channel was reopened", "Clear reopen timestamp for a code channel".
- Pull requests: "Start loading / Store a loaded / Record a failed ... code channel pull request fetch", "Forget a code channel pull request", "PR status", "PR approved / closed / merged / feedback", "Create PR", "All pull requests", "Filter pull requests".
- Diffs and comments: "Loading diff", "Adds a line-level code comment to the store", "Clears all code comments for a channel when the diff is refreshed".
- Adjacent: "Agent sessions" strings ("Failed to start agent session", "Navigates to an agent session") appear alongside, suggesting code channels are backed by agent sessions.

Code-channel UI strings last appear in build 134419 (2026-10-14); the latest build (134791) has none.

Also see the `/code` and `/codeblock` slash commands (formatting, unrelated to code channels). The related method families `agents.*` and `ai.alpha.agents.*` are in `datamine-2026-09.md`.

## Not known

Params, responses, token types, whether the endpoints still answer today, and whether code channels are GA, gated, or retired. If you can verify any of it, see the contribute note in the explorer.
