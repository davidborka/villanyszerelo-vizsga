# Felkészülési és Tanulmányi Útmutató: Villanyszerelő Szakmai Vizsga

**Szakma megnevezése:** 4 0713 04 07 Villanyszerelő, Épületvillamosság szakmairány (KKK szerint)  
**Dokumentum célja:** Átfogó felkészítő és tanulmányi útmutató a központi interaktív vizsgához és a gyakorlati projektfeladathoz (beleértve a portfólióvédést, a szerelési technológiákat, a méréseket és a biztonságtechnikai előírásokat).

---

## 1. Kulcsfogalmak és Elméleti Összefoglaló

### 1.1. A vizsga felépítése és értékelési rendszere

A szakmai vizsga két fő vizsgatevékenységből áll. A szakmai bizonyítványba az ágazati alapvizsga és a szakmai vizsga a KKK szerinti arányban számít bele.

| Vizsgatevékenység | Időtartam | Súlyarány | Minimum teljesítmény |
| :--- | :--- | :--- | :--- |
| **Központi interaktív vizsga** (feleletválasztós, számítási és tesztkérdések) | 90 perc | 30% | 40% |
| **Projektfeladat** (gyakorlati szerelés és portfólióvédés) | 300 perc | 70% | 40% |

#### Érdemjegyek megoszlása (12/2020. Korm. rendelet 290. §)
* **0–39%:** elégtelen (1)
* **40–49%:** elégséges (2)
* **50–59%:** közepes (3)
* **60–79%:** jó (4)
* **80–100%:** jeles (5)

*Figyelem:* Ha bármelyik vizsgatevékenység eredménye 40% alatt van, a vizsga sikertelen.

#### A projektfeladat pontozási struktúrája (300 perc)
1. **Portfólió és szóbeli védése (20%):** Szakszerű szöveges leírás (5%), saját rajzi dokumentáció (5%), kivitelezési fázisok dokumentálása (5%), szóbeli védés és önreflexió (5%).
2. **Épületvillamossági szerelés (40%):** Rajzi dokumentáció értelmezése (10%), eszközök és mérőeszközök kiválasztása, helyes használata (20%), a végrehajtott feladat, mérési/ellenőrzési eredmények bemutatása és megvédése (10%).
3. **Fogyasztásmérő hely (40%):** Mérőszekrény, mérő, esztétikai kivitel (5%), túláram- és túlfeszültség-védelem, helyes technológia (5%), áramütés elleni védelem (20%), kábel- és vezetékbekötés a főelosztóba (10%).

*Kritikus szabály:* **A védővezető (PE) hiánya, helytelen bekötése vagy az áramütés elleni védelem kialakításában elkövetett hiba az egész vizsga azonnali érvénytelenítését (sikertelenségét) vonja maga után!**

---

### 1.2. Munkavédelem és a Feszültségmentesítés Szabályai

#### A feszültségmentesítés 5+1 lépése (MSZ 1585:2016 / MSZ EN 50110-1)
A munkavégzés megkezdése előtt a feszültségmentesítést szigorúan az alábbi sorrendben kell végrehajtani:

* **0. Lépés (Azonosítás):** A berendezés beazonosítása, meggyőződés arról, hogy a tervezett áramkör kapcsolható és biztonságosan hozzáférhető.
* **1. Teljes leválasztás:** Minden lehetséges betáplálási oldalról történő kikapcsolás (kismegszakítók, főkapcsolók, szakaszolók nyitása).
* **2. Visszakapcsolás elleni biztosítás:** A kapcsolókészülékek elreteszelése (pl. egyedi lakat alkalmazásával), és figyelmeztető tiltótábla elhelyezése (*„Ne kapcsold be, dolgoznak!”*).
* **3. A feszültség nélküli állapot ellenőrzése:** Kétpólusú feszültségvizsgálóval (MSZ EN 61243-3) kell ellenőrizni minden pólus és a PE/föld között (L–N, L–PE, N–PE). *A feszültségvizsgáló működőképességét a mérés előtt ÉS után is ismert feszültségforráson vagy beépített tesztelővel ellenőrizni kell!*
* **4. Földelés és rövidrezárás:** Először a földelőberendezéshez/sínhez kell csatlakoztatni a szerkezetet, és csak ezt követően a földelendő fázisvezetőkre (leszereléskor fordított sorrend).
* **5. A szomszédos, feszültség alatt álló részek elleni védelem:** Letakarás, elkerítés, védőburkolatok vagy jelzőszalagok/zászlók kihelyezése.

*Szigorú tilalom:* **A fázisceruza (egypólusú feszültségkereső) használata a feszültségmentesség megállapítására TILOS és életveszélyes!**

#### Szerszám- és műszerválasztási mátrix

