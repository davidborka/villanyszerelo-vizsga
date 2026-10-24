# Kimi K3.1 Pro: új interaktív mini feladatok – lépésenkénti számolás és rajzértelmezés

Te egy villamosmérnök-tanár és senior frontend fejlesztő vagy egyben. Feladat: a villanyszerelő vizsgára (4 0713 04 07, Épületvillamosság) készülő tanuló **lépésről lépésre vezetett számolási feladatokat** és **rajzértelmezési feladatokat** kapjon a tanulási segédletben. Cél: a vizsgán a számolási (20%) és a rajzos feladatokat biztosan megoldja – a minimumot biztosan, erős közepest elérve. Dolgozz önállóan, ne kérdezz, a végén jelents.

## Kiindulás – olvasd el először
- `research/guide/widgets/core.js`, `core.css` – a keret: `W.register({ id, title, module, kind: 'demo'|'task', lead, mount(el, api) })`, `W.h`, `W.s`, `W.s.root`, `W.shuffle`, `W.fmt`, `api.done(ok, msg)`, `api.note(msg, cls)`. Az „↺ Újra” a `mount`-ot hívja újra → a véletlen változatot a mount-ban sorsold.
- `research/guide/widgets/a-aramkorok.js`, `b-feladatok.js` – a meglévő 23 widget: kövesd a stílusukat (utasítás → interakció → „Ellenőrzés” → visszajelzés), és **ne ismételd** őket (a b-feladatok `ohm-haromszog`, `feszultsegeses`, `kismegszakito-valasztas`, `pv-string` már megvan – ezekből ne csinálj másolatot).
- Szakmai forrás a repóban: `research/modules/*.md` (főleg 05, 11–17), `research/modules/17-szamolasi-feladatgyujtemeny.md` (ellenőrzött számpéldák és képletek), `src/sim/generated.ts` (képletek, Iz-táblázat, γ = 56 Cu), `src/ui/Drawings.tsx` (az egyvonalas/áramút rajzjelek geometriája – a rajzjeleid ehhez igazodjanak).

## Kimenet
1. Új fájl: `research/guide/widgets/c-szamolas-rajz.js` – benne az alábbi widgetek `W.register`-rel.
2. A `research/guide/build.py` `WIDGETS` szótárában az új id-ket a megadott modulokhoz fűzd hozzá (csak ezt a szótárt módosítsd a build.py-ban).
3. Más meglévő fájlt ne módosíts.

## A. Lépésenkénti számolás (mindegyik `kind: 'task'`, véletlen életszerű adatok)
Közös minta minden számolós widgetnél:
- Fent a **szöveges feladat** életszerű helyzettel (pl. „A kerti tároló 32 m-re van az elosztótól…”) és egy kis **SVG-vázlat** (vezeték, fogyasztó, adatokkal).
- Alatta **lépések**: minden lépésnél a tanuló beírja a részeredményt (mértékegység kiírva), külön „Ellenőrzés” lépésenként, ±2% tűréssel (kerekítés miatt). A következő lépés csak a helyes (vagy feladott) előző után nyílik.
- Lépésenként **„Tipp”** (melyik képlet) és **„Megmutatom”** (a lépés teljes behelyettesítése: képlet → számokkal → eredmény, mértékegységgel), a megmutatott lépés nem számít „sajátnak”.
- A végén összegzés: hány lépést oldott meg segítség nélkül; tipikus hibák felismerése (pl. ha 2× vagy √3 nélkül számol, ha mA/A vagy kW/W keveredik, ha η-val szoroz osztás helyett – mondja meg konkrétan).
- Magyar számformátum (tizedesvessző) beíráskor és kiíráskor is: a bevitel fogadja el a vesszőt és a pontot is.

