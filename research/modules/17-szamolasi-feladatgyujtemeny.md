# 17. modul – Számolási feladatgyűjtemény

Vizsgaszerű feladatok típusonként, lépésenkénti megoldással. Anyagállandók: **ρCu = 0,0178 Ω·mm²/m**, **ρAl = 0,0286 Ω·mm²/m**; √3 ≈ 1,732. A képletek magyarázata a 11. és 12. modulban van.

**Munkamódszer minden feladatnál:** 1. írd ki az adatokat egységgel; 2. váltsd át (kW → W, perc → h, s → h); 3. írd fel a képletet; 4. helyettesíts be; 5. kerekíts a végén, és nézd meg, reális-e az eredmény.

## A) Ohm-törvény, teljesítmény, energia

### 1. Vasaló
- **Feladat:** 230 V / 1500 W-os vasaló árama és üzemi ellenállása?
- **Megoldás lépésenként:** I = P / U = 1500 / 230; R = U² / P = 230² / 1500 = 52 900 / 1500.
- **Eredmény:** I = **6,52 A**, R = **35,27 Ω**.
- **Tipikus hiba:** R = U / P – mértékegységben sem jön ki Ω.

### 2. Törpefeszültségű fűtőbetét
- **Feladat:** 24 V-ra kapcsolt 16 Ω-os fűtőbetét árama és teljesítménye?
- **Megoldás lépésenként:** I = U / R = 24 / 16; P = U · I = 24 · 1,5.
- **Eredmény:** I = **1,5 A**, P = **36 W**.
- **Tipikus hiba:** P = U / R-rel számolni (az áram jön ki, nem a teljesítmény).

### 3. Villanybojler havi költsége
- **Feladat:** 2,4 kW-os bojler naponta 2,5 órát fűt, 30 napon át. Energia és költség 75 Ft/kWh áron?
- **Megoldás lépésenként:** W = P · t = 2,4 kW · 2,5 h · 30 = 180 kWh; költség = 180 · 75.
- **Eredmény:** **180 kWh**, **13 500 Ft**.
- **Tipikus hiba:** W-ban hagyott teljesítménnyel számolni (180 000 „kWh”).

### 4. Vegyes kapcsolás
- **Feladat:** R1 = 10 Ω sorosan kapcsolódik az R2 = 30 Ω és R3 = 60 Ω párhuzamos eredőjével. Eredő ellenállás, és az áram 12 V-on?
- **Megoldás lépésenként:** R2 ∥ R3 = 30 · 60 / (30 + 60) = 1800 / 90 = 20 Ω; Re = 10 + 20 = 30 Ω; I = 12 / 30.
- **Eredmény:** Re = **30 Ω**, I = **0,4 A**.
- **Tipikus hiba:** a párhuzamos részt is összeadni (100 Ω).

### 5. Izzó csökkentett feszültségen
- **Feladat:** 230 V / 100 W-os izzó mekkora teljesítményt vesz fel 207 V-on (az ellenállást állandónak véve)?
- **Megoldás lépésenként:** R = 230² / 100 = 529 Ω; P' = 207² / 529 = 42 849 / 529.
- **Eredmény:** **81 W** (10%-kal kisebb feszültség → kb. 19%-kal kisebb teljesítmény, mert P ~ U²).
- **Tipikus hiba:** arányosan 90 W-ot mondani.

## B) Vezeték ellenállása

### 6. Rézvezeték ellenállása
- **Feladat:** 40 m hosszú, 1,5 mm²-es rézér ellenállása; mekkora a hurok (oda-vissza) ellenállása?
- **Megoldás lépésenként:** R = ρ · l / A = 0,0178 · 40 / 1,5; hurok = 2 · R.
- **Eredmény:** R = **0,475 Ω**, hurok = **0,949 Ω**.
- **Tipikus hiba:** a hurokellenállásnál elfelejteni a 2-es szorzót.

### 7. Réz helyett alumínium
- **Feladat:** Mekkora alumínium keresztmetszet ad ugyanakkora ellenállást, mint egy 6 mm²-es rézvezető (azonos hossz)?
- **Megoldás lépésenként:** ρAl / AAl = ρCu / ACu → AAl = 6 · 0,0286 / 0,0178 = 9,64 mm² → következő szabványos méret.
- **Eredmény:** **9,64 mm² → 10 mm² Al**.
- **Tipikus hiba:** fordított arány (6 · 0,0178 / 0,0286 = 3,7 mm²).

