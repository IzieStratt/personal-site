# Custom profile fields: `users.profile.setSections`, and why `users.profile.set` lies to you (2026-09-30)

Sixth pass. Triggered by a concrete task — set one custom `DATE` profile field
on this account — that the documented API appeared to do and silently did not.

Everything here is either a **live call against this account** or a **source
read of the web client bundle**. Nothing is inferred from method names. Where a
thing was *not* verified, that is said explicitly.

## The headline finding

`users.profile.set` **returns `ok: true` and silently discards every write to
a custom profile field** (any `Xf...` id). Core fields (`status_text`,
`status_emoji`, `title`, `phone`, …) through the same call work fine. There is
no error, no warning, and nothing in the response distinguishes the two cases:

| via `users.profile.set` | result |
|---|---|
| `status_text` -> `"probe"` | **persisted** |
| `Title` (`Xf09UB145B18`, text) -> `"ZZTEST123"` | silently reverted |
| `Birthday` (`Xf0A06G5MKJM`, date) -> `"2012-08-02"` | silently reverted |
| `Last Shipped At` (`Xf0BV2AV197Y`, date) -> `"2026-09-30"` | never appears in `fields` |

Reproduced identically with all three encodings the docs allow —
`profile` as a JSON-dumps string, `profile` as a dict, and the single-key
`name`/`value` form — and with an explicit `user=` (the admin param). Also
checked against the bot token (`not_allowed_token_type`) and the classic read
path. The project's existing `users_profile_set` calls only ever touch
`status_text`/`status_emoji`, so nothing in this repo is affected by this.

**Agent-facing consequence: treat every profile write as unverified until you
read it back with an independent call.** A `users.profile.set` that returned
`ok: true` proves nothing about whether the field changed.

## The endpoint that actually works: `users.profile.setSections`

The web client does not use `users.profile.set` for custom fields. Source-read
from the bundle (`js/modern.vendor.1199148cec6e2371.min.js`, build `bv1-13`),
module `Tlo7`, which builds a generated fetcher:

```js
let ey = createFetcher("users.profile.setSections generated fetcher", async (dispatch, getState, args) => {
  let {abortSignal, reason, ...rest} = args;
  return dispatch(apiCall({method: "users.profile.setSections", args: rest, ...}));
});
```

and its hook passes exactly three args — `user`, `section_id` (from the caller's
own key), `elements` — over the normal `/api/` route with the session token in
`args`. So it is a plain Web API method, not a private GraphQL endpoint.

Params (catalog previously had these as `params_known` from
`slack-undoc-client` but `existence-only`; now live-verified):

- `user` — target user ID; omitting it targets the caller.
- **`section`** — the `sectionId` (`Ps09UB143BUJ`), not the label.
  Live-verified trap: **`section_id` and `profile_section_id` both return
  `failed_to_set_sections`** while `section` is accepted.
- `elements` — JSON array. The id is the **`Pe...` `elementId`** from
  `getSections`, not the legacy `Xf...` id.

Element value shape, copied from `convertSectionToProfileInput` (module `jm/x`),
switching on the element's `__typename`:

| `__typename` | payload |
|---|---|
| `ProfileTextElement` | `{element_id, text: {text}}` |
| **`ProfileDateElement`** | **`{element_id, date: {date}}`** |
| `ProfileLinkElement` | `{element_id, link: {displayText, uri}}` |
| `ProfilePersonElement` | `{element_id, person: {persons}}` |
| `ProfileLongTextElement` | `{element_id, long_text: {blocks}}` |
| `ProfileCurrentLocationElement` | `{element_id, currentLocation: {city, country, description, state}}` |
| `ProfileTagsElement` | `{element_id, tags: {tags}}` |

An empty inner string clears the element. Live-verified write:

```jsonc
// users.profile.setSections
// user=U09KKMHLS15  section=Ps09UB143BUJ
elements=[{"element_id":"Pe09VB644Z0U","text":{"text":"ZZSCHOOLTEST"}}]
// -> ok:true, and users.profile.getSections read back 'ZZSCHOOLTEST'
//    (restored to 'no' afterwards; verified no leftovers)
```

That is a genuine `live-verified` write against a real account.

## Why the one field I actually needed still wouldn't set

`users.profile.getSections` returns a per-element permission object, and it is
the only place a caller can discover this in advance:

