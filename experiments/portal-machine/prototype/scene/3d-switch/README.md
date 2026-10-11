# Articulated Knife Switch — True 3D Study III

**Status:** Mechanically constrained demonstration, NOT an approved final visual asset. Production website not altered.

This folder replaces repeated AI image prompting with a reproducible geometric 3D switch, implemented using **Three.js 0.180** and bundled locally using **esbuild**.

## Mechanics
- 2 copper blades, 1 common rear pivot axis and one black Bakelite handle linking the FREE ends.
- 2 permanent stationary jaw slots at the front, no moving linkage rods.
- 2 heavy black cloth-insulated cables total: source busbar (shared hinge feed) and load busbar (shared contact feed). The two blades are PARALLEL SWITCH CONTACTS of the same conceptual circuit, not four terminal poles.
- OFF / 68° raised, ON / 0° closed; actual 3D pivot group rotates about its local X axis. All fixed mounts remain constant.
- Endpoints and material meshes are named so geometry can be audited independently of painted textures.
- One intentionally illustrative electrical construction, not an engineer-approved energized switch or current-rated device.

## Run locally
The Mac contains the built files at `Documents/WalterBinger.Com/Prototypes/Switch-Lab/Three-D-Assembly`. Open `index.html` in Chrome. Drag to orbit, scroll to zoom, press OFF/ON or scrub travel.

For repeatable builds on another device:
```sh
npm install
npx esbuild src.js --bundle --format=iife --target=es2020 --outfile=bundle.js --minify
python3 -m http.server 8000
```
Open http://localhost:8000; no API key or paid generation required.

## Editable Blender asset
The **EXPORT ANIMATED 3D GLB** button generates a full `.glb` file with all named meshes and an animation clip `OPEN_to_CLOSED`. Tested exported file: 9,844,224 bytes, glTF 2.0, 188 nodes, 183 meshes, 13 materials, 6 textures and 1 animation. Existing local export: `exports/twin-blade-switch-animated-r01.glb`. Import to Blender via File → Import → glTF 2.0 (.glb/.gltf). Blender itself is not installed on the connected Mac at this stage.

## Visual treatments: AI job is NOW texture, not switch invention
Use Nano Banana/Gemini ONLY for:
1. Seamless aged copper PBR surface samples (base color, roughness, normal/bump concepts).
2. Worn cast-iron microtexture, tool marks, engraved edges and aged iron patina.
3. Ivory glazed porcelain and polished black Bakelite surface studies.
4. Renaissance engineering-paper/crosshatching treatment and studio lighting references.

**Never use an image-to-image redraw of the COMPLETE switch as an implementation input.** Image generation repeatedly invented fourth cables, crossed rods and inconsistent pivots. Approved art must be transferred onto this geometry via material maps, lighting/tonemapping and carefully planned ornaments. The 3D mesh remains the authority.

## Tests and known limitations
- Headless Chrome desktop 1440px/mobile 390px: 68° OFF → 0° ON → 68° OFF, correct counters, responsive no-overflow and no JS errors.
- Actual downloadable GLB checked: correct binary header/length, one animation clip and named `Blade_Assembly`.
- 3D shadowing and procedural PBR-ish materials already included; **not** museum-grade hand-rendered Da Vinci artwork. The shader/material pass and final close-up geometry will require aesthetic judgment.
- Cable tails are routed off the preview edges instead of showing disconnected ends. On actual machine integration they'll terminate in modeled enclosure feedthrough ports.
- External fonts are optional; the mesh/browser interaction requires no network once bundled.
- Keep site main branch untouched until Walter approves both motion and art.

**Saved prior baseline**: `../Archived Baselines/switch-geometry-proof-v1.html`.
**Parent prototype**: `../Exposed-Twin-Blade-Switch-Mechanism-Preview.html`.