### 8. Ismeretlen hossz
- **Feladat:** Egy 2,5 mm²-es rézvezeték-tekercs mért ellenállása 0,356 Ω. Milyen hosszú?
- **Megoldás lépésenként:** l = R · A / ρ = 0,356 · 2,5 / 0,0178.
- **Eredmény:** **50 m**.
- **Tipikus hiba:** A és ρ felcserélése a képletben.

## C) Feszültségesés és keresztmetszet-választás

### 9. Egyfázisú feszültségesés
- **Feladat:** 230 V, I = 10 A, nyomvonalhossz 30 m, 1,5 mm² Cu. Megfelel-e 3%-os határra?
- **Megoldás lépésenként:** ΔU = 2 · 10 · 30 · 0,0178 / 1,5 = 7,12 V; ε = 7,12 / 230 · 100.
- **Eredmény:** **7,12 V = 3,10%** → **nem felel meg** (nagyobb keresztmetszet kell).
- **Tipikus hiba:** 2-es szorzó nélkül 1,55%-ot kapni és „megfelel”-t mondani.

### 10. Egyfázisú keresztmetszet-választás
- **Feladat:** 3,5 kW-os ohmos fogyasztó 230 V-on, 28 m-re. A megengedett esés 2%. Legkisebb szabványos Cu keresztmetszet?
- **Megoldás lépésenként:** I = 3500 / 230 = 15,22 A; ΔUmeg = 0,02 · 230 = 4,6 V; A ≥ 2 · 15,22 · 28 · 0,0178 / 4,6 = 3,30 mm².
- **Eredmény:** **4 mm²**.
- **Tipikus hiba:** 3,30-at 2,5-re kerekíteni.

### 11. Háromfázisú feszültségesés
- **Feladat:** Szimmetrikus 3f terhelés, 400 V, I = 25 A, cos φ = 0,9, l = 50 m, 10 mm² Cu. Feszültségesés (reaktanciát elhanyagolva)?
- **Megoldás lépésenként:** ΔU = √3 · I · l · ρ · cos φ / A = 1,732 · 25 · 50 · 0,0178 · 0,9 / 10; ε = ΔU / 400.
- **Eredmény:** **3,47 V = 0,87%**.
- **Tipikus hiba:** egyfázisú képlettel (2-es szorzóval) számolni.

### 12. Háromfázisú keresztmetszet-választás
- **Feladat:** 3f szimmetrikus, 400 V, I = 40 A, cos φ = 0,85, l = 80 m, megengedett esés 2%. Legkisebb szabványos Cu keresztmetszet?
- **Megoldás lépésenként:** ΔUmeg = 0,02 · 400 = 8 V; A ≥ 1,732 · 40 · 80 · 0,0178 · 0,85 / 8 = 10,48 mm².
- **Eredmény:** **16 mm²** (a 10 mm² kevés).
- **Tipikus hiba:** 10,48-at 10-re kerekíteni.

### 13. Védelem kiválasztása (Ib ≤ In ≤ Iz)
- **Feladat:** 3,2 kW-os sütő 230 V-on, 2,5 mm² Cu (Iz = 24 A, tájékoztató érték), csoportosítás miatt 0,7-es csökkentő tényező. Megfelel-e a B16?
- **Megoldás lépésenként:** Ib = 3200 / 230 = 13,91 A; Iz' = 24 · 0,7 = 16,8 A; 13,91 ≤ 16 ≤ 16,8.
- **Eredmény:** **B16 megfelel.**
- **Tipikus hiba:** a csökkentő tényező elhagyása, vagy B20 választása (20 > 16,8 – nem védi a vezetéket).

## D) Háromfázisú rendszer

### 14. Vonali feszültség
- **Feladat:** Uf = 230 V. Mekkora a vonali feszültség?
- **Megoldás lépésenként:** Uv = √3 · Uf = 1,732 · 230.
- **Eredmény:** **398,4 V ≈ 400 V**.
- **Tipikus hiba:** 2 · 230 = 460 V.

### 15. Delta fázisárama
- **Feladat:** Delta kapcsolású fogyasztó vonali árama 17,3 A. Mekkora egy ág (fázis) árama?
- **Megoldás lépésenként:** If = Iv / √3 = 17,3 / 1,732.
- **Eredmény:** **≈ 10 A**.
- **Tipikus hiba:** szorozni osztás helyett.

