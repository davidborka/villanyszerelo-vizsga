# 15. modul – Túlfeszültség-védelem, PV rendszerek, transzformátorok

Rövidebb, fogalmi témák: a vizsgán főleg „melyik típusú SPD hova kerül”, „mit nem szabad az áramváltóval” és „miért veszélyes a napelem DC oldala” típusú kérdések jönnek.

## Villámvédelem és túlfeszültség
- **Külső villámvédelem:** a közvetlen villámcsapást fogja fel és vezeti a földbe – **felfogó** (tetőn), **levezető** (homlokzaton), **földelő**.
- **Belső villámvédelem:** a bejutó túlfeszültség elleni védelem – **villámvédelmi egyenpotenciálra hozás** (minden belépő fémes rész és vezeték a földelőrendszerre, a feszültség alatti vezetők túlfeszültség-levezetőn keresztül).
- Túlfeszültség forrása lehet közeli vagy távoli villámcsapás és kapcsolási folyamat (nagy induktív terhelés ki-be kapcsolása).

## Villámvédelmi zónák (LPZ)
| Zóna | Mit jelent |
|---|---|
| **LPZ 0A** | kint, közvetlen villámcsapásnak kitett hely |
| **LPZ 0B** | kint, a felfogó védi a közvetlen csapástól, de a teljes elektromágneses tér hat |
| **LPZ 1** | épületen belül; a határon lévő SPD-k korlátozzák a bejutó áramot |
| **LPZ 2, 3** | belső helyiség, készülék környezete – egyre kisebb túlfeszültség |

**Elv:** minden zónahatáron, ahol vezeték átlép, a megfelelő szintű SPD (túlfeszültség-levezető) „lépcsőzetesen” csökkenti a túlfeszültséget.

## SPD típusok
| Típus | Vizsgáló hullám | Hova |
|---|---|---|
| **T1** (1. típus) | villámáram, 10/350 µs | a betáplálásnál (fő elosztó), ha van külső villámvédelem vagy szabadvezetékes a táplálás – LPZ 0 → 1 határ |
| **T2** (2. típus) | 8/20 µs | fő- és alelosztók – a lakáselosztóban ez a szokásos |
| **T3** (3. típus) | kombinált hullám | érzékeny készülék közelében (pl. aljzatba épített védelem) |

- Létezik **kombinált T1+T2** levezető is.
- Az SPD földelő vezetéke legyen **rövid és egyenes** – a hosszú bekötés rontja a védelmet.
- Az SPD elé a gyártó által előírt előtét-védelem (biztosító/kismegszakító) kerül.

## Napelemes (PV) rendszerek biztonsága
- **A DC oldal fényben mindig feszültség alatt van.** A napelem nem kapcsolható ki: amíg fény éri, a stringen akár több száz V egyenfeszültség van, akkor is, ha az AC oldalt leválasztottuk.
- Egyenáramú ív nem alszik ki magától (nincs nullátmenet) → DC oldalon **csak DC-re méretezett** kapcsoló, biztosító, csatlakozó használható; csatlakozót terhelés alatt bontani tilos.
- **DC szakaszoló:** a modulok és az inverter között (külön vagy az inverterbe építve) – az inverter karbantartásához.
- **Inverter:** a DC-t a hálózattal szinkron AC-vé alakítja; **szigetüzem elleni védelme** hálózatkimaradáskor lekapcsol, hogy ne tápláljon vissza a „kikapcsolt” hálózatra (a hálózaton dolgozó szerelő védelme).
- **AC oldal:** saját áramkör, saját kismegszakító és az inverter gyártója által előírt típusú ÁVK; az inverter AC kimenetére más fogyasztó nem köthető.
- **Visszatáplálás:** csak az elosztói engedéllyel és **kétirányú (ad-vesz) mérővel** – a hálózatra kapcsolás nem a szerelő egyéni döntése.
- **Tűzoltói szempont:** feliratozás a mérőhelyen és az elosztóban („napelemes rendszer – a DC oldal leválasztás után is feszültség alatt”), a DC kábelek nyomvonala dokumentálva; ahol az előírás megköveteli, tűzeseti leválasztó.

## Transzformátor alapok
- **Áttétel:** **U1 / U2 = N1 / N2**, az áramok fordítva: I1 / I2 = N2 / N1 (ideális transzformátor).
- **Látszólagos teljesítmény:** **S = U · I** (VA); ideális esetben S1 = S2.
- Példa: 230/24 V-os, 100 VA-es transzformátor, N1 = 920 menet → N2 = 920 · 24 / 230 = **96 menet**; I2 = 100 / 24 = **4,17 A**; I1 = 100 / 230 = **0,435 A**.
- **Biztonsági (elválasztó) transzformátor:** a primer és a szekunder között megerősített szigetelés – SELV táplálására.

## Mérőváltók
| | Áramváltó (ÁV) | Feszültségváltó (FV) |
|---|---|---|
| Szekunder | 5 A vagy 1 A | jellemzően 100 V |
| **Tilos** | **szekunderét üzem közben szakadásban hagyni** – a nyitott szekunderen veszélyes nagy feszültség keletkezik, a vasmag túlmelegszik | **szekunderét rövidre zárni** – zárlati áram, a váltó tönkremegy |
| Teendő | műszer cseréje előtt a szekunder kapcsokat **rövidre zárni** | szekunder oldali biztosító / kismegszakító |

- Áramváltó-példa: 200/5 A-es áramváltó, szekunder áram 3,2 A → primer áram = 3,2 · 200 / 5 = **128 A**.
- A mérőváltók szekunder körét előírás szerint egy ponton földelik.

## EV-töltő (elektromos autó)
- **Külön, csak a töltőt ellátó áramkör**, saját túláramvédelemmel és **30 mA-es ÁVK-val**; az egyenáramú hibaáram elleni védelemről (B típusú ÁVK vagy a töltőbe épített DC-hibaáram-érzékelés) a **gyártói előírás** szerint kell gondoskodni.
- Nagyságrend: 11 kW háromfázisú töltő ≈ 11 000 / (√3 · 400) = **15,9 A**; 3,7 kW egyfázisú ≈ **16 A** – tartós terhelés, ezért a vezetéket és a kötéseket erre méretezd.

## Tipikus hibák
- Áramváltós mérőnél a mérő kikötése a szekunder rövidrezárása nélkül.
- „Lekapcsoltam az invertert, a napelemen már nincs feszültség.”
- AC kapcsoló vagy biztosító a DC oldalon.
- T1-es levezető helyett T3-as a betáplálásnál; hosszú, hurkos földelő vezeték az SPD-n.
- EV-töltő meglévő dugaljkörre kötve.

## Tipikus kérdések
- Miért nem szabad az áramváltó szekunderét szakadásban hagyni? (veszélyes túlfeszültség, melegedés)
- Melyik SPD-típus kerül a lakáselosztóba? (T2)
- Mi a szigetüzem elleni védelem lényege? (hálózatkimaradáskor az inverter nem táplál vissza)
- Mekkora a szekunder feszültség, ha N1 = 1000, N2 = 50, U1 = 230 V? (11,5 V)
