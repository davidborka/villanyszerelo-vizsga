#!/usr/bin/env python3
"""Önálló, offline tanulási útmutató (index.html) a villanyszerelő vizsgához.
Futtatás: python3 research/guide/build.py   (a research/pack/audio és img tartalmát bemásolja)"""
import html, json, os, shutil

SRC = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(SRC, "..", ".."))
PACK = os.path.join(ROOT, "research", "pack")
VIDEOS = os.path.join(ROOT, "research", "sources", "videos.json")
# a kész útmutató a szimulátor mellé kerül: <oldal>/tanulas/
HERE = os.path.join(ROOT, "public", "tanulas")
e = html.escape

PLAN = [
    ("08:00", 50, "m01-vizsga-strategia", "Kezdd a nagy képpel: mi ér pontot, mi tesz érvénytelenné."),
    ("08:50", 60, "m03-aramutes-elleni-vedelem", "A legtöbb pont és az érvénytelenség kockázata itt van."),
    ("09:50", 45, "m02-munkavedelem", "5 szabály + szerszámválasztás (a projekt 20%-a)."),
    ("10:35", 15, None, "Szünet – mozogj, igyál vizet."),
    ("10:50", 60, "m04-meresek", "Mérések és jegyzőkönyv; utána a szimulátor Ellenőrzés szakasza."),
    ("11:50", 75, "m05-vilagitasvezerlesek", "Bekötések; a szimulátor 1–4. feladata gyakorló módban."),
    ("13:05", 45, None, "Ebéd."),
    ("13:50", 60, "m06-eloszto-csatorna", "Elosztó és csatorna; a nyári konyha vizsga módban, megoldás nélkül."),
    ("14:50", 60, "m07-merohely", "Mérőhely (III. rész, 40%); a szimulátor 5. feladata."),
    ("15:50", 15, None, "Szünet."),
    ("16:05", 60, "m08-interaktiv-vizsga", "Számítások; utána egy teljes 90 perces interaktív vizsga vizsga módban."),
    ("17:05", 30, "m09-portfolio", "Portfólióvédés; 10 perc a Hot Seat vizsgabizottsága előtt."),
    ("este", 30, None, "Ismétlés: tanulókártyák és kvíz a NotebookLM-ben, a hibás kérdéseid újra."),
]

