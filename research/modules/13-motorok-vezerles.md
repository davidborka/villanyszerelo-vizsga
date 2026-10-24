# 13. modul – Motorok és motorvezérlés

Az épületvillamosságban a háromfázisú **aszinkronmotor** (kalickás forgórészű) a leggyakoribb: szivattyú, ventilátor, kompresszor, kapu. A vizsgán az adattábla olvasása, a motoráram számítása és a vezérlő áramkör (öntartás, irányváltás, csillag–delta) a tipikus feladat.

## Működés dióhéjban
- Az állórész három tekercse a háromfázisú árammal **forgó mágneses mezőt** hoz létre.
- A forgórész ezt a mezőt kicsit **lemaradva** követi – innen az „aszinkron” név. Ha pontosan együtt forogna, nem indukálódna benne áram, és nem lenne nyomaték.

## Szinkron fordulatszám és szlip
- **n0 = 60 · f / p** (f = 50 Hz, p = póluspárok száma), 1/min-ben.

| p (póluspár) | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| n0 (1/min) | 3000 | 1500 | 1000 | 750 |

- **Szlip:** **s = (n0 − n) / n0** (gyakran %-ban). Üzemi értéke kis motoroknál néhány százalék.
- Példa: adattáblán n = 1440 1/min → a közeli szinkron érték 1500 (p = 2) → s = (1500 − 1440) / 1500 = **0,04 = 4%**.
- Az adattábla fordulatszámából mindig a **közvetlenül felette lévő** szinkron értéket válaszd.

## Az adattábla
| Adat | Jelentés |
|---|---|
| **P2** (pl. 5,5 kW) | a tengelyen **leadott** mechanikai teljesítmény – nem a felvett! |
| **η** | hatásfok: P2 / P1 |
| **cos φ** | teljesítménytényező névleges terhelésen |
| **In** | névleges áram (Δ/Y-nál két érték, pl. 11 / 6,4 A) |
| **Δ/Y 400/690 V** | deltában 400 V-ra, csillagban 690 V-ra köthető → nálunk (3 × 400 V) **deltában** üzemel |
| **Δ/Y 230/400 V** | 3 × 400 V-os hálózaton **csillagban** üzemel (csillag–delta indítás nem lehetséges) |

- **Felvett villamos teljesítmény:** P1 = P2 / η. Példa: 5,5 kW, η = 0,87 → P1 = **6322 W**.
- **Motoráram:** **I = P2 / (√3 · U · cos φ · η)**.
  - Példa: 5,5 kW, 400 V, cos φ = 0,83, η = 0,87 → I = 5500 / (1,732 · 400 · 0,83 · 0,87) = **11,0 A**.

## Mágneskapcsoló és jelölései
- **Tekercs:** A1–A2. **Főérintkezők:** 1-2, 3-4, 5-6 (L1-T1 … a motor felé).
- **Segédérintkezők:** **NO (záró) 13-14**, **NC (bontó) 21-22** (az első számjegy sorszám, a második a funkció: 3-4 záró, 1-2 bontó).
- **Nyomógombok:** START záró (NO), STOP bontó (NC).
- **Hőrelé (motorvédő) F2:** a főáramkörben érzékeli a túlterhelést; vezérlő bontó érintkezője **95-96 (NC)**, jelző záró 97-98.

## (a) Egyszerű öntartás – vezérlő áramkör
1. L (vezérlő kismegszakító után) → **F2 hőrelé 95-96 (NC)** sorosan.
2. → **S0 STOP (NC)** sorosan.
3. → **S1 START (NO)** és vele **párhuzamosan K1 segédzáró 13-14** (ez az öntartás).
4. → **K1 tekercs A1-A2** → N.

Működés: START-ra K1 meghúz, a 13-14 záródik és „áthidalja” a START-ot, így a gomb elengedése után is behúzva marad. STOP vagy hőrelé-kioldás megszakítja a tekercs áramát, az öntartás megszűnik. Áramkimaradás után **nem indul újra magától** (ez biztonsági előny).

Főáramkör: L1-L2-L3 → motorvédő/kismegszakító (Q1) → K1 főérintkezők → F2 hőrelé → motor U-V-W; PE a motortestre.

## (b) Forgásirányváltás reteszeléssel
- **Irányváltás:** a három fázisból **kettőt felcserélünk** (pl. K1: L1→U, L2→V, L3→W; K2: L1→W, L2→V, L3→U).
- Ha K1 és K2 egyszerre húzna be, **két fázis között zárlat** lenne → reteszelés kell.

