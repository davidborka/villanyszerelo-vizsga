// 3D props generálása fal.ai Hunyuan3D v3.1 Pro-val, majd optimalizálás gltf-transformmal.
// Használat:  FAL_KEY=... bun scripts/gen-assets.ts [id ...]
// Kimenet:    assets-src/raw/<id>.glb  →  public/models/<id>.glb (meshopt + webp, 1024 px textúra)
//
// Csak "díszlet" (szerszámok, műszerek) készül így. A szerelvények, csatornák, dobozok
// méretpontos procedurális modellek maradnak (src/scene), mert a vizsgán a mm számít.
import { $ } from 'bun'
import { mkdir } from 'node:fs/promises'

const ENDPOINT = 'fal-ai/hunyuan-3d/v3.1/pro/text-to-3d'

const ASSETS: Record<string, string> = {
  furesz: 'Fine-tooth hacksaw for cutting PVC cable trunking, red steel frame, black handle, product shot, realistic',
  gerlada: 'Plastic mitre box with 45 and 90 degree slots for cutting cable trunking, grey, realistic tool',
  csupaszolo: 'Automatic wire stripper pliers, self-adjusting, red and black insulated handles, realistic',
  csavLapos: 'VDE 1000V insulated flat screwdriver 3.5mm, red and yellow handle, realistic',
  csavPZ: 'VDE 1000V insulated Pozidriv PZ2 screwdriver, red and yellow handle, realistic',
  oldalcsipo: 'VDE insulated diagonal side cutting pliers, red and yellow handles, realistic',
  feszVizsg: 'Two-pole voltage tester for electricians with LED display and two probes connected by cable, yellow and black',
  multifunkcios: 'Installation multifunction tester for insulation resistance, loop impedance and RCD testing, with test leads, yellow rubber housing',
  lakatfogo: 'Digital AC clamp meter, yellow and black, realistic',
  multimeter: 'Digital multimeter CAT III with red and black test probes, realistic',
  vizmertek: 'Aluminium spirit level 40 cm with green bubble vials',
  mero: 'Retractable steel measuring tape 5m, yellow and black housing',
  furo: 'Cordless drill driver with battery, professional, blue and black',
}

const key = process.env.FAL_KEY
if (!key) {
  console.error('FAL_KEY nincs beállítva (https://fal.ai/dashboard/keys).')
  process.exit(1)
}
const auth = { Authorization: `Key ${key}`, 'Content-Type': 'application/json' }

async function generate(id: string, prompt: string) {
  const sub = await fetch(`https://queue.fal.run/${ENDPOINT}`, {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({ prompt, generate_type: 'Normal', enable_pbr: true, face_count: 40000 }),
  }).then((r) => r.json())
  if (!sub.status_url) throw new Error(`${id}: ${JSON.stringify(sub)}`)
  for (;;) {
    const st = await fetch(sub.status_url, { headers: auth }).then((r) => r.json())
    if (st.status === 'COMPLETED') break
    if (st.status !== 'IN_QUEUE' && st.status !== 'IN_PROGRESS') throw new Error(`${id}: ${JSON.stringify(st)}`)
    await Bun.sleep(5000)
  }
  const res = await fetch(sub.response_url, { headers: auth }).then((r) => r.json())
  const url = res.model_glb?.url ?? res.model_urls?.glb?.url
  if (!url) throw new Error(`${id}: nincs GLB a válaszban: ${JSON.stringify(res).slice(0, 300)}`)
  const raw = `assets-src/raw/${id}.glb`
  await Bun.write(raw, await fetch(url))
  const out = `public/models/${id}.glb`
  await $`bunx @gltf-transform/cli optimize ${raw} ${out} --compress meshopt --texture-compress webp --texture-size 1024 --simplify-ratio 0.5`
  console.log(`✓ ${id} → ${out}`)
}

await mkdir('assets-src/raw', { recursive: true })
await mkdir('public/models', { recursive: true })
const ids = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(ASSETS)
// párhuzamosan, de kíméletesen: egyszerre 3
for (let i = 0; i < ids.length; i += 3)
  await Promise.all(ids.slice(i, i + 3).map((id) => generate(id, ASSETS[id]).catch((e) => console.error('✗', e.message))))