MODULES = [
    {
        "key": "m01-vizsga-strategia", "title": "A vizsga felépítése és a pontszerzés", "min": 15,
        "lead": "Projekt 70% (portfólió 20 + szerelés 40 + mérőhely 40), interaktív 30%; mindkettőn külön 40% kell.",
        "principles": [
            ("A biztonsági hiba mindent visz", "Az áramütés elleni védelem kialakításában elkövetett hiba érvénytelen vizsgát jelent, akármilyen szép a munka. Ezért a vezetékezést a védővezetőkkel kezded, és bekapcsolás előtt szemrevételezel: van-e PE minden lámpatesten és dugaljon, minden áramkör átmegy-e az ÁVK-n, a kapcsoló a fázist bontja-e.",
             "A szimulátorban vizsga módban kötsz be, és az értékelés „ÉRVÉNYTELEN” jelzése megmutatja, ha ilyen hibát hagytál.", "Egy elfelejtett PE miatti érvénytelen vizsga.", "KKK 2024.08.29 v4, 8.13 – projektfeladat értékelése"),
            ("A szerszám- és műszerválasztás 20%", "A II. vizsgarész legnagyobb tétele nem a bekötés, hanem az eszközök és mérőeszközök kiválasztása és helyes használata. A bizottság figyeli, mivel vágsz, mivel ellenőrzöd a feszültségmentességet, és melyik műszerrel mérsz.",
             "A szimulátor Anyag + szerszám szakaszában csak azt vidd, ami kell; a rossz szerszám használata pontlevonás.", "Fázisceruza, nem szigetelt csavarhúzó, flex a csatornához.", "KKK 2024.08.29 v4, 8.13 – II. vizsgarész"),
        ],
        "checks": [("Mekkora súlya van a projektfeladatnak és az interaktív vizsgának?", "70% és 30%; mindkettőn külön legalább 40% kell."),
                   ("Mi tesz érvénytelenné egy egyébként jó munkát?", "Az áramütés elleni védelem hibája (pl. hiányzó PE, ÁVK megkerülése)."),
                   ("Hány százaléktól jeles a szakmai vizsga?", "80%-tól (60–79% jó, 50–59% közepes, 40–49% elégséges).")],
        "cards": [("Portfólió súlya a projektben", "20% (4 × 5%)"), ("Mérőhely súlya a projektben", "40%, ebből áramütés elleni védelem 20%")],
    },
    {
        "key": "m02-munkavedelem", "title": "Munkavédelem és szerszámok", "min": 15,
        "lead": "Az öt szabály sorrendben, kétpólusú vizsgálóval; VDE szerszám, finomfogú fűrész gérvágóládával.",
        "principles": [
            ("Az öt szabály sorrendje", "Leválasztás minden betáplálásról, visszakapcsolás elleni biztosítás, feszültségmentesség ellenőrzése, földelés és rövidrezárás (ahol szükséges), a szomszédos feszültség alatti részek letakarása. A sorrend a lényeg: csak biztosított, leválasztott részen ellenőrzöl, és csak ellenőrzött részen dolgozol.",
             "Az Ellenőrzés szakasz első feladata a sorrend kirakása.", "Feszültség alatti munka – a vizsgán azonnali súlyos hiba.", "MSZ 1585 – Villamos berendezések üzemeltetése"),
            ("Kétpólusú vizsgáló, nem fázisceruza", "A fázisceruza csak jelez, nem mér két pont között, és hamisan mutathat feszültségmentességet. A kétpólusú vizsgálóval L–N, L–PE és N–PE között mérsz, előtte és utána ismert feszültségen kipróbálod.",
             "A szimulátorban a fázisceruzás ellenőrzés kritikus hibaként kerül az értékelésbe.", "Megrázás „feszültségmentesnek hitt” vezetéktől.", "MSZ 1585; MSZ EN 61243-3"),
        ],
        "checks": [("Sorold fel az öt szabályt!", "Leválasztás, visszakapcsolás elleni biztosítás, feszültségmentesség ellenőrzése, földelés-rövidrezárás, szomszédos részek letakarása."),
                   ("Mivel vágod a PVC csatornát 45°-ban?", "Finomfogú fűrésszel gérvágóládában, utána sorjázod."),
                   ("Mivel méred az áramot az áramkör megbontása nélkül?", "Lakatfogóval.")],
        "cards": [("Feszültségmentesség ellenőrzése", "Kétpólusú feszültségvizsgáló"), ("Szigetelés és PE-folytonosság", "Installációs multifunkciós műszer")],
    },
    {
        "key": "m03-aramutes-elleni-vedelem", "title": "Áramütés elleni védelem", "min": 20,
        "lead": "PE mindenhová, 30 mA-es ÁVK, Zs ≤ U0/Ia, TN-C-S szétválasztás után N és PE soha többé nem találkozik.",
        "principles": [
            ("Önműködő lekapcsolás + ÁVK", "Testzárlatkor a kismegszakító akkor old ki gyorsan, ha a hurokimpedancia elég kicsi: Zs ≤ U0/Ia (B16: 230/80 = 2,88 Ω). Ezt egészíti ki a 30 mA-es ÁVK, amely a fázis és a nulla közti áramkülönbségre old ki. Az ÁVK-n az L és az N is átmegy, a PE soha.",
             "A szimulátorban ha a nulla megkerüli az ÁVK-t, bekapcsoláskor az ÁVK tényleg kiold.", "Áramütés hibás készüléknél; „ok nélkül” kioldó ÁVK.", "MSZ HD 60364-4-41:2017, 411"),
            ("PEN-szétválasztás egyszer és végleg", "TN-C-S-nél a PEN-t a főföldelő sínre kötöd, onnan indul külön a PE és az N. Ha utána bárhol újra összekötöd őket, a fogyasztói áram egy része a védővezetőn folyik, az ÁVK kiold, és a PE-n feszültség jelenhet meg.",
             "A szimulátor mérőhely-feladatában az N–PE újraösszekötés kritikus hiba.", "Feszültség a burkolatokon, kioldó ÁVK.", "MSZ HD 60364-5-54, 543.4"),
        ],
        "checks": [("Mekkora lehet a Zs egy B16-os körben?", "Legfeljebb 230/(5·16) = 2,88 Ω."),
                   ("Mely áramkörökben kötelező a 30 mA-es ÁVK?", "≤32 A-es dugaljkörök, szabadtéri hordozható készülékek, lakásban a világítási végáramkörök is."),
                   ("Mire használható a zöld-sárga vezeték?", "Csak PE-re, illetve PEN-re (a végein kék jelöléssel).")],
        "cards": [("Lekapcsolási idő TN, 230 V, ≤32 A", "0,4 s"), ("EPH minimális keresztmetszete", "6 mm² Cu")],
    },
    {
        "key": "m04-meresek", "title": "Szerelői ellenőrzés és mérések", "min": 20,
        "lead": "Szemrevételezés → PE-folytonosság → szigetelés (500 V DC, ≥1 MΩ) → lekapcsolás → ÁVK → funkciópróba; jegyzőkönyv.",
        "principles": [
            ("Mérni csak feszültségmentesen – a szigetelést", "A szigetelésmérő 500 V egyenfeszültséget kapcsol a vezetékekre; feszültség alatt tönkreteheti a műszert és a készülékeket, és hamis eredményt ad. Előtte a PE-folytonosságot méred, hogy legyen mihez mérni.",
             "A szimulátor letiltja a feszültség alatti szigetelésmérést, és hibaként rögzíti.", "Tönkrement műszer, hamis „megfelel”.", "MSZ HD 60364-6:2017, 6.4.3"),
            ("A jegyzőkönyv a mérés része", "A mérés csak akkor ér pontot, ha dokumentálod: mit mértél, milyen műszerrel (típus, gyári szám, méréshatár), milyen kapcsolásban, mi lett az eredmény és megfelel-e. P = U·I-t a mért értékekből számolod, a feszültséget a 230 V ±10%-hoz hasonlítod.",
             "A szimulátor jegyzőkönyve a mért értékeidből ellenőrzi a P-t és a tűrés-értékelést.", "Jó mérés, mégis pontvesztés hiányos jegyzőkönyv miatt.", "Nagykunsági FVK 2026-os mintafeladat, mérési jegyzőkönyv"),
        ],
        "checks": [("Szigetelésmérés 230 V-os körben: mérőfeszültség és határérték?", "500 V DC, ≥ 1 MΩ."),
                   ("Mi a hálózati tűréshatár?", "230 V ± 10% → 207–253 V."),
                   ("U = 229,4 V, I = 0,262 A, izzó. P = ?", "≈ 60,1 W.")],
        "cards": [("PE-folytonosság mérőárama", "≥ 0,2 A"), ("ÁVK kioldási idő IΔn-nél", "≤ 300 ms")],
    },
    {
        "key": "m05-vilagitasvezerlesek", "title": "Világításvezérlések", "min": 20,
        "lead": "101, 105, 106, 107; váltó–kereszt–váltó; impulzusrelé A1–A2 / 11–14; lépcsőházi automata.",
        "principles": [
            ("A kapcsoló a fázist bontja", "Ha a nullát kapcsolod, a lámpa kikapcsolva is feszültség alatt marad – izzócserénél megráz. Ezért a kapcsoló mindig a fázisban van, a lámpa N-t és PE-t közvetlenül kap.",
             "A szimulátor minden kapcsolóállásban ellenőrzi, maradt-e fázis a kikapcsolt lámpán.", "Áramütés izzócserénél.", "MSZ HD 60364-4-46; szakmai gyakorlat"),
            ("Váltó–kereszt–váltó", "L a V1 közösére, a két korrespondáló V1-ről a kereszt 1–2-re, a kereszt 3–4-ről V2 1–2-re, V2 közöse a lámpára. A keresztkapcsoló a két korrespondálót cseréli fel, így bármelyik kapcsoló váltása átbillenti a lámpát.",
             "A Rajzolvasás szakasz áramútrajz-feladata pontosan ezt kéri.", "Csak két helyről működő lámpa.", "Épületvillamossági kapcsolások – szakmai tananyag"),
        ],
        "checks": [("Hány ér fut a váltó és a kereszt között?", "4 (a mintarajz szerint)."),
                   ("Impulzusrelé: hova kötöd a nyomógombokat?", "Párhuzamosan, L-ről az A1-re; A2 → N."),
                   ("Csillárkapcsoló hány lámpakört kapcsol?", "Kettőt, külön és együtt.")],
        "cards": [("106", "Váltókapcsoló (C, 1, 2)"), ("107", "Keresztkapcsoló (1-2 be, 3-4 ki)")],
    },
    {
        "key": "m06-eloszto-csatorna", "title": "Elosztó, csatorna, kivitelezés", "min": 15,
        "lead": "ÁVK 40/30 mA, B10 világítás, B16 dugalj, SPD; 1,5 / 2,5 mm²; mérés, gér, sorja, vízszint.",
        "principles": [
            ("Keresztmetszet és védelem együtt", "A kismegszakító a vezetéket védi: 1,5 mm²-hez B10, 2,5 mm²-hez B16 a szokásos párosítás. Nagyobb kismegszakító (pl. C32) vékony vezetéken nem véd túlterhelés ellen.",
             "A szimulátor a dugaljkör 1,5 mm²-es vezetékét hibának jelzi.", "Melegedő, öregedő vezeték.", "MSZ HD 60364-4-43; MSZ HD 60364-5-52"),
            ("Mérj, ne becsülj", "A gérvágott darab hosszát a hosszabb, külső élen méred, gérvágóládában vágod, sorjázod, és a fő szakaszt vízmértékkel állítod. ±2 mm pontosság már szép munka.",
             "A Kábelcsatorna szakaszban mérőszalaggal mérsz a 3D lapon.", "Rések a sarkokban, ferde csatorna – esztétikai pontvesztés.", "Szakmai gyakorlat"),
        ],
        "checks": [("Melyik kismegszakító a 2,5 mm²-es dugaljkörhöz?", "B16."),
                   ("Hány vezeték mehet egy csavaros kapocsba?", "Legfeljebb kettő (sínkapocsba egy)."),
                   ("Mennyi a jó csupaszolási hossz?", "Tipikusan 8–14 mm, a kapocs szerint.")],
        "cards": [("H07V-U", "Tömör rézerű, 450/750 V, csatornába"), ("Vezetékezési sorrend", "PE → N → L")],
    },
    {
        "key": "m07-merohely", "title": "Fogyasztásmérő hely", "min": 20,
        "lead": "B32 a mérő előtt; 1→3 L, 4→6 N; PEN a PE-sínre; EPH; 10 mm²; ÁVK csak mért oldalon.",
        "principles": [
            ("A mérő előtt, a fázisban: plombálható főkismegszakító", "A méretlen oldalon a túláramvédelem a mérőt és a fővezetéket védi, ezért a mérő ELŐTT van, a plombálható térben. A mérőn a fázis 1-en be és 3-on ki, a nulla 4-en be és 6-on ki; fordított bekötés hiba, megkerülés szabálytalan vételezés.",
             "A szimulátor 5. feladata felismeri a fordított mérőt és a méretlen vételezést.", "Szabálytalan vételezés, rossz mérés.", "MS-09-12-v09 (2024) mérőszekrény-specifikáció; E.ON mérőhelyi ellenőrző lista"),
            ("ÁVK csak a mért, szétválasztott oldalon", "A PEN-t nem bonthatja semmi, és a szétválasztás előtt a fázis–nulla különbség nem értelmezhető védelemként. Ezért az ÁVK a lakás főelosztójába kerül, a mérő után.",
             "A szimulátorban ÁVK a mérőszekrényben = kritikus hiba.", "Védelem nélküli lakás, kioldó vagy hatástalan ÁVK.", "MSZ HD 60364-4-41; E.ON földelési útmutató 2022"),
        ],
        "checks": [("Mi a mérő 1, 3, 4, 6 kapcsa?", "1 L be, 3 L ki, 4 N be, 6 N ki."),
                   ("Hova kötöd a beérkező PEN-t?", "A földelt PE- (főföldelő) sínre, onnan híd az N-re."),
                   ("Mekkora a fővezeték keresztmetszete 32 A-ig?", "10 mm² Cu.")],
        "cards": [("EPH helye", "Főföldelő sín"), ("SPD helye egy mérőnél", "Mért főelosztó")],
    },
    {
        "key": "m08-interaktiv-vizsga", "title": "Interaktív vizsga: számítás, anyag", "min": 20,
        "lead": "P = U·I·cos φ; ΔU = 2·I·l·ρ/A; R = ρ·l/A; P3 = √3·U·I·cos φ; Zs ≤ U0/Ia; kábeljelölések, IP.",
        "principles": [
            ("Az oda-vissza út", "Egyfázisú áramkörben az áram a fázison oda és a nullán vissza folyik, ezért a feszültségesés képletében 2-es szorzó van: ΔU = 2·I·l·ρ/A. A vizsga rossz válaszai között szinte mindig ott a 2-es nélküli eredmény.",
             "A szimulátor generált számolós feladatai pont ezeket a csapdákat kínálják rossz válaszként.", "Fele akkora feszültségesés, rossz keresztmetszet-választás.", "Villamos alapismeretek – vezetékméretezés"),
            ("Mértékegység és √3", "Háromfázisban a vonali feszültséggel (400 V) és √3-mal számolsz; egyfázisban 230 V-tal. W, kW, Ω, mΩ – a válaszok gyakran csak ebben térnek el.",
             "Interaktív vizsga gyakorló módban az Ellenőrzés gomb a levezetést is mutatja.", "Elszámolt nagyságrend.", "Villamos alapismeretek"),
        ],
        "checks": [("16 A, 25 m, 2,5 mm² Cu, egyfázis: ΔU?", "2·16·25·0,0178/2,5 = 5,70 V (2,48%)."),
                   ("400 V, 16 A, cos φ 0,85: P?", "1,732·400·16·0,85 ≈ 9,42 kW."),
                   ("Mit jelent az A a NAYY-ban?", "Alumínium vezető.")],
        "cards": [("ρ réz", "0,0178 Ω·mm²/m"), ("IP fürdő 1–2. zóna", "legalább IPX4")],
    },
    {
        "key": "m09-portfolio", "title": "Portfólió és szóbeli védés", "min": 15,
        "lead": "10 perc: mi volt, hogyan csináltad, mit mértél, saját rajz, önreflexió.",
        "principles": [
            ("Válasz előbb, indoklás utána", "A bizottság rövid, pontos válaszokat vár: először a lényeg („B16, mert a 2,5 mm²-t ez védi”), aztán az indoklás és a szabvány. Ha nem tudod, mondd ki, és mondd el, hol néznél utána.",
             "A Hot Seat portfólióvédésben a vizsgabizottság pont így kérdez.", "Hosszú, elkalandozó válasz, ami alatt elfogy az idő.", "KKK 2024.08.29 v4, I. vizsgarész"),
            ("Saját rajz, saját munka", "A portfólió értékelési eleme a saját rajzi dokumentáció és a kivitelezési fázisok dokumentálása. Mutass fotókat a fázisokról, és tudd megmagyarázni a rajzod minden jelét.",
             "A szimulátor rajzolvasási feladatai a jelek és érszámok magyarázatát gyakoroltatják.", "„Ezt Ön rajzolta?” – és nincs válasz.", "KKK 2024.08.29 v4, I. vizsgarész"),
        ],
        "checks": [("Hány perc a portfólióvédés?", "10 perc, a 300 percen belül."),
                   ("Mi a négy értékelési elem?", "Szöveges leírás, saját rajz, kivitelezési fázisok dokumentálása, szóbeli védés és önreflexió."),
                   ("Mikor kell leadni a portfóliót?", "Legalább 10 nappal a vizsga előtt.")],
        "cards": [("Portfólió terjedelme", "Minimum 10–15 oldal mellékletek nélkül"), ("Kötelező melléklet", "Munkanapló")],
    },
]

