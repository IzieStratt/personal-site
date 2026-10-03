# Slack web client experiments: community-reported batch (2026-10)

These are **web client query parameters, not Web API methods**. This page
records a community post pasted by the site owner on October 3, 2026. The
post and follow-up are attributed in that paste to a display name, "felix";
that attribution has not been independently authenticated here.

**Verification:** the exact names and values below come from the pasted
links. They have not been checked against a current client bundle or tested
in a live Slack session. The feature labels describe the post or the flag
names, not confirmed behavior. Availability may differ by account, workspace
or client build; a query parameter is not a guarantee that a feature works.

## Exact parameters in the pasted link

| Feature label | Query parameter | Value | Evidence / notes |
| --- | --- | --- | --- |
| Quick quote replies | `force_quick_quote_replies` | `on` | Listed in the post and both links. |
| Jump to latest in long threads | `force_fe_long_threads_jump_to_latest` | `on` | The post calls it `long_threads_jump_to_latest`; the URL includes `fe_`. |
| Draft management in composer | `force_draft_management_in_composer` | `treatment` | Listed twice in the post; repeated with the same value in the follow-up URL. One parameter is enough to record the supplied value. |
| Activity priority bundles | `force_activity_priority_bundles` | `on` | Named as one of the poster's favorites. |
| Thread badging in the Home sidebar | `force_thread_badging_home_sidebar` | `on` | Named as one of the poster's favorites. |
| Unread thread indication in the reply bar | `force_unread_thread_indication_in_replybar` | `on` | The follow-up also names it as a favorite. |
| Relative time difference | `force_relative_time_difference` | `on` | The follow-up also names it as a favorite; exact UI behavior is not described in the paste. |

The later link additionally contains `slackDebug=1`. That is a separate
query option in the source, not one of the seven experiment overrides.
Its effects were not described or tested here.

## Link parameters without a workspace or channel destination

To preserve the useful part without publishing the source workspace/channel
IDs, this is the query string from the later link with the duplicate draft
parameter removed:

```text
?force_quick_quote_replies=on&force_fe_long_threads_jump_to_latest=on&force_draft_management_in_composer=treatment&force_activity_priority_bundles=on&force_thread_badging_home_sidebar=on&force_unread_thread_indication_in_replybar=on&force_relative_time_difference=on&slackDebug=1
```

The pasted links target Slack's web client (`app.slack.com/client/...`).
The paste does not establish persistence across reloads, desktop/mobile
support, or whether these overrides still work. No Slack API calls were
made to test them.

## Other features mentioned, without exact flags

The same post mentions:

- Dictation.
- Markdown copy and paste.
- Block Kit pages.
- AI features, including questions, forms and code interpreters.
- Notification and sidebar management.
- Canvas autocomplete.
- Nested blockquotes.

No exact query parameter, API method, rollout status or reproduction steps
were supplied for these mentions. Do not infer flag names from the labels.
The post recommends a video earlier in its thread; no video or video link
was supplied in the paste, and none was reviewed for this entry. The later
reply says the link includes useful experiments from a previous datamine,
but does not identify that build or provide additional evidence.

## Related reference

- [experiments.getByUser](../methods/misc-undocumented.md#experimentsgetbyuser)
  is a separate internal API entry for bucket assignments. These query
  parameters are not newly discovered API methods and do not change that
  entry's verification status.
- [Web client internals](../methods/web-client-internals-2026-09.md)
  describes a different, bundle-sourced pass.
