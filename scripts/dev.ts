// Egy paranccsal indul a szimulátor (Vite) és a beépített Hot Seat (portfólióvédés) is.
// A Hot Seat a hotseat/ submodule-ból fut; ha a 4740-es port már foglalt, azt használjuk.
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'

const PORT = Number(process.env.HOTSEAT_PORT ?? 4740)
const procs: ReturnType<typeof spawn>[] = []
const run = (cmd: string, args: string[], env: Record<string, string> = {}) =>
  procs.push(spawn(cmd, args, { stdio: 'inherit', env: { ...process.env, ...env } }))

const busy = await fetch(`http://127.0.0.1:${PORT}/api/boards`).then(() => true, () => false)
if (busy) console.log(`Hot Seat már fut: http://localhost:${PORT}`)
else if (!existsSync('hotseat/app/server.mjs')) console.log('A hotseat/ submodule üres: git submodule update --init')
else run('node', ['hotseat/app/server.mjs'], { PORT: String(PORT) })

run('bunx', ['vite', ...process.argv.slice(2)], { VITE_HOTSEAT_URL: `http://localhost:${PORT}` })

const stop = () => (procs.forEach((p) => p.kill()), process.exit())
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
