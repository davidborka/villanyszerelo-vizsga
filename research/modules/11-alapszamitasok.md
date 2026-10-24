# 11. modul – Villamos alapismeretek és alapszámítások

Az interaktív vizsga 20%-a számítás. A feladatok szinte mindig ugyanarra a néhány képletre épülnek: ha ezeket biztosan tudod, és figyelsz a mértékegységekre, a pontok nagy része megvan.

## Mennyiségek és mértékegységek
| Jel | Mennyiség | Egység |
|---|---|---|
| U | feszültség | V (volt) |
| I | áram | A (amper) |
| R | ellenállás | Ω (ohm) |
| P | hatásos teljesítmény | W (watt) |
| W | energia (munka) | Wh, kWh (1 kWh = 1000 W · 1 h) |
| ρ | fajlagos ellenállás | Ω·mm²/m |

Váltószámok: 1 kW = 1000 W · 1 mA = 0,001 A · 1 h = 3600 s.

## Ohm-törvény
**U = I · R → I = U / R → R = U / I**
- Példa: 230 V-ra kapcsolt 46 Ω-os fűtőszál árama: I = 230 / 46 = **5 A**.

## Soros és párhuzamos kapcsolás
- **Soros:** Re = R1 + R2 + R3; az áram mindenhol ugyanaz, a feszültség megoszlik.
  - Példa: 10 Ω + 20 Ω + 30 Ω = **60 Ω**; 12 V-on I = 12 / 60 = **0,2 A**.
- **Párhuzamos:** 1/Re = 1/R1 + 1/R2; a feszültség ugyanaz, az áramok összeadódnak. Az eredő **mindig kisebb a legkisebb ágnál**.
  - Két ellenállásra: Re = R1·R2 / (R1 + R2). Példa: 20 Ω ∥ 30 Ω = 600 / 50 = **12 Ω**.
  - n egyforma ellenállás: Re = R / n. Példa: 100 Ω ∥ 100 Ω = **50 Ω**.
- A lakás dugaljai, lámpái **párhuzamosan** kapcsolódnak a hálózatra – ezért kapja mindegyik a 230 V-ot.

## Teljesítmény és energia
**P = U · I = I² · R = U² / R** (egyenáramon és ohmos terhelésnél, cos φ = 1)
- Példa: 230 V / 2000 W-os vízforraló: I = 2000 / 230 = **8,70 A**; R = 230² / 2000 = **26,45 Ω**.

**W = P · t**
- Példa: 150 W-os tévé napi 5 órát megy 30 napig: W = 0,15 kW · 5 h · 30 = **22,5 kWh**. 70 Ft/kWh áron: 22,5 · 70 = **1575 Ft**.

## Vezeték ellenállása
**R = ρ · l / A** — ρCu = 0,0178 Ω·mm²/m, ρAl = 0,0286 Ω·mm²/m (az alumínium kb. 1,6-szor rosszabb vezető).
- Példa (réz): 50 m hosszú, 1,5 mm²-es ér: R = 0,0178 · 50 / 1,5 = **0,593 Ω**.
- Példa (alumínium): 100 m hosszú, 16 mm²-es ér: R = 0,0286 · 100 / 16 = **0,179 Ω**.
- Egyfázisú körben az áram oda (L) és vissza (N) is megy: a hurok ellenállása **2 · ρ · l / A**.

## Váltakozó áram: impedancia és cos φ
- Tekercs (motor, előtét) és kondenzátor esetén az áram és a feszültség között **φ fázisszög** van.
- **Impedancia:** Z = √(R² + X²), ahol X a reaktancia (Ω). Az Ohm-törvény váltakozó áramon: I = U / Z.
- **cos φ = R / Z = P / S** (teljesítménytényező; ohmos fogyasztónál 1).
- Példa: R = 30 Ω, X = 40 Ω → Z = √(900 + 1600) = **50 Ω**; I = 230 / 50 = **4,6 A**; cos φ = 30 / 50 = **0,6**.

