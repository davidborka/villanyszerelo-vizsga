#!/usr/bin/env python3
"""Az útmutató ellenőrzése: nincs külső hivatkozás, minden helyi fájl megvan, nincs gépspecifikus utalás."""
import os, re, sys
here = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "public", "tanulas")
page = "".join(open(os.path.join(here, f)).read() for f in ("index.html", "gyakorlat.html")) + "".join(open(os.path.join(here, "widgets", f)).read() for f in os.listdir(os.path.join(here, "widgets")))
bad = []
for m in re.finditer(r'(?:href|src)="([^"]+)"', page):
    u = m.group(1)
    if re.match(r"https?:", u): bad.append(f"külső hivatkozás: {u}")
    elif not u.startswith("#") and not os.path.exists(os.path.join(here, u)): bad.append(f"hiányzó fájl: {u}")
for pat in ("/home/", "neoduck", "localhost", "claude-1000"):
    if pat in page: bad.append(f"gépspecifikus utalás: {pat}")
print("\n".join(bad) or "OK – az útmutató önálló és hordozható")
sys.exit(1 if bad else 0)
