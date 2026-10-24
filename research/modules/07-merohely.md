# 7. modul – Egyfázisú fogyasztásmérő hely (III. vizsgarész, a projekt 40%-a)

> Oktatási szerelőlap-feladat. Valódi, rendszerengedélyes mérőszekrénynél mindig a szekrény jóváhagyott rajza és az illetékes elosztó előírása az irányadó.

## Áramút
**Méretlen L → plombálható főkismegszakító (pl. B32) → mérő 1 → mérő 3 → mért fővezeték → lakás főelosztó (ÁVK → kismegszakítók) → fogyasztók**

## A mérő kapcsai (1–3–4–6 kiosztású egyfázisú direkt mérő)
- **1 = méretlen L be**, **3 = mért L ki**, **4 = N be**, **6 = N ki**.
- Létezik 1–2–3–4 kiosztású mérő is (1 L be, 2 L ki, 3 N be, 4 N ki) – mindig a mérő saját bekötési rajza dönt.
- **A PEN-t nem szabad a mérő N-kapcsain átvezetni.**

## Túláramvédelem a mérő előtt
- A szerződés szerinti főkismegszakító a **fázisban, a mérő ELŐTT**, a plombálható térben; a kezelőszerv plomba bontása nélkül működtethető.
- Alapeset a **B karakterisztika**; C csak indokolt, engedélyezett esetben.

## PEN-szétválasztás (TN-C-S)
- A beérkező **PEN a földelt PE- (főföldelő) sínre** kerül, innen híd az N-kapocsra. Az N a mérőn át (4→6) halad tovább.
- **A szétválasztás után N és PE soha nem köthető újra össze.** Ha mégis, a fogyasztói áram egy része a PE-n tér vissza, és az ÁVK kiold.
- **PEN-be és PE-be nem kerül kismegszakító vagy ÁVK.**
- **Az ÁVK csak a mért, már szétválasztott hálózatban** alkalmazható – a mérő előtt (méretlen oldalon) tilos.
- **EPH** (fő védőösszekötő) a főföldelő sínre, legalább 6 mm² Cu. Nem a mérő N-kapcsára!

## Keresztmetszet és szín
- Méretlen és mért fővezeték, belső huzalozás 32 A-ig: **10 mm² Cu** (H07V-K); a mért nem lehet kisebb a méretlennél.
- PEN legalább 10 mm² Cu; jelölése zöld-sárga, a végein kék.
- N kék, PE zöld-sárga, L barna/fekete.

## Túlfeszültség-levezető
- Egyetlen elszámolási mérő esetén a fogyasztó **mért főelosztójában** a helye, nem a mérőtérben.

## Plombálás, elkülönítés
- Méretlen tér, mérőtér és mért főelosztó funkcionálisan elkülönül; **méretlen leágazás nem lehet** (szabálytalan vételezés).
- A mérő kapocsfedele és a méretlen tér zárópecsételhető.

## Ellenőrző lista a mérőhely bekötése után
- [ ] Főkismegszakító a mérő előtt, a fázisban.
- [ ] Mérő: L 1→3, N 4→6, nem fordítva.
- [ ] PEN a PE-sínen, híd az N-re, utána N és PE sehol nem találkozik.
- [ ] EPH a főföldelő sínen.
- [ ] 10 mm² a fővezetékeken, színek rendben.
- [ ] ÁVK csak a mért oldalon, a lakás főelosztóban.
- [ ] Semmi nem kap fázist a mérő megkerülésével.
