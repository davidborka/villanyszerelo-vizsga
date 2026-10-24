# 12. modul – Vezetékméretezés és túláramvédelem

A vezetéket és a védelmét mindig **együtt** választjuk: a kismegszakító nem a fogyasztót, hanem **a vezetéket** védi túlterhelés és zárlat ellen.

## Az alapfeltétel: Ib ≤ In ≤ Iz
| Jel | Jelentés |
|---|---|
| **Ib** | az áramkör tervezett üzemi árama (amit a fogyasztók felvesznek) |
| **In** | a védelem (kismegszakító, biztosító) névleges árama |
| **Iz** | a vezeték tartósan megengedett árama (terhelhetősége) az adott szerelési módban |

- **In ≥ Ib**, különben a védelem üzem közben is lekapcsol.
- **In ≤ Iz**, különben a vezeték túlmelegedhet, mielőtt a védelem működik.
- Második feltétel szavakkal: **a védelem biztos működését okozó áram (I2) legfeljebb a vezeték terhelhetőségének 1,45-szöröse lehet** (I2 ≤ 1,45 · Iz). Kismegszakítónál az I2 a névleges áram 1,45-szöröse, így ha In ≤ Iz teljesül, ez is teljesül. Olvadóbiztosítónál az I2 nagyobb arány, ott külön figyelni kell rá.

**Példa:** 3 kW-os mosogatógép, 230 V: Ib = 3000 / 230 = **13,04 A**. 2,5 mm² Cu, Iz = 24 A (lenti táblázat) → **B16**: 13,04 ≤ 16 ≤ 24 ✔. Ha a meleg környezet miatt 0,87-es csökkentő tényező kell: Iz = 24 · 0,87 = 20,88 A ≥ 16 ✔.

## Terhelhetőség – tájékoztató táblázat
> **Tájékoztató értékek, egyetlen szerelési módra** (rézvezető, PVC szigetelés, védőcsőben falon, 2 terhelt ér, 30 °C környezet, egy áramkör). Nem a hivatalos szabványtáblázat: valós tervezésnél az MSZ HD 60364-5-52 adott szerelési módra vonatkozó táblázata és a csökkentő tényezők (hőmérséklet, csoportosítás) az irányadók.

| Keresztmetszet (mm² Cu) | 1,5 | 2,5 | 4 | 6 | 10 | 16 |
|---|---|---|---|---|---|---|
| Iz kb. (A) | 17,5 | 24 | 32 | 41 | 57 | 76 |
| Példa védelem (In ≤ Iz) | B10 vagy B16 | B16 vagy B20 | B25 vagy B32 | B32 vagy B40 | B40 vagy B50 | B63 |

- Lakásban a szokásos párosítás: **világítás 1,5 mm² – B10**, **dugaljkör 2,5 mm² – B16**.
- Több egymás melletti áramkör, szigetelt fal, meleg padlás → kisebb Iz (csökkentő tényezők szorzódnak).

## Kismegszakító-karakterisztikák
| Jel | Mágneses (azonnali) kioldás | Hol használjuk |
|---|---|---|
| **B** | 3–5 · In | lakás, iroda: világítás, dugaljak, hosszú vezetékek (kis zárlati áram) |
| **C** | 5–10 · In | motorok, transzformátoros, sok LED-tápos vagy fénycsöves világítás – nagyobb bekapcsolási áram |
| **D** | 10–20 · In | nagy indítási áramú gépek: nagy transzformátor, motor, hegesztőgép |

- A túlterhelés-védelem (hőkioldó) mindháromnál ugyanúgy működik; a különbség a **zárlati (mágneses) kioldás** küszöbe.
- Az érintésvédelemhez a karakterisztika felső határával számolunk: **Zs ≤ U0 / Ia**, ahol B-nél Ia = 5 · In, C-nél 10 · In (B16: 80 A → 2,88 Ω).

## Olvadóbiztosító
- **gG:** általános célú, teljes tartományú – túlterhelés és zárlat ellen is véd; vezetékvédelemre ezt használjuk.
- **aM:** részleges tartományú, csak **zárlatvédelem**; motorágakban, ahol a túlterhelés ellen külön hőrelé (motorvédő) véd.
- Kiolvadt betétet csak azonos névleges áramú és jelleggörbéjű betétre szabad cserélni; „patkolni” (átkötni) tilos.