SOURCES = [
    ("IKK / vizsgaközpont", "Villanyszerelő – KKK 2024.08.29 v4", "A vizsga szerkezete, súlyok, értékelés; minden modul."),
    ("Nagykunsági Független Vizsgaközpont", "Épületvillamosság projektfeladat-mintafeladat, 2026", "A nyári konyha feladat, mérések, jegyzőkönyv (1., 4., 5. modul)."),
    ("MEE / elosztók", "MS-09-12-v09: Fogyasztásmérőhely tokozatok, szekrények direkt méréshez, 2024", "Mérőhely (7. modul)."),
    ("E.ON", "Mérőhelyi ellenőrző lista; Földelés, főföldelő sín, PEN-szétválasztás", "Mérőhely, PEN, EPH (3., 7. modul)."),
    ("MEE FAM és Biztonság", "Felülvizsgálatok, ellenőrzések", "Szerelői ellenőrzés (4. modul)."),
    ("MKIK SZKTV", "Villanyszerelő előválogató feladatsorok és megoldások, 2024 és 2025", "Az interaktív vizsga stílusa (8. modul)."),
    ("MSZT", "MSZ HD 60364-4-41, -5-52, -5-54, -6; MSZ EN 60445; MSZ EN 50160; MSZ 1585", "Szabványhivatkozások."),
]