| Művelet / Feladat | Szabványos, elfogadott eszköz | NEM elfogadott / Tilos eszköz |
| :--- | :--- | :--- |
| Nyomvonal kijelölés | Mérőszalag, vízmérték, ácsceruza | Becslés, szabadkézi rajz |
| Kábelcsatorna vágása | Finomfogú fémfűrész + gérvágóláda (45°/90°) | Sarokcsiszoló (megolvasztja a PVC-t), oldalcsípő |
| Vágott élek eldolgozása | Sorjázó, kézi reszelő | Megmunkálás elhagyása (a sorja sérti a szigetelést) |
| Vezeték csupaszolása | Automata csupaszoló fogó (8–14 mm) | Csupaszítókés (bevághatja a réz ereket) |
| Csavaros kötések meghúzása | VDE szigetelt csavarhúzó (1000 V, MSZ EN 60900) | Szigeteletlen csavarhúzó |
| Feszültségmentesítés vizsgálata | Kétpólusú feszültségvizsgáló | Fázisceruza, érintés nélküli feszültségjelző toll |
| Szigetelési ellenállás / PE mérés | Installációs multifunkciós műszer | Sima univerzális multiméter |
| Üzemi áram mérése | Lakatfogó | Multiméter (áramkör megszakításával) |

---

### 1.3. Érintésvédelem és Hálózati Rendszerek

A villamos berendezések alapvető védelmi struktúrája az alapvédelemből (üzemi feszültség alatti részek érintése elleni védelem: szigetelés, burkolat) és a hibavédelemből (testzárlat esetén fellépő feszültség elleni védelem) áll.

#### Hálózati rendszerek típusai (MSZ HD 60364-1)
* **TN-C:** A nulla (N) és védővezető (PE) a teljes hálózaton egy közös vezetőben (PEN) egyesített. Új lakóépületi belső szerelésnél nem alkalmazható.
* **TN-S:** A táplálástól kezdve külön N (kék) és külön PE (zöld-sárga) vezető fut.
* **TN-C-S:** A hálózat elején PEN vezető fut, amelyet a mérőhelyen vagy a főelosztóban szétválasztunk N és PE vezetőkre. **A szétválasztási pont után a PE és N vezetőket újra összekötni szigorúan TILOS!**
* **TT:** A táppont közvetlenül földelt, a fogyasztói berendezés testei tőle független saját földelőre vannak kötve. Alapvető védelmi eszköze az áram-védőkapcsoló (ÁVK).

```
TN-C-S Szétválasztási elv:
Méretlen PEN ───► [ PE-sín (Főföldelő) ] ──┬──► PE vezető (zöld-sárga)
                         │ (Áthidalás)     │
                         ▼                 └──► Fő EPH vezető (≥ 6 mm² Cu)
                    [ N-sín ] ───────────────► N vezető (kék) (ÁVK-n át!)
```

#### Önműködő lekapcsolás TN rendszerben
A táplálás önműködő lekapcsolásának feltétele testzárlat esetén:
$$Z_s \le \frac{U_0}{I_a}$$

Hol:
* $Z_s$: A hibahurok-impedancia ($\Omega$).
* $U_0$: A névleges fázisfeszültség a földhöz képest ($230\,\text{V}$).
* $I_a$: A védelmi készülék előírt időn belüli kioldását biztosító áram ($A$).
  * B jelleggörbéjű kismegszakító: $I_a = 5 \cdot I_n$ (Pl. B16 esetén $I_a = 80\,\text{A} \rightarrow Z_s \le 230 / 80 = \mathbf{2{,}88\,\Omega}$).
  * C jelleggörbéjű kismegszakító: $I_a = 10 \cdot I_n$ (Pl. C16 esetén $I_a = 160\,\text{A} \rightarrow Z_s \le 230 / 160 = \mathbf{1{,}44\,\Omega}$).

#### Megengedett lekapcsolási idők ($230\,\text{V}$, $\le 32\,\text{A}$ végáramkörökben)
* **TN rendszerben:** max. **0,4 s**
* **TT rendszerben:** max. **0,2 s**

#### Áram-védőkapcsoló (ÁVK / Fi-relé) használata
* **Működési elv:** Az összegző áramváltó a fázis(ok) és a nullavezető áramainak vektoros összegét méri. Ha a bemenő és visszatérő áramok különbsége eléri a névleges hibaáramot ($I_{\Delta n}$), a készülék lekapcsol.
* **Kötelező kiegészítő védelem ($I_{\Delta n} \le 30\,\text{mA}$):**
  1. Átlagos személyek által használt, $\le 32\,\text{A}$ névleges áramú dugaszolóaljzatok áramkörei.
  2. Szabadtéren használt, $\le 32\,\text{A}$ hordozható készülékek.
  3. Lakásokban a világítási végáramkörök (MSZ HD 60364-4-41:2017).
* **Szabályok:** Az ÁVK-n az összes fázisvezetőnek és a nullavezetőnek át kell haladnia. **A PE (védővezető) soha nem mehet át az ÁVK-n!**
* **Típusok:**
  * **AC:** Csak szinuszos váltakozó hibaáramra.
  * **A:** Szinuszos és lüktető egyenáramú hibaáramra.
  * **B:** Sima egyenáramú hibaáram kiszűrésére is (frekvenciaváltókhoz, napelem inverterekhez).

