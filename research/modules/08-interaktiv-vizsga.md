# 8. modul – Az interaktív vizsga: számítások és anyagismeret

**90 perc, előre megadott válaszlehetőségek.** Témakörök: anyag- és alkatrészismeret 20% · technológia 20% · számítás 20% · villamos biztonság 40%.

## A számítások, amelyeket biztosan tudnod kell
| Mit | Képlet | Példa |
|---|---|---|
| Teljesítmény egyfázisban | P = U · I · cos φ | 230 V · 10 A · 1 = 2,3 kW |
| Áram teljesítményből | I = P / (U · cos φ) | 2200 W / 230 V = 9,57 A |
| Háromfázisú teljesítmény | P = √3 · U · I · cos φ | 1,732 · 400 · 16 · 0,85 = 9,42 kW |
| Vezeték ellenállása | R = ρ · l / A (ρCu = 0,0178 Ω·mm²/m) | 40 m, 1,5 mm² → 0,475 Ω |
| Feszültségesés egyfázisban | ΔU = 2 · I · l · ρ / A (oda-vissza út!) | 16 A, 25 m, 2,5 mm² → 5,7 V = 2,48% |
| Energia, költség | W = P · t; költség = W · egységár | 2 kW · 3 h · 30 nap = 180 kWh |
| Hurokimpedancia-határ | Zs ≤ U0 / Ia; B: Ia = 5·In, C: Ia = 10·In | B16 → 2,88 Ω; C16 → 1,44 Ω |

Tipikus csapdák: a 2-es szorzó kimarad a feszültségesésnél; √3 kimarad háromfázisban; 400 V-tal számolnak 230 V helyett; W és kW, Ω és mΩ keverése.

## Kábel- és vezetékjelölések
- **H07V-U:** harmonizált, 450/750 V, PVC szigetelés, tömör réz (U), egyerű – csatornába, csőbe.
- **H07V-K:** ugyanez hajlékony (K) erekkel.
- **NYM-J:** falon kívül és vakolatban, PVC köpeny, -J = van zöld-sárga ér.
- **NYY:** földbe fektethető, PVC szigetelés és köpeny. **NAYY:** ugyanez alumínium vezetővel.
- **H05VV-F:** hajlékony csatlakozóvezeték készülékekhez.

## IP-védettség
- Első szám: szilárd testek (5 = porvédett, 6 = pormentes). Második szám: víz (4 = fröccsenő víz, 5 = vízsugár, 7 = rövid ideig víz alá merítés).
- Fürdőszoba 1. és 2. zóna: legalább **IPX4** (vízsugaras tisztításnál IPX5).

## Villám- és túlfeszültség-védelem
- SPD-fokozatok a betáptól a készülék felé: **villámáram-levezető (T1, 10/350 µs)** a betáplálásnál → **túlfeszültség-levezető (T2, 8/20 µs)** az elosztókban → **finomvédelem (T3)** a készülék közelében.

## Fotovoltaikus rendszer (biztonság)
- DC oldalon nappal mindig feszültség van – a panelek nem kapcsolhatók ki fénynél.
- Inverter AC oldalán a gyártó előírása szerinti ÁVK (B típus, ha az inverter nem zárja ki a DC hibaáramot).

## Motorindítás (rajzkiegészítés)
- **Csillag-delta indítás:** K1 (fő) és KY behúz → a motor csillagban felgyorsul → időrelé lejár → KY elenged → KΔ behúz; KY és KΔ **reteszelt** (egyszerre soha).
- **Forgásirányváltás:** két mágneskapcsoló két fázis felcserélésével, **kölcsönös reteszeléssel**.
