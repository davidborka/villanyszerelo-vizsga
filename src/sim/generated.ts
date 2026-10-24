import type { Question } from './questions'

// Paraméteres számítási feladatok: minden húzásnál új számokkal, a helyes eredmény képletből,
// a rossz válaszok a tipikus hibákból (kimaradt 2-es szorzó, √3, mértékegység, rossz karakterisztika).

const RHO_CU = 0.0178 // Ω·mm²/m
type Rnd = () => number
const pick = <T,>(rnd: Rnd, a: readonly T[]): T => a[Math.floor(rnd() * a.length)]
const hu = (x: number, d = 2) => x.toFixed(d).replace('.', ',')

/** A helyes értékből és a hibás változatokból 4 különböző opciót készít; a helyes az első (a UI keveri) */
function options(right: number, wrong: number[], fmt: (x: number) => string): { options: string[]; answer: number } {
  const seen = new Set<string>([fmt(right)])
  const out = [fmt(right)]
  for (const w of [...wrong, right * 1.5, right * 0.5, right * 2.5]) {
    const s = fmt(w)
    if (out.length < 4 && Number.isFinite(w) && w > 0 && !seen.has(s)) (seen.add(s), out.push(s))
  }
  return { options: out, answer: 0 }
}

const GENERATORS: ((rnd: Rnd, n: number) => Question)[] = [
  // egyfázisú feszültségesés
  (rnd, n) => {
    const I = pick(rnd, [10, 13, 16, 20])
    const l = pick(rnd, [15, 20, 25, 30, 35, 40])
    const A = pick(rnd, [1.5, 2.5, 4])
    const dU = (2 * I * l * RHO_CU) / A
    const pct = (100 * dU) / 230
    return {
      id: `g-du-${n}`, topic: 'szamitas', kind: 'single', points: 2,
      q: `Egyfázisú, 230 V-os áramkör: I = ${I} A, a vezeték hossza l = ${l} m, keresztmetszete ${hu(A, 1)} mm² Cu (ρ = 0,0178 Ω·mm²/m). Hány százalék a feszültségesés?`,
      ...options(pct, [pct / 2, (100 * dU) / 400, dU], (x) => `${hu(x)} %`),
      explain: `ΔU = 2·I·l·ρ/A = 2·${I}·${l}·0,0178/${hu(A, 1)} = ${hu(dU)} V; ΔU% = ${hu(dU)}/230·100 = ${hu(pct)} %. (Az oda-vissza út miatt 2-vel kell szorozni.)`,
      source: 'generált feladat',
    }
  },
  // háromfázisú teljesítmény
  (rnd, n) => {
    const I = pick(rnd, [8, 10, 12, 16, 20, 25])
    const cos = pick(rnd, [0.8, 0.85, 0.9])
    const P = (Math.sqrt(3) * 400 * I * cos) / 1000
    return {
      id: `g-p3-${n}`, topic: 'szamitas', kind: 'single', points: 2,
      q: `Háromfázisú, 400 V-os szimmetrikus fogyasztó vonali árama ${I} A, cos φ = ${hu(cos)}. Mekkora a felvett hatásos teljesítmény?`,
      ...options(P, [(400 * I * cos) / 1000, (3 * 400 * I * cos) / 1000, (Math.sqrt(3) * 400 * I) / 1000], (x) => `${hu(x)} kW`),
      explain: `P = √3·U·I·cos φ = 1,732·400·${I}·${hu(cos)} = ${hu(P)} kW.`,
      source: 'generált feladat',
    }
  },
  // áram egyfázisú teljesítményből
  (rnd, n) => {
    const P = pick(rnd, [1200, 1500, 2000, 2200, 2500, 3000])
    const I = P / 230
    return {
      id: `g-i1-${n}`, topic: 'szamitas', kind: 'single', points: 1,
      q: `Egy ${P} W-os, ohmos (cos φ = 1) egyfázisú fogyasztó 230 V-ról üzemel. Mekkora áramot vesz fel?`,
      ...options(I, [P / 400, P / (230 * Math.sqrt(3)), (P / 230) * 1.414], (x) => `${hu(x)} A`),
      explain: `I = P/U = ${P}/230 = ${hu(I)} A.`,
      source: 'generált feladat',
    }
  },
  // energiaköltség
  (rnd, n) => {
    const P = pick(rnd, [0.8, 1.2, 1.5, 2, 2.4])
    const h = pick(rnd, [2, 3, 4, 5])
    const d = pick(rnd, [20, 30, 31])
    const ft = pick(rnd, [36, 52, 70])
    const cost = P * h * d * ft
    return {
      id: `g-e-${n}`, topic: 'szamitas', kind: 'single', points: 1,
      q: `Egy ${hu(P, 1)} kW-os fogyasztó naponta ${h} órát üzemel, ${d} napon át. Mennyibe kerül az energia, ha 1 kWh ára ${ft} Ft?`,
      ...options(cost, [P * h * ft, P * d * ft, cost / 1000], (x) => `${Math.round(x).toLocaleString('hu-HU')} Ft`),
      explain: `W = P·t = ${hu(P, 1)} kW · ${h} h · ${d} = ${hu(P * h * d, 1)} kWh; költség = ${hu(P * h * d, 1)} · ${ft} = ${Math.round(cost).toLocaleString('hu-HU')} Ft.`,
      source: 'generált feladat',
    }
  },
  // hurokimpedancia-határ
  (rnd, n) => {
    const In = pick(rnd, [6, 10, 13, 16, 20, 25])
    const ch = pick(rnd, ['B', 'C'] as const)
    const k = ch === 'B' ? 5 : 10
    const Zs = 230 / (k * In)
    return {
      id: `g-zs-${n}`, topic: 'szamitas', kind: 'single', points: 2,
      q: `TN rendszerű, 230 V-os végáramkört ${ch}${In} kismegszakító véd (a mágneses kioldás határa ${ch === 'B' ? '5' : '10'}·In). Legfeljebb mekkora lehet a hibahurok-impedancia az önműködő lekapcsoláshoz?`,
      ...options(Zs, [230 / ((ch === 'B' ? 10 : 5) * In), 230 / In, 400 / (k * In)], (x) => `${hu(x)} Ω`),
      explain: `Zs ≤ U0/Ia = 230/(${k}·${In}) = ${hu(Zs)} Ω. (Ia: a ${ch} karakterisztika azonnali kioldásának árama.)`,
      source: 'MSZ HD 60364-4-41, generált feladat',
    }
  },
  // vezeték ellenállása
  (rnd, n) => {
    const l = pick(rnd, [20, 30, 40, 50, 60])
    const A = pick(rnd, [1.5, 2.5, 4, 6])
    const R = (RHO_CU * l) / A
    return {
      id: `g-r-${n}`, topic: 'szamitas', kind: 'single', points: 1,
      q: `Mekkora egy ${l} m hosszú, ${hu(A, 1)} mm² keresztmetszetű rézvezető ellenállása (ρ = 0,0178 Ω·mm²/m)?`,
      ...options(R, [2 * R, (RHO_CU * A) / l, R * 1000], (x) => `${hu(x, 3)} Ω`),
      explain: `R = ρ·l/A = 0,0178·${l}/${hu(A, 1)} = ${hu(R, 3)} Ω.`,
      source: 'generált feladat',
    }
  },
]