Widgetek (id → module → tartalom):
1. `lepes-eredo` → m11-alapszamitasok: véletlen vegyes ellenálláshálózat (3–5 ellenállás) SVG-n; a tanuló lépésenként vonja össze (kijelöli a soros vagy párhuzamos párt kattintással, beírja az eredőt, a rajz egyszerűsödik), végül az eredő és az áram adott feszültségen.
2. `lepes-3f-teljesitmeny` → m11: 3f fogyasztó (U = 400 V, I, cosφ) → S, P, Q lépésenként, mellette **méretarányos teljesítményháromszög** SVG, ami a beírt helyes értékekkel rajzolódik ki.
3. `lepes-motor` → m13-motorok-vezerles: adattábla-kép (SVG adattábla: Pn, Un, In?, cosφ, η, n) → felvett teljesítmény, névleges áram, szlip (szinkron fordulatszámból: pólusszám kitalálása), csillag–delta indításnál az indítóáram aránya (1/3).
4. `lepes-hurok` → m12-vezetekmeretezes-vedelem: Zs összetevőkből (trafó + hálózat Zs a mérőhelyig + a fogyasztói vezeték oda-vissza ellenállása ρ·2l/A), majd Ik = U0/Zs, Ia (B/C × In), megfelel-e a 0,4 s; ha nem: mit változtatna (vastagabb vezeték, B karakterisztika, ÁVK) – választós utolsó lépés.
5. `lepes-keresztmetszet` → m12: Ib számolása → In választása → Iz korrekciós tényezőkkel (hőmérséklet, csoportosítás – kis táblázat a feladatban) → keresztmetszet választása → feszültségesés ellenőrzése (≤3% / 5%). A korrekciós tényezőket a feladatban add meg táblázatként (ne a tanulónak kelljen tudnia), és jelöld tájékoztatónak.
6. `lepes-energia` → m11: háztartás 3–4 fogyasztója (W és napi üzemóra), havi kWh és költség (Ft/kWh adott), melyik a legnagyobb tétel, és mennyit spórol egy cserével (pl. LED).
7. `lepes-tt-foldeles` → m03-aramutes-elleni-vedelem: TT rendszer: RA megengedett legnagyobb értéke ÁVK-val (RA·IΔn ≤ 50 V), mért RA alapján megfelel-e, két párhuzamos földelőszonda eredője, érintési feszültség hibánál.
8. `lepes-vilagitas` → m14-kabelek-szereles-kulonleges-helyek (vagy m15, ha jobban illik): helyiség (a × b), előírt átlagos megvilágítás (lx), lámpatest fényárama, karbantartási és hatásfok tényező (megadva) → szükséges fényáram, lámpatestszám (felfelé kerekítés), elrendezés (sor × oszlop) választás.
9. `lepes-trafo` → m15-tulfeszultseg-pv-transzformator: egyfázisú trafó (U1, U2, S) → áttétel, primer/szekunder áram, menetszám arány; kis biztonsági transzformátor (SELV) példával.

