# 4. modul – Szerelői ellenőrzés, mérések, jegyzőkönyv

## A szerelői ellenőrzés sorrendje (MSZ HD 60364-6)
1. **Szemrevételezés** – feszültség alá helyezés előtt: vezetékszínek, kötések, PE mindenhol, burkolatok, feliratok.
2. **Vezetők folytonossága** – védővezetők és EPH: kis ellenállás (tipikusan < 1 Ω), a műszer mérőárama legalább **0,2 A** (MSZ EN 61557-4).
3. **Szigetelési ellenállás** – feszültségmentesen! 230 V-os áramkörnél **500 V DC mérőfeszültség, határérték ≥ 1 MΩ**. L+N a PE-hez képest. Tipikus jó érték: „> 299 MΩ”.
4. **Az önműködő lekapcsolás ellenőrzése** – hurokimpedancia (Zs) mérése, összevetés a Zs ≤ U0/Ia feltétellel.
5. **ÁVK vizsgálata** – kioldás IΔn-nél (≤ 300 ms), 5·IΔn-nél (≤ 40 ms); a próbagomb (T) megnyomása is.
6. **Működési próbák** – minden kapcsoló, nyomógomb, minden üzemállapot.

A szigetelésmérést **soha** nem szabad feszültség alatt végezni.

## A mintafeladat mérései (2026, nyári konyha)
- **Árammérés lakatfogóval** a 2. áramkör fázisvezetőjén, amikor a „Lámpa 2” világít.
- **Teljesítmény:** P = U · I (izzó / ohmos terhelés: cos φ = 1). Példa: U = 229,4 V, I = 0,262 A → P ≈ 60,1 W.
- **Fázisfeszültség a 2P+F dugaljban** (L–N) multiméterrel; értékelés a tűréshatárhoz: **230 V ± 10% → 207–253 V** (MSZ EN 50160). 254,6 V → nem felel meg.

## A mérési jegyzőkönyv tartalma
- Név, mérőhely száma, dátum.
- **Mérés tárgya** (mit, miért mérünk).
- **Mérőeszközök:** műszer megnevezése, típusa, gyári száma, méréshatára.
- Felhasznált eszközök.
- **Kapcsolási rajz** és a **mérés összeállítása** (hova került a műszer).
- **A mérés leírása**, mért és számított értékek, **értékelés** (megfelel / nem felel meg, mihez képest).

## Funkciópróba és bemutatás
- A felügyelő jelenlétében helyezed feszültség alá: először az ÁVK, aztán a kismegszakítók.
- Bemutatod a működést minden üzemállapotban: váltó–kereszt–váltó mindhárom helyről, mozgásérzékelő, impulzusrelé, lépcsőházi automata kikapcsolási ideje, ÁVK próbagomb.

## Tipikus kérdések
- Mekkora mérőfeszültséggel és milyen határértékre mérsz szigetelést 230 V-os áramkörben? (500 V DC, ≥ 1 MΩ)
- Mi a hálózati feszültség tűréshatára? (230 V ± 10%)
- Hogyan számolod a felvett teljesítményt a mért áramból? (P = U · I · cos φ)
- Miért kell a PE-folytonosságot a szigetelésmérés előtt mérni?
