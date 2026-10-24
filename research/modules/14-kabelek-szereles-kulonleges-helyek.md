# 14. modul – Kábelek, szerelési módok, kötéstechnika, különleges helyek

Az anyagismereti kérdések (20%) nagy része vezetéktípus-jelölés, IP-kód és „hova melyik vezeték való”. A különleges helyek (fürdőszoba, építési terület) a biztonsági kérdésekben és a projektfeladatban is előjönnek.

## Vezeték- és kábeljelölések
| Jelölés | Jelentés | Tipikus felhasználás |
|---|---|---|
| **H07V-U** | harmonizált, 450/750 V, PVC szigetelésű egyerű, **tömör** vezető | védőcsőbe, kábelcsatornába, elosztóba |
| **H07V-R** | ugyanez **sodrott** (többhuzalos, merev) vezetővel | nagyobb keresztmetszet csőben, csatornában |
| **H07V-K** | ugyanez **finomhuzalos** (hajlékony) vezetővel, rögzített szerelésre | elosztók, mérőhely belső huzalozása (érvéghüvellyel) |
| **H05VV-F** | 300/500 V, PVC szigetelés + PVC köpeny, **hajlékony** zsinór | háztartási készülékek csatlakozó zsinórja |
| **H07RN-F** | 450/750 V, gumi szigetelés, polikloroprén (neoprén) köpeny, hajlékony | mozgatott gépek, szabadtér, építési terület |
| **NYM-J** | PVC szigetelésű és köpenyű szerelővezeték, **van zöld-sárga ér** (-J) | épületen belül, falon, vakolatban – földbe nem |
| **NYY-J** | 0,6/1 kV-os PVC szigetelésű és köpenyű **réz** erősáramú kábel | földbe, épületek közé, kültérre |
| **NAYY** | mint az NYY, de **alumínium** (A) vezetővel | csatlakozó- és elosztóhálózat nagy keresztmetszeten |
| **CYKY** | réz (C), PVC érszigetelés (Y), kábel (K), PVC köpeny (Y) | épületen belül és földben is elterjedt erősáramú kábel |

- **Harmonizált jelölés:** 03 = 300/300 V, 05 = 300/500 V, 07 = 450/750 V; **G** = van zöld-sárga ér (3G1,5), **x** = nincs (3x1,5).
- **-J / -O:** van, illetve nincs zöld-sárga ér (NYM-J, NYY-O).

## Szerelési módok
- **Falon kívül:** kábelcsatornában, védőcsőben, bilinccsel. Egyerű vezeték (H07V-U) **csak csőben vagy zárt csatornában** futhat, szabadon soha.
- **Süllyesztett:** vakolat alatt, falhoronyban (NYM-J vagy védőcsőbe húzott egyerű vezeték). Nyomvonal **csak vízszintes és függőleges**, a szerelvényekhez igazodva – ferdén soha, mert később nem található meg, és fúráskor átvághatják.
- **Földben:** földkábel (NYY, NAYY, CYKY), homokágyban, felette figyelmeztető szalaggal, védőcsővel az épületbe lépésnél és keresztezéseknél. A fektetési mélységet a terv és a vonatkozó előírás adja.

## Védőcső és kábelcsatorna
- Védőcső: merev vagy gégecső; a cső **húzható** legyen – utólag cserélhető vezetékek. Ívekben ne törjön, a végeken sorjamentes.
- Kábelcsatorna: válassz akkorát, hogy a vezetékek **lazán** elférjenek, maradjon hely a hőleadásnak és a bővítésnek; a megengedett kitöltést a gyártó adja meg.
- **Kitöltés becslése:** H07V-U 2,5 mm² külső átmérője kb. 3,6 mm → keresztmetszete π · 3,6² / 4 ≈ **10,2 mm²**. 12 ér ≈ **122 mm²**. Egy 40 × 25 mm-es csatorna (1000 mm²) kitöltése kb. **12%** – bőven elfér.

## Kötéstechnika
| Kötés | Mire figyelj |
|---|---|
| **Csavaros kapocs** | tömör vezetőhöz; előírt meghúzási nyomaték; egy kapocsba legfeljebb a megengedett számú ér |
| **Rugós (pl. WAGO)** | a kapocsra írt keresztmetszet és vezetőtípus (tömör / hajlékony) szerint; csupaszolási hossz a jelölés szerint |
| **Sajtolt (saru, toldóhüvely)** | méretre illő hüvely és **hozzá való présszerszám**; utána húzópróba |
| **Érvéghüvely** | finomhuzalos vezető csavaros kapocsba mindig hüvellyel; a szálak ne álljanak ki |

