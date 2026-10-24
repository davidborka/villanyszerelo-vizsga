# Brief: interaktív szemléltetések és mini feladatok a tanulási segédletbe

## Cél
A villanyszerelő vizsgára (4 0713 04 07, Épületvillamosság) készülő tanuló a tanulási segédletben (`public/tanulas/`) **kattintható szemléltetéseket** és **gyakorlati mini feladatokat** kap: kipróbálja, mi történik, bekötést old meg, számol, és azonnali visszajelzést kap. Cél: biztos átmenő / erős közepes, a gyakorlati vizsgára fókuszálva. Magyar nyelv, szakmailag pontos (a vizsga a hibát nem bocsátja meg – inkább egyszerűbb, mint pontatlan).

## Keret (már kész, NE módosítsd)
- `research/guide/widgets/core.js` – olvasd el. `W.register({ id, title, module, kind: 'demo'|'task', lead, mount(el, api) })`, segédek: `W.h` (DOM), `W.s` és `W.s.root(w,h)` (SVG), `W.shuffle`, `W.fmt` (magyar számformátum). `api.done(ok, msg)` a feladat ellenőrzésekor (siker mentődik), `api.note(msg, 'good'|'bad'|'')` szabad visszajelzés, a „↺ Újra” gomb újra meghívja a `mount`-ot (ezért minden véletlen változatot a mount-ban sorsolj).
- `research/guide/widgets/core.css` – kész osztályok: `.wrow`, `.wgrid`, `.wlist` (li.ok / li.no), `.wsvg`, `.hot` (kattintható SVG elem), `.wmeter` (műszerkijelző), `.wsmall`, `button.primary`, `button.on`. Színek CSS-változókból: `var(--fg)`, `--bg`, `--card`, `--line`, `--acc`, `--good`, `--bad`, `--muted` – SVG-ben is ezeket használd (stroke="var(--fg)"), hogy világos és sötét módban is jó legyen. Érszíneknél valós színek: barna #8b4513, fekete #222, szürke #888, kék #1f6fd1, zöld-sárga (zöld #2e9d3a + sárga csík, pl. stroke-dasharray két réteggel).
- Saját, kiegészítő CSS-t a JS-ből injektálhatsz egyszer (`<style>` a head-be, egyedi prefixszel), de minimálisan.
- A `research/guide/build.py` a widgeteket a modulokba teszi (WIDGETS szótár) és a `public/tanulas/gyakorlat.html` oldalra (mind, modulonként). Futtatás: `python3 research/guide/build.py && python3 research/guide/check.py`.

## Kimenet
Egyetlen fájl (a kiosztásban megadott), benne a kiosztott widgetek `W.register(...)` hívásokkal, **pontosan a megadott id-kkel és module kulcsokkal**. Más fájlt ne módosíts (a build.py-t sem; ha valami a keretben hiányzik, írd a jelentésbe).

## Minőségi követelmények
- Vanilla JS, külső könyvtár és külső URL nélkül (a check.py elbukik külső hivatkozáson). Nincs `alert/confirm/prompt`.
- Telefonon is használható (360 px széles): SVG `viewBox`-szal, kattintás (nem drag & drop – sorrendezéshez ↑/↓ gombok), min. 32 px érintési célok.
- Minden feladat: világos utasítás (`lead`), ellenőrzés gomb, konkrét visszajelzés **miért** rossz (pl. „A kapcsoló a nullát bontja – a fázist kell”), siker esetén rövid megerősítő magyarázat. Ahol lehet, véletlenített változatok (Újra = új feladat).
- Szemléltetés (demo): élő ábra, ami állapotváltásra reagál (pl. a feszültség alatti vezetékek kiemelve / animált áram, lámpa világít), mellette 1–2 mondatos magyarázat, ami az állapottal változik.
- Szakmai tények: MSZ HD 60364 (4-41, 5-52, 6, 7-701), MSZ 1585, MSZ EN 60445 (érszínek), MSZ EN 60898-1, MSZ EN 61008. Számolásokat python3-mal ellenőrizd. Bizonytalan tényt hagyj ki.
- Ne hivatkozz a gépre, felhasználóra, magán anyagra.

## Tesztelés (kötelező)
1. `python3 research/guide/build.py && python3 research/guide/check.py`
2. Szerver: `python3 -m http.server <port> -d public/tanulas` (háttérben, egyedi port: a kiosztásban), böngésző: `chrome-devtools-axi open http://localhost:<port>/gyakorlat.html`, `chrome-devtools-axi snapshot`, `click`, `screenshot` (nézd meg a képet!), konzolhibák: `chrome-devtools-axi --help` szerint. Minden widgetet próbálj ki: helyes és hibás megoldással is, Újra gombbal, és nézz meg képernyőképet sötét és keskeny nézetben is, ha lehet.
3. A végén állítsd le a szervert.

Jelentés: widgetenként 1 sor (mit tud), mit teszteltél, ismert korlátok, bizonytalan tények.