/** Gyakorlóterem: további típusok, lépésenkénti levezetéssel (sorok "\n"-nel elválasztva) */
const SQ3 = Math.sqrt(3)
const MORE: Record<string, { label: string; make: (rnd: Rnd, n: number) => Question }> = {
  motor: { label: 'Motoráram adattáblából', make: (rnd, n) => {
    const P = pick(rnd, [2.2, 3, 4, 5.5, 7.5, 11]), cos = pick(rnd, [0.8, 0.82, 0.85, 0.86]), eta = pick(rnd, [0.84, 0.86, 0.88, 0.9])
    const I = (P * 1000) / (SQ3 * 400 * cos * eta)
    return { id: `g-mot-${n}`, topic: 'szamitas', kind: 'single', points: 2,
      q: `Háromfázisú aszinkronmotor adattáblája: P = ${hu(P, 1)} kW (leadott), 400 V, cos φ = ${hu(cos)}, η = ${hu(eta)}. Mekkora a névleges áram?`,
      ...options(I, [(P * 1000) / (SQ3 * 400 * cos), (P * 1000) / (400 * cos * eta), (P * 1000) / (SQ3 * 230 * cos * eta)], (x) => `${hu(x, 1)} A`),
      explain: `Az adattáblán a leadott (tengely-) teljesítmény áll, a felvett: P1 = P2/η.\nI = P2 / (√3 · U · cos φ · η)\nI = ${P * 1000} / (1,732 · 400 · ${hu(cos)} · ${hu(eta)}) = ${hu(I, 1)} A`, source: 'generált feladat' } } },
  fordulat: { label: 'Szinkron fordulatszám, szlip', make: (rnd, n) => {
    const poles = pick(rnd, [2, 4, 6, 8]), p = poles / 2, n0 = 3000 / p
    const s = pick(rnd, [3, 4, 5, 6]), nn = Math.round(n0 * (1 - s / 100))
    return { id: `g-sz-${n}`, topic: 'szamitas', kind: 'single', points: 2,
      q: `Egy ${poles} pólusú (${p} póluspárú) aszinkronmotor 50 Hz-ről ${nn} 1/min fordulattal forog. Mekkora a szlip?`,
      ...options((100 * (n0 - nn)) / n0, [(100 * (n0 - nn)) / nn, (100 * (n0 - nn)) / 3000, (100 * (6000 / poles - nn)) / (6000 / poles)], (x) => `${hu(x, 1)} %`),
      explain: `Szinkron fordulatszám: n0 = 60 · f / p = 60 · 50 / ${p} = ${n0} 1/min (p = póluspárok száma).\nSzlip: s = (n0 − n) / n0 = (${n0} − ${nn}) / ${n0} = ${hu((100 * (n0 - nn)) / n0, 1)} %`, source: 'generált feladat' } } },
  spq: { label: 'Látszólagos és meddő teljesítmény', make: (rnd, n) => {
    const P = pick(rnd, [2, 3, 4, 6, 8]), cos = pick(rnd, [0.6, 0.8]), S = P / cos, Q = Math.sqrt(S * S - P * P)
    const askS = rnd() < 0.5
    return { id: `g-spq-${n}`, topic: 'szamitas', kind: 'single', points: 2,
      q: `Egy fogyasztó hatásos teljesítménye P = ${P} kW, cos φ = ${hu(cos, 1)}. Mekkora a ${askS ? 'látszólagos teljesítmény (S)' : 'meddő teljesítmény (Q)'}?`,
      ...(askS ? options(S, [P * cos, P + P * cos, S * cos], (x) => `${hu(x)} kVA`) : options(Q, [S - P, P * cos, S], (x) => `${hu(x)} kvar`)),
      explain: `S = P / cos φ = ${P} / ${hu(cos, 1)} = ${hu(S)} kVA\nQ = √(S² − P²) = √(${hu(S)}² − ${P}²) = ${hu(Q)} kvar\n(A teljesítményháromszög: S² = P² + Q²; Q-t nem kivonással kapjuk.)`, source: 'generált feladat' } } },
  trafo: { label: 'Transzformátor áttétele', make: (rnd, n) => {
    const U2 = pick(rnd, [12, 24, 48]), N1 = pick(rnd, [920, 1150, 2300]), N2 = (N1 * U2) / 230
    return { id: `g-tr-${n}`, topic: 'szamitas', kind: 'single', points: 1,
      q: `Egy 230/${U2} V-os biztonsági transzformátor primer menetszáma N1 = ${N1}. Mennyi a szekunder menetszám?`,
      ...options(N2, [(N1 * 230) / U2, N1 / U2, N2 * 2], (x) => `${Math.round(x)} menet`),
      explain: `U1 / U2 = N1 / N2 → N2 = N1 · U2 / U1\nN2 = ${N1} · ${U2} / 230 = ${Math.round(N2)} menet`, source: 'generált feladat' } } },
  keresztmetszet: { label: 'Keresztmetszet-választás (Ib ≤ In ≤ Iz)', make: (rnd, n) => {
    const T: [number, number][] = [[1.5, 17.5], [2.5, 24], [4, 32], [6, 41], [10, 57]]
    const Ib = pick(rnd, [9, 12, 14, 18, 22, 27, 30, 36])
    const In = [10, 13, 16, 20, 25, 32, 40, 50].find((x) => x >= Ib)!
    const A = T.find(([, iz]) => iz >= In)![0]
    const idx = T.findIndex(([a]) => a === A)
    const wrong = [T[Math.max(0, idx - 1)][0], T[Math.min(T.length - 1, idx + 1)][0], T[Math.min(T.length - 1, idx + 2)][0]]
    return { id: `g-km-${n}`, topic: 'szamitas', kind: 'single', points: 2,
      q: `Egy áramkör üzemi árama Ib = ${Ib} A. A kismegszakító névleges áramai: 10, 13, 16, 20, 25, 32, 40, 50 A. A feladatban megadott (tájékoztató) terhelhetőségek: 1,5 mm² → 17,5 A; 2,5 → 24 A; 4 → 32 A; 6 → 41 A; 10 → 57 A. Mekkora legkisebb rézkeresztmetszet felel meg?`,
      ...options(A, wrong, (x) => `${hu(x, 1)} mm²`),
      explain: `1. Ib ≤ In: a legkisebb névleges áram, ami nem kisebb ${Ib} A-nél: In = ${In} A.\n2. In ≤ Iz: a legkisebb keresztmetszet, amelynek terhelhetősége legalább ${In} A: ${hu(A, 1)} mm² (Iz = ${hu(T[idx][1], 1)} A).\n(A valóságban a terhelhetőség a szerelési módtól és a környezettől is függ, és a feszültségesést is ellenőrizni kell.)`, source: 'generált feladat' } } },
  du3: { label: 'Háromfázisú feszültségesés', make: (rnd, n) => {
    const I = pick(rnd, [16, 20, 25, 32]), l = pick(rnd, [30, 40, 50, 60]), A = pick(rnd, [2.5, 4, 6, 10]), cos = pick(rnd, [0.85, 0.9, 1])
    const dU = (SQ3 * I * l * RHO_CU * cos) / A, pct = (100 * dU) / 400
    return { id: `g-du3-${n}`, topic: 'szamitas', kind: 'single', points: 2,
      q: `Szimmetrikus háromfázisú terhelés: I = ${I} A, l = ${l} m, ${hu(A, 1)} mm² Cu, cos φ = ${hu(cos)}, U = 400 V. Hány százalék a (vonali) feszültségesés? (ΔU = √3 · I · l · ρ · cos φ / A, ρ = 0,0178)`,
      ...options(pct, [(100 * 2 * I * l * RHO_CU) / A / 400, (100 * dU) / 230, pct / SQ3], (x) => `${hu(x)} %`),
      explain: `ΔU = √3 · I · l · ρ · cos φ / A = 1,732 · ${I} · ${l} · 0,0178 · ${hu(cos)} / ${hu(A, 1)} = ${hu(dU)} V\nΔU% = ${hu(dU)} / 400 · 100 = ${hu(pct)} %\n(Háromfázisban nem 2-vel, hanem √3-mal szorzunk, és a 400 V-os vonali feszültséghez viszonyítunk.)`, source: 'generált feladat' } } },
  eredo: { label: 'Eredő ellenállás', make: (rnd, n) => {
    const R1 = pick(rnd, [10, 20, 30, 40, 60]), R2 = pick(rnd, [15, 20, 30, 60, 120]), par = rnd() < 0.5
    const R = par ? (R1 * R2) / (R1 + R2) : R1 + R2
    return { id: `g-re-${n}`, topic: 'szamitas', kind: 'single', points: 1,
      q: `Mekkora R1 = ${R1} Ω és R2 = ${R2} Ω eredője ${par ? 'párhuzamos' : 'soros'} kapcsolásban?`,
      ...options(R, par ? [R1 + R2, (R1 + R2) / 2, R1 * R2] : [(R1 * R2) / (R1 + R2), Math.abs(R1 - R2) || R1 / 2, R1 * R2 / 10], (x) => `${hu(x)} Ω`),
      explain: par ? `Párhuzamos: Re = R1 · R2 / (R1 + R2) = ${R1} · ${R2} / (${R1} + ${R2}) = ${hu(R)} Ω\n(Az eredő mindig kisebb a legkisebb ágnál.)` : `Soros: Re = R1 + R2 = ${R1} + ${R2} = ${R} Ω`, source: 'generált feladat' } } },
  impulzus: { label: 'Teljesítmény a mérő impulzusaiból', make: (rnd, n) => {
    const c = pick(rnd, [500, 1000, 2000]), t = pick(rnd, [30, 60, 120]), P = pick(rnd, [300, 600, 1200, 2000])
    const nImp = Math.round((P * c * t) / 3600000)
    const Pm = (3600 * 1000 * nImp) / (c * t)
    return { id: `g-imp-${n}`, topic: 'szamitas', kind: 'single', points: 2,
      q: `A fogyasztásmérő mérőállandója c = ${c} imp/kWh. ${t} másodperc alatt ${nImp} impulzust számoltál. Mekkora a felvett teljesítmény?`,
      ...options(Pm, [Pm / 1000, (nImp * c) / t, Pm * 2], (x) => (x >= 10 ? `${Math.round(x)} W` : `${hu(x, 3)} W`)),
      explain: `Egy impulzus 1/c kWh = ${hu(1000 / c, 1)} Wh energia.\nP = 3600 · n / (c · t) kW = 3600 · ${nImp} / (${c} · ${t}) kW = ${hu(Pm / 1000, 3)} kW = ${Math.round(Pm)} W`, source: 'generált feladat' } } },
  csillagdelta: { label: 'Csillag–delta indítóáram', make: (rnd, n) => {
    const In = pick(rnd, [8, 10, 12, 15]), k = pick(rnd, [5, 6, 7]), Id = In * k, Iy = Id / 3
    return { id: `g-yd-${n}`, topic: 'szamitas', kind: 'single', points: 2,
      q: `Egy motor névleges árama ${In} A, közvetlen (delta) indításkor az indítóáram ${k}·In. Mekkora az indítóáram csillag–delta indításkor (csillag fokozatban)?`,
      ...options(Iy, [Id / SQ3, Id, In], (x) => `${hu(x, 1)} A`),
      explain: `Közvetlen indítás: Iind = ${k} · ${In} = ${Id} A.\nCsillagban a tekercsfeszültség 1/√3-szoros, a hálózati (vonali) áram így 1/3-a a delta indításnak.\nIind,Y = ${Id} / 3 = ${hu(Iy, 1)} A`, source: 'generált feladat' } } },
}

