# Brief: a gyakorló kérdésbank bővítése (interaktív vizsga)

## Cél
A 4 0713 04 07 Villanyszerelő (Épületvillamosság) központi interaktív vizsgájára gyakorló kérdésbank most 145 kérdés (`src/sim/questions.ts`). A hivatalos kérdésbank nem nyilvános, ezért **saját megfogalmazású, ellenőrzött** kérdésekkel bővítjük nyilvános forrásokból. Cél: a vizsgázó a minimumot biztosan, erős közepest elérje.

## Kimenet
Egyetlen új fájl: `src/sim/bank/<topic>.ts` (a feladatkiosztásban megadott néven), ennyi:

```ts
import type { Question } from '../questions'
export const BANK_<TOPIC>: Question[] = [ ... ]
```

- A `Question` típus és a stílus: olvasd el `src/sim/questions.ts` elejét (típus) és pár meglévő kérdést a témádból. **Ne módosítsd a questions.ts-t és más fájlt sem**, csak a sajátodat (a bekötést a koordinátor csinálja).
- Azonosító: `<prefix>-NNN` (a kiosztásban megadott prefix, 001-től), egyedi.
- `kind`: 'single' (a legtöbb), 'multi' (több helyes; `answer` index-tömb), 'order' (options HELYES sorrendben, 4–6 lépés), 'number' (value, unit, tol). Keverd: kb. 70% single, 15% multi, 10% order, 5% number (számítási témánál több number).
- `points`: 1 egyszerű, 2 összetettebb/multi/order, 3 számolás több lépéssel.
- `explain`: 1–3 mondat, MIÉRT ez a jó válasz, a rossz opciók tipikus tévedését is megnevezve.
- `source`: szabvány-pont, tankönyvi téma vagy nyilvános URL (lásd lent). Pontos, ellenőrizhető.
- Single kérdésnél a helyes opció indexe legyen változatos (ne mindig 0); 4 opció, hihető tévesztők.
- A meglévő 145 kérdést **ne ismételd** (ugyanaz a tény más szavakkal sem); nézd át a témád meglévő kérdéseit a `questions.ts`-ben.
- Magyarul, a vizsga stílusában („Válassza ki…”, „Melyik állítás igaz…”). Tizedesvessző.

## Források (csak nyilvános)
- KKK (képzési és kimeneti követelmény): https://nagykunvk.hu/wp-content/uploads/2021/05/Villanyszerelo-2024.08.29.-v4-Villanyszerelo-2024.08.29.-v4.pdf
- SZKTV/OSZTV villanyszerelő feladatsorok és megoldások (a valódi interaktív vizsga stílusa):
  - https://s3-eu-west-1.amazonaws.com/szakmavilag/osztv-szktv/2022/Villanyszerelo_Feladatsor_2022.pdf
  - https://s3-eu-west-1.amazonaws.com/szakmavilag/osztv-szktv/2022/Villanyszerelo_Megoldas_2022.pdf
  - https://s3-eu-west-1.amazonaws.com/szakmavilag/osztv-szktv/2023/Villanyszerelo_Feladatsor_2023.pdf
  - https://s3-eu-west-1.amazonaws.com/szakmavilag/osztv-szktv/2024/2024-Villanyszerelo-Megoldas-2023-10-10-javTG-1.pdf
  - https://s3-eu-west-1.amazonaws.com/szakmavilag/Villanyszerel%C5%91_Megold%C3%A1s_2025-5934.pdf
  Letöltés: `curl -sL -o <scratchpad>/x.pdf <url>` majd `pdftotext -layout`. A letöltött fájlt a saját scratchpad mappádba tedd, ne a repóba.
- Villamosipar és elektronika ismeretek érettségi feladatsorok/útmutatók (pl. https://irinyi-ref.hu/wp-content/uploads/2021/10/er/vill17mo.pdf, vill18mo.pdf, vill19.pdf).
- Szabványok (saját szavakkal): MSZ HD 60364 (4-41, 5-52, 5-54, 6, 7-701, 7-704, 7-705), MSZ 1585, MSZ EN 60445, MSZ HD 361, MSZ EN 60529, MSZ EN 60898-1, MSZ EN 61008/61009, MSZ EN 62305, OTSZ/TvMI, 40/2017 NGM r., Munkavédelmi tv., villamos biztonsági felülvizsgálat (VBF/ÉV/szerelői ellenőrzés).
- Web: WebSearch/WebFetch szabad. Perplexity kvóta elfogyott, ne használd.
- **Tilos**: a forrásokból szó szerint másolt feladatszöveg (a tényt saját szavakkal kérdezd), magánszemélyek nevei, a gépen lévő magán PDF-ek.

## Ellenőrzés a végén
1. Minden számolós kérdést számold újra (python3) és az eredményt írd a jelentésbe.
2. `bunx tsc --noEmit -p .` hibamentes legyen a fájlodra.
3. Gyors szerkezeti ellenőrzés: egyedi id-k, single answer < options.length, multi index-tömb érvényes, legalább 1 helyes.
Jelentés: kérdések száma kind szerint, mely forrásokból, mely tényekben voltál bizonytalan (ezeket inkább hagyd ki).
