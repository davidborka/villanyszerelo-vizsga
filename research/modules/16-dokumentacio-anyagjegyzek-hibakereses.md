# 16. modul – Dokumentáció, anyagjegyzék, hibakeresés, átadás

A projektfeladat kiindulása mindig egy rajz: abból kell kiolvasni, mit és mennyit kell szerelni, majd a végén a kész munkát ellenőrizni és átadni.

## A villamos dokumentáció részei
| Dokumentum | Mire való |
|---|---|
| **Kiviteli terv** | ami alapján építünk: alaprajz a szerelvényekkel és nyomvonalakkal, elosztó-rajz, műszaki leírás, anyagigény |
| **Megvalósulási terv** | a ténylegesen megépült állapot (eltérések átvezetve) – ez marad a tulajdonosnál, később erre épül a javítás, bővítés |
| **Egyvonalas rajz** | egy vonal = egy nyomvonal; a ferde vonalkák száma az erek száma; áttekintő, elosztóknál és alaprajzon |
| **Áramútrajz** (többvonalas) | minden vezető és érintkező külön – vezérléseknél (öntartás, csillag–delta), hibakereséshez |
| **Elrendezési rajz** | hol helyezkednek el fizikailag az elemek (elosztó DIN-sínje, szerelvények a falon, magasságok) |
| **Jelmagyarázat** | a rajzon használt jelképek és rövidítések feloldása – nélküle a rajz nem egyértelmű |

- A rajzjelek a vonatkozó szabványos jelképek szerint készülnek; ha a rajz eltér a megszokottól, **a jelmagyarázat dönt**.

## Anyagjegyzék és mennyiségkiírás – a módszer
1. **Áramkörönként** haladj (elosztótól a legutolsó fogyasztóig), ne helyiségenként – így semmi nem marad ki.
2. **Darabos tételek:** szerelvények (kapcsoló, dugalj), lámpatestek, dobozok, elosztó-készülékek. Számold meg a rajzjeleket, és vesd össze a jelmagyarázattal.
3. **Hosszmértékes tételek:** csatorna/cső méterben a nyomvonal szerint; vezeték **erenként és színenként** (ér × nyomvonalhossz).
4. **Ráhagyás:** vezetéknél a bekötésekre és dobozokra (pl. +10%), csatornánál a vágási veszteségre; mindig **felfelé** kerekíts a kiszerelésre (méter, 2 m-es szál).
5. **Apróanyag:** kötőelemek (rugós kapocs), érvéghüvely, csavar, tipli, feliratozó.

## Kidolgozott példa: kis műhely
*A rajz leírása:* a bal falon az elosztó. **Dugaljkör (B16):** 40 × 25-ös csatorna az elosztótól az 1. dugaljig 2,5 m, onnan a 2.-ig 2,0 m, onnan a 3.-ig 2,0 m; 3 db falon kívüli 2P+F dugalj, H07V-U 2,5 mm² (L, N, PE). **Világítás (B10):** 25 × 16-os csatorna az elosztótól a kapcsolóig 1,2 m, a kapcsolótól a lámpáig 2,8 m; 1 db 101-es kapcsoló, 1 db I. osztályú lámpatest, H07V-U 1,5 mm². Az N és a PE a kapcsoló dobozán áthalad a lámpáig. Ráhagyás a vezetékre 10%.

