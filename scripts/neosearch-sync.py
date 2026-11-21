#!/usr/bin/env python3
"""Rebuild vs/neosearch from the Hack Club workspace's custom emoji.

Writes website/public/__subdomains/vs/neosearch/emoji.json, downloads images that are
missing from img/, and deletes images of neo emoji that no longer exist.

Credentials: SLACK_XOXC + SLACK_XOXD, or --tokens path/to/tokens.json (the izie-tokens
format: {"xoxd": ..., "teams": [{"teamId": "T0266FRGM", "token": "xoxc-..."}]}).

  python3 scripts/neosearch-sync.py --tokens ~/Documents/Projects/izie/hc-full-account/izie-tokens/tokens.json
  python3 scripts/neosearch-sync.py --dry-run
"""

import argparse
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(ROOT, "website/public/__subdomains/vs/neosearch")
IMG = os.path.join(SITE, "img")
API = "https://hackclub.slack.com/api/"
TEAM = "T0266FRGM"
# longest first, so neobotter isn't filed under neobot
FAMILIES = ["neoboykisser", "neobotter", "neopossum", "neobread", "neocat", "neodog", "neofox", "neobot"]
FAMILY_RE = re.compile(rf"^({'|'.join(FAMILIES)})(?=$|[_\-0-9])")


def creds(args):
    if args.tokens:
        data = json.load(open(os.path.expanduser(args.tokens)))
        team = next((t for t in data.get("teams", []) if t.get("teamId") == TEAM), None)
        if not team:
            sys.exit(f"no {TEAM} token in {args.tokens}")
        return team["token"], data["xoxd"]
    token, xoxd = os.environ.get("SLACK_XOXC"), os.environ.get("SLACK_XOXD")
    if not token or not xoxd:
        sys.exit("set SLACK_XOXC and SLACK_XOXD, or pass --tokens")
    return token, xoxd


def emoji_list(token, xoxd):
    body = urllib.parse.urlencode({"token": token}).encode()
    req = urllib.request.Request(API + "emoji.list", body, headers={"Cookie": f"d={xoxd}", "Origin": "https://app.slack.com"})
    data = json.load(urllib.request.urlopen(req, timeout=60))
    if not data.get("ok"):
        sys.exit(f"emoji.list failed: {data.get('error')}")
    return data["emoji"]


def family(name):
    m = FAMILY_RE.match(name)
    return m.group(1) if m else None


def ext(url):
    e = os.path.splitext(urllib.parse.urlparse(url).path)[1].lower()
    return e if e in {".png", ".gif", ".jpg", ".jpeg", ".webp"} else ".png"


def build(emoji):
    entries, aliases = [], []
    for name, value in sorted(emoji.items()):
        fam = family(name)
        if not fam:
            continue
        if value.startswith("alias:"):
            target = value[len("alias:"):]
            aliases.append({"name": name, "alias": target, "family": fam})
        else:
            entries.append({"name": name, "file": f"img/{name}{ext(value)}", "family": fam, "url": value})
    names = {e["name"] for e in entries}
    aliases = [a for a in aliases if a["alias"] in names]  # aliases of non-neo emoji are dropped
    return entries, aliases


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--tokens", help="izie-tokens tokens.json")
    ap.add_argument("--dry-run", action="store_true", help="report changes without writing anything")
    args = ap.parse_args()

    entries, aliases = build(emoji_list(*creds(args)))
    wanted = {os.path.basename(e["file"]) for e in entries}
    have = set(os.listdir(IMG))
    missing = [e for e in entries if os.path.basename(e["file"]) not in have]
    stale = sorted(f for f in have if family(os.path.splitext(f)[0]) and f not in wanted)

    old = json.load(open(os.path.join(SITE, "emoji.json")))
    old_names = {e["name"] for e in old}
    new_names = {e["name"] for e in entries} | {a["name"] for a in aliases}
    print(f"{len(entries)} emoji, {len(aliases)} aliases; +{len(new_names - old_names)} -{len(old_names - new_names)} names; "
          f"{len(missing)} images to download, {len(stale)} to delete")
    if args.dry_run:
        for n in sorted(new_names - old_names):
            print("  +", n)
        for n in sorted(old_names - new_names):
            print("  -", n)
        return

    failed = []
    for e in missing:
        try:
            with urllib.request.urlopen(e["url"], timeout=60) as r:
                data = r.read()
            with open(os.path.join(SITE, e["file"]), "wb") as f:
                f.write(data)
        except OSError as error:
            failed.append((e["name"], str(error)))
        time.sleep(0.05)
    for f in stale:
        os.remove(os.path.join(IMG, f))

    ok = [e for e in entries if os.path.exists(os.path.join(SITE, e["file"]))]
    out = [{k: e[k] for k in ("name", "file", "family")} for e in ok] + aliases
    out.sort(key=lambda e: e["name"])
    with open(os.path.join(SITE, "emoji.json"), "w") as f:
        json.dump(out, f)
    print(f"wrote {len(out)} entries" + (f"; {len(failed)} downloads failed: {failed[:5]}" if failed else ""))


if __name__ == "__main__":
    main()
