# Slack web client internals: emoji UI, menus, autocomplete (2026-09)

Component names, Redux thunk names, props and CSS from Slack's own web client
bundle. These are what a client mod such as Taut hooks into; none of them are
Web API methods.

**Provenance.** Read-only greps of the Slack desktop app's Service Worker
cache (`~/Library/Application Support/Slack/Service Worker/CacheStorage`,
bundle files cached 2026-09-15) while building the HMojis Taut plugin. Nothing
here was probed on the network.

**Verified.** Every name below appears verbatim in the bundle: a
`displayName`, a thunk's `meta.name`, or a CSS rule. The HMojis plugin now
patches most of them, and the patches pass tests against a fake Taut runtime.

**Not verified.** None of it has been seen on screen in a live client yet.
Slack ships new builds often, so re-check a name before relying on it.

**Why this is useful even though Taut is a dead end for API methods** (see
`taut-client-internals.md`). Taut's `patchComponent` hooks React's `jsx()` and
matches components by `displayName` at element creation. So a component that
is never exported from its webpack module can still be patched, as long as it
has a `displayName`. Every component on this page has one.

## Emoji hover card ("Right click to add to your organization")

Hovering a custom emoji whose URL isn't one of the workspace's own emoji makes
Slack treat it as coming from another org. The card then offers an import.

- **`EmojiTooltipEmoji`** renders the card's big preview.
  - Props: `text`, `displayText`, `url`, `fallbackUrl`, `isStandard`,
    `sourceTeamId`, `unicode`, `forceDisplay`.
  - For non-standard emoji it renders `url` straight from its props. It
    passes `shouldFallbackOnLoadError`, so a URL that fails to load shows the
    fallback image, a "?" diamond.
- **`ImportExternalEmojiTooltipInfo`** takes `{ emojiUrl, emojiName }`. It
  renders the `right-click` icon plus "Right click to add to your
  organization" when a hook called `useCanImportThisEmoji` allows the import,
  and `null` otherwise.
