# Villanyszerelő vizsga-szimulátor (Épületvillamosság)

Böngészős 3D gyakorló a **4 0713 04 07 Villanyszerelő** projektfeladatához, egy valós 2026-os mintafeladat („nyári konyha”) alapján. A kutatás összefoglalója: [docs/KUTATAS.md](docs/KUTATAS.md).

## Futtatás

```bash
git submodule update --init   # a beépített Hot Seat (portfólióvédés) – első alkalommal
bun install
bun run dev      # szimulátor (Vite) + Hot Seat egyszerre; a szimulátor címe a konzolon
bun test         # hálózatmodell, feladatok, pontozás, interaktív vizsga
bun run build
```

`bun run dev:web` csak a szimulátort, `bun run hotseat` csak a Hot Seat-et indítja (alapból http://localhost:4740, `HOTSEAT_PORT`-tal állítható).

### Portfólióvédés (Hot Seat, `hotseat/` submodule)

A kezdőképernyő **Portfólióvédés** kártyája a Hot Seat-et a szimulátoron belül, beágyazva nyitja meg, a „Villanyszerelő portfólióvédés” zsűrivel (vizsgabizottság elnöke, gyakorlati szakértő, villamos biztonsági szakértő + Coach). A védés végén az **Eredmény a vizsga-szimulátorba** gomb a zsűri mediánját (/10 → %) visszaküldi; ez lesz a vizsga-előrejelzésben a portfólió (a projekt 20%-a). A zsűri AI-modelleket hív (claude / codex / copilot CLI) a Hot Seat beállításai szerint.

A submodule most a helyi `unshy` repó `villanyszerelo-portfolio` ágára mutat. Ha az ág fel van töltve GitHubra, az URL átállítható: `git submodule set-url hotseat git@github.com:davidborka/unshy.git`.

## Feladatok és módok

A kezdőképernyőn választasz feladatot és módot:

| # | Feladat | Mit gyakorol |
|---|---|---|
| 1 | Nyári konyha (valós 2026-os vizsgaközponti minta) | 101 + mozgásérzékelős lámpa, váltó–kereszt–váltó, 2P+F dugalj |
| 2 | Társasház lépcsőháza | lépcsőházi automata, 3 nyomógomb (négyvezetékes bekötés) |
| 3 | Folyosó impulzusrelével | impulzusrelé (A1–A2 tekercs, 11–14 érintkező), 3 nyomógomb |
| 4 | Nappali | csillárkapcsoló (105) két lámpakörrel, 2 dugalj |

- **Vizsga mód:** nincs tipp, nincs azonnali „jó/rossz”. Szabad sorrend, bármelyik szakaszra visszaléphetsz. Hibázni lehet: rossz szerszámmal is elvégzed a műveletet (rosszabb minőségben), túl hosszú csatornát is fel lehet erőltetni, feszültség alatt is lehet szerelni (áramütés, érvénytelen vizsga), bekapcsolás előtti mérések nélkül is bekapcsolhatsz. Minden a **Beadás** után derül ki.
- **Gyakorló mód:** tippek, azonnali visszajelzés, ellenőrizhető rajzfeladatok, „mi kell” az anyagvételezésnél.

## Gyakorlóterem és tanulási segédlet

- **Gyakorlóterem** (a szimulátor kezdőképernyőjéről): végtelen számolás 15 feladattípusban lépésenkénti megoldással; áramútrajz-feladatok minden alapkapcsolásra (ugyanaz a hálózatmodell ellenőrzi, mint a 3D szerelést); motorvezérlés-rajzkiegészítés (öntartás, forgásirányváltás reteszeléssel, csillag–delta); installációs és kapcsolási rajzjelek; portfólióvédés-gyakorló LLM nélkül (10 perces időzítő, bizottsági kérdések, opcionális hangfelvétel csak a böngészőben, önértékelés).
- **Tanulási segédlet** (`/tanulas/`): 15 modul a vizsga minden részére, kétnapos terv, modulonként NotebookLM-hanglecke és infografika, kereshető elvek, fogalomtár; **számolási feladatgyűjtemény** (33 feladat, rejtett lépésenkénti megoldással); **NotebookLM-oldal** (útmutató, kvíz, tanulókártyák, gondolattérkép). Forrás: `research/modules/*.md`, építés: `python3 research/guide/build.py`.

## Szakaszok

1. **Feladatlap** – a feladat és az egyvonalas rajz.
2. **Anyag + szerszám** – készülékek, vezetékek és szerszámok vételezése. Ami kimaradt, a szerszámosládából pótolható (levonással).
3. **Rajzolvasás** – rajzjelek (MSZ EN 60617), érszámok (ahol a rajz megadja), áramútrajz összekötése; ugyanaz a hálózatmodell ellenőrzi, mint a 3D szerelést.
4. **Kábelcsatorna** – mérőszalag a 3D lapon, vágás 90°/45°-ban, sorjázás, felszerelés/leszerelés, vízmérték.
5. **Készülékek** – DIN-sín (ÁVK, kismegszakítók, SPD, lépcsőházi automata, impulzusrelé), szerelvények.
6. **Vezetékezés** – kapocsról kapocsra, színnel, keresztmetszettel, csupaszolási hosszal.
7. **Ellenőrzés, mérés** – 5 szabály, feszültségmentesség, szigetelés + PE-folytonosság, bekapcsolás, funkciópróba (kapcsolók, nyomógombok, mozgásérzékelő, ÁVK-próbagomb), árammérés lakatfogóval, feszültségmérés, jegyzőkönyv.
8. **Értékelés** – 100 pont a KKK II. vizsgarészének súlyai szerint; áramütés elleni védelem hibája = ÉRVÉNYTELEN.

A bekötést egy valódi hálózati modell ellenőrzi (`src/sim/circuit.ts`): minden kapcsoló-, nyomógomb- és relé-állapotra kiszámolja a csomópontokat, felismeri a zárlatot, az ÁVK megkerülését, a hiányzó PE-t, a nullában lévő kapcsolót, a rossz színt vagy keresztmetszetet, és szimulálja a kioldásokat, az impulzusrelé váltását és a lépcsőházi automata időzítését.

## Felépítés

```
src/sim/layout.ts    szerelőlap geometria (m), buildLayout(): csatornadarabok + vezetékútvonal-gráf a feladatból
src/sim/tasks.ts     a 4 vizsgafeladat adatai és működés-ellenőrzése
src/sim/score.ts     pontozás (tiszta függvény az állapotból), áramútrajz-ellenőrzés
src/sim/catalog.ts   szerszámok, készülékek (kapcsok, belső érintkezők), vezetékek
src/sim/circuit.ts   union-find hálózatmodell, simulate/settle (kioldások), inspect (szerelői ellenőrzés)
src/sim/store.ts     zustand játékállapot, vizsga/gyakorló mód, szerszámhasználat, hibák rögzítése
src/scene/Scene.tsx  React Three Fiber jelenet (procedurális modellek)
src/ui/              szakaszpanelek, rajzok (SVG), értékelés
scripts/gen-assets.ts  fal.ai Hunyuan3D v3.1 Pro → GLB → gltf-transform optimalizálás
```

## 3D assetek

**Méretpontos elemek** (csatorna, dobozok, DIN-készülékek, kapcsok) procedurálisan, kódból készülnek – itt a mm számít, ezt AI-modell nem adja meg megbízhatóan.

**Díszlet és szerszámok** AI-val generálhatók:

```bash
export FAL_KEY=...              # https://fal.ai/dashboard/keys
bun scripts/gen-assets.ts       # mind
bun scripts/gen-assets.ts furesz multimeter   # csak ezek
```

A nyers GLB az `assets-src/raw/`, az optimalizált (meshopt, webp, 1024 px) a `public/models/` mappába kerül. Betöltés: `useGLTF('/models/furesz.glb')` (drei). Blenderben utómunka (lépték, origó, poligonszám): `blender --background --python <script>.py`.

**Procedurális modellek finomítása Kimi Code-dal:** jelentkezz be (`kimi`, majd `/login`), aztán

```bash
kimi -m kimi-code/k3.1-pro -p "$(cat docs/KIMI_3D.md)"   # vagy interaktívan: kimi -m kimi-code/k3.1-pro --auto, majd beilleszted
```

A [docs/KIMI_3D.md](docs/KIMI_3D.md) leírja a modellenkénti méreteket és a kötelező feltételeket (a játéklogika és a tesztek érintetlenek maradnak).

Unity nem kell hozzá: ennél a feladatnál (2D/3D kattintásos interakció, sok UI) a React Three Fiber a könnyebb út, és bármilyen böngészőben fut telepítés nélkül.
