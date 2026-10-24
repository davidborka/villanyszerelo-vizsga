# Továbbépítési prompt (Kimi Code / bármely kódoló modell)

Másold be egészben, a projekt gyökerében indítva (`kimi -m kimi-code/k3.1-pro -p "$(cat docs/HANDOFF_PROMPT.md)"`, vagy interaktívan: `kimi -m kimi-code/k3.1-pro --auto`, majd beilleszted; a `-p` nem kombinálható a `--auto`/`-y` kapcsolóval).

---

You are continuing a working project: a realistic 3D web simulator for the Hungarian electrician
practical exam ("4 0713 04 07 Villanyszerelő – Épületvillamosság", KKK 2024.08.29 v4). The UI
language is Hungarian; keep all user-facing text Hungarian and technically correct.

Stack: Vite 8, React 19, TypeScript, React Three Fiber 9 + drei 10 (three 0.186), zustand 5, bun.
Commands: `bun run dev`, `bun test`, `bun run build`. Read first, in this order:
README.md → docs/KUTATAS.md (exam research, scoring weights, real 2026 sample task, sources)
→ src/sim/layout.ts → src/sim/catalog.ts → src/sim/circuit.ts → src/sim/store.ts
→ src/scene/Scene.tsx → src/ui/Panels.tsx → src/ui/Drawings.tsx → tests/circuit.test.ts.

What exists (do not break it): 8 exam stages (task sheet, material + tool selection, drawing reading,
cable trunking measure/cut 90°/45°/deburr/mount/level, device placement incl. DIN rail, terminal-to-
terminal wiring routed through the trunking graph, inspection + measurements + protocol, scoring).
The wiring is validated by a union-find network model per switch state (shorts, RCD bypass, missing
PE, switched neutral, colour and cross-section rules, MCB/RCD trips). Scoring follows the KKK part II
weights; any shock-protection error = "ÉRVÉNYTELEN".

Rules:
- Keep src/sim free of React/three imports; put every new electrical rule into circuit.ts with a test
  in tests/ first (red → green). Every change: `bun test` and `bun run build` must pass.
- Dimensions in metres, board face z = 0. Keep geometry dimensionally accurate (real catalogue sizes).
- Match the existing code style (small components, zustand selectors, Hungarian comments).
- Verify visually in the browser after each milestone (all 8 stages, plus a deliberately wrong wiring).

Milestones, in order (finish and verify each before the next):
1. Task variants as data: move the "nyári konyha" task into `src/tasks/nyariKonyha.ts` (mounts, pieces,
   expected devices, one-line diagram segments, measurements) and add 3 more tasks from the KKK list:
   (a) lépcsőházi automata + 3 nyomógomb + 2 lámpa, (b) impulzusrelé (távkapcsoló) 3 nyomógombbal,
   (c) csillárkapcsoló (105) + 2 lámpakör + 2 dugalj. Add the needed devices to catalog.ts with
   correct terminals (A1/A2, 1-2, 3-4 for relays; L, N, ↑ for staircase timer) and timed behaviour.
2. III. vizsgarész – fogyasztásmérő hely: 1-phase surface meter cabinet, main MCB, sub-meter with
   correct in/out (1-3 L, 4-6 N), méretlen/mért vezeték colours and cross-sections (min. 6/10 mm²),
   PEN/TN-C-S split rules, and scoring (shock protection 20%, overcurrent+surge 5%, wiring 10%,
   aesthetics 5%).
3. Free trunking route: let the student draw the route on a 5 cm grid (snap), then derive the cut
   list (with T-joints and 45° corners) automatically; score aesthetics (straightness, symmetry,
   minimal joints, distance from boxes).
4. More measurements (MSZ HD 60364-6): loop impedance Zs vs. Ia (B16 → Zs ≤ 230 V / 80 A), RCD trip
   time at IΔn (≤ 300 ms) and 5·IΔn (≤ 40 ms), polarity; generate consistent values from the actual
   wiring; a full printable "Mérési jegyzőkönyv" (instrument, type, serial no., range, diagram).
5. Interactive-exam practice mode (30% of the exam): multiple-choice bank for the four topic areas
   (material 20%, technology 20%, calculation 20% – cross-section by current capacity and voltage
   drop, power/energy –, safety 40%), randomized, with explanations.
6. Assets: run `bun scripts/gen-assets.ts` (fal.ai Hunyuan3D v3.1 Pro, needs FAL_KEY) for tools,
   show the active tool as a GLB in a corner viewport; procedural device models per docs/KIMI_3D.md.
7. Persistence + UX: save progress in localStorage (try/catch), undo, hints toggle ("vizsga mód"
   without hints, real 300-minute timer), mobile layout, keyboard shortcuts for tools.

Report at the end: what changed, which tests were added, screenshots of each milestone, and any
exam-rule you were unsure about (cite the KKK or the standard).
