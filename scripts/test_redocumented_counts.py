"""Tests for the ReDocumented count definitions and the drift check.

  python3 -m unittest discover -s scripts -p 'test_*.py' -v
"""
import copy
import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import redocumented_counts as rc  # noqa: E402

VS = HERE.parent / 'website/public/__subdomains/vs'
CATALOG = VS / 'redocumented/docs/data/methods.json'
BUILD = HERE / 'build-redocumented-agent.py'


def method(status, verified, **extra):
    return {'name': f'x.{status}{len(verified)}{len(extra)}', 'status': status, 'verified': verified,
            'params_known': False, 'response_known': False, **extra}


class CountDefinitions(unittest.TestCase):
    def test_live_verified_undocumented_is_the_exact_label_on_undocumented_entries_only(self):
        ms = [
            method('undocumented', 'live-verified'),                                   # counted
            method('undocumented', 'live-verified', source='x'),                       # counted
            method('documented', 'live-verified'),                                     # documented: not counted here
            method('documented', 'docs + live-tested'),
            method('documented', 'docs-only (live-tested 2026-09-20, only error paths observed)'),
            method('undocumented', 'partial'),
            method('undocumented', 'existence-only'),
            method('undocumented', 'not-live-tested'),
            method('undocumented', 'ambiguous (live 2026-09-26: feature_not_enabled ...)'),
        ]
        c = rc.compute_counts(ms)
        self.assertEqual(c['live_verified_undocumented'], 2)
        self.assertEqual((c['total'], c['documented'], c['undocumented']), (9, 3, 6))

    def test_not_in_client_and_observed_params_and_own_miner(self):
        ms = [method('undocumented', 'existence-only', not_in_client=True),
              method('undocumented', 'existence-only', params_observed={'a': {'sites': 1, 'type': 'unknown'}},
                     source='IzieStratt/slack-datamine-plus (own miner)'),
              method('undocumented', 'existence-only', params_observed={})]
        c = rc.compute_counts(ms)
        self.assertEqual((c['not_in_client'], c['params_observed'], c['own_miner_sourced']), (1, 1, 1))

    def test_every_count_has_a_published_definition(self):
        self.assertEqual(set(rc.COUNT_DEFS), set(rc.compute_counts([])))


class RealCatalog(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data = json.loads(CATALOG.read_text())

    def test_stored_counts_equal_the_counts_derived_from_the_entries(self):
        self.assertEqual(self.data['counts'], rc.compute_counts(self.data['methods']),
                         'methods.json `counts` is stale: run python3 scripts/build-redocumented-agent.py')

    def test_definitions_are_published_in_the_schema(self):
        self.assertEqual(self.data['schema']['count_definitions'], rc.COUNT_DEFS)

    def test_every_quoted_count_in_the_docs_matches_exactly_once(self):
        problems = rc.apply_claims(rc.compute_counts(self.data['methods']),
                                   {'redocumented': VS / 'redocumented', 'vs': VS}, write=False)
        self.assertEqual(problems, [], '\n'.join(problems))


class DriftIsCaught(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp(prefix='redoc-test-'))
        self.vs = self.tmp / 'vs'
        shutil.copytree(VS, self.vs)
        self.cat = self.vs / 'redocumented/docs/data/methods.json'

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def check_cli(self):
        return subprocess.run([sys.executable, str(BUILD), '--check'], capture_output=True, text=True,
                              env={**os.environ, 'REDOC_VS_DIR': str(self.vs)})

    def test_check_passes_on_a_clean_tree(self):
        r = self.check_cli()
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)
        self.assertIn('OK:', r.stdout)

    def test_check_fails_when_the_catalog_changes_but_nothing_was_regenerated(self):
        data = json.loads(self.cat.read_text())
        victim = next(m for m in data['methods'] if m['status'] == 'undocumented' and m['verified'] == 'existence-only')
        victim['verified'] = 'live-verified'
        self.cat.write_text(json.dumps(data, indent=1, ensure_ascii=False) + '\n')
        r = self.check_cli()
        self.assertEqual(r.returncode, 1, r.stdout)
        self.assertIn('live_verified_undocumented', r.stdout)
        self.assertIn('docs/README.md', r.stdout)
        self.assertIn('Run `python3 scripts/build-redocumented-agent.py`', r.stdout)

    def test_check_fails_when_a_doc_quotes_a_wrong_number(self):
        f = self.vs / 'redocumented/llms.txt'
        f.write_text(f.read_text().replace('~323 methods', '~999 methods', 1))
        r = self.check_cli()
        self.assertEqual(r.returncode, 1, r.stdout)
        self.assertIn("says '999' for `documented`", r.stdout)

    def test_a_reworded_claim_is_reported_not_silently_skipped(self):
        f = self.vs / 'redocumented/docs/README.md'
        f.write_text(f.read_text().replace('are `live-verified`', 'are verified live', 1))
        problems = rc.apply_claims(rc.compute_counts(json.loads(self.cat.read_text())['methods']),
                                   {'redocumented': self.vs / 'redocumented', 'vs': self.vs}, write=False)
        self.assertTrue(any('expected exactly 1 place' in p and 'live_verified_undocumented' in p for p in problems), problems)


if __name__ == '__main__':
    unittest.main()