### 16. Háromfázisú fűtés árama
- **Feladat:** 3 × 2 kW-os fűtőbetét deltában 400 V-on. Összteljesítmény és vonali áram?
- **Megoldás lépésenként:** P = 3 · 2 = 6 kW; I = P / (√3 · U) = 6000 / (1,732 · 400) (cos φ = 1).
- **Eredmény:** **6 kW**, **8,66 A**.
- **Tipikus hiba:** 6000 / 400 = 15 A (√3 nélkül).

### 17. S, P, Q háromfázisban
- **Feladat:** 400 V, I = 12 A, cos φ = 0,8. S, P, Q?
- **Megoldás lépésenként:** S = √3 · 400 · 12 = 8314 VA; P = S · 0,8 = 6651 W; Q = √(S² − P²) = S · 0,6.
- **Eredmény:** **S = 8314 VA, P = 6651 W, Q = 4988 var**.
- **Tipikus hiba:** Q = S − P (1663) – a háromszög derékszögű, nem egyenes.

## E) Motoráram

### 18. Motor névleges árama
- **Feladat:** P2 = 4 kW, 400 V, cos φ = 0,82, η = 0,86. Névleges áram?
- **Megoldás lépésenként:** I = 4000 / (1,732 · 400 · 0,82 · 0,86).
- **Eredmény:** **8,19 A**.
- **Tipikus hiba:** η kihagyása (7,04 A) – a leadott teljesítmény nem a felvett.

### 19. Felvett teljesítmény, veszteség
- **Feladat:** P2 = 11 kW, η = 0,9. Felvett teljesítmény és veszteség?
- **Megoldás lépésenként:** P1 = P2 / η = 11 / 0,9; veszteség = P1 − P2.
- **Eredmény:** **P1 = 12,22 kW**, veszteség **1,22 kW**.
- **Tipikus hiba:** P1 = P2 · η = 9,9 kW (a felvett nem lehet kisebb a leadottnál).

### 20. Csillag–delta indítóáram
- **Feladat:** In = 15 A, közvetlen indításnál az indítóáram 7 · In. Mekkora az indítóáram csillagban?
- **Megoldás lépésenként:** közvetlen (delta): 7 · 15 = 105 A; csillagban 1/3: 105 / 3.
- **Eredmény:** **35 A**.
- **Tipikus hiba:** 1/√3-mal számolni (60,6 A).

## F) Szinkron fordulatszám és szlip

### 21. Négypólusú motor
- **Feladat:** p = 2, f = 50 Hz, a mért fordulatszám 1455 1/min. Szlip?
- **Megoldás lépésenként:** n0 = 60 · 50 / 2 = 1500; s = (1500 − 1455) / 1500.
- **Eredmény:** **s = 0,03 = 3%**.
- **Tipikus hiba:** a pólusszámmal (4) osztani a póluspár (2) helyett → 750.

### 22. Adattáblából
- **Feladat:** Az adattáblán n = 960 1/min, 50 Hz. Póluspár és szlip?
- **Megoldás lépésenként:** a felette lévő szinkron érték 1000 → p = 60 · 50 / 1000 = 3; s = (1000 − 960) / 1000.
- **Eredmény:** **p = 3, s = 4%**.
- **Tipikus hiba:** a 750-es szinkron értéket választani (negatív szlip jönne ki).

### 23. Kétpólusú motor
- **Feladat:** n = 2950 1/min, 50 Hz. Szlip %-ban?
- **Megoldás lépésenként:** n0 = 3000 (p = 1); s = (3000 − 2950) / 3000 · 100.
- **Eredmény:** **1,67%**.
- **Tipikus hiba:** n0 helyett n-nel osztani (1,69%).

## G) Hurokimpedancia-határ (TN, U0 = 230 V)

### 24. B10 és C10
- **Feladat:** Legnagyobb Zs B10 és C10 kismegszakítóhoz?
- **Megoldás lépésenként:** B: Ia = 5 · 10 = 50 A → 230 / 50; C: Ia = 10 · 10 = 100 A → 230 / 100.
- **Eredmény:** **B10: 4,6 Ω; C10: 2,3 Ω**.
- **Tipikus hiba:** In-nel osztani (23 Ω).

