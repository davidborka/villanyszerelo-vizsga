You are working in a Vite + React 19 + TypeScript + React Three Fiber 9 (three 0.186, drei 10) project:
a Hungarian electrician practical-exam simulator. Read README.md, then src/scene/Scene.tsx,
src/scene/models/*, src/App.tsx, src/index.css. Units are METRES; the mounting board's front face
is z = 0, origin bottom-left, board 1.5 × 1.1 m. Use `bun` (bun add, bun test, bun run build).

GOAL: make the 3D view look and feel like a polished AAA simulation game (think "PowerWash
Simulator" / "House Flipper" quality), while keeping it fast in a laptop browser.

Do these, in order, verifying each in the browser (`bun run dev`, Chromium) before the next:
1. Rendering: add @react-three/postprocessing — ACES tone mapping, subtle Bloom (only emissive:
   lit lamps, LEDs), N8AO ambient occlusion, SMAA, light vignette. Soft shadows (drei
   SoftShadows or AccumulativeShadows for static parts). Keep 60 fps on integrated GPUs: add an
   automatic quality fallback (drei PerformanceMonitor → lower dpr, disable AO).
2. Environment: a believable exam workshop around the board — concrete floor, painted back wall,
   workbench edge at the bottom, ceiling fluorescent light (all procedural, no downloads).
   The board stays the hero; the camera must still frame it via FitCamera.
3. Camera: replace OrbitControls with drei CameraControls. Smoothly dolly/focus to the selected
   trunking piece (state.selectedPiece) or mount (state.selectedMount) and back out on deselect;
   double-click anywhere on the board focuses that point. Clamp so the user never loses the board.
4. Feedback: hover highlight on every interactive object (drei Outlines or emissive rim),
   cursor changes, small press animations (rocker tilt easing, DIN lever snap, push-button travel),
   lids snapping on with a short tween.
5. Sound: a tiny WebAudio module (src/scene/sfx.ts, synthesized, no audio files): click, rocker,
   DIN lever clack, saw (on store action cutPiece), drill buzz (mount), breaker trip "thunk",
   RCD trip, wire connect "tick". Subscribe to the zustand store (useGame.subscribe) to detect
   events – do not change store logic. Master mute button in the header (localStorage, try/catch).
6. HUD polish: the CSS in src/index.css already has a dark game HUD; refine only where needed so the
   3D view and HUD feel like one product (no layout changes to the left panel).

HARD CONSTRAINTS
- Do NOT modify anything in src/sim/ or tests/circuit.test.ts. All tests must pass (`bun test`).
- Keep every onClick / onPointer handler and terminal position working (termWorld()).
- No external asset downloads at runtime except the Google Fonts already in index.html.
- `bun run build` must pass; no console errors. Total triangle count stays < 250k.
- Match the existing code style (small components, Hungarian comments are fine).

Deliver: changed/new files and a short list of what changed, with screenshots of: start screen,
csatorna stage with a selected piece (camera focused), vezetékezés stage, powered ellenőrzés stage
with a lit lamp.
