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

let serial = 0

/** `count` darab új számítási feladat, különböző típusokból; az azonosító a munkamenetben egyedi */
export function generateCalc(count: number, rnd: Rnd = Math.random): Question[] {
  const order = [...GENERATORS].sort(() => rnd() - 0.5)
  return Array.from({ length: count }, (_, i) => order[i % order.length](rnd, ++serial))
}
