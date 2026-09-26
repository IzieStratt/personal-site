#!/usr/bin/env python3
"""Build the agent-facing files for vs.izie.top/redocumented from docs/.

Run after editing docs/data/methods.json or any docs/**/*.md:
  python3 scripts/build-redocumented-agent.py

Writes (all generated, don't hand-edit). Per-method pages are served by worker.js
straight from methods.json, not generated here.
  api/index.json              compact list of every method (no params/response)
  api/methods.txt             one line per method, greppable
  api/namespaces.json         namespace -> method names
  openapi.json                OpenAPI 3.1 for methods with params_known: true
  llms-full.txt               llms.txt + every markdown doc, concatenated
"""
import json
import shutil
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / 'website/public/__subdomains/vs/redocumented'
BASE = 'https://vs.izie.top/redocumented'
DOCS = ROOT / 'docs'
API = ROOT / 'api'

data = json.loads((DOCS / 'data/methods.json').read_text())
methods = sorted(data['methods'], key=lambda m: m['name'])
safety = data.get('safety_note_for_agents') or data['schema'].get('safety_note_for_agents', '')

if API.exists():
    shutil.rmtree(API)
API.mkdir(parents=True)


def write_json(path, obj):
    path.write_text(json.dumps(obj, indent=1, ensure_ascii=False) + '\n')


# keep in sync with WRITE_VERBS in worker.js
def is_write_shaped(name):
    verb = name.rsplit('.', 1)[-1].lower()
    return any(verb.startswith(v) for v in (
        'create', 'delete', 'remove', 'set', 'update', 'add', 'post', 'send', 'invite',
        'kick', 'archive', 'rename', 'leave', 'join', 'close', 'reset', 'revoke', 'upload',
        'edit', 'mark', 'clear', 'disable', 'enable', 'assign', 'approve', 'deny', 'restrict',
        'promote', 'demote', 'convert', 'move', 'save', 'unarchive', 'schedule', 'share',
    ))


index, namespaces, txt = [], defaultdict(list), []
for m in methods:
    m = dict(m, write_shaped=is_write_shaped(m['name']))
    name = m['name']
    ns = name.rsplit('.', 1)[0] if '.' in name else name
    namespaces[ns].append(name)
    index.append({k: m.get(k) for k in (
        'name', 'status', 'verified', 'params_known', 'response_known', 'write_shaped', 'purpose')})
    txt.append('\t'.join([name, m['status'], m['verified'], 'params' if m['params_known'] else '-',
                          'write' if m['write_shaped'] else '-', (m.get('purpose') or '').replace('\n', ' ')]))

write_json(API / 'index.json', {
    'generated': data.get('generated'),
    'counts': data.get('counts'),
    'lookup': f'{BASE}/api/methods/{{name}}.json (or .md) for one method\'s full entry',
    'safety_note_for_agents': safety,
    'methods': index,
})
write_json(API / 'namespaces.json', dict(sorted(namespaces.items())))
(API / 'methods.txt').write_text(
    '# name\tstatus\tverified\tparams(known)\twrite-shaped\tpurpose\n'
    f'# one method per line; full entry at {BASE}/api/methods/<name>.json\n' + '\n'.join(txt) + '\n')

# OpenAPI: only methods whose params are real sourced data
paths = {}
for m in methods:
    if not m['params_known']:
        continue
    props = {k: {'type': 'string', 'description': ' '.join(str(x) for x in (v.get('type'), v.get('desc')) if x)}
             for k, v in (m['params'] or {}).items()}
    required = [k for k, v in (m['params'] or {}).items() if v.get('required') and k != 'token']
    schema = {'type': 'object', 'properties': props}
    if required:
        schema['required'] = required
    paths[f"/{m['name']}"] = {'post': {
        'operationId': m['name'],
        'summary': (m.get('purpose') or m['name'])[:200],
        'description': f"status: {m['status']}; verified: {m['verified']}; params source: {m.get('params_source')}. "
                       f"Details: {BASE}/api/methods/{m['name']}.md",
        'tags': [m['status']],
        'x-verified': m['verified'],
        'x-write-shaped': is_write_shaped(m['name']),
        'requestBody': {'content': {'application/x-www-form-urlencoded': {'schema': schema}}},
        'responses': {'200': {'description': 'Slack envelope; check `ok`. Response fields: '
                              + (', '.join(m['response']) if m.get('response') else 'unknown')}},
    }}
write_json(ROOT / 'openapi.json', {
    'openapi': '3.1.0',
    'info': {'title': 'ReDocumented Slack Web API (params-known subset)', 'version': data.get('generated', ''),
             'description': 'Generated from methods.json; only methods with params_known: true. '
                            'Param types are loose strings. ' + safety},
    'servers': [{'url': 'https://slack.com/api'}],
    'components': {'securitySchemes': {'bearer': {'type': 'http', 'scheme': 'bearer'}}},
    'security': [{'bearer': []}],
    'paths': paths,
})

parts = [(ROOT / 'llms.txt').read_text()]
for p in sorted(DOCS.rglob('*.md'), key=lambda p: (p.name != 'README.md', str(p))):
    rel = p.relative_to(ROOT)
    parts.append(f"\n\n{'=' * 78}\n# FILE: {BASE}/{rel}\n{'=' * 78}\n\n{p.read_text()}")
(ROOT / 'llms-full.txt').write_text(''.join(parts))

print(f'{len(methods)} methods, {len(paths)} in openapi.json, {len(namespaces)} namespaces')
