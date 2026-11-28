#!/usr/bin/env python3
"""lostfm scrobbler for the Music app on macOS. No dependencies beyond Python 3.

Watches the Music app and sends plays to lostfm (or any ListenBrainz-compatible server):
a "now playing" when a track starts, and a scrobble once you've heard half of it (or 4 minutes),
the usual scrobble rule. Tracks under 30 seconds are ignored.

    python3 apple-music-scrobbler.py --token YOUR_TOKEN              # run in the foreground
    python3 apple-music-scrobbler.py --token YOUR_TOKEN --install    # start at login (LaunchAgent)
    python3 apple-music-scrobbler.py --uninstall

Get a token at https://vs.izie.top/lostfm/connect/
"""
import argparse
import json
import os
import plistlib
import subprocess
import sys
import time
import urllib.error
import urllib.request

DEFAULT_URL = "https://vs.izie.top/lostfm/1/submit-listens"
LABEL = "top.izie.lostfm-apple-music"
PLIST = os.path.expanduser(f"~/Library/LaunchAgents/{LABEL}.plist")
SEP = "␞"  # unlikely to appear in a title

SCRIPT = f'''
if application "Music" is not running then return "stopped"
tell application "Music"
  if player state is not playing then return "paused"
  set t to current track
  return (persistent ID of t) & "{SEP}" & (name of t) & "{SEP}" & (artist of t) & "{SEP}" & (album of t) & "{SEP}" & (duration of t) & "{SEP}" & player position
end tell
'''


def now_playing():
    """Returns dict or None. Raises RuntimeError if AppleScript fails (e.g. permission denied)."""
    r = subprocess.run(["osascript", "-e", SCRIPT], capture_output=True, text=True, timeout=10)
    if r.returncode != 0:
        raise RuntimeError(r.stderr.strip() or "osascript failed")
    out = r.stdout.strip()
    if out in ("stopped", "paused", ""):
        return None
    parts = out.split(SEP)
    if len(parts) != 6:
        return None
    pid, name, artist, album, duration, position = parts
    try:
        duration, position = float(duration.replace(",", ".")), float(position.replace(",", "."))
    except ValueError:
        return None
    return {"id": pid, "name": name, "artist": artist, "album": album, "duration": duration, "position": position}


def submit(url, token, listen_type, track, listened_at=None):
    listen = {"track_metadata": {"artist_name": track["artist"], "track_name": track["name"],
                                 "release_name": track["album"],
                                 "additional_info": {"media_player": "Apple Music", "submission_client": "lostfm-apple-music"}}}
    if listened_at is not None:
        listen["listened_at"] = int(listened_at)
    body = json.dumps({"listen_type": listen_type, "payload": [listen]}).encode()
    req = urllib.request.Request(url, data=body, method="POST", headers={
        "Authorization": f"Token {token}", "Content-Type": "application/json", "User-Agent": "lostfm-apple-music/1"})
    with urllib.request.urlopen(req, timeout=15) as r:
        return r.status


def run(url, token, interval):
    current = None     # track we're watching
    started = 0.0      # when it started (unix)
    heard = 0.0        # seconds actually heard (pauses and skips don't count)
    last_pos = None
    done = False
    queue = []         # scrobbles that failed to send; retried later
    warned = False
    print(f"lostfm: watching the Music app, sending to {url}", flush=True)
    while True:
        try:
            t = now_playing()
            warned = False
        except Exception as e:
            if not warned:
                print(f"lostfm: can't read the Music app ({e}). Allow Terminal/Python to control Music in "
                      "System Settings → Privacy & Security → Automation.", flush=True)
                warned = True
            t = None
        now = time.time()
        if t and (current is None or t["id"] != current["id"] or (last_pos is not None and t["position"] + 5 < last_pos and done)):
            # new track (or the same one played again from the start)
            current, started, heard, last_pos, done = t, now - t["position"], 0.0, t["position"], False
            if t["duration"] >= 30:
                try:
                    submit(url, token, "playing_now", t)
                except Exception as e:
                    print(f"lostfm: now playing failed: {e}", flush=True)
        elif t and current:
            step = t["position"] - (last_pos or 0)
            if 0 < step <= interval * 2 + 2:  # normal playback; seeks don't count as listening
                heard += step
            last_pos = t["position"]
            need = min(current["duration"] / 2, 240)
            if not done and current["duration"] >= 30 and heard >= need:
                done = True
                queue.append((current, started))
        for item in list(queue):
            try:
                submit(url, token, "single", item[0], item[1])
                queue.remove(item)
                print(f"lostfm: scrobbled {item[0]['artist']} – {item[0]['name']}", flush=True)
            except urllib.error.HTTPError as e:
                if e.code in (400, 401):  # bad data or token: retrying won't help
                    print(f"lostfm: server refused the scrobble ({e.code}): {e.read()[:200]!r}", flush=True)
                    queue.remove(item)
                break
            except Exception:
                break  # offline; keep it for later
        time.sleep(interval)


def install(token, url, interval):
    os.makedirs(os.path.dirname(PLIST), exist_ok=True)
    script = os.path.abspath(__file__)
    plist = {"Label": LABEL, "ProgramArguments": [sys.executable, script, "--token", token, "--url", url,
                                                  "--interval", str(interval)],
             "RunAtLoad": True, "KeepAlive": True,
             "StandardOutPath": os.path.expanduser("~/Library/Logs/lostfm-apple-music.log"),
             "StandardErrorPath": os.path.expanduser("~/Library/Logs/lostfm-apple-music.log")}
    subprocess.run(["launchctl", "unload", PLIST], capture_output=True)
    with open(os.open(PLIST, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600), "wb") as f:
        plistlib.dump(plist, f)
    subprocess.run(["launchctl", "load", PLIST], check=True)
    print(f"lostfm: installed. It starts at login; logs are in ~/Library/Logs/lostfm-apple-music.log\n"
          f"Keep this file where it is: {script}")


def uninstall():
    subprocess.run(["launchctl", "unload", PLIST], capture_output=True)
    if os.path.exists(PLIST):
        os.remove(PLIST)
    print("lostfm: uninstalled.")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--token", default=os.getenv("LOSTFM_TOKEN"))
    ap.add_argument("--url", default=DEFAULT_URL, help="ListenBrainz submit-listens URL")
    ap.add_argument("--interval", type=int, default=10, help="seconds between checks")
    ap.add_argument("--install", action="store_true")
    ap.add_argument("--uninstall", action="store_true")
    a = ap.parse_args()
    if sys.platform != "darwin":
        sys.exit("This scrobbler only works on macOS (it talks to the Music app).")
    if a.uninstall:
        return uninstall()
    if not a.token:
        sys.exit("Pass --token (get one at https://vs.izie.top/lostfm/connect/)")
    if not a.url.startswith("https://"):
        sys.exit("--url must be https")
    if a.install:
        return install(a.token, a.url, a.interval)
    try:
        run(a.url, a.token, max(3, a.interval))
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
