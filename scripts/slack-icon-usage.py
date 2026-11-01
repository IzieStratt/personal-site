#!/usr/bin/env python3
"""Map Slack web-client icon names to where they're used, and derive descriptions.

Reads the icon list from an icons.json (default: the slackdatamineplus site dir),
finds the Slack web client bundle in the local desktop app's Service Worker cache
(or uses --bundle), and for every icon name finds `name:"<icon>"`-style usages.
The nearest human-readable UI string (t("...") / label / title / aria-label) is
used as the description.

Outputs:
  icons-usage.json  -> { icon: { "count": n, "labels": [...], "snippets": [...] } }
  icons.json        -> adds "desc" to each icon (unless --no-write)

Usage:
  slack-icon-usage.py [--icons PATH] [--bundle PATH] [--no-write]
"""
import argparse
import collections
import json
import os
import re
import sys

DEFAULT_ICONS = os.path.join(
    os.path.dirname(__file__), "..", "website", "public", "__subdomains",
    "slackdatamineplus", "icons.json")
SW_CACHE = os.path.expanduser(
    "~/Library/Application Support/Slack/Service Worker/CacheStorage")

# A usage looks like: name:"mark-as-unread"  or  name: "mark-as-unread"
USAGE_RE_TMPL = r'name:\s*"{name}"'
# Human-readable UI strings near a usage.
LABEL_RES = [
    re.compile(r'\.t\("([^"]{3,80})"\)'),
    re.compile(r'(?:label|title|tooltip|aria-label|ariaLabel|text):\s*"([^"]{3,80})"'),
]


def find_bundles():
    """Every cached file that contains at least one `name:"..."` icon usage."""
    out = []
    for dp, _, fs in os.walk(SW_CACHE):
        for f in fs:
            p = os.path.join(dp, f)
            try:
                if b'name:"' in open(p, "rb").read():
                    out.append(p)
            except OSError:
                continue
    if not out:
        sys.exit("No Slack client bundle found in " + SW_CACHE)
    return out


def clean_label(s):
    return re.sub(r"\s+", " ", s).strip()


def usages_for(text, name):
    out = []
    for m in re.finditer(USAGE_RE_TMPL.format(name=re.escape(name)), text):
        window = text[max(0, m.start() - 220):m.end() + 120]
        labels = []
        for lre in LABEL_RES:
            labels += [clean_label(x) for x in lre.findall(window)]
        out.append((labels, window))
    return out


def describe(name, labels):
    """Most common UI label if the bundle has one; otherwise a name-derived guess."""
    if labels:
        return collections.Counter(labels).most_common(1)[0][0]
    if name.endswith("-filled"):
        return "Filled variant of " + name[:-7].replace("-", " ")
    if name.startswith("brand-"):
        return name[6:].replace("-", " ").title() + " logo"
    return name.replace("-", " ").capitalize()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--icons", default=DEFAULT_ICONS)
    ap.add_argument("--bundle", default=None)
    ap.add_argument("--no-write", action="store_true")
    args = ap.parse_args()

    icons_path = os.path.abspath(args.icons)
    data = json.load(open(icons_path, encoding="utf-8"))
    names = list(data["icons"].keys())

    bundles = [args.bundle] if args.bundle else find_bundles()
    texts = [open(b, "rb").read().decode("utf-8", "replace") for b in bundles]
    print("bundles scanned:", len(texts), file=sys.stderr)

    usage = {}
    for name in names:
        hits = [h for t in texts for h in usages_for(t, name)]
        labels = [l for ls, _ in hits for l in ls]
        usage[name] = {
            "count": len(hits),
            "labels": [l for l, _ in collections.Counter(labels).most_common(5)],
            "snippets": [w[-200:] for _, w in hits[:2]],
        }
        if not args.no_write:
            data["icons"][name]["desc"] = describe(name, labels)

    usage_path = os.path.join(os.path.dirname(icons_path), "icons-usage.json")
    with open(usage_path, "w", encoding="utf-8") as f:
        json.dump(usage, f, ensure_ascii=False, indent=1)
    print("wrote", usage_path, file=sys.stderr)

    unused = sum(1 for v in usage.values() if v["count"] == 0)
    print(f"icons: {len(names)}  with usages: {len(names) - unused}  unused in bundle: {unused}",
          file=sys.stderr)

    overrides_path = os.path.join(os.path.dirname(icons_path), "icons-desc-overrides.json")
    if not args.no_write and os.path.exists(overrides_path):
        # Hand-reviewed descriptions win over the label/name heuristic.
        overrides = json.load(open(overrides_path, encoding="utf-8"))
        for name, desc in overrides.items():
            if name in data["icons"]:
                data["icons"][name]["desc"] = desc
        print("applied", len(overrides), "overrides", file=sys.stderr)

    if not args.no_write:
        with open(icons_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
        print("updated desc in", icons_path, file=sys.stderr)


if __name__ == "__main__":
    main()