- **Thunk `maybeOpenImportExternalEmojiModal`** ("Opens the
  AddCustomEmojiModal if an emoji can be imported") takes
  `{ event, emojiName, emojiUrl }`.
  - The `Emoji` component calls it from `onContextMenu` when
    `isImportAllowed` is set and the emoji isn't standard.
  - If the emoji can be imported, it calls `preventDefault()` on the event and
    dispatches **`openImportExternalEmojiModal`**, which opens
    `AddCustomEmojiModal` pre-filled with the name and URL.
- The wrapper **`withEmojiErrorBoundary`** renders
  `<span data-qa="missing_emoji" class="c-emoji c-emoji__medium c-emoji--inline">`
  when an emoji component throws.

## Emoji picker

- **Components**, in order of their `displayName`s:
  - `EmojiPicker` and `EmojiPickerWithContextProvider`
  - `EmojiPickerContext`
  - `EmojiList`, `EmojiListRow`, `EmojiListEmojiItem`, `EmojiListEmojiButton`,
    `EmojiListGroupItem`
  - `EmojiPickerStickyHeader`, `EmojiPickerInput`
  - `EmojiPickerFooter`, `EmojiPickerPreview`, `EmojiSkinTonePicker`,
    `EmojiHandyReactions`, `AddCustomEmojiButton`
  - `EmojiPackCta`, `GifListItem`, `GifListRow`
- **`EmojiPickerFooter`** props include `showAddEmojiButton`,
  `showSkinTonePicker`, `showHandyReactions`, `currentEmojiSelection`,
  `onAddEmojiButtonClick`, `channelId` and `isHuddlesEmojiPicker`. It renders
  one of two things:
  - `AddCustomEmojiButton`, when `showAddEmojiButton` is set
  - the "Emoji Deluxe™" label, otherwise
- **`AddCustomEmojiButton`** takes `{ onClick, isHuddlesEmojiPicker }`. It
  renders a small outline button with
  `data-qa="customize_emoji_add_button"` and
  `class="p-emoji_picker__add_custom_emoji"`, labelled "Add Emoji" (or "Add
  Reaction" in huddles).
- **Footer CSS.** This explains why injected elements land in odd places:

```css
.p-emoji_picker__footer { position: sticky; bottom: 0; min-height: 60px; z-index: 151; }
.p-emoji_picker__add_custom_emoji { position: absolute; bottom: 14.5px; left: 14px; opacity: 1; pointer-events: auto; }
.p-emoji_picker__footer--previewing .p-emoji_picker__add_custom_emoji { opacity: 0; pointer-events: none; }
.p-emoji_picker__footer--previewing .p-emoji_picker__preview { opacity: 1; }
```

  The footer gets `--previewing` while an emoji is hovered. The Add Emoji
  button is absolutely positioned and fades out in that state. A sibling
  element added next to it therefore sits in normal flow (above the button)
  and stays visible during the preview, unless it shares that class.

## `:` emoji autocomplete

- **`TextyAutocompleteEmoji`** renders the list. Props: `results`,
  `selectedIndex`, `onSelect`, `userSkinTone`. For each result it renders a
  `TextyAutocompleteResult` containing two things:
  - an `Emoji`, looked up by name in Slack's emoji store
  - `:name:`, built from the result's `emojiBestNameMatch`, with
    `emojiMatchIndices` highlighted
- **`TextyAutocompleteResult`** is the `<li role="option"
  data-qa="tab_complete_ui_item">` row shared by every autocomplete kind
  (emoji, member, channel, broadcast keyword, …).
  - Props: `children`, `index`, `result`, `isSelected`, `isPseudoSelected`,
    `onSelect`, `onSelectedIndexChange`, `size`, `isDisabled`.
  - To target only emoji rows, check `result.type === 'emoji'`.
- **Thunk `autocompleteEmoji`**. From the HMojis plugin's own logging of a
  live call (an earlier session, not re-checked this pass):
  - Its argument includes `query` (with the leading `:`) and `channelId`.
  - It resolves to a plain array of scored results:
    `{ item: { name, url, id: "E"+name, keywords, updated }, name, score,
    emojiScore, type: "emoji", source: "local", suggestionType: "emoji",
    emojiBestNameMatch, emojiMatchIndices, … }`.
  - That array is not the Flannel wire format (`{ results: [...] }`).
- **Thunk `upsertEmoji`** takes an array of `{ name, value, updated }`, where
  `value` is the image URL. It adds names to the client's emoji store so they
  render as emoji. Shape taken from a live call, same source as above.
  - A name registered this way is found by Slack's own autocomplete. So a
    plugin that injects its own rows for those names mostly sees Slack's
    rows, not its own.

## Right-click on a person: `MemberContextMenu`

- **`MemberContextMenu`** (a class component, wrapped with `connect`) wraps a
  person's name or avatar. It passes this to Slack's `ContextMenu` trigger:

```js
getTemplate: () => this.props.getMemberContextMenuTemplate({ id }),
overrideDefaultMenu: true, showSlackKitContextMenuOnDesktop: true, width: "auto"
```

  `getMemberContextMenuTemplate` is mapped to dispatch the thunk of the same
  name.
- **Thunk `getMemberContextMenuTemplate`** ("get the context menu template
  when user clicks on a member") takes `{ id }` and returns an array of menu
  items:
  - items look like `{ label, click }`
  - dividers look like `{ type: "separator" }`
  - the last items are "copy member name", "copy member id" and "Copy link"
- **Menu item `type` values** (enum module `fgV0`): `default`,
  `compact_item`, `separator`, `submenu`, `header`, `custom`,
  `subheader_child`, `radio`, `checkbox`.
- **Other context menus** that have a `displayName`:
  - `MessageActionsContextMenu`: props `ts`, `threadTs`, `channelId`,
    `messageContainerType`, `rollup`, `onSelectAction`, `targetBounds`
  - `ChannelContextMenu`, `LinkContextMenu`, `TextSelectionContextMenu`,
    `BotContextMenu`, `PinsListMessageContextMenu`
  - `MessageActionsMenu`, `MessageActionsOverflowMenu`,
    `MoreMessageActionsSubmenu`

## Message DOM hooks

- The sender button carries the author's user id as
  **`data-message-sender="U…"`**.
- The name element inside it is `data-qa="message_sender_name"`.
- Prefer `MemberContextMenu` above to reading these attributes.

## Related Web API behaviour

See `conversations.md` and `chat.md` for the Web API side of the same work:
reading a bot's own DMs to prove who posted a message, and review cards
posted with Block Kit.