#### Érintésvédelmi osztályok
* **I. osztály:** Alapszigetelés + a fémtest PE-vezetőre kötése.
* **II. osztály:** Kettős vagy megerősített szigetelés. *Védővezetőt bekötni tilos!* (Jele: kettős négyzet $\square$).
* **III. osztály:** Biztonsági törpefeszültségű táplálás (SELV/PELV, $\le 50\,\text{V}$ AC / $120\,\text{V}$ DC).

---

### 1.4. Szerelői Ellenőrzés és Mérések (MSZ HD 60364-6)

Az új vagy felújított villamos berendezés átadása előtt az ellenőrzést az alábbi **kötelező sorrendben** kell végrehajtani:

```
[1. Szemrevételezés] (Feszültségmentesen)
        │
        ▼
[2. PE és EPH folytonosság mérése] (Mérőáram ≥ 0,2 A)
        │
        ▼
[3. Szigetelési ellenállás mérése] (500 V DC, R ≥ 1 MΩ, L+N a PE-hez)
        │
        ▼
[4. Hurokimpedancia (Zs) mérése] (Feszültség alatt, L–PE között)
        │
        ▼
[5. ÁVK vizsgálata] (Kioldási idő ≤ 300 ms IΔn-nél, Teszt gomb)
        │
        ▼
[6. Működési próbák] (Kapcsolók, relék, funkciók ellenőrzése)
```

#### Határértékek összefoglaló táblázata

| Mérés / Vizsgálat tárgya | Mérési paraméter / Mérőfeszültség | Elfogadható határérték |
| :--- | :--- | :--- |
| **Védővezetők folytonossága** | $4–24\,\text{V}$ AC/DC, mérőáram $I \ge 0{,}2\,\text{A}$ | Jellemzően $R < 1\,\Omega$ |
| **Szigetelési ellenállás ($230/400\,\text{V}$ hálózat)** | $500\,\text{V}$ DC mérőfeszültség | $R_{szig} \ge \mathbf{1{,}0\,\text{M}\Omega}$ |
| **Szigetelési ellenállás (SELV/PELV)** | $250\,\text{V}$ DC mérőfeszültség | $R_{szig} \ge 0{,}5\,\text{M}\Omega$ |
| **Hálózati fázisfeszültség** | Multiméter AC $750\,\text{V}$ / CAT III | $230\,\text{V} \pm 10\%$ ($207{,}0\,\text{V} - 253{,}0\,\text{V}$) |
| **ÁVK kioldási idő ($I_{\Delta n}$ esetén)** | Célműszer hibaáram-generálással | $t \le 300\,\text{ms}$ |
| **Fő EPH vezető keresztmetszet** | Rézvezető esetén | $A \ge 6\,\text{mm}^2\,\text{Cu}$ |

---

### 1.5. Világítási és Motoros Vezérlések

#### Kapcsolótípusok és bekötési szabályok
* **Alapszabály:** A kapcsoló mindig a **fázisvezetőt (L)** bontja! A lámpa a nullát (N) és a védővezetőt (PE) közvetlenül kapja.

```
101 (Egypólusú):     L ───[ 101 ]─── Kapcsolt L ───( Lámpa )─── N
105 (Csillár):       L ───┬─[ 105 / 1 ]─── Kapcsolt L1 ───( Lámpa 1 )─── N
                          └─[ 105 / 2 ]─── Kapcsolt L2 ───( Lámpa 2 )─── N
106 (Váltó):         L ───[ V1 ] ═══ Korrespondáló (2 ér) ═══ [ V2 ] ─── Kapcsolt L ───( Lámpa )
107 (Kereszt):       ... [ V1 ] ═══ Korrespondáló ═══ [ K107 ] ═══ Korrespondáló ═══ [ V2 ] ...
```

#### Ipari motorvezérlések alapelvei
* **Csillag-delta ($\text{Y}/\Delta$) indítás:**
  * Alkalmazhatóság: A motor adattábláján $\Delta/Y\,\,400/690\,\text{V}$ szerepel (a hálózati vonali feszültségen, azaz $400\,\text{V}$-on üzemszerűen deltában működik).
  * Hatása: Az indítási áram és az indítónyomaték a közvetlen indításhoz képest **$1/3$-ára** csökken.
  * Sorrend: Főmágneskapcsoló ($K1$) + Csillagmágneskapcsoló ($KY$) behúz $\rightarrow$ Motor felgyorsul $\rightarrow$ Időrelé lejár $\rightarrow$ $KY$ elenged $\rightarrow$ Delta mágneskapcsoló ($K\Delta$) behúz.
  * *Reteszelés:* $KY$ és $K\Delta$ között **kötelező a villamos és/vagy mechanikus reteszelés** (a két mágneskapcsoló egyidejű behúzása fáziszárlatot okoz!).
* **Forgásirányváltás:** Két tetszőleges fázisvezető felcserélésével valósul meg, a két mágneskapcsoló között kötelező a kölcsönös reteszeléssel (bontó segédérintkezők beépítésével).
* **Mágneskapcsoló és hőkioldó kapocsjelölések:**
  * Működtető tekercs: **A1–A2**
  * Főérintkezők: **1–2, 3–4, 5–6**
  * Záró segédérintkező (pl. öntartásra): **13–14**
  * Hőkioldó bontó érintkezője (vezérlés megszakítására): **95–96**
  * Hőkioldó záró érintkezője (hibajelzésre): **97–98**

