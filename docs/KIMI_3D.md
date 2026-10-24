You are working in a Vite + React 19 + TypeScript + React Three Fiber (three 0.186, drei 10) project:
a Hungarian electrician practical-exam simulator ("villanyszerelő vizsga"). Read README.md and
docs/KUTATAS.md first. Units are METRES, the mounting board's front face is the plane z = 0,
origin = bottom-left corner of the board (1.5 m × 1.1 m).

GOAL: replace the primitive placeholder meshes in src/scene/Scene.tsx with realistic,
dimensionally accurate PROCEDURAL models (no external files, no network), so the board looks
like a real Hungarian exam board (Hager/Schneider/Legrand style white devices, grey enclosure,
white PVC trunking).

Create src/scene/models/ with one component per device, each a pure visual component:
- `Mcb` (1-module 18 mm DIN MCB: body 18×85×~65 mm with the stepped front profile, toggle lever,
  rating print "B10"/"B16"/"C32" via CanvasTexture, top/bottom screw terminals as recessed holes)
- `Rcd` (2-module 36 mm, blue/grey lever, yellow "T" test button, "40A 30mA" print)
- `Spd` (2-module, green status window)
- `SurfaceBox` (70×70×40 mm IP44 surface box with rounded corners, knock-outs)
- `SwitchRocker` (rocker + frame; prop `state` tilts the rocker; variants 101/105/106/107 drawn as
  icons on the rocker), `Socket2PF` (Schuko-style 2P+F with PE clips),
- `LampFitting` (round bulkhead with opal diffuser, `lit` prop → emissive), `MotionSensor` dome,
- `DistBox` (12-module surface enclosure, open front, DIN rail, N (blue) and PE (green) terminal
  bars with 6 screws each), `TrunkingProfile` (U-profile with lid: build it from an ExtrudeGeometry
  of the cross-section, keep the existing 45° mitre logic from `pieceShape`).

HARD CONSTRAINTS
1. Do NOT change game logic: src/sim/* must stay untouched; all tests in tests/ must pass (`bun test`).
2. Keep EXACT external dimensions and anchor points from src/sim/layout.ts and src/sim/catalog.ts
   (MODULE_W, BOX_SIZE, LAMP_R, DIST, terminal offsets `off`). Terminal positions are computed by
   `termWorld()` in Scene.tsx – terminals must still sit on the visible screw of your model.
3. Keep every onClick / onPointerOver handler working (switch toggle, DIN lever toggle, RCD test
   button, terminal click, trunk selection). Wrap your model, don't remove the handlers.
4. Performance: < 150k triangles for the whole board, reuse geometries/materials (useMemo or module
   level), no shadows on tiny parts.
5. Use only CanvasTexture for printed labels (no font downloads).
6. `bun run build` and `bun test` must pass. Then run `bun run dev` and check the 8 stages visually.

Deliver: the new files, the edited Scene.tsx, and a short list of what changed.
