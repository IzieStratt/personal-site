# Custom profile fields: a member-account reproduction (2026-09-30)

This is a scoped revision of the observations recorded in
[PR #9](https://github.com/IzieStratt/personal-site/pull/9), which was closed
without merging. It separates a dated member-account test from Slack's
supported API contract. The tests below were recorded on September 30, 2026;
this revision did not rerun profile writes.

## Supported custom-field writes

[Slack's current `users.profile.set` documentation](https://docs.slack.dev/reference/methods/users.profile.set.md)
explicitly documents updating custom fields through `profile.fields`, keyed
by their `Xf...` IDs. The member-account result below does not overturn that
contract, and `setSections` is not a general replacement for it.

The documented prerequisites and restrictions matter:

- Select **API** as the field's data source in Configure Profiles.
- Use an `xoxp-` user token with `users.profile:write`.
- For profile-detail changes other than the documented username/display-name
  exception, Slack requires an Owner/Admin-generated token. On Enterprise,
  this means an Org Owner/Admin. The installer determines the token's role.
- Changing another user's profile requires a paid plan and a higher role
  than the target. The optional `user` argument is restricted to admins on
  paid teams. Slack also states that org users cannot change their own
  profile details.

An arbitrary admin token is not enough for every target or field. The
original test did not establish an authorized admin-token/API-data-source
configuration. It also did not isolate the cause of the unchanged value.

## What the member-account test recorded

The original record identifies a non-admin member account in Hack Club's
Enterprise Grid workspace: user `U09KKMHLS15`, workspace `T0266FRGM`, org
`E09V59WQY1E`. It describes member-account token tests, including browser
session tokens for the section methods. It does not retain a complete
per-request token/scope/data-source matrix for `users.profile.set`; do not
assume every recorded request used an eligible `xoxp` token.

For `users.profile.set`, the recorded response was `ok: true`, but independent
profile readback did not retain the requested custom-field values:

| Requested change | Recorded response/readback |
|---|---|
| `status_text` = `probe` | Control value persisted |
| Text field `Xf09UB145B18` = `ZZTEST123` | `ok: true`; requested value did not persist |
| Date field `Xf0A06G5MKJM` = `2012-08-02` | `ok: true`; requested value did not persist |
| Date field `Xf0BV2AV197Y` = `2026-09-30` | `ok: true`; field did not appear in the readback's `fields` |

The original write-up reports JSON-string and object forms of `profile`, a
`name`/`value` attempt, and an explicit `user` argument. These are attempted
variants, not proof that every variant satisfied the current custom-field
contract. In particular, Slack distinguishes non-custom `name`/`value` writes
from custom writes using `fields`. The raw request/response traces are not
attached here, so the table preserves the historical record rather than
claiming a fresh independently reproduced result. The record states that
test values were restored and checked afterwards.

The conclusion is limited: **these member-account attempts returned success
without the requested custom-field change surviving readback**. This does
not establish that all member tokens behave this way, or that
`users.profile.set` cannot write custom fields. Role, token eligibility,
field data source and payload configuration remain possible explanations.
For consequential writes, verify persistence with a separate read.

## A similar report, not a confirmed cause

[Stack Overflow question 76129021](https://stackoverflow.com/questions/76129021)
was asked April 28, 2023. Its author reports that a request changes
`status_text` but leaves a custom field unchanged without an error. This is
a similar symptom, not proof of a common cause or a long-standing Slack bug.
The sole answer quotes role restrictions and suggests possible causes; it
does not record a confirmed fix. Slack's current documentation remains the
primary source for supported capability and prerequisites.

## Undocumented client section methods

The original record describes `users.profile.getSections` and
`users.profile.setSections` in the inspected Slack web-client profile-edit
path. These are undocumented client/session methods, not a supported Web
API workaround or a permission bypass. The record reports a successful
write/readback/restore on one editable text element and an unchanged value
on a locked element.

### Section identifier: separate hook arguments from the wire parameter

The original bundle excerpt creates a fetcher using
`apiCall({method: "users.profile.setSections", args: rest, ...})`. The write-up
also says a hook passes `section_id`, while its live-call notes say:

| Parameter in the recorded direct call | Recorded outcome |
|---|---|
| `section` | Accepted with the tested section ID |
| `section_id` | `failed_to_set_sections` |
| `profile_section_id` | `failed_to_set_sections` |

The accepted direct-call parameter in that record is **`section`**. The
hook-to-serializer/network mapping was not preserved well enough to explain
why the hook description used `section_id`. Do not present the hook's key as
a verified wire parameter or claim a rename that has not been traced. Also,
`failed_to_set_sections` is an observed result for those rejected attempts,
not an exhaustive definition of that error.

The recorded call used a `Ps...` section ID and `Pe...` element IDs from
`getSections`, rather than legacy `Xf...` field IDs. Its successful control:

```text
method: users.profile.setSections
user: U09KKMHLS15
section: Ps09UB143BUJ
elements: [{"element_id":"Pe09VB644Z0U","text":{"text":"ZZSCHOOLTEST"}}]
response: ok: true
separate users.profile.getSections readback: ZZSCHOOLTEST
restored value: no; restoration checked in the original test
```

### Element shapes and permissions

The original source-read notes attribute these shapes to
`convertSectionToProfileInput` in module `jm/x` of
`js/modern.vendor.1199148cec6e2371.min.js`, build `bv1-13`, inspected
September 30, 2026. Only the text write above was positively verified by
write/readback/restore in the retained record; the other shapes are
source-read notes, not successful live writes:

| Element discriminator | Recorded payload shape |
|---|---|
| `ProfileTextElement` | `{element_id, text: {text}}` |
| `ProfileDateElement` | `{element_id, date: {date}}` |
| `ProfileLinkElement` | `{element_id, link: {displayText, uri}}` |
| `ProfilePersonElement` | `{element_id, person: {persons}}` |
| `ProfileLongTextElement` | `{element_id, long_text: {blocks}}` |
| `ProfileCurrentLocationElement` | `{element_id, currentLocation: {city, country, description, state}}` |
| `ProfileTagsElement` | `{element_id, tags: {tags}}` |

One tested element reported `permissions.ui: false` and an `api` role list
containing org/workspace owners and admins. Its member-account write returned
`ok: true` without persistence. A sibling `ui: true` text element in the same
section persisted and was restored. The original record also says editing
was blocked in the member's Slack UI. This supports a permission-related
explanation for that element; it does not prove a universal meaning for
`ui: false`, or establish what a genuine admin could write.

The recorded token matrix for the section methods was: workspace `xoxc`
returned `team_is_restricted`; an enterprise browser session authenticated;
`xoxp`/`xoxb` attempts returned `not_allowed_token_type`. These are results
for this workspace/session, not a promise about every deployment. No tokens
or cookies are included here.

### Layout/schema is distinct from profile values

For `users.profile.setAdminSections`, the original test used validation errors
to derive section/element metadata fields. A shape-valid request reached
`permission_denied` on this member account. Tested value-bearing properties
(`date`, `text`, `value`, `link`, `person`) were rejected as additional
properties. This is evidence about the tested layout/schema request shape,
not a successful layout update or proof that every possible value field is
unsupported. No authorized admin write was tested. Keep layout/schema
observations separate from `setSections` element-value writes.

## Transport: limit the conclusion to the inspected path

The retained bundle excerpt names a method-specific `apiCall`; the original
investigation reports no GraphQL transport found in the inspected bundles
and profile request path. `__typename` alone is not evidence of a GraphQL
request. Neither the excerpt nor a missing `/graphql` string establishes
Slack's entire current architecture or the internal origin of those tags.

[Slack's April 2023 real-time messaging article](https://slack.engineering/real-time-messaging/)
describes a Hacklang Webapp fronting client APIs, alongside other services.
That is historical architecture context, not a transport restriction or an
exhaustive current inventory. [GraphQL's HTTP guidance](https://graphql.org/learn/serving-over-http/)
uses a typical endpoint path and describes persisted documents, so endpoint
string searches alone do not rule out GraphQL. The reported 58-string bundle
census is not reproduced by this revision.

## Verification boundary

This note preserves the dated observations from the closed PR while correcting
its scope. No new Slack writes were made for this revision. Admin identities,
API-data-source configurations and the hook-to-wire parameter mapping remain
untested or unresolved. Existing catalog verification labels are not upgraded
by this note. Supported custom-field writes belong to Slack's documented
`users.profile.set` contract; undocumented client observations are separate.