## Teljesítményháromszög
| Jel | Név | Képlet (1 fázis) | Egység |
|---|---|---|---|
| S | látszólagos | U · I | VA |
| P | hatásos (hasznos munkát végez) | U · I · cos φ | W |
| Q | meddő (mágneses tér fenntartása) | U · I · sin φ | var |

**S² = P² + Q²** (derékszögű háromszög: P a vízszintes, Q a függőleges befogó, S az átfogó).
- Példa: U = 230 V, I = 10 A, cos φ = 0,8 (sin φ = 0,6): S = **2300 VA**, P = 2300 · 0,8 = **1840 W**, Q = 2300 · 0,6 = **1380 var**.

## Fázisjavítás – az alapgondolat
- Az induktív fogyasztók (motorok, fénycső-előtétek) meddő áramot is felvesznek → nagyobb áram, nagyobb veszteség a vezetéken, a szolgáltató meddő díjat számolhat.
- **Párhuzamosan kötött kondenzátor** helyben adja a meddő teljesítményt → a hálózatból felvett S és I csökken, **a hatásos P nem változik**.
- Szükséges kondenzátor-teljesítmény: **Qc = P · (tg φ1 − tg φ2)**.
- Példa: P = 10 kW, cos φ 0,7-ről 0,95-re: tg φ1 = 1,0202, tg φ2 = 0,3287 → Qc = 10 · 0,6915 = **6,92 kvar**. A látszólagos teljesítmény 14,29 kVA-ről **10,53 kVA**-re csökken.

## Háromfázisú rendszer (3 × 400/230 V)
- **Fázisfeszültség (Uf):** fázis–nulla, 230 V. **Vonali feszültség (Uv):** fázis–fázis, 400 V. **Uv = √3 · Uf** (230 · 1,732 = 398,4 ≈ 400 V).
- **Csillag (Y):** a tekercsek/ellenállások egyik vége közös pontban; egy elem **Uf**-et kap; **Iv = If**.
- **Delta (Δ, háromszög):** az elemek a fázisok közé kötve; egy elem **Uv**-t kap; **Iv = √3 · If**.
  - Példa: delta, fázisáram (elemáram) 10 A → vonali áram = 1,732 · 10 = **17,32 A**.
- **Teljesítmény (szimmetrikus terhelés):** **P = √3 · U · I · cos φ** (U és I vonali értékek); S = √3 · U · I; Q = √3 · U · I · sin φ.
  - Példa: 400 V, 20 A, cos φ = 0,85 → P = 1,732 · 400 · 20 · 0,85 = **11 778 W ≈ 11,8 kW**.
- **Csillag kontra delta ugyanazzal az ellenállással:** 3 db 46 Ω-os fűtőszál 400 V-on.
  - Csillag: egy szál 400/√3 = 230,9 V-ot kap, If = 5,02 A, P = 400² / 46 = **3478 W**.
  - Delta: egy szál 400 V-ot kap, If = 8,70 A, Iv = 15,06 A, P = 3 · 400² / 46 = **10 435 W**.
  - **Deltában háromszor akkora a teljesítmény** – ezt használja ki a csillag–delta indítás fordítva (13. modul).

## Tipikus hibák
- W és kWh keverése: a percet, másodpercet előbb órára váltsd.
- Az egyfázisú vezeték ellenállásánál csak az oda-utat számolod (a 2-es szorzó hiányzik).
- Háromfázisban a √3 kimarad, vagy a fázisfeszültséggel (230 V) számolsz a √3·U·I képletben.
- A párhuzamos eredő nagyobb jön ki, mint a legkisebb ág – ez biztosan számolási hiba.
- VA, W és var összekeverése: a mértékegység maga is pontot ér a feleletválasztós kérdésben.

## Tipikus kérdések
- Mekkora az áram 230 V-on egy 1150 W-os ohmos fogyasztónál? (5 A)
- Mi a mértékegysége a meddő teljesítménynek? (var)
- Delta kapcsolásban hogyan aránylik a vonali áram a fázisáramhoz? (√3-szoros)
- Mit változtat a fázisjavító kondenzátor a hatásos teljesítményen? (Semmit; az S és az I csökken.)