### 25. Mért érték értékelése
- **Feladat:** Egy C16-tal védett kör mért Zs-e 1,9 Ω. Megfelel? Megfelelne B16-tal?
- **Megoldás lépésenként:** C16: 230 / 160 = 1,44 Ω < 1,9 → nem; B16: 230 / 80 = 2,88 Ω > 1,9 → igen.
- **Eredmény:** **C16-tal nem felel meg, B16-tal megfelel.**
- **Tipikus hiba:** azt hinni, hogy a „nagyobb” C karakterisztika jobban véd.

### 26. B20 és C32
- **Feladat:** Zs-határ B20-hoz és C32-höz?
- **Megoldás lépésenként:** 230 / (5 · 20) = 230 / 100; 230 / (10 · 32) = 230 / 320.
- **Eredmény:** **B20: 2,3 Ω; C32: 0,72 Ω**.
- **Tipikus hiba:** B-nél 3 · In-nel számolni (a biztos kioldáshoz a felső határ, 5 · In kell).

## H) Teljesítménytényező

### 27. Egyfázisú motor
- **Feladat:** 230 V, I = 6 A, a wattmérő 1100 W-ot mutat. S, cos φ, Q?
- **Megoldás lépésenként:** S = 230 · 6 = 1380 VA; cos φ = 1100 / 1380; Q = √(1380² − 1100²).
- **Eredmény:** **S = 1380 VA, cos φ = 0,80, Q = 833 var**.
- **Tipikus hiba:** P = U · I-vel 1380 W-ot mondani.

### 28. Fázisjavítás
- **Feladat:** P = 20 kW, cos φ = 0,75, cél 0,95. Szükséges kondenzátor-teljesítmény?
- **Megoldás lépésenként:** tg φ1 = 0,882; tg φ2 = 0,329; Qc = 20 · (0,882 − 0,329).
- **Eredmény:** **Qc ≈ 11,06 kvar**.
- **Tipikus hiba:** cos-értékek különbségével szorozni (20 · 0,2 = 4 kvar).

## I) Transzformátor, mérőváltó

### 29. Csengőtranszformátor
- **Feladat:** 230/12 V, 60 VA, N1 = 1150. N2, I2, I1?
- **Megoldás lépésenként:** N2 = 1150 · 12 / 230 = 60; I2 = 60 / 12; I1 = 60 / 230.
- **Eredmény:** **N2 = 60 menet, I2 = 5 A, I1 = 0,261 A**.
- **Tipikus hiba:** az áramokat is a feszültség arányában számolni (fordított arány!).

### 30. Áramváltó
- **Feladat:** 150/5 A-es áramváltó szekunderén 3,4 A folyik. Primer áram?
- **Megoldás lépésenként:** áttétel 150 / 5 = 30; 3,4 · 30.
- **Eredmény:** **102 A**.
- **Tipikus hiba:** osztani szorzás helyett.

## J) Mérési jegyzőkönyv, fogyasztásmérő

### 31. Teljesítmény mért értékekből
- **Feladat:** Izzós (ohmos) körben U = 228,6 V, lakatfogóval I = 0,436 A. Felvett teljesítmény?
- **Megoldás lépésenként:** P = U · I · cos φ, cos φ = 1 → 228,6 · 0,436.
- **Eredmény:** **99,7 W**.
- **Tipikus hiba:** a jegyzőkönyvben a mértékegység és az értékelés elhagyása.

### 32. Mérő LED-villanásai
- **Feladat:** A mérő állandója c = 800 imp/kWh; 45 s alatt n = 20 villanás. Teljesítmény?
- **Megoldás lépésenként:** P = 3600 · n / (c · t) = 3600 · 20 / (800 · 45) [kW, ha t másodpercben van].
- **Eredmény:** **2,0 kW**.
- **Tipikus hiba:** a 3600-as szorzó (óra → másodperc) kimarad.

### 33. Nagy állandójú mérő
- **Feladat:** c = 10 000 imp/kWh, 30 s alatt 25 impulzus. Teljesítmény?
- **Megoldás lépésenként:** P = 3600 · 25 / (10 000 · 30).
- **Eredmény:** **0,3 kW = 300 W**.
- **Tipikus hiba:** kW és W összekeverése a végeredményben.

## Tipikus hibák (összefoglaló)
- Mértékegység-átváltás elmarad (kW, perc, másodperc).
- A √3, a 2-es szorzó vagy az η kimarad.
- Lefelé kerekített keresztmetszet.
- Pólusszám és póluspárszám összekeverése.
