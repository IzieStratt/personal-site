# Taut (`jeremy46231/taut`) source-mining — findings, and why it's not a new API surface

**Source-only, no live testing (this is a client-side source review, not a network
probe).** Both `jeremy46231/taut` (upstream) and `IzieStratt/taut` (the user's own
fork, all four extra branches: `fix/binary-response-body`, `homebrew-added`,
`izie/haiku-warning`, `izie/restricted-channel-warning`) were cloned read-only to
`scratch/clones/` and grepped for API call sites (`/api/`, method-name string
literals, `edgeapi`, `wss://`, `fetch(`/`axios` calls to `*.slack.com`, internal
gateway handling). The installed `/Applications/Taut.app` (`app.asar`, extracted
read-only to `scratch/asar-extract/`, deleted after) was also grepped, and the
local `developing-taut-plugins` skill was read for any documented API surface.

## The actual finding: Taut does not call the Slack API (or the Edge API, or a
## websocket gateway) directly at all

Taut is **not** a reimplementation of a Slack client that talks to Slack's
backend on its own. It's an Electron wrapper that loads Slack's *real* web
client (`app.slack.com`) and patches it **in-process**, after Slack's own
webpack bundle has already loaded and made its own real network connections.
Concretely, from `app/slack/*.ts`:

- `app/slack/webpack.ts` — `patchModuleExports()` walks Slack's already-loaded
  webpack module registry and swaps out specific exported functions for
  wrapped versions (interception, not replacement of the network layer).
- `app/slack/redux.ts` — `patchThunk()` / `patchSlice()` intercept Slack's own
  Redux Toolkit thunks/slices (the client's internal state-management layer,
  which itself calls Slack's API/RTM code) rather than issuing new requests.
- `app/slack/rtm.ts` — the RTM/websocket "listener" Taut exposes to plugins
  (`onRtmEvent`) is implemented by patching the function Slack's own client
  calls internally when it routes an incoming websocket batch
  (`exports[key].name === 'routeMessages'`) and by patching the Redux thunk
  named `handleMessageImmediatelyWithoutPreprocessing` (degraded-connection
  fallback path). Taut never opens its own `wss://` connection or constructs
  RTM/Edge-gateway frames itself — it observes Slack's.
- `app/api/messageSend.tsx` — outgoing message edits/sends are intercepted by
  wrapping the React props `prepareAndSendMessage` / `prepareAndSaveEditMessage`
  on Slack's own composer components, again not a direct API call.
- `app/api/accountSwitcher.ts` is the one place with real protocol knowledge:
  it documents (in its own header comment) that a Slack web session =
  `xoxc` token (in `localStorage` under `localConfig_v2`) **+** the `d` xoxd
  cookie (HttpOnly, server-bound to the token), and that Enterprise Grid boot
  needs the full per-team `localConfig` object (dropping fields yields
  `api_missing_host_error`) — consistent with, and no richer than, what this
  project's `auth-and-tokens.md` already documents.
- The only literal Slack API method name found anywhere in the source tree is
  `'conversations.replies'`, in `plugins/ShowRealUser.tsx` — already a
  documented official method, nothing new.
- `plugins/NoTrack.ts` blocks (does not call) `*/beacon*`, `*/clog*`,
  `*/science*`, `*/metrics*`, `*/typing*` under `slack.com/api/*` — Slack's own
  client-side telemetry/typing-indicator traffic, useful confirmation that
  those paths exist but not new method names to document (telemetry, not
  `/api/<method>` RPC calls; `beacon/error` was already noted in this
  project's README gap list).
- The installed `/Applications/Taut.app` build (`app.asar`) contains only
  Taut's own bundled TypeScript output (`build/app/main.js`, `preload.js`,
  `options.js`) — it does **not** embed Slack's own webapp JS (Taut loads that
  live from `app.slack.com` at runtime), so there was nothing further to grep
  there. Confirmed by searching for any `namespace.method`-shaped string
  matching known Slack API namespaces in `main.js`: none found beyond noise.
- The `developing-taut-plugins` skill (`~/.claude/skills/developing-taut-plugins/SKILL.md`)
  confirms the same architecture from the authoring side: plugins are told to
  use `this.api.redux.patchThunk` / `patchSlice` / `getRawState()` and
  `this.api.modal` / `this.api.menu` / `this.api.elements` (Slack-native UI
  hooks) — there is no `this.api.slack.call(method, params)`-style direct API
  surface documented or implied anywhere.

## The user's own fork (`IzieStratt/taut`)

Four branches ahead of `main`: `fix/binary-response-body` (bridge/IPC
plumbing for binary fetch responses, not Slack-API-related), `homebrew-added`
(README-only, an unofficial Homebrew tap), `izie/haiku-warning` and
`izie/restricted-channel-warning` (two UI plugins). Both plugins read Slack
state exclusively via `this.api.redux.getRawState()` / `this.api.rtm.on(...)` —
same patch-the-client pattern, no direct API calls, nothing new for this
project's method catalog.

## Conclusion

**Taut is a dead end for new Web API / Edge API / RTM-gateway method names.**
It confirms (independently, from a different angle) facts this project already
had — the `xoxc`+`d`-cookie session model, that Enterprise Grid boot needs a
full per-team config object — but it does not talk to a "different API surface"
that needs its own protocol doc. Per the task brief's own conditional
instruction, this finding is recorded here as its own file *because* it was
worth checking and ruling out explicitly, not because a new protocol was found.
The one general research nugget worth keeping: Slack's own client internally
names its websocket message router `routeMessages` and its degraded-mode
handler `handleMessageImmediatelyWithoutPreprocessing` — internal client-code
symbol names, not API methods, but potentially useful breadcrumbs for anyone
mining the webpack bundle directly (see `slack-datamine`, `methods/INDEX.md`).