---

### 1.6. Fogyasztásmérő Hely és Kábelcsatornázási Technológia

#### Egyfázisú direkt fogyasztásmérő hely bekötési elve (1–3–4–6 kiosztás)
* **1-es kapocs:** Méretlen L (fázis) bemenet a főkismegszakítótól (pl. B32).
* **3-as kapocs:** Mért L (fázis) kimenet a lakás főelosztója felé.
* **4-es kapocs:** N (nulla) bemenet (a PE-sínről áthidalt N-pontról).
* **6-os kapocs:** Mért N (nulla) kimenet a lakás főelosztója felé.

```
Méretlen L ───► [ Főkismegszakító (B32) ] ───► Mérő 1. kapocs
                                              Mérő 3. kapocs ───► Mért L (Főelosztó ÁVK)
Bejövő PEN ───► [ PE-sín (Főföldelő) ] ───────► Mérő 4. kapocs
                      │                       Mérő 6. kapocs ───► Mért N (Főelosztó ÁVK)
                      └── EPH (≥ 6 mm² Cu)
```

*Szerelési előírások mérőhelyen:*
* Szigetelés a fal és a mérőszekrény között: XPS hőszigetelő lap (min. 5 cm) beépítése kötelező a hőhíd és a belső fali penészesedés elkerülésére.
* Földelőszonda telepítése: 1,5 m-es toldható acél szondák leütése bontókalapáccsal. A földelési ellenállás célértéke $R_A \le 10\,\Omega$.
* Vezeték-keresztmetszet mérőhelyen: $\min. 10\,\text{mm}^2\,\text{Cu}$ (H07V-K).

#### Kábelcsatornázás szabályai
* PVC csatorna illesztése: Gérvágás $45^\circ$-os szögben, vágás utáni kötelező sorjázással.
* Rögzítés panellakásban/falon: Beütő dűbel ($5 \times 25\,\text{mm}$ vagy $5 \times 30\,\text{mm}$) a csatorna tengelyvonalában lefúrva, kb. $30–50\,\text{cm}$-es osztással.
* Kivitelezési pontosság: A csatornaelemek illesztési pontossága $\pm 2\,\text{mm}$-en belül elfogadható.

---

### 1.7. Fontosabb Számítási Képletek

1. **Egyfázisú hatásos teljesítmény:** $P = U \cdot I \cdot \cos\varphi$
2. **Háromfázisú hatásos teljesítmény:** $P = \sqrt{3} \cdot U \cdot I \cdot \cos\varphi$
3. **Vezeték ellenállása:** $R = \rho \cdot \frac{l}{A}$  
   *(ahol $\rho_{Cu} = 0{,}0178\,\frac{\Omega \cdot \text{mm}^2}{\text{m}}$)*
4. **Egyfázisú feszültségesés (oda-vissza út!):**  
   $$\Delta U = \frac{2 \cdot I \cdot l \cdot \rho}{A} \quad \text{és} \quad \varepsilon = \frac{\Delta U}{U_0} \cdot 100\%$$
5. **Háromfázisú szimmetrikus feszültségesés:**  
   $$\Delta U = \frac{\sqrt{3} \cdot I \cdot l \cdot \rho \cdot \cos\varphi}{A}$$
6. **Villamos munka és költség:** $W = P \cdot t \quad \text{és} \quad \text{Költség} = W \cdot \text{Egységár}$
7. **Napelem modul feszültségének hőmérsékleti korrekciója:**  
   $$U_{OC}(T) = U_{OC,STC} \cdot \left(1 + \frac{\alpha_{Uoc}}{100} \cdot \Delta T\right)$$

---

## 2. Gyakorló Kérdésbank (Megoldásokkal és Magyarázatokkal)

### 2.1. Anyag- és alkatrészismeret

**a-001. Válassza ki, mely állítások igazak az NYM-J 3x1,5 jelű vezetékre!**
- [x] Az érszigetelés és a köpeny anyaga PVC.
- [x] Tartalmaz zöld-sárga színű (védővezetőként használható) eret.
- [ ] Közvetlenül földbe fektethető kábel.
- [x] Erei 1,5 mm² keresztmetszetű réz vezetők.
- [ ] Alumínium vezetőjű vezeték.  
*Magyarázat:* NYM: N = szabványos típus, Y = PVC szigetelés, M = köpenyes szerelővezeték. A -J jelzi a zöld-sárga ér jelenlétét. Épületen belüli rögzített szerelésre való, földbe nem fektethető (arra az NYY alkalmas).

**a-002. Mit jelent a H07V-U vezeték jelölésében az „U” betű?**
- [x] Tömör, egyhuzalos vezető (merev).
- [ ] Sodrott, többhuzalos merev vezető.
- [ ] Finomhuzalos, hajlékony vezető.
- [ ] UV-álló szigetelés.  
*Magyarázat:* MSZ HD 361 szerint: U = tömör (egyhuzalos), R = sodrott merev, K = finomhuzalos rögzített fektetésre, F = hajlékony (zsinór). H = harmonizált, 07 = 450/750 V.