| Tétel | Számítás | Mennyiség |
|---|---|---|
| Kábelcsatorna 40 × 25 | 2,5 + 2,0 + 2,0 = 6,5 m | 6,5 m → **4 szál** (2 m-es) |
| Kábelcsatorna 25 × 16 | 1,2 + 2,8 = 4,0 m | 4,0 m → **3 szál** (1 tartalék a vágásokra) |
| H07V-U 2,5 barna / kék / zöld-sárga | 6,5 m · 1,1 = 7,15 m | **8 m** színenként |
| H07V-U 1,5 barna (L a kapcsolóig + kapcsolt L a lámpáig) | (1,2 + 2,8) · 1,1 = 4,4 m | **5 m** |
| H07V-U 1,5 kék / zöld-sárga | 4,0 · 1,1 = 4,4 m | **5 m** színenként |
| Dugalj 2P+F, falon kívüli | jelek száma | **3 db** |
| Kapcsoló 101, falon kívüli | | **1 db** |
| Lámpatest (I. osztály) | | **1 db** |
| ÁVK 2P 40 A / 30 mA, B16, B10 | elosztó | **1-1-1 db** |
| N-sín, PE-sín, rugós kötőelemek, érvéghüvely | apróanyag | tételesen |

## Hibakeresés módszere
1. **Tünet pontos rögzítése:** mi nem működik, mikor old a védelem, melyik áramkörben.
2. **Feszültségmentesítés** az öt szabály szerint – a legtöbb mérés (folytonosság, szigetelés) csak így végezhető.
3. **Szemrevételezés:** kötések, színek, egy kapocsban lévő erek, sérült szigetelés.
4. **Folytonosság- és szigetelésmérés** a gyanús szakaszon.
5. **Félbevágás módszere:** egy hosszú láncot (pl. 8 dugaljat felfűző kört) középen megbontasz vagy megmérsz; így eldől, melyik felében van a hiba, és azt felezed tovább. 8 elemnél **3 méréssel** megvan a hibás szakasz.
6. Javítás után **újra mérés és funkciópróba**.

## Tipikus hibák és tüneteik
| Tünet | Valószínű ok |
|---|---|
| Az ÁVK bekapcsoláskor vagy terheléskor azonnal kiold | **N és PE összekötése** az ÁVK utáni részen; egy kör nullája másik ÁVK-ra vagy az ÁVK előtti N-re kötve |
| Kismegszakító azonnal old | zárlat L–N vagy L–PE között (becsípett vezeték, csavar a vezetékben) |
| A lámpa csak két helyről kapcsolható | **felcserélt korrespondáló** vezetékek a keresztkapcsolónál |
| Villogás, melegedő kapocs, égett szag | **laza kötés** (nem húzott csavar, rövid csupaszolás, hüvely nélküli hajlékony ér) |
| Folytonosságmérésnél nagy vagy végtelen PE-ellenállás | **PE-szakadás** – a készülék háza hiba esetén feszültség alá kerülhet |
| Az egész kör halott, a kismegszakító bekapcsolva | szakadt fázis vagy nulla, rossz kapocs a lánc elején |

## Átadás-átvétel
- **Szerelői ellenőrzés** elvégezve és dokumentálva (mérési jegyzőkönyv: folytonosság, szigetelés, hurokimpedancia, ÁVK).
- **Megvalósulási dokumentáció** átadása; az elosztóban az áramkörök **feliratozva**.
- A készülékek kezelési útmutatói, garanciális papírok.
- A megrendelő tájékoztatása: mit véd az ÁVK, a próbagombot rendszeresen meg kell nyomni.
- A hiányosságok listája határidővel, ha van – az átvétel ennek rendezésével zárul.

## Tipikus hibák
- Az anyagjegyzékben a vezetéket a csatorna hosszával számolod, nem ér × hossz alapon.
- Kimarad a ráhagyás, vagy lefelé kerekítesz.
- Feszültség alatt folytonosságot, szigetelést mérsz.
- „Megjavítottam” – újramérés és funkciópróba nélkül.

## Tipikus kérdések
- Mi a különbség a kiviteli és a megvalósulási terv között? (terv kontra ténylegesen megépült állapot)
- Melyik rajzon látod egy vezérlés minden érintkezőjét? (áramútrajz)
- Mi a valószínű oka, ha az ÁVK azonnal kiold? (N–PE összekötés a mögötte lévő részen)
- Mit jelent a vonalkák száma az egyvonalas rajzon? (az erek számát)
