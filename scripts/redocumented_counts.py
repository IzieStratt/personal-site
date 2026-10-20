"""Single source of truth for the ReDocumented catalog counts and for every place that quotes them.

`docs/data/methods.json` (key `methods`) is the catalog. Everything here is DERIVED from it:

  * compute_counts(methods)   the numbers, with the definitions in COUNT_DEFS (also written into the catalog's
                              schema as `count_definitions`, so agents can read them)
  * CLAIMS                    each sentence in the docs/agent files that quotes a derived number: which file, a regex
                              whose group `n` is the number, which count it must equal, and how to format it
  * apply_claims / check      rewrite the numbers, or report the ones that disagree

Run through `scripts/build-redocumented-agent.py` (writes) or `... --check` (CI: fails, writes nothing).
A claim whose sentence was reworded so the pattern no longer matches fails loudly instead of being skipped.
"""
import re
from pathlib import Path

COUNT_DEFS = {
    'total': "Number of entries in `methods`.",
    'documented': "Entries with status == 'documented' (in Slack's public docs).",
    'undocumented': "Entries with status == 'undocumented' (found by source-mining).",
    'not_in_client': "Entries flagged not_in_client: true (missing from several recent Slack web client builds; "
                     "says nothing about whether the API still answers).",
    'params_observed': "Entries with a non-empty params_observed object (argument names seen in Slack's client code; "
                       "partial, not a schema).",
    'live_verified_undocumented': "Entries with status == 'undocumented' AND verified exactly 'live-verified' (called "
                                  "for real with real credentials, read-only). NOT counted: 'partial', 'existence-only', "
                                  "'not-live-tested', ambiguous results, and documented methods labelled "
                                  "'docs + live-tested' or 'docs-only (live-tested ..., error path only)'.",
    'params_known': "Entries with params_known: true (a real, sourced parameter schema).",
    'response_known': "Entries with response_known: true (a real, sourced response shape or example).",
    'own_miner_sourced': "Entries whose `source` credits IzieStratt/slack-datamine-plus.",
}


def compute_counts(methods):
    return {
        'total': len(methods),
        'documented': sum(m['status'] == 'documented' for m in methods),
        'undocumented': sum(m['status'] == 'undocumented' for m in methods),
        'not_in_client': sum(bool(m.get('not_in_client')) for m in methods),
        'params_observed': sum(bool(m.get('params_observed')) for m in methods),
        'live_verified_undocumented': sum(m['status'] == 'undocumented' and m['verified'] == 'live-verified' for m in methods),
        'params_known': sum(bool(m['params_known']) for m in methods),
        'response_known': sum(bool(m['response_known']) for m in methods),
        'own_miner_sourced': sum('slack-datamine-plus' in (m.get('source') or '') for m in methods),
    }


def _fmt(counts, key, how):
    if how == 'pct':  # key is "<count>_pct": share of total, one decimal
        base = key[:-4]
        return f"{counts[base] / counts['total'] * 100:.1f}%"
    n = counts[key]
    if how == 'plain':
        return str(n)
    if how == 'floor100plus':  # "1,700+": a floor, not the exact number
        return f"{n // 100 * 100:,}+"
    return f"{n:,}"


def _claim(path, pattern, key, how='comma', root='redocumented'):
    return {'path': path, 'root': root, 'pattern': pattern, 'key': key, 'how': how}