## Szelektivitás
- Hiba esetén **csak a hibához legközelebbi védelem** kapcsoljon le, a felette lévő maradjon bekapcsolva.
- Ehhez a táp felé haladva a védelmek névleges árama **lépcsőzetesen nő** (pl. lakás főelosztó B16 → mérőhely előtti B32 → csatlakozási pont biztosítója).
- A tényleges szelektivitást a gyártói táblázatok igazolják; a lépcsőzés csak a kiindulás.

## Feszültségesés
- **Egyfázisban:** **ΔU = 2 · I · l · ρ / A** (a 2-es szorzó: L és N is hordozza az áramot).
- **Háromfázisban, szimmetrikus terhelésnél:** **ΔU = √3 · I · l · ρ · cos φ / A** – ez a vonali feszültség esése. *Feltételezés:* a terhelés szimmetrikus (a nullán nem folyik áram), és a vezeték reaktanciáját elhanyagoljuk (kis keresztmetszeteknél ez jó közelítés).
- Százalékban: ε = ΔU / U · 100 (egyfázisban 230 V-hoz, háromfázisban 400 V-hoz).
- Iránymutatás: a szabvány tájékoztató melléklete közcélú hálózatról táplált berendezésre világításnál kb. **3%**-ot, egyéb fogyasztónál kb. **5%**-ot ajánl; a feladat vagy a terv által megadott érték az irányadó.

**Példa (1f):** I = 16 A, l = 25 m, 2,5 mm² Cu: ΔU = 2 · 16 · 25 · 0,0178 / 2,5 = **5,70 V** → 5,70 / 230 = **2,48%**.

**Példa (3f):** I = 32 A, l = 40 m, 6 mm² Cu, cos φ = 0,85: ΔU = 1,732 · 32 · 40 · 0,0178 · 0,85 / 6 = **5,59 V** → 5,59 / 400 = **1,40%**.

## Keresztmetszet-választás lépései
1. **Üzemi áram:** Ib = P / U (1f) vagy P / (√3 · U · cos φ) (3f).
2. **Védelem:** a legkisebb szabványos In ≥ Ib (pl. 6, 10, 13, 16, 20, 25, 32, 40, 50, 63 A).
3. **Terhelhetőség:** olyan keresztmetszet, amelynél a csökkentő tényezőkkel számolt Iz ≥ In.
4. **Feszültségesés:** a megengedett ΔU-ból visszaszámolva A ≥ 2 · I · l · ρ / ΔU (1f); ha nagyobb jön ki, a nagyobb keresztmetszet kell.
5. **Érintésvédelem:** a hurokimpedancia (Zs) a választott védelemhez megfelelő-e.
6. A legnagyobb kiadódó keresztmetszet a döntő, mindig a következő **szabványos** méretre kerekítve felfelé.

**Példa:** 1f, I = 25 A, l = 30 m, megengedett esés 3% (6,9 V): A ≥ 2 · 25 · 30 · 0,0178 / 6,9 = **3,87 mm²** → **4 mm²** (Iz ≈ 32 A ≥ 25 A, B25 ✔).

## Védővezető (PE) keresztmetszete – alapszabály (azonos anyagú vezetőknél)
| Fázisvezető S | PE |
|---|---|
| S ≤ 16 mm² | **PE = S** |
| 16 < S ≤ 35 mm² | **PE = 16 mm²** |
| S > 35 mm² | **PE = S / 2** |

- Példák: S = 10 → PE 10 mm²; S = 25 → PE 16 mm²; S = 70 → PE 35 mm².
- Ha a PE nem része a kábelnek (külön vezetett ér): legalább 2,5 mm² Cu mechanikai védelemmel, 4 mm² Cu anélkül.

## Tipikus hibák
- A kismegszakítót a fogyasztóhoz méretezed, nem a vezetékhez (pl. C32 egy 2,5 mm²-es dugaljkörre).
- Feszültségesésnél a 2-es szorzó kimarad (1f), vagy háromfázisban 2-vel szorzol √3 helyett.
- Kiszámolt 3,1 mm² után 2,5 mm²-t választasz – **mindig felfelé** kerekíts.
- C karakterisztika ott, ahol a hurokimpedancia csak B-hez lenne elég.
- aM betét túlterhelés-védelem nélkül.

## Tipikus kérdések
- Mit jelent az Ib ≤ In ≤ Iz feltétel? (üzemi áram ≤ védelem ≤ vezeték terhelhetősége)
- Hányszoros áramnál old ki biztosan azonnal egy C kismegszakító? (10 · In)
- Mekkora PE kell egy 25 mm²-es fázisvezető mellé? (16 mm²)
- Mire való az aM biztosító? (motorág zárlatvédelme)