- **Cu/Al átmenet:** réz és alumínium közvetlenül **nem köthető** össze (galvanikus korrózió, az alumínium oxidrétege és „folyása” miatt a kötés melegszik, meglazul). Csak **Cu/Al-ra jelölt kötőelem** (bimetál saru vagy kapocs) használható, a gyártó utasítása szerint.
- Kötés csak dobozban, elosztóban – a kötésnek **hozzáférhetőnek** kell maradnia.

## IP-kód (MSZ EN 60529)
- **Első számjegy:** szilárd test elleni védelem (0–6). **Második:** víz elleni védelem (0–9). Az „X” = nincs megadva.

| Kód | Jelentés |
|---|---|
| IP2X | ujjal nem érhető el veszélyes rész (> 12,5 mm) |
| IP4X | > 1 mm-es tárgy ellen |
| IPX4 | fröccsenő víz minden irányból |
| IPX5 | vízsugár |
| IPX7 | ideiglenes vízbe merítés |
| **IP44** | > 1 mm tárgy + fröccsenő víz – a „kültéri, nedves hely” alapszintje |

## Érintésvédelmi osztályok
- **I. osztály:** alapszigetelés + **védővezető bekötése** (fém házas készülék).
- **II. osztály:** kettős vagy megerősített szigetelés, **nincs PE** (jel: két egymásba írt négyzet).
- **III. osztály:** törpefeszültségről (SELV/PELV) működik.
- A 0. osztály (csak alapszigetelés, PE nélkül) általános használatra nem megengedett.

## Fürdőszoba (MSZ HD 60364-7-701)
| Zóna | Hol | Minimum IP |
|---|---|---|
| **0** | a kád / zuhanytálca belseje | **IPX7** |
| **1** | a kád/zuhany fölött, a padlótól 2,25 m magasságig | **IPX4** (vízsugaras tisztításnál IPX5) |
| **2** | az 1. zónán kívül vízszintesen 0,6 m-es sáv, 2,25 m magasságig | **IPX4** |

- A helyiség **összes áramkörét 30 mA-es ÁVK** védje.
- Kapcsoló és dugaszolóaljzat a 0–2. zónában nem lehet (kivétel a törpefeszültség és a szabványos borotva-csatlakozó); a zónán kívüli pontos távolságot a hatályos kiadás szerint ellenőrizd.
- **Helyi (kiegészítő) egyenpotenciálra hozás** ott, ahol az előírás vagy a terv megköveteli: a PE és a helyiségbe belépő fémes csövek összekötése.
- Az 1. és a 2. zónában csak oda szánt, fixen bekötött készülék (pl. vízmelegítő) lehet.

## Ideiglenes építési hely ellátása (MSZ HD 60364-7-704)
- **Építési elosztó** (építési helyre minősített, zárható szekrény) leválasztó főkapcsolóval; minimum **IP44**, mechanikailag ellenálló kivitel.
- A dugaszolóaljzat-áramkörök (≤ 32 A) **30 mA-es ÁVK** mögött; aljzatok CEE ipari kivitelben (**kék = 230 V**, **piros = 400 V**).
- Mozgó, hajlékony vezeték: **H07RN-F** gumikábel (PVC zsinór, pl. H05VV-F, ide nem való); a kábel ne fusson járművek útjában, átvezetésnél védelemmel.
- A berendezést **rendszeresen ellenőrizni** kell (ÁVK próbagomb, szemrevételezés), a sérült kábelt azonnal cserélni.

## Tipikus hibák
- NYM-J közvetlenül földbe, H07V-U csatorna nélkül a falon.
- Hajlékony vezeték csavaros kapocsba érvéghüvely nélkül.
- Réz és alumínium összecsavarása közönséges kapocsban.
- „IP44, tehát a kád fölé is jó” – a 0. zónába IPX7 és oda szánt, törpefeszültségű készülék kell.
- Építési területen PVC hosszabbító, ÁVK nélküli aljzat.

## Tipikus kérdések
- Mit jelent a H07V-K „K” betűje? (finomhuzalos, rögzített szerelésre)
- Melyik vezeték fektethető közvetlenül földbe: NYM-J vagy NYY-J? (NYY-J)
- Mit jelent az IPX7? (ideiglenes vízbe merítés elleni védelem)
- Milyen vezeték kell az építési terület mozgó gépeihez? (H07RN-F)
