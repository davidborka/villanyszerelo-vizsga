# 5. modul – Világításvezérlések bekötése

## Kapcsolótípusok (szerelvényszám és rajzjel)
| Szám | Megnevezés | Kapcsok | Mire |
|---|---|---|---|
| 101 | egypólusú kapcsoló | L, 1 | egy lámpa(kör) egy helyről |
| 105 | csillárkapcsoló (sorozatkapcsoló) | L, 1, 2 | két lámpakör egy helyről (külön és együtt) |
| 106 | váltókapcsoló | C (közös), 1, 2 | két helyről kapcsolás (váltó–váltó) |
| 107 | keresztkapcsoló | 1-2 be, 3-4 ki | három vagy több helyről: váltó–kereszt(ek)–váltó |
| – | nyomógomb (záró) | 1, 2 | impulzusrelé, lépcsőházi automata vezérlése |

**Alapszabály:** a kapcsoló mindig a **fázist** bontja; a lámpa a nullát és a PE-t közvetlenül kapja.

## Váltó–kereszt–váltó (három helyről kapcsolt lámpa)
- L (a kismegszakító után) → **V1 közös (C)**.
- V1 1 és 2 → **K 1 és 2** (két korrespondáló vezeték).
- K 3 és 4 → **V2 1 és 2** (két korrespondáló vezeték).
- **V2 közös (C)** → lámpa L. A lámpa N és PE közvetlenül.
- Érszámok a mintafeladat egyvonalas rajzán: B10 → V1: 3 · V1–K: 4 · K–V2: 4 · V2 → lámpa: 3.
- Ellenőrzés: bármelyik kapcsoló átváltása megváltoztatja a lámpa állapotát.

## Mozgásérzékelős lámpa 101-es kapcsolóval
- A 101-es kapcsoló a lámpa fázisát bontja, így a lámpa a kapcsolóval feszültségmentesíthető.
- A kapcsolóhoz 2 ér megy (L be, kapcsolt L ki), a lámpához 3 (kapcsolt L, N, PE).

## Csillárkapcsoló (105)
- L → kapcsoló L; 1 → 1. lámpakör L; 2 → 2. lámpakör L; a lámpakörök N és PE közvetlenül.

## Impulzusrelé (távkapcsoló)
- Tekercs: **A1–A2**; érintkező: **11–14**.
- A nyomógombok **párhuzamosan**: L → nyomógomb → A1; A2 → N.
- 11 ← L, 14 → lámpák L. Minden gombnyomásra a relé vált (be → ki → be).
- A nyomógombokhoz 2 ér megy (L és a vezérlővezeték A1-re).

## Lépcsőházi automata
- Kapcsok: L, N, nyomógomb-bemenet (gyártótól függően 3 vagy „S”), kimenet (lámpa).
- **Négyvezetékes bekötés:** a nyomógombok a fázist adják a nyomógomb-bemenetre; a lámpák az automata kimenetéről kapnak fázist.
- Bármelyik gomb indítja, a beállított idő (pl. 0,5–20 perc) után lekapcsol.

## Tipikus hibák
- A korrespondáló vezetékek felcserélése a kereszten (3-4 helyett 1-3) → csak két helyről működik.
- A lámpa közvetlenül a kismegszakítóról kap fázist, megkerülve a relét / automatát.
- A nyomógomb a nullát kapcsolja → a relé nem húz meg (vagy zárlat).