GLOSSARY = [
    ("ÁVK", "Áram-védőkapcsoló (FI-relé): az L és N áramkülönbségére old ki; személyvédelemre 30 mA."),
    ("EPH", "Egyenpotenciálra hozás: a fémes közművek összekötése a főföldelő sínnel."),
    ("PEN", "Közös nulla- és védővezető TN-C rendszerben; zöld-sárga, végein kék jelöléssel."),
    ("Zs", "Hibahurok-impedancia; az önműködő lekapcsolás feltétele Zs ≤ U0/Ia."),
    ("SPD", "Túlfeszültség-levezető (T1, T2, T3 fokozat)."),
    ("KKK", "Képzési és kimeneti követelmények – a vizsga hivatalos leírása."),
    ("Korrespondáló vezeték", "A váltó- és keresztkapcsolók közötti két vezeték."),
    ("Méretlen / mért", "A fogyasztásmérő előtti / utáni oldal."),
]


def copy_media():
    """Hanganyag másolása, infografikák WebP-re tömörítése (1600 px széles)."""
    import subprocess
    for sub in ("audio", "img"):
        src, dst = os.path.join(PACK, sub), os.path.join(HERE, sub)
        os.makedirs(dst, exist_ok=True)
        if not os.path.isdir(src):
            continue
        for f in os.listdir(src):
            if sub == "img" and f.endswith(".png"):
                out = os.path.join(dst, f[:-4] + ".webp")
                if not os.path.exists(out):
                    subprocess.run(["magick", os.path.join(src, f), "-resize", "1600x>", "-quality", "80", out], check=True)
            else:
                shutil.copy2(os.path.join(src, f), os.path.join(dst, f))