Vezérlő áramkör:
1. L → **F2 (NC)** → **S0 STOP (NC)** – ez a közös rész.
2. **Jobbra ág:** S1 (NO) ∥ K1 13-14 → **K2 bontó 21-22** sorosan → **K1 tekercs** → N.
3. **Balra ág:** S2 (NO) ∥ K2 13-14 → **K1 bontó 21-22** sorosan → **K2 tekercs** → N.
- **Villamos reteszelés:** a másik kapcsoló NC segédérintkezője az ág tekercse előtt – amíg az egyik behúzva van, a másik nem kaphat feszültséget.
- **Mechanikus reteszelés:** a két mágneskapcsoló közé szerelt retesz fizikailag akadályozza az egyidejű behúzást. A kettőt **együtt** szokás alkalmazni.
- Kiegészítés (nyomógomb-reteszelés): a gombok bontó érintkezője a másik ágban – ilyenkor STOP nélkül is át lehet váltani; a vizsgán az alapváltozat (STOP-on keresztül) a biztos.

## (c) Csillag–delta indítás
**Miért?** Közvetlen indításkor az indítóáram a névleges sokszorosa (gyakran 5–8 ×). Csillagban egy tekercs 400 / √3 = 230 V-ot kap a 400 V helyett:
- csillag: I_vonal = (U/√3) / Z; delta: I_vonal = √3 · U / Z → hányados **1/3**.
- Az **indítóáram és az indítónyomaték is 1/3-ára** csökken → csak kis terheléssel induló gépnél jó (ventilátor, szivattyú).
- Feltétel: a motor **deltában** legyen névleges a hálózati feszültségre (400/690 V Δ/Y), és mind a 6 tekercsvég (U1-V1-W1, U2-V2-W2) ki legyen vezetve.
- Példa: In = 11 A, indítóáram-arány 6 → közvetlen (delta) indítás 66 A, csillagban **22 A**.

Főáramkör: **K1 (fő)** a hálózatot U1-V1-W1-re kapcsolja; **K2 (csillag)** az U2-V2-W2 végeket köti össze (csillagpont); **K3 (delta)** U1–W2, V1–U2, W1–V2 összekötéseket hozza létre.

Vezérlő áramkör (egyik szokásos változat):
1. L → **F2 (NC)** → **S0 STOP (NC)** → **S1 START (NO) ∥ K1 13-14** → **K1 tekercs**; ugyanerről a pontról **párhuzamosan az időrelé (KT) tekercse**.
2. **Csillag ág:** a közös pontról → **KT késleltetve bontó (NC)** → **K3 bontó 21-22** → **K2 tekercs**.
3. **Delta ág:** a közös pontról → **KT késleltetve záró (NO)** → **K2 bontó 21-22** → **K3 tekercs**.

Menet: START → K1 + K2 (csillag) + KT behúz → a motor csillagban felgyorsul → a beállított idő (néhány s) után KT bont: K2 elenged, majd záró érintkezője K3-at (delta) behúzza. K2 és K3 kölcsönösen reteszelt – **egyszerre soha nem lehetnek behúzva** (zárlat).

## Lágyindító és frekvenciaváltó
- **Lágyindító:** félvezetőkkel fokozatosan emeli a motor feszültségét, így simán és kisebb árammal indít.
- **Frekvenciaváltó:** a frekvencia és a feszültség változtatásával **fordulatszámot is szabályoz**; bekötésénél a gyártói utasítás (árnyékolt motorkábel, megfelelő ÁVK-típus) kötelező.

## Tipikus hibák
- A P2 (leadott) teljesítményt felvettnek veszed, és kimarad az η az áramképletből.
- Az öntartó érintkező a STOP-pal párhuzamosan (így nem lehet leállítani) vagy a START-tal sorosan.
- STOP gomb záró, START bontó érintkezővel.
- Irányváltásnál mindhárom fázist felcseréled (az irány nem változik) vagy elmarad a reteszelés.
- 230/400 V Δ/Y motor csillag–delta indítása 400 V-os hálózaton → deltában 400 V jut a 230 V-os tekercsre.

## Tipikus kérdések
- Mekkora egy 4 pólusú (p = 2) motor szinkron fordulatszáma 50 Hz-en? (1500 1/min)
- Hogyan változtatod meg a háromfázisú motor forgásirányát? (két fázis cseréje)
- Hányad részére csökken az indítóáram csillag–delta indításnál? (1/3)
- Melyik érintkező adja az öntartást, és hogyan kötjük? (K1 segédzáró, a START-tal párhuzamosan)
