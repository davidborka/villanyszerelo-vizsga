# 3. modul – Áramütés elleni védelem (a legtöbb pontot érő téma)

Az interaktív vizsga 40%-a villamos biztonság, a mérőhelynél 20% az áramütés elleni védelem, és **ebben elkövetett hiba érvénytelen vizsgát jelent**.

## Hálózati rendszerek
- **TN-C:** a nulla és a védővezető egy közös vezető (PEN). Lakásban új szerelésnél már nem alkalmazzuk.
- **TN-S:** külön N (kék) és PE (zöld-sárga) a táplálástól.
- **TN-C-S:** a betáp PEN, amelyet egy ponton (mérőhely / fő elosztó) **PE-re és N-re szétválasztunk; a szétválasztás után N és PE soha többé nem köthető össze.**
- **TT:** a fogyasztó saját földelővel rendelkezik; az ÁVK itt alapvető.

## Védelmi intézkedés: önműködő lekapcsolás + kiegészítő védelem
- **Önműködő lekapcsolás:** testzárlatkor a kismegszakító (túláramvédelem) adott időn belül lekapcsol. Feltétel TN rendszerben: **Zs ≤ U0 / Ia**.
  - B karakterisztika: Ia = 5·In → B16: Zs ≤ 230 / 80 = **2,88 Ω**.
  - C karakterisztika: Ia = 10·In → C16: Zs ≤ 1,44 Ω.
  - Lekapcsolási idő 230 V-os, ≤ 32 A-es végáramkörben: TN: 0,4 s; TT: 0,2 s.
- **Kiegészítő védelem: ÁVK (áram-védőkapcsoló, FI-relé) IΔn ≤ 30 mA**
  - kötelező: átlagos személyek által használt, ≤ 32 A-es dugaszolóaljzat-áramkörök; szabadtéri hordozható készülékek ≤ 32 A; lakásokban a lámpatesteket tápláló végáramkörök is (MSZ HD 60364-4-41:2017, 411.3.4).
  - A 300 mA-es ÁVK tűzvédelmi célú, **személyvédelemre nem elég**.
  - Az ÁVK-n **az L és az N is átmegy**; a PE soha. Ha a nulla nem az ÁVK-n át tér vissza (vagy egy fogyasztó N-je a PE-re van kötve), az ÁVK kiold.

## Védővezető (PE) és egyenpotenciálra hozás
- Minden I. érintésvédelmi osztályú készülék (fém lámpatest, dugalj védőérintkezője) **PE-t kap**. Hiányzó PE = érvénytelen vizsga.
- **Zöld-sárga vezeték kizárólag PE (vagy PEN, a végein kék jelöléssel)** lehet.
- **EPH (fő védőösszekötő, egyenpotenciálra hozás):** a fémes közműveket (víz, gáz, fűtés) a főföldelő sínre kötjük; legalább 6 mm² Cu.
- A PE-be és a PEN-be **nem kerülhet kapcsoló, kismegszakító vagy ÁVK**.

## Érintésvédelmi osztályok
- I. osztály: alapszigetelés + védővezető bekötése (fém lámpatest, mosógép).
- II. osztály: kettős/megerősített szigetelés, nincs PE (jel: két egymásba írt négyzet).
- III. osztály: törpefeszültség (SELV/PELV, ≤ 50 V AC).

## Vezetékszínek (MSZ EN 60445)
- L: barna (háromfázisban L1 barna, L2 fekete, L3 szürke) · N: kék · PE: zöld-sárga · PEN: zöld-sárga, végein kék jelöléssel.

## Tipikus hibák a vizsgán
- Lámpatest PE nélkül; dugalj PE-je lógva hagyva.
- Lámpa nullája közvetlenül az N-sínre, de a fázisa az ÁVK-n át → bekapcsoláskor az ÁVK kiold.
- A szétválasztás után a PE az N-sínre kötve („utólagos nullázás”) – tilos.
- Kék vezeték fázisként – szín hiba.