def media(key):
    a, i = f"audio/{key}.opus", f"img/{key}.webp"
    has_a, has_i = os.path.exists(os.path.join(HERE, a)), os.path.exists(os.path.join(HERE, i))
    out = ""
    if has_a:
        out += f'<div class="player" data-src="{a}"><audio preload="none" src="{a}"></audio><button class="pp">▶ Hanglecke</button><button class="sk" data-d="-15">−15 s</button><button class="sk" data-d="15">+15 s</button><select class="sp"><option>1</option><option>1.25</option><option>1.5</option><option>2</option></select><span class="t">0:00</span></div>'
    else:
        out += '<p class="muted">A hanglecke a NotebookLM-ben (Stúdió) érhető el.</p>'
    if has_i:
        out += f'<figure><img src="{i}" alt="Infografika: {e(key)}" loading="lazy"></figure>'
    return out


def build():
    copy_media()
    videos = json.load(open(VIDEOS)) if os.path.exists(VIDEOS) else []
    by_key = {m["key"]: m for m in MODULES}
    plan = "".join(
        f'<li><span class="time">{t}</span><span class="dur">{d} p</span>'
        + (f'<a href="#{k}">{e(by_key[k]["title"])}</a>' if k else "<b>—</b>")
        + f' <span class="muted">{e(note)}</span></li>'
        for t, d, k, note in PLAN)
    cards = "".join(f'<a class="mcard" href="#{m["key"]}" data-key="{m["key"]}"><b>{n + 1}. {e(m["title"])}</b><span>{e(m["lead"])}</span><i class="done">✓</i></a>' for n, m in enumerate(MODULES))
    mods, princ = "", ""
    for n, m in enumerate(MODULES):
        ps = ""
        for title, body, sim, mistake, ref in m["principles"]:
            block = f'<h4>{e(title)}</h4><p>{e(body)}</p><p class="sim"><b>A szimulátorban:</b> {e(sim)}</p><p class="err"><b>Megelőzött hiba:</b> {e(mistake)}</p><p class="ref">{e(ref)}</p>'
            ps += f'<div class="principle">{block}</div>'
            princ += f'<details class="pcard" data-text="{e((title + " " + body).lower())}"><summary>{e(title)} <span class="muted">· {n + 1}. modul</span></summary>{block}<a href="#{m["key"]}">→ a modulhoz</a></details>'
        checks = "".join(f'<details><summary>{e(q)}</summary><p>{e(a)}</p></details>' for q, a in m["checks"])
        fc = "".join(f'<button class="flash" data-back="{e(b)}">{e(f)}</button>' for f, b in m["cards"])
        mods += f'''<section class="module" id="{m["key"]}">
<div class="kicker">{n + 1}. modul · ~{m["min"]} perc</div><h2>{e(m["title"])}</h2><p class="lead">{e(m["lead"])}</p>
{media(m["key"])}{ps}
<div class="practice"><h3>Ellenőrző kérdések</h3>{checks}<h3>Tanulókártyák</h3><div class="flashes">{fc}</div></div>
<button class="read" data-key="{m["key"]}">Megjelölöm olvasottnak</button></section>'''
    vids = "".join(f'<li><b>{e(v.get("title", ""))}</b> <span class="muted">— {e(v.get("channel", ""))}, {e(str(v.get("minutes", "")))} perc · {n_topic(v)}</span><br><span>{e(v.get("why", ""))}</span></li>' for v in videos)
    srcs = "".join(f'<li><b>{e(a)}</b>: {e(t)} <span class="muted">— {e(w)}</span></li>' for a, t, w in SOURCES)
    gl = "".join(f"<dt>{e(k)}</dt><dd>{e(v)}</dd>" for k, v in GLOSSARY)
    page = TEMPLATE.replace("%PLAN%", plan).replace("%CARDS%", cards).replace("%MODULES%", mods).replace("%PRINC%", princ) \
        .replace("%VIDEOS%", vids or '<li class="muted">A videók a NotebookLM notebook forrásai között vannak.</li>').replace("%SOURCES%", srcs).replace("%GLOSS%", gl) \
        .replace("%NMOD%", str(len(MODULES)))
    open(os.path.join(HERE, "index.html"), "w").write(page)
    print("index.html kész:", len(page), "bájt")
    import sys
    sys.path.insert(0, SRC)
    from nlm_page import build as build_nlm
    print("notebooklm.html:", build_nlm(os.path.join(ROOT, "research", "nlm", "public"), HERE))