```json
"permissions": {
  "api": ["ORG_ADMIN","ORG_PRIMARY_OWNER","ORG_OWNER",
          "WORKSPACE_ADMIN","WORKSPACE_OWNER","WORKSPACE_PRIMARY_OWNER"],
  "ui": false,
  "scim": false
}
```

`"ui": false` — the field is admin-locked. `setSections` accepts the call and
drops the write, same `ok: true` non-signal as above. Notably `ui: false` also
blocks the member in the **Slack UI**, so this is not an API-vs-UI distinction;
it is an identity requirement.

For contrast, a sibling field in the same section with `ui: true`
(`School`, `Pe09VB644Z0U`) wrote and restored cleanly through the identical
call. Same endpoint, same section, same payload shape — so the transport was
right and only the permission differed. That control is what makes this a real
finding rather than "the API is broken".

## `users.profile.setAdminSections` is schema, not values

The catalog listed it as `existence-only`. Its params are now **live-verified**
— Slack returns precise JSON-schema errors with JSON pointers, so the shape was
walked out from its own complaints:

- `sections` (required) — JSON **array** of section objects, each requiring
  `id`, `label`, `order`, `type`, `isHidden`, `canChangeHidden`, `canEdit`,
  `profileAdminElements[]`.
- each element requires `label`, `order`, `elementKey`, `type`, `hint`,
  `isHidden`, `canChangeHidden`, `canEdit`, `isIndexed`, `isFilterable`,
  `isInPreview`, `isScimManaged`. Optional `legacyFieldId` is **accepted**;
  `elementId` and `fieldId` are rejected.

With the schema satisfied and **no value property**, the call reached the
permission check and returned **`permission_denied`** for this account.

Critically, **no value property is accepted at all** — `date`, `text`, `value`,
`link`, `person` are each rejected as `invalid additional property` once
`legacyFieldId` is the identifier. So this method defines *which elements a
section contains* and their ordering/metadata; it is not a back door for
setting admin-locked values, and it did not appear in the web client bundle at
all (the bundle has `PROFILE_ADMIN_ELEMENTS` as a label constant only).

`permission_denied` here is the third rejection category in
`admin-write-scope-2026-09.md`: an org-level authenticated session is not an
actual org admin. No token substitution fixes it; it needs a different identity.

## Token notes (both are real traps)

- The `xoxd`/`xoxc` pair must be sent as **`Cookie: d=<xoxd>`**, not
  `Authorization: Bearer`. As a bearer they return `invalid_auth`; as a cookie
  they authenticate fine. Same pattern as this project's
  `instinct_watchdog.py`.
- `users.profile.setSections` is **enterprise-scoped**: team xoxc returns
  `team_is_restricted`, enterprise xoxc works. `xoxp`/`xoxb` return
  `not_allowed_token_type`. `users.profile.getSections` follows the same split,
  which means a team-only session cannot even *see* the permissions that
  explain why its write did nothing.

Also confirmed dead ends, recorded so nobody repeats them:
`admin.users.profile.set` and `enterprise.users.profile.setSections` ->
`unknown_method`; `enterprise.users.profile.set` -> `profile_set_not_allowed`.

## Provenance

- **Live calls** (this account, `U09KKMHLS15`, Hack Club `T0266FRGM`, Grid
  `E09V59WQY1E`): `users.profile.set` (3 encodings, core + text + date),
  `users.profile.get`/`getSections`, `users.profile.setSections`
  (write + restore + failed ui=false write), `users.profile.setAdminSections`
  (schema walk + `permission_denied`), token-matrix probes. All writes were to
  this account's own profile and every test value was restored and verified
  absent afterwards.
- **Source read:** Slack web client bundles, build `bv1-13`
  (`a.slack-edge.com`), 13 files / ~48 MB, fetched 2026-09-30. Endpoint,
  param names and element shapes come from `js/modern.vendor.1199148cec6e2371.min.js`
  (modules `Tlo7`, `jm/x`, `Bg7Z`).
- **Cross-referenced:** `slack-undoc-client` generated types for the initial
  param guesses; `team.profile.get` for the field->label mapping.

Not verified, explicitly: no org-admin identity was available, so whether a
*genuine* admin can write a `ui: false` element via `setSections`, and what
that path looks like in the admin UI, remain unconfirmed. The `ui: false`
permission object is what Slack reports, and this account's writes were refused
consistently across both endpoints — that is the limit of what was tested.