/** A Gyakorlóterem számolási típusai (az alaptípusokkal együtt) */
export const CALC_TYPES: { key: string; label: string }[] = [
  { key: 'du', label: 'Egyfázisú feszültségesés' }, { key: 'p3', label: 'Háromfázisú teljesítmény' }, { key: 'i1', label: 'Áram teljesítményből' },
  { key: 'e', label: 'Energia és költség' }, { key: 'zs', label: 'Hurokimpedancia-határ' }, { key: 'r', label: 'Vezeték ellenállása' },
  ...Object.entries(MORE).map(([key, v]) => ({ key, label: v.label })),
]
const BASE_KEYS = ['du', 'p3', 'i1', 'e', 'zs', 'r']

let serial = 0

/** `count` darab új számítási feladat, különböző típusokból; az azonosító a munkamenetben egyedi */
export function generateCalc(count: number, rnd: Rnd = Math.random): Question[] {
  const all = [...GENERATORS, ...Object.values(MORE).map((m) => m.make)]
  const order = [...all].sort(() => rnd() - 0.5)
  return Array.from({ length: count }, (_, i) => order[i % order.length](rnd, ++serial))
}

/** Egy adott típusú feladat (Gyakorlóterem); 'vegyes' = véletlen típus */
export function generateOne(key: string, rnd: Rnd = Math.random): Question {
  if (key === 'vegyes') return generateCalc(1, rnd)[0]
  const b = BASE_KEYS.indexOf(key)
  return b >= 0 ? GENERATORS[b](rnd, ++serial) : MORE[key].make(rnd, ++serial)
}