**a-003. Milyen színű a nullavezető (N) az MSZ EN 60445 szerint?**
- [x] Kék
- [ ] Fekete
- [ ] Szürke
- [ ] Zöld-sárga  
*Magyarázat:* N = kék; PE = zöld-sárga; ajánlott fázisszínek: L1 barna, L2 fekete, L3 szürke.

**a-004. Mire használható a zöld-sárga színű vezeték?**
- [x] Kizárólag védővezetőként (PE), illetve PEN vezetőként (végein kék jelöléssel).
- [ ] Bármilyen célra, ha a végeit átjelöljük szigetelőszalaggal.
- [ ] Kapcsolt fázisvezetőként.
- [ ] Fázisvezetőként, ha a barna elfogyott.  
*Magyarázat:* A zöld-sárga színkombináció kizárólag védelmi célokat szolgál, üzemi fázisvezetőként még átjelölve sem használható.

**a-005. Mit jelent a kismegszakítón olvasható „C16” jelölés?**
- [x] C kioldási jelleggörbe (5–10·In zárlati kioldás), 16 A névleges áram.
- [ ] 16 kA zárlati megszakítóképesség, C osztály.
- [ ] C típusú áram-védőkapcsoló, 16 mA kioldóáram.
- [ ] 16 A-es egyenáramú megszakító.  
*Magyarázat:* A betű a zárlati gyorskioldó jelleggörbéje (B: 3–5·In, C: 5–10·In, D: 10–20·In), a szám a névleges üzemi áram Amperben.

**a-006. Finomhuzalos (pl. H07V-K) vezetőt kell csavaros sorkapocsba kötni. Melyik szerszám szükséges a szakszerű bekötéshez?**
- [x] Érvéghüvely-krimpelő (préselő) fogó és érvéghüvely.
- [ ] Forrasztópáka és ón (a vég beforrasztásához).
- [ ] Kombinált fogó a sodráshoz.
- [ ] Csőhajlító rugó.  
*Magyarázat:* A finomhuzalos vezető végét érvéghüvelyezni kell. A beforrasztott vezetékvég a csavar alatti hidegfolyás miatt idővel meglazul, ami kontakt-hibát és tüzet okozhat.

---

### 2.2. Technológia

**t-001. Rendezze a csillag-delta indítás lépéseit a helyes sorrendbe!**
1. Az indítógomb megnyomásával a fő mágneskapcsoló ($K1$) és a csillag mágneskapcsoló ($KY$) behúz.
2. A motor csillag kapcsolásban felgyorsul, közben fut az időrelé.
3. Az időrelé beállított idejének lejárta után a csillag mágneskapcsoló ($KY$) elenged.
4. A delta mágneskapcsoló ($K\Delta$) behúz, és a motor delta üzemben fut tovább.

**t-002. Hogyan lehet egy háromfázisú aszinkronmotor forgásirányát megváltoztatni?**
- [x] Két tetszőleges fázisvezető egymás közötti felcserélésével.
- [ ] Mindhárom fázis ciklikus cseréjével (L1→L2→L3→L1).
- [ ] A nullavezető és az L1 felcserélésével.
- [ ] A csillagpont földelésével.  
*Magyarázat:* Két fázis cseréje megfordítja a forgó mágneses mező irányát. A ciklikus csere a fázissorrendet nem változtatja meg.

**t-003. Hogyan kell bekötni a motort csillag kapcsoláshoz a kapocstáblán?**
- [x] U2, V2, W2 kapcsokat rövidre zárjuk (áthidaljuk), a hálózatot az U1, V1, W1 kapcsokra kötjük.
- [ ] U1–W2, V1–U2, W1–V2 kapcsokat függőlegesen áthidaljuk.
- [ ] U1, V1, W1 kapcsokat zárjuk rövidre.
- [ ] Csak U1 és V1 kapocsra adunk feszültséget.  
*Magyarázat:* Csillag kapcsolásban a tekercsvégek (U2, V2, W2) alkotják a csillagpontot. A függőleges áthidalás a delta kapcsolásnak felel meg.

**t-004. Milyen nyomvonalon kell vezetni a vakolat alatti (süllyesztett) vezetékeket?**
- [x] Kizárólag vízszintesen és függőlegesen, a falélekkel párhuzamosan.
- [ ] A legrövidebb úton, átlósan ferdén.
- [ ] Tetszőlegesen, ha van róla fénykép.
- [ ] Csak a padló szegélyében.  
*Magyarázat:* A szabályos nyomvonalbiztosítás garantálja, hogy később fúrási munkáknál a rejtett vezetékek helye kikövetkeztethető legyen.

**t-005. Melyik vezetékkötés szabályos egy elágazó dobozban?**
- [x] Rugós vagy csavaros, szabványos összekötő kapocs (pl. WAGO rugós kötőelem).
- [ ] Ereket összesodorni és szigetelőszalaggal betekerni.
- [ ] Összesodrás és csomózás.
- [ ] Kötés nélkül egymás mellé helyezés.  
*Magyarázat:* A kötéseknek tartós villamos folytonosságot és megfelelő mechanikai kötést kell biztosítaniuk. A sodort-szigetelőszalagos kötés szigorúan tilos.

