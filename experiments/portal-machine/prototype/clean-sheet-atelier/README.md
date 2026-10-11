# Portal Machine — Clean-Sheet Whole-Object Atelier Study 01
**Status:** Interactive sculptural BLOCKOUT for Walter's art direction approval. Not published, not the new site's final design.

## Why this exists
Walter rejected V14's side-by-side switch/projector/dashboard boxes as Frankenstein instead of Fifth Element. This is a **new Three.js scene authored from scratch**, NOT a restyled V14 layout. No sections of V14's 3D source or old homepage were imported. Only the mechanical CONSTRAINTS of the functioning switch were retained, not the clumsy standalone switch assembly styling.

## Explore it
Open `index.html` in Chrome on Mac.
- Drag canvas to orbit; scroll to zoom.
- Click the **integrated black lever at the machine's left shoulder** or the accessible **THROW MAIN CURRENT** button to close/open the switch.
- Switch powers one real-time sculptural projection mesh, glass filaments and local lamps. Everything belongs to a single machine body.
- Use RESET VIEW to recover the designed angle.
- Resize Chrome: separate full-machine initial framing on desktop and mobile.

## Design and mechanics
- One large flowing cast-metal hull with a contiguous top inlay and matching copper trim.
- A central resonant aperture set into sculptural column roots anchored to that hull; three vacuum-valves, induction reactor and copper plumbing live toward one side, engraved dials toward the other. Same metal/palette/camera, no pasted-on UI frames.
- One practical upright Bakelite knife-lever mounted into the machine's left shoulder, NOT a separate control box. For now we intentionally DO NOT use the rejected Y-shaped lever. Two copper blades pivot together on a shared rear conductive hinge and descend into two **separate** fixed front contacts. Their two thick, dark/red cables exit through the underside front, and no fixed crossbar links the lower terminals. OFF=real gap, ON=moving blades bridge.
- Only one underlying power Boolean. Lever throw animates blade assembly and activates lighting+the placeholder volumetric membrane.
- Geometric visuals are a SILHOUETTE BLOCKOUT. The active membrane is a moving WebGL mesh but is an illustrative placeholder, NOT the final validated V12 physics solver. Audio, historical curtain, capture-state logic and actual homepage are intentionally absent at this first visual approval gate; they are all safely preserved in the V13–V14 prototypes.
- Matte color studies only; full Da Vinci crosshatching, fine materials, wear, cinema-grade lighting and score/sound are later stage work.

## Files
`index.html` — minimal stand-alone design-review shell, not the full website.
`src.js` — parametric 3D scene source, named movable groups/parts, one power state.
`bundle.js` — ready-to-open local-file browser build of Three.js scene.
`package.json`/`package-lock.json` — precise build dependencies (Three.js + esbuild).

To rebuild:
```sh
npm ci
npx esbuild src.js --bundle --format=iife --target=es2020 --outfile=bundle.js --minify
```
Use a static localhost server for general browser deploy or preview; Chrome can load the prebundled relative bundle via file://.

## Acceptance before any next build
Walter chooses KEEP/CHANGE/DISCARD on the machine as one object: overall silhouette; balance between left reactor and right dials; portal integration; main switch position/proportions; readiness for high-detail material stage. Do not rush back into mounting separate projectors/controls or the homepage until the whole object reads correctly.

## QA
Headless Chrome at 1440 desktop, 1000 laptop and 390 mobile: power OFF -> ON -> OFF, lever angle -62 -> approx 0 -> -62, no page JS errors, viewport no horizontal overflow. Direct click on the 3D lever passed both desktop and mobile tests. Mobile camera re-framed to show full object. No claims of physical/electrical certification, performance at all GPUs or artist approval.