## B. Rajzértelmezés (`kind: 'task'`, a rajz a fő elem, nagy és tiszta SVG)
10. `rajz-alaprajz` → m16-dokumentacio-anyagjegyzek-hibakereses: egyszerű helyiség-alaprajz (szoba + előszoba) egyvonalas szerelési rajzzal: lámpahelyek, kapcsolók (101, 105, 106), dugaljak, kötődobozok, vezetékvonalak **érszám-vonalkákkal**. Kérdések kattintással/legördülővel: melyik kapcsoló melyik lámpát kapcsolja; hány ér fut az X–Y szakaszon (és miért); hány db doboz/kapcsoló/dugalj kell (anyagjegyzék); kb. hány méter vezeték (a rajz léptéke megadva). Véletlen változatok (legalább 3 különböző alaprajz-sablon).
11. `rajz-eroszam` → m05-vilagitasvezerlesek: egyvonalas rajz (váltó–váltó, váltó–kereszt–váltó, csillárkapcsoló, impulzusrelé, lépcsőházi automata közül véletlen) – a tanuló minden vezetékszakaszra beírja az érszámot (PE-vel együtt), majd ellenőrzés; hiba esetén a szakaszhoz rajzolt magyarázat (mely erek futnak ott: L, N, PE, korrespondálók, kapcsolt fázis). Ehhez igazodj a `research/modules/05-vilagitasvezerlesek.md` érszámaihoz.
12. `rajz-aramut-hiba` → m05: áramútrajz (többvonalas) egy hibával (pl. a kapcsoló a nullát bontja, a PE hiányzik a lámpatestről, a kereszt rosszul kötve, a lámpa megkerüli a relét, a nyomógomb N-t ad az A1-re) – a tanuló rákattint a hibás vezetékre/elemre, majd kiválasztja a hiba típusát; magyarázat a helyes bekötéssel (a helyes rajz is megjeleníthető).
13. `rajz-eloszto` → m06-eloszto-csatorna: elosztó egyvonalas rajza (főkapcsoló, ÁVK(k), kismegszakítók áramkör-megnevezéssel, keresztmetszettel). Kérdések: melyik áramkörök vannak ÁVK mögött; melyik védelem old ki, ha a fürdőszobai dugaljnál testzárlat / 20 mA szivárgás van; melyik áramkör méretezése hibás (pl. B20 1,5 mm²-en); hány modulhely kell.
14. `rajz-motor` → m13-motorok-vezerles: főáramkör + vezérlő áramkör (forgásirányváltás reteszeléssel vagy öntartás) rajza; kérdések: mi történik, ha …(S1 megnyomva, majd S2; hőrelé kiold; K1 segédbontója hiányzik → mi a veszély); a tanuló a rajzon kattintással mutatja meg a reteszelő érintkezőt / öntartó érintkezőt.
15. `rajz-mero-kapcsolas` → m04-meresek: mérési kapcsolás: a tanuló kattintással helyezi el az ampermérőt (sorosan) és a voltmérőt (párhuzamosan) egy áramkörben, illetve a teljesítménymérő áram- és feszültségtekercsét; hibás elhelyezésnél konkrét magyarázat (pl. ampermérő párhuzamosan = rövidzár).

## Minőség – kötelező
- **Szakmai pontosság**: minden képletet és mintaszámot `python3`-mal ellenőrizz (a véletlen generátorból legalább 20 változatot számolj végig egy rövid python- vagy node-szkripttel, és nézd meg, hogy az eredmények életszerűek: pl. ne jöjjön ki 0,3 mm² vagy 900 A háztartásban). Bizonytalan szabványadatot hagyj ki vagy jelöld „tájékoztató”-nak. Ellentmondás ne legyen a repó moduljaival.
- **Szép és használható**: tiszta, műszaki rajz jellegű SVG (egységes vonalvastagság, rajzjelek a `Drawings.tsx` szerint, érszínek: barna #8b4513, fekete #222, szürke #888, kék #1f6fd1, zöld-sárga), címkék 360 px-en is legalább ~11 px-esek (ha kell, a meglévő `.wdiagram` görgethető tárolót használd), sötét módban is kontrasztos (CSS-változók: `--fg --bg --card --line --acc --good --bad --muted`, a gombszöveg a `--on-acc`).
- Érintési célok ≥ 36 px, billentyűzettel is használható (a meglévő widgetek `.hot` + tabindex + Enter/Space mintáját kövesd), nincs alert/confirm/prompt, nincs külső könyvtár vagy URL.
- Minden feladat végén rövid **„Mit tanultál”** mondat (a vizsgán hogyan jön elő).

## Ellenőrzés
- `node --check research/guide/widgets/c-szamolas-rajz.js && python3 research/guide/build.py && python3 research/guide/check.py`
- Böngésző: `python3 -m http.server 8840 -d public/tanulas`, nyisd meg a `gyakorlat.html`-t (Playwright/Chromium vagy amit találsz), minden új widgetet oldj meg helyesen és hibásan is, nyomd meg az Újra-t többször, nézz képernyőképet 1280 px-en világos és 390 px-en sötét módban, és javíts, amit látsz. Konzolhiba ne legyen. A végén állítsd le a szervert.
- Ne commitolj, ne pusholj.

## Jelentés (magyarul)
Widgetenként 1 sor (mit tud, hány véletlen változat), az ellenőrző számítások (pár minta), mit teszteltél, és a szakmai kételyek listája.
