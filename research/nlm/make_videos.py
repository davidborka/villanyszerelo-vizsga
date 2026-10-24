#!/usr/bin/env python3
"""Videólecke a gyakorlati modulokhoz (NotebookLM Video Overview), csak nyilvános forrásokból.

videos.json: [{"key": "m05-...", "focus": "..."}]. Egyenként indít (szünettel), figyeli az állapotot,
letölti, és 720p-re tömöríti a research/pack/video/<key>.mp4 fájlba. Újrafuttatható: a meglévőt kihagyja.
"""
import json, os, re, subprocess, sys, time

NB = "c2577abe-37b7-4b0f-b665-69975a0b0cec"
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "pack", "video")
SRC = open(os.path.join(HERE, "public_source_ids")).read().strip()
STYLE = ("Tiszta, műszaki whiteboard-stílus: kapcsolási rajzok, vezetékek valós érszínekkel "
         "(barna fázis, kék nulla, zöld-sárga védővezető), lépésről lépésre felépülő ábrák, kevés szöveg.")
ID = re.compile(r'"(?:artifact_id|id)"\s*:\s*"([0-9a-f-]{36})"')


def nlm(*args, timeout=600):
    r = subprocess.run(["nlm", *args], capture_output=True, text=True, timeout=timeout)
    return r.stdout + r.stderr


def main():
    os.makedirs(OUT, exist_ok=True)
    pending = {}
    for v in json.load(open(os.path.join(HERE, "videos.json"))):
        if os.path.exists(os.path.join(OUT, v["key"] + ".mp4")):
            continue
        focus = ("Villanyszerelő szakmai vizsga (Épületvillamosság), gyakorlati videólecke annak, aki biztosan át akar menni. "
                 + v["focus"] + " A végén 20 másodperces összefoglaló a két legfontosabb szabályról.")
        for attempt in range(4):
            out = nlm("video", "create", NB, "--format", "explainer", "--style-prompt", STYLE, "--language", "hu",
                      "--focus", focus, "--source-ids", SRC, "--confirm", "--json")
            m = ID.search(out)
            if m:
                pending[v["key"]] = m.group(1)
                print(f"{v['key']}: queued {m.group(1)}", flush=True)
                break
            print(f"{v['key']}: not created ({attempt + 1}): {out.strip()[-200:]}", flush=True)
            time.sleep(180)
        time.sleep(60)
    tmp = os.path.join(OUT, ".tmp")
    os.makedirs(tmp, exist_ok=True)
    for _ in range(240):
        if not pending:
            break
        try:
            status = {x["id"]: x for x in json.loads(nlm("studio", "status", NB, "--json", timeout=120))}
        except Exception:
            status = {}
        for key, art in list(pending.items()):
            st = status.get(art, {}).get("status")
            if st == "failed":
                print(f"{key}: FAILED", flush=True)
                del pending[key]
                continue
            if st != "completed":
                continue
            raw = os.path.join(tmp, key + ".mp4")
            nlm("download", "video", NB, "--id", art, "-o", raw, "--no-progress", timeout=1800)
            if not os.path.exists(raw):
                continue
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-vf", "scale=-2:720", "-c:v", "libx264", "-preset", "slow",
                            "-crf", "30", "-c:a", "aac", "-b:a", "64k", "-movflags", "+faststart",
                            os.path.join(OUT, key + ".mp4")], check=False)
            del pending[key]
            print(f"saved {key}", flush=True)
        time.sleep(60)
    print("DONE; pending:", sorted(pending) or "none")
    return 1 if pending else 0


if __name__ == "__main__":
    sys.exit(main())
