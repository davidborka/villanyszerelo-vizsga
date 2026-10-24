import { chromium } from 'playwright'

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium',
  headless: true,
  args: ['--no-sandbox', '--enable-unsafe-swiftshader'],
})
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
const errors: string[] = []
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text())
})
page.on('pageerror', (error) => errors.push(error.message))

await page.goto(process.env.APP_URL ?? 'http://127.0.0.1:5173', { waitUntil: 'networkidle' })
await page.screenshot({ path: 'screenshots/start.png' })
await page.locator('.taskcard').first().click()

await page.evaluate(async () => {
  const { TASKS } = await import('/src/sim/tasks.ts')
  const cuts = Object.fromEntries(TASKS.nyariKonyha.layout.pieces.map((piece) => [piece.id, {
    len: piece.len,
    ends: piece.ends,
    deburred: true,
    mounted: true,
    leveled: true,
  }]))
  window.__game.getState().set({ cuts })
  window.__game.getState().setStage('csatorna')
})
await page.locator('table.pieces tbody tr').first().click()
await page.waitForTimeout(1200)
await page.screenshot({ path: 'screenshots/csatorna-selected.png' })

await page.evaluate(() => {
  let n = 0
  const w = (a: string, b: string, color: string, cs = 1.5) => ({ id: `W${++n}`, a, b, color, cs, strip: 10 })
  const din = [
    { uid: 'Q1', type: 'spd' }, { uid: 'Q2', type: 'mcbB10' }, { uid: 'Q3', type: 'mcbB10' },
    { uid: 'Q4', type: 'mcbB16' }, { uid: 'Q5', type: 'rcd40' },
  ]
  const mounts = { L1: 'lampMotion', S1: 'sw101', V1: 'sw106', K: 'sw107', V2: 'sw106', L2: 'lamp', SO: 'socket' }
  const wires = [
    w('bet.L', 'Q5.Lin', 'barna', 2.5), w('bet.N', 'Q5.Nin', 'kek', 2.5), w('bet.PE', 'PE.0', 'zoldsarga', 2.5),
    w('Q5.Nout', 'N.0', 'kek', 2.5), w('Q5.Lout', 'Q2.in', 'barna', 2.5), w('Q2.in', 'Q3.in', 'barna', 2.5), w('Q3.in', 'Q4.in', 'barna', 2.5),
    w('bet.L', 'Q1.L', 'barna', 2.5), w('bet.N', 'Q1.N', 'kek', 2.5), w('Q1.PE', 'PE.1', 'zoldsarga', 2.5),
    w('Q2.out', 'S1.L', 'barna'), w('S1.1', 'L1.L', 'fekete'), w('N.1', 'L1.N', 'kek'), w('PE.2', 'L1.PE', 'zoldsarga'),
    w('Q3.out', 'V1.C', 'barna'), w('V1.1', 'K.1', 'fekete'), w('V1.2', 'K.2', 'szurke'),
    w('K.3', 'V2.1', 'fekete'), w('K.4', 'V2.2', 'szurke'), w('V2.C', 'L2.L', 'barna'),
    w('N.2', 'L2.N', 'kek'), w('PE.3', 'L2.PE', 'zoldsarga'),
    w('Q4.out', 'SO.L', 'barna', 2.5), w('N.3', 'SO.N', 'kek', 2.5), w('PE.4', 'SO.PE', 'zoldsarga', 2.5),
  ]
  window.__game.getState().set({ din, mounts, wires, dinOn: Object.fromEntries(din.map((d) => [d.uid, false])), sw: { S1: 1 }, motion: true, lidsOn: false })
  window.__game.getState().setStage('vezetekezes')
})
await page.waitForTimeout(1300)
await page.screenshot({ path: 'screenshots/vezetekezes.png' })

await page.evaluate(() => window.__game.getState().setStage('ellenorzes'))
await page.getByRole('button', { name: 'Bekapcsolás' }).click()
await page.waitForTimeout(1400)
await page.screenshot({ path: 'screenshots/ellenorzes-lit.png' })

const result = await page.evaluate(async () => {
  const { simulate } = await import('/src/sim/circuit.ts')
  return {
    stats: window.__sceneStats(),
    lit: simulate(window.__game.getState()).lit,
    powered: window.__game.getState().powered,
  }
})
console.log(JSON.stringify({ ...result, errors }, null, 2))
await browser.close()
if (errors.length || !result.powered || !result.lit.L1 || result.stats.triangles >= 250000) process.exit(1)