---

### 2.3. Számítások

**s-001. Egyfázisú $230\,\text{V}$-os áramkör: a fogyasztó árama $16\,\text{A}$, a vezeték nyomvonalhossza $20\,\text{m}$, keresztmetszete $2{,}5\,\text{mm}^2$ réz ($\rho = 0{,}0178\,\frac{\Omega \cdot \text{mm}^2}{\text{m}}$). Mekkora a feszültségesés a vezetéken?**
- [ ] $2{,}28\,\text{V}$
- [x] $4{,}56\,\text{V}$
- [ ] $9{,}11\,\text{V}$
- [ ] $11{,}39\,\text{V}$  
*Számítás:* $\Delta U = \frac{2 \cdot I \cdot l \cdot \rho}{A} = \frac{2 \cdot 16 \cdot 20 \cdot 0{,}0178}{2{,}5} = \frac{11{,}392}{2{,}5} = 4{,}5568\,\text{V} \approx 4{,}56\,\text{V}$.

**s-002. Egy szimmetrikus háromfázisú fogyasztó $3 \times 400\,\text{V}$-os hálózatról $16\,\text{A}$ vonali áramot vesz fel, $\cos\varphi = 0{,}85$. Mekkora a hatásos teljesítménye?**
- [ ] $5{,}44\,\text{kW}$
- [x] $9{,}42\,\text{kW}$
- [ ] $11{,}09\,\text{kW}$
- [ ] $16{,}32\,\text{kW}$  
*Számítás:* $P = \sqrt{3} \cdot U \cdot I \cdot \cos\varphi = 1{,}732 \cdot 400 \cdot 16 \cdot 0{,}85 = 9422\,\text{W} \approx 9{,}42\,\text{kW}$.

**s-003. TN rendszerű $230\,\text{V}$-os végáramkört B16 kismegszakító véd ($I_a = 5 \cdot I_n$). Legfeljebb mekkora lehet a hibahurok-impedancia ($Z_s$)?**
- [ ] $1{,}44\,\Omega$
- [x] $2{,}88\,\Omega$
- [ ] $14{,}4\,\Omega$
- [ ] $28{,}8\,\Omega$  
*Számítás:* $I_a = 5 \cdot 16 = 80\,\text{A}$. $Z_s \le \frac{U_0}{I_a} = \frac{230}{80} = 2{,}875\,\Omega \approx 2{,}88\,\Omega$.

**s-004. TT rendszerben a berendezést $300\,\text{mA}$-es ÁVK véd, az engedélyezett érintési feszültség $U_L = 50\,\text{V}$. Legfeljebb mekkora lehet a testek földelési ellenállása ($R_A$)?**
- [ ] $16{,}7\,\Omega$
- [x] $166{,}7\,\Omega$
- [ ] $1667\,\Omega$
- [ ] $6000\,\Omega$  
*Számítás:* $R_A \cdot I_{\Delta n} \le 50\,\text{V} \rightarrow R_A \le \frac{50}{0{,}3} = 166{,}66\,\Omega \approx 166{,}7\,\Omega$.

---

### 2.4. Villamos biztonság és felülvizsgálat

**b-001. Az alábbiak közül melyek a belső villámvédelem eszközei?**
- [x] Villámvédelmi potenciálkiegyenlítés (EPH).
- [x] Túlfeszültség-védelmi eszközök (SPD) az elosztókban.
- [x] Biztonsági elválasztási távolság betartása.
- [ ] Tetőn lévő felfogó rúd.
- [ ] Földelő szonda.  
*Magyarázat:* A felfogó, levezető és földelő a külső villámvédelem részei. Az SPD és az EPH a belső villámvédelemhez tartozik.

**b-002. Mekkora mérőfeszültséggel és milyen határértékkel kell vizsgálni egy $230/400\,\text{V}$-os lakásberendezés szigetelési ellenállását?**
- [x] $500\,\text{V}$ DC mérőfeszültség, $\ge 1{,}0\,\text{M}\Omega$.
- [ ] $250\,\text{V}$ DC mérőfeszültség, $\ge 0{,}5\,\text{M}\Omega$.
- [ ] $1000\,\text{V}$ DC mérőfeszültség, $\ge 1{,}0\,\text{M}\Omega$.
- [ ] $230\,\text{V}$ AC mérőfeszültség, $\ge 0{,}25\,\text{M}\Omega$.  
*Magyarázat:* Az MSZ HD 60364-6 szerint $500\,\text{V}$-ig terjedő névleges feszültségű áramköröknél (SELV/PELV kivételével) $500\,\text{V}$ DC mérőfeszültség és legalább $1{,}0\,\text{M}\Omega$ szigetelési ellenállás az előírás.

**b-003. Milyen védelmi funkciót tölt be a napelem modulban lévő megkerülő (bypass) dióda?**
- [x] Árnyékolt cellacsoportot áthidal, megelőzve a teljesítményveszteséget és a hot-spot (forró pont) túlmelegedést.
- [ ] Védi a rendszert a villámcsapástól.
- [ ] Átalakítja a DC feszültséget AC feszültséggé.
- [ ] Növeli a string üresjárási feszültségét.  
*Magyarázat:* Részleges árnyékoláskor a nem termelő cella fogyasztóvá válna és átforrósodna. A bypass dióda nyit, és kikerüli a veszélyeztetett cellasort.