# root 'redocumented' = website/public/__subdomains/vs/redocumented, root 'vs' = its parent folder.
# Only CURRENT-state statements belong here. Historical snapshots ("this pass added 31", "372 before this update") stay as written.
S = r'\s+'
CLAIMS = [
    # docs/README.md
    _claim('docs/README.md', r'both the ~(?P<n>[\d,]+) officially', 'documented'),
    _claim('docs/README.md', r'Catalog now: (?P<n>[\d,]+)' + S + r'documented \+ [\d,]+ undocumented', 'documented'),
    _claim('docs/README.md', r'documented \+ (?P<n>[\d,]+) undocumented/cross-referenced', 'undocumented'),
    _claim('docs/README.md', r'undocumented/cross-referenced = (?P<n>[\d,]+) total', 'total'),
    _claim('docs/README.md', r'\((?P<n>[\d,]+) not found in Slack\'s current web client\)', 'not_in_client'),
    _claim('docs/README.md', r'treating "(?P<n>[\d,]+) undocumented" as', 'undocumented'),
    _claim('docs/README.md', r'as "(?P<n>[\d,]+)' + S + r'confirmed hidden APIs"', 'undocumented'),
    _claim('docs/README.md', r'only (?P<n>[\d,]+) undocumented methods are `live-verified`', 'live_verified_undocumented'),
    _claim('docs/README.md', r'\*\*(?P<n>[\d,]+)/[\d,]+ methods' + S + r'\([\d.]+%\) now have real', 'params_known'),
    _claim('docs/README.md', r'\*\*[\d,]+/(?P<n>[\d,]+) methods' + S + r'\([\d.]+%\) now have real', 'total'),
    _claim('docs/README.md', r'\*\*[\d,]+/[\d,]+ methods' + S + r'\((?P<n>[\d.]+%)\) now have real', 'params_known_pct', 'pct'),
    _claim('docs/README.md', r'; (?P<n>[\d,]+)/[\d,]+ \([\d.]+%\) have a', 'response_known'),
    _claim('docs/README.md', r'; [\d,]+/(?P<n>[\d,]+) \([\d.]+%\) have a', 'total'),
    _claim('docs/README.md', r'; [\d,]+/[\d,]+ \((?P<n>[\d.]+%)\) have a', 'response_known_pct', 'pct'),
    # docs/methods/INDEX.md (header paragraph)
    _claim('docs/methods/INDEX.md', r'^(?P<n>[\d,]+) documented methods \+', 'documented'),
    _claim('docs/methods/INDEX.md', r'documented methods \+ (?P<n>[\d,]+) undocumented methods = [\d,]+ total', 'undocumented'),
    _claim('docs/methods/INDEX.md', r'undocumented methods = (?P<n>[\d,]+) total', 'total'),
    _claim('docs/methods/INDEX.md', r'total\. (?P<n>[\d,]+) are not found in', 'not_in_client'),
    _claim('docs/methods/INDEX.md', r'and (?P<n>[\d,]+) undocumented methods have observed', 'params_observed'),
    _claim('docs/methods/INDEX.md', r'\*\*(?P<n>[\d,]+)/[\d,]+ \([\d.]+%\) have real, sourced', 'params_known'),
    _claim('docs/methods/INDEX.md', r'\*\*[\d,]+/(?P<n>[\d,]+) \([\d.]+%\) have real, sourced', 'total'),
    _claim('docs/methods/INDEX.md', r'\*\*[\d,]+/[\d,]+ \((?P<n>[\d.]+%)\) have real, sourced', 'params_known_pct', 'pct'),
    _claim('docs/methods/INDEX.md', r'-- (?P<n>[\d,]+)/[\d,]+ \([\d.]+%\) also have a known response', 'response_known'),
    _claim('docs/methods/INDEX.md', r'-- [\d,]+/(?P<n>[\d,]+) \([\d.]+%\) also have a known response', 'total'),
    _claim('docs/methods/INDEX.md', r'-- [\d,]+/[\d,]+ \((?P<n>[\d.]+%)\) also have a known response', 'response_known_pct', 'pct'),
    # docs/methods/datamine-2026-10.md
    _claim('docs/methods/datamine-2026-10.md', r'\*\*(?P<n>[\d,]+)\*\* of [\d,]+ methods carry the flag', 'not_in_client', 'plain'),
    _claim('docs/methods/datamine-2026-10.md', r'\*\*[\d,]+\*\* of (?P<n>[\d,]+) methods carry the flag', 'total', 'plain'),
    _claim('docs/methods/datamine-2026-10.md', r'\*\*(?P<n>[\d,]+)\*\* undocumented methods now have `params_observed`', 'params_observed', 'plain'),
    _claim('docs/methods/datamine-2026-10.md', r'; (?P<n>[\d,]+) entries carry it', 'own_miner_sourced', 'plain'),
    # llms.txt (agent-facing; read as plain text)
    _claim('llms.txt', r'Web API \(~(?P<n>[\d,]+) methods\)', 'documented'),
    _claim('llms.txt', r'source-mining \(~(?P<n>[\d,]+) more;', 'undocumented'),
    _claim('llms.txt', r'more; (?P<n>[\d,]+) of them flagged', 'not_in_client'),
    _claim('llms.txt', r'(?P<n>[\d,]+) methods carry `params_observed`', 'params_observed'),
    _claim('llms.txt', r'known \((?P<n>[\d,]+), including ones known to take none\)', 'params_known'),
    _claim('llms.txt', r'`true` — (?P<n>[\d,]+)/[\d,]+', 'params_known'),
    _claim('llms.txt', r'`true` — [\d,]+/(?P<n>[\d,]+)', 'total'),
    # entry pages
    _claim('index.html', r'~(?P<n>[\d,]+) documented methods plus [\d,]+\+ undocumented', 'documented'),
    _claim('index.html', r'documented methods plus (?P<n>[\d,]+\+) undocumented', 'undocumented', 'floor100plus'),
    _claim('llms.txt', r'covering ~(?P<n>[\d,]+) documented methods and', 'documented', root='vs'),
    _claim('llms.txt', r'documented methods and ~(?P<n>[\d,]+) undocumented', 'undocumented', root='vs'),
    _claim('index.html', r'documented \+ (?P<n>[\d,]+\+) undocumented methods\)', 'undocumented', 'floor100plus', root='vs'),
]


def apply_claims(counts, roots, write):
    """roots: {'redocumented': Path, 'vs': Path}. Returns a list of problems (empty = every claim matches).
    With write=True the stale numbers are rewritten in place first."""
    # per-file edits are applied together so several claims in one file don't clobber each other
    texts, problems = {}, []
    for c in CLAIMS:
        f = roots[c['root']] / c['path']
        if f not in texts:
            if not f.exists():
                problems.append(f"{f}: file missing (claim `{c['key']}`)")
                continue
            texts[f] = f.read_text()
    for c in CLAIMS:
        f = roots[c['root']] / c['path']
        if f not in texts:
            continue
        rx = re.compile(c['pattern'], re.M)
        found = list(rx.finditer(texts[f]))
        if len(found) != 1:
            problems.append(f"{c['root']}/{c['path']}: expected exactly 1 place matching /{c['pattern']}/ for `{c['key']}`, found {len(found)} "
                            f"(was the sentence reworded? update CLAIMS in scripts/redocumented_counts.py)")
            continue
        m = found[0]
        want = _fmt(counts, c['key'], c['how'])
        have = m.group('n')
        if have != want:
            problems.append(f"{c['root']}/{c['path']}: says {have!r} for `{c['key']}`, catalog says {want!r}")
            if write:
                s, e = m.span('n')
                texts[f] = texts[f][:s] + want + texts[f][e:]
    if write:
        for f, t in texts.items():
            if f.read_text() != t:
                f.write_text(t)
    return problems
