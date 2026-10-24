# Kimi K3.1 Pro: review és csiszolás – interaktív szemléltetések

Te egy senior UI/UX és frontend mérnök vagy. A feladat: a villanyszerelő vizsgára készülő tanulási segédlet 23 interaktív elemének **átnézése és javítása**, hogy **használható és szép** legyen (telefonon és asztali gépen, világos és sötét módban). Dolgozz önállóan, ne kérdezz.

## Fájlok (csak ezeket módosíthatod)
- `research/guide/widgets/core.js` – keret (W.register, W.h, W.s, api.done/note). Az API-t ne törd el.
- `research/guide/widgets/core.css` – közös stílus.
- `research/guide/widgets/a-aramkorok.js` – 9 widget (kapcsolások, ÁVK, hibaáram, motor, mérőhely, fürdőszoba).
- `research/guide/widgets/b-feladatok.js` – 14 widget (pontkalkulátor, sorrendek, méretezés, számolás, hibakeresés, rajzjelek).
- A stílusváltozók a `research/guide/build.py` TEMPLATE-jéből jönnek (`--bg --fg --card --line --acc --good --bad --muted`); a build.py-t ne módosítsd.

## Mit nézz és javíts
1. **Vizuális minőség:** egységes tipográfia, térközök, gombstílus, kártya; SVG-ábrák arányai, vonalvastagság, címkék olvashatósága (360 px szélességen is legalább ~11 px), színek kontrasztja sötét módban; érszínek valósághűek. Az ábrák legyenek „szépek”: tiszta, műszaki rajz jellegű, nem zsúfolt.
2. **Használhatóság:** egyértelmű, mit kell csinálni; kattintható elemek láthatóan kattinthatók (hover/fókusz, kurzor); érintési célok ≥ 36 px; billentyűzettel is elérhető gombok; visszajelzés a gomb közelében; nincs vízszintes görgetés 360 px-en (ismert: az `erszin` widget kilóg 360 px-en – javítsd).
3. **Konzisztencia:** a 23 widget egységes szerkezetű legyen (utasítás → interakció → „Ellenőrzés” gomb → visszajelzés); azonos elnevezések (Ellenőrzés, Újra, Megoldás mutatása, ha van).
4. **Hibák:** JS-hibák, rossz állapotkezelés, „Újra” után ottmaradó állapot, kétszer regisztrált eseménykezelők.
5. **Szakmai tartalmat ne változtass** (számok, szabályok, magyarázatok tényei) – csak megjelenést, szöveg érthetőségét és hibákat. Ha szakmai hibát látsz, ne javítsd, hanem írd a jelentésbe.

## Szabályok
- Vanilla JS/CSS, külső könyvtár és külső URL nélkül. Nincs alert/confirm/prompt.
- Ellenőrzés minden módosítás után: `python3 research/guide/build.py && python3 research/guide/check.py` és `node --check` a JS fájlokra.
- Ha tudsz böngészőt használni: `python3 -m http.server 8820 -d public/tanulas` és nézd meg a `gyakorlat.html` oldalt (a végén állítsd le).
- Ne commitolj, ne pusholj.

## Jelentés a végén (magyarul)
Widgetenként 1 sor: mit javítottál. Külön lista: talált szakmai kételyek (nem javítva), és amit nem sikerült megoldani.