---

## 3. Esszé- és Kifejtős Kérdések (Mélyebb Megértéshez)

### 3.1. Kifejtős feladat: Szerelői ellenőrzés jegyzőkönyvezése és folyamata
**Feladat:** Mutassa be részletesen egy újonnan szerelt családi ház villamos berendezésének első szerelői ellenőrzési folyamatát az MSZ HD 60364-6 szabvány szerint! Fejtse ki a mérések sorrendjét, a használt műszerek típusát és a minimálisan elvárt mérési határértékeket!

*Kidolgozási útmutató / Főbb pontok:*
1. **Szemrevételezés:** Feszültség alá helyezés előtti ellenőrzés (vezetékszínek, kötések, szerszámnyom-mentesség, IP-védettség, feliratozás).
2. **PE és EPH folytonosság mérése:** $4–24\,\text{V}$ DC/AC feszültségű, min. $0{,}2\,\text{A}$ mérőáramú műszerrel. Elvárt érték $R < 1\,\Omega$.
3. **Szigetelési ellenállás mérése:** Feszültségmentes állapotban, az összes fogyasztó lekapcsolása mellett, L+N összezárva a PE-hez képest. $500\,\text{V}$ DC mérőfeszültség, határérték $R_{szig} \ge 1{,}0\,\text{M}\Omega$.
4. **Hurokimpedancia mérés:** Feszültség alatti mérés a legvisszafogottabb ponton (aljzatoknál L–PE között). Összevetés a kismegszakító $I_a$ áramával ($Z_s \le U_0/I_a$).
5. **ÁVK tesztelése:** Névleges hibaáram generálása céleszközzel ($I_{\Delta n} = 30\,\text{mA} \rightarrow t \le 300\,\text{ms}$), valamint a próbagomb ($T$) megnyomása.
6. **Jegyzőkönyv tartalma:** Mérési hely, dátum, műszer típusa/gyári száma/méréshatára, mért és számított értékek, minősítés (*„Megfelelt / Nem felelt meg”*).

---

### 3.2. Kifejtős feladat: Fogyasztásmérő hely kialakítása TN-C-S rendszerben
**Feladat:** Írja le egy egyfázisú, $32\,\text{A}$-es szabványos fogyasztásmérő hely építési és bekötési lépéseit! Különösen térjen ki a PEN-szétválasztás szabályaira, a főkismegszakító elhelyezésére, a méretlen/mért áramkörök szétválasztására és a fő földelősín EPH bekötésére!

*Kidolgozási útmutató / Főbb pontok:*
1. **Szerelés előkészítése:** Szigetelő XPS lap (min. 5 cm) felszerelése a mérődoboz mögé a hőhíd megelőzésére. Földelőszonda leütése, RD10 acélvezető bevezetése.
2. **Méretlen oldal:** A bejövő fázisvezeték a plombálható téri főkismegszakítóba (B32) érkezik. A főkismegszakítóból elmenő $10\,\text{mm}^2$-es fázisvezető a mérő 1-es kapocsba csatlakozik.
3. **PEN szétválasztás:** A bejövő PEN vezető a fő földelősínre (PE-sín) érkezik. Innen készül egy áthidaló híd az N-sínre/mérő 4-es kapocsra. A szétválasztási pont be van kötve a földelőszondára és a fő EPH vezetőre ($\min. 6\,\text{mm}^2\,\text{Cu}$).
4. **Mérőbekötés:** 1-es kapocs: Méretlen L; 3-as kapocs: Mért L (megy a lakáselosztó ÁVK-jára); 4-es kapocs: N bemenet; 6-os kapocs: Mért N kimenet (megy a lakáselosztó ÁVK-jára).
5. **Szigorú szabályok:** A mérő elé ÁVK nem tehető (csak a mért oldalra). A szétválasztott PE és N vezetőt utólagosan összekötni TILOS. A PEN/PE vezetőbe kapcsoló- vagy védőeszköz nem építhető be.

---

### 3.3. Kifejtős feladat: Portfólió védés és önreflexió szimulációja
**Feladat:** Készüljön fel a 10 perces portfólió védésre! Ismertesse a bemutatás javasolt időbeosztását és struktúráját, valamint adjon válaszokat a leggyakoribb bizottsági keresztkérdésekre!

*Kidolgozási útmutató / Főbb pontok:*
* **10 perces szóbeli szerkezet:**
  1. *1. perc:* Munka bemutatása (helyszín, épület leírása, saját feladatkör).
  2. *3. perc:* Kivitelezés menetének részletezése (tervezés, anyagválasztás, indoklás, szerelési fázisok fotókkal).
  3. *2. perc:* Ellenőrzések és mérések (folytonosság, szigetelés, hurokimpedancia, eredmények kiértékelése).
  4. *2. perc:* Rajzi dokumentáció magyarázata (egyvonalas rajz, áramútrajz értelmezése).
  5. *2. perc:* Önreflexió (mi sikerült jól, mit csinálna másképp, tanulságok).