TOPICS = {1: "vizsga", 2: "kapcsolók", 3: "relé, automata", 4: "elosztó", 5: "mérőhely", 6: "érintésvédelem", 7: "mérések", 8: "5 szabály", 9: "csatorna"}


def n_topic(v):
    return TOPICS.get(v.get("topic"), "")


TEMPLATE = """<!doctype html><html lang="hu"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Villanyszerelő vizsga – mai tanulási terv</title><style>
:root{--bg:#fbfaf6;--fg:#1b1d21;--muted:#666b73;--card:#fff;--line:#e4e1d8;--acc:#c46a00;--good:#1d7a46;--bad:#b42318}
@media (prefers-color-scheme:dark){:root{--bg:#111418;--fg:#e8ebef;--muted:#9aa3ae;--card:#1a1e24;--line:#2c323b;--acc:#ffb020;--good:#3ddc84;--bad:#ff6b6b}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.55 system-ui,-apple-system,Segoe UI,sans-serif}
header{position:sticky;top:0;background:var(--bg);border-bottom:1px solid var(--line);padding:10px 16px;display:flex;gap:14px;align-items:center;flex-wrap:wrap;z-index:2}
header b{font-size:17px}nav a{color:var(--fg);margin-right:12px;text-decoration:none;font-size:14px}nav a:hover{color:var(--acc)}
main{max-width:920px;margin:0 auto;padding:16px}h1{font-size:30px;line-height:1.15;margin:14px 0 6px}h2{margin:4px 0 6px}
.kicker{color:var(--acc);font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase}.muted{color:var(--muted)}.lead{font-size:17px}
.stats{display:flex;gap:10px;flex-wrap:wrap;margin:12px 0}.stats div{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:8px 12px}
.flow{display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:14px;margin:8px 0 18px}.flow span{background:var(--card);border:1px solid var(--line);border-radius:99px;padding:3px 10px}
ol.plan{list-style:none;padding:0}ol.plan li{display:flex;gap:10px;flex-wrap:wrap;padding:7px 0;border-bottom:1px solid var(--line)}.time{font-weight:700;width:52px}.dur{width:48px;color:var(--muted)}ol.plan a{color:var(--acc)}
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px;margin:12px 0}.mcard{position:relative;display:flex;flex-direction:column;gap:4px;background:var(--card);border:1px solid var(--line);border-radius:10px;padding:12px;color:var(--fg);text-decoration:none}.mcard span{font-size:13px;color:var(--muted)}.mcard .done{display:none;position:absolute;top:8px;right:10px;color:var(--good);font-style:normal}.mcard.isread .done{display:block}
.progress{height:8px;background:var(--line);border-radius:99px;overflow:hidden}.progress i{display:block;height:100%;background:var(--good);width:0}
.module{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:18px;margin:18px 0}.principle{border-left:3px solid var(--acc);padding:2px 0 2px 12px;margin:14px 0}
.sim{background:rgba(29,122,70,.08);padding:6px 10px;border-radius:6px}.err{background:rgba(180,35,24,.07);padding:6px 10px;border-radius:6px}.ref{font-size:13px;color:var(--muted);font-style:italic}
figure{margin:12px 0}figure img{max-width:100%;border-radius:8px;border:1px solid var(--line)}
.player{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin:10px 0}.player button,.player select,button.read,button.flash,.tools button{font:inherit;padding:6px 10px;border-radius:6px;border:1px solid var(--line);background:var(--bg);color:var(--fg);cursor:pointer}
.practice{display:none;margin-top:12px}body.practice-on .practice{display:block}details{border-bottom:1px solid var(--line);padding:6px 0}summary{cursor:pointer}
.flashes{display:flex;gap:8px;flex-wrap:wrap}button.flash{min-height:64px;max-width:260px;text-align:left}button.flash.flip{background:var(--acc);color:#fff}
button.read.on{background:var(--good);color:#fff}.tools{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:10px 0}input.search{font:inherit;padding:7px 10px;border-radius:6px;border:1px solid var(--line);background:var(--card);color:var(--fg);flex:1;min-width:180px}
.pcard{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:8px 12px;margin:6px 0}dl dt{font-weight:700;margin-top:8px}dl dd{margin:0}
@media (prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}
</style></head><body>
<header><b>⚡ Villanyszerelő vizsga – mai terv</b><nav><a href="#home">Áttekintés</a><a href="notebooklm.html"><b>NotebookLM: kvíz, kártyák</b></a><a href="#terv">Mai terv</a><a href="#modulok">Modulok</a><a href="#elvek">Elvek</a><a href="#videok">Videók</a><a href="#forrasok">Források</a><a href="#fogalmak">Fogalmak</a></nav>
<label class="muted"><input type="checkbox" id="practice"> Gyakorló mód</label></header>
<main>
<section id="home"><div class="kicker">4 0713 04 07 · Villanyszerelő · Épületvillamosság</div>
<h1>Egy nap alatt a legtöbb pont: biztonság, mérőhely, mérések, bekötések.</h1>
<div class="stats"><div><b>%NMOD%</b> modul</div><div>~<b>7–8</b> óra tanulás</div><div>hanglecke + infografika modulonként</div><div><span id="pct">0</span>% kész</div></div>
<div class="progress"><i id="bar"></i></div>
<h3>Áttekintés</h3><div class="flow"><span>Feladatlap, rajz</span>→<span>Anyag, szerszám</span>→<span>Csatorna</span>→<span>Készülékek</span>→<span>Vezetékezés (PE → N → L)</span>→<span>Ellenőrzés, mérés</span>→<span>Bemutatás, jegyzőkönyv</span>→<span>Portfólióvédés</span></div>
<p>A vizsga két része: <b>projektfeladat (70%)</b> – portfólió 20, épületvillamossági szerelés 40, fogyasztásmérő hely 40 – és <b>központi interaktív vizsga (30%)</b>. Mindkettőn külön 40% kell. Az áramütés elleni védelem hibája érvénytelen vizsgát jelent, ezért a terv a biztonsággal kezd. Minden modulhoz tartozik egy rövid hanglecke és egy ábra; a gyakorló módban ellenőrző kérdések és tanulókártyák is megjelennek. A notebookban (NotebookLM) bármire rákérdezhetsz, és ott van a kvíz, a tanulókártyák és a gondolattérkép is.</p></section>
<section id="terv"><h2>Mai terv</h2><ol class="plan">%PLAN%</ol></section>
<section id="modulok"><h2>Modulok</h2><div class="cards">%CARDS%</div>%MODULES%</section>
<section id="elvek"><h2>Elvek</h2><div class="tools"><input class="search" id="q" placeholder="Keresés az elvek között…"><button id="openall">Mind ki</button><button id="closeall">Mind be</button></div>%PRINC%</section>
<section id="videok"><h2>Videók</h2><p class="muted">A videók a NotebookLM notebook forrásai; a feliratukra a notebookban rá is kérdezhetsz.</p><ul>%VIDEOS%</ul></section>
<section id="forrasok"><h2>Források</h2><ul>%SOURCES%</ul></section>
<section id="fogalmak"><h2>Fogalmak</h2><dl>%GLOSS%</dl></section>
</main><script>
const K='villanyvizsga.guide.read',get=()=>{try{return JSON.parse(localStorage.getItem(K)||'[]')}catch{return[]}},put=v=>{try{localStorage.setItem(K,JSON.stringify(v))}catch{}};
function paint(){const r=get();document.querySelectorAll('.mcard').forEach(c=>c.classList.toggle('isread',r.includes(c.dataset.key)));document.querySelectorAll('button.read').forEach(b=>{const on=r.includes(b.dataset.key);b.classList.toggle('on',on);b.textContent=on?'✓ Olvasva':'Megjelölöm olvasottnak'});const p=Math.round(100*r.length/%NMOD%);document.getElementById('pct').textContent=p;document.getElementById('bar').style.width=p+'%'}
document.querySelectorAll('button.read').forEach(b=>b.onclick=()=>{const r=get(),k=b.dataset.key;put(r.includes(k)?r.filter(x=>x!==k):[...r,k]);paint()});
document.querySelectorAll('button.flash').forEach(b=>{const f=b.textContent;b.onclick=()=>{b.classList.toggle('flip');b.textContent=b.classList.contains('flip')?b.dataset.back:f}});
const pr=document.getElementById('practice');pr.onchange=()=>document.body.classList.toggle('practice-on',pr.checked);
document.getElementById('q').oninput=ev=>{const q=ev.target.value.toLowerCase();document.querySelectorAll('.pcard').forEach(c=>c.style.display=c.dataset.text.includes(q)?'':'none')};
document.getElementById('openall').onclick=()=>document.querySelectorAll('.pcard').forEach(d=>d.open=true);document.getElementById('closeall').onclick=()=>document.querySelectorAll('.pcard').forEach(d=>d.open=false);
document.querySelectorAll('.player').forEach(p=>{const a=p.querySelector('audio'),pp=p.querySelector('.pp'),t=p.querySelector('.t');const fmt=s=>Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');
pp.onclick=()=>{if(a.paused){document.querySelectorAll('audio').forEach(x=>x!==a&&x.pause());a.play()}else a.pause()};a.onplay=()=>pp.textContent='❚❚ Szünet';a.onpause=()=>pp.textContent='▶ Hanglecke';a.ontimeupdate=()=>t.textContent=fmt(a.currentTime)+(a.duration?' / '+fmt(a.duration):'');
a.onended=()=>{const r=get(),k=p.closest('.module').id;if(!r.includes(k))put([...r,k]);paint()};p.querySelectorAll('.sk').forEach(b=>b.onclick=()=>a.currentTime=Math.max(0,a.currentTime+ +b.dataset.d));p.querySelector('.sp').onchange=ev=>a.playbackRate=+ev.target.value});
paint();
</script></body></html>"""

if __name__ == "__main__":
    build()