* **Gyakorló válaszok bizottsági kérdésekre:**
  * *Miért B16 kismegszakítót választott a $2{,}5\,\text{mm}^2$-es dugaljvezetékhez?* $\rightarrow$ Mert a vezeték $I_z$ terhelhetőségéhez ($19{,}5\,\text{A}$) igazodva a B16 biztosítja az $I_B \le I_n \le I_z$ feltételt, a B jelleggörbe pedig lakossági terhelésekhez megfelelő kioldási sebtséget ad.
  * *Mi történik, ha egy dugalj védőérintkezője nincs bekötve (szakadt PE)?* $\rightarrow$ A rákötött I. érintésvédelmi osztályú készülék alapszigetelés-hibája esetén a fémtest tartósan $230\,\text{V}$ alá kerül, a kismegszakító nem old ki, és az ÁVK is csak akkor lép működésbe, ha egy ember megérinti a testet (áramütés éri).

---

## 4. Fogalomtár / Glosszárium

| Fogalom / Rövidítés | Meghatározás és Magyarázat |
| :--- | :--- |
| **ÁVK / Fi-relé** | Áram-védőkapcsoló. Kiegészítő védelmi eszköz, amely a fázis(ok) és a nulla áramainak vektoros különbségét (hibaáram) érzékelve választja le a hálózatot. |
| **EPH** | Egyenpotenciálra hozó hálózat. Az épület fémhálózatait (víz, gáz, fűtés, fém szerkezetek) összekötő védővezető rendszer, amely megelőzi a feszültségkülönbségek kialakulását. |
| **PEN vezető** | Egyesített védő- és nullavezető (Protective Earth and Neutral). Zöld-sárga színű, végein kék átjelöléssel rendelkező vezető TN-C rendszerben. |
| **PE vezető** | Védővezető (Protective Earth). Kizárólag zöld-sárga szigetelésű vezető, amely a testeket köti össze a földelőrendszerrel. |
| **N vezető** | Nullavezető (Neutral). Kék színű üzemi vezető, amely a fogyasztó visszatérő áramát vezeti. |
| **Hurokimpedancia ($Z_s$)** | A hibaáram útjának teljes komplex ellenállása a fázis–testzárlat keletkezési helyétől a táptranszformátorig és vissza a PE vezetőn át. |
| **Kismegszakító (MCB)** | Túláramvédelmi készülék, amely túlterhelés esetén (bimetall/hőkioldó) és zárlat esetén (elektromágneses gyorskioldó) önműködően lekapcsol. |
| **B jelleggörbe** | Kismegszakító kioldási karakterisztika. Zárlati gyorskioldása $3–5 \cdot I_n$ között történik. Lakossági világítási és általános dugaljáramkörökhöz. |
| **C jelleggörbe** | Kismegszakító kioldási karakterisztika. Zárlati gyorskioldása $5–10 \cdot I_n$ között történik. Indítási áramcsúccsal rendelkező motorokhoz, transzformátorokhoz. |
| **SELV / PELV** | Safety / Protective Extra Low Voltage. Biztonsági törpefeszültség ($\le 50\,\text{V}$ AC), amely védőelválasztású forrásból származik. |
| **IP-védettség** | Ingress Protection. A villamos berendezések burkolatának környezeti behatások (szilárd testek és víz) elleni védettségi fokozata (pl. IP44, IP65). |
| **SPD** | Surge Protective Device. Túlfeszültség-védelmi eszköz (villámáram- és túlfeszültség-levezető T1, T2, T3 fokozatokban). |
| **H07V-U** | Harmonizált, $450/750\,\text{V}$-os, PVC szigetelésű, tömör rézvezetőjű egyerű vezeték (védőcsőbe, csatornába). |
| **H07V-K** | Harmonizált, $450/750\,\text{V}$-os, PVC szigetelésű, finomhuzalos (hajlékony) rézvezetőjű egyerű vezeték (érvéghüvelyezendő). |
| **NYM-J** | PVC köpenyes szerelővezeték, tömör réz erekkel, épületen belüli rögzített szerelésre (van zöld-sárga ér benne). |
| **NYY-J** | PVC szigetelésű és köpenyű erősáramú kábel, amely közvetlenül földbe (homokágyba) fektethető. |
| **H1Z2Z2-K** | Szabványos, $1{,}5\,\text{kV}$ DC névleges feszültségű, UV- és időjárásálló, halogénmentes szolár kábel napelem rendszerekhez. |
| **CYKY** | Cseh eredetű, elterjedt rézvezetőjű, PVC érszigetelésű és PVC köpenyű szerelőkábel. |
| **Szigetüzem-védelem** | Anti-islanding védelem napelem invertereknél. A közcélú hálózat feszültségkimaradása esetén azonnal lekapcsolja az invertert a hálózatról a visszatáplálási balesetek megelőzésére. |
| **Gérvágás** | Kábelcsatornák és védőcsövek sarokillesztési technológiája $45^\circ$-os szögben történő precíziós vágással. |