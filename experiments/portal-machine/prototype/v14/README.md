# Unnamed Portal Machine — V14 Integrated Y-Lever Preview
**11 October 2026 — WORKING PREVIEW, NOT LIVE.**

## Open and test
File on connected Mac:
`~/Documents/WalterBinger.Com/Prototypes/Portal-V14-Integrated-Interactive-Machine/index.html`

Open the local HTML in Chrome; it uses a bundled THREE/WebGL 3D model plus inline website content and a live membrane/sound solver. No paid image generation is needed for the interaction. The stage is embedded in the existing professional homepage's Universe threshold; it is NOT an isolated switch lab.

1. Scroll to the Universe threshold; pull the hanging cord to drop the ivory curtain.
2. **Click the physical upright Y-lever on the 3D machine** (or activate the accessible 'THROW MAIN CURRENT' button on the control deck). The 3D assembly swings from 68° OFF to 0° ON.
3. Drag/orbit the machine canvas with a pointer to inspect the geometry. The power state appears in the brass plaque below the 3D model.
4. Move the center XY joystick to sculpt the numerical standing-wave field. Select voice (Velvet Keys, Glass, Tube Organ, Marimba) and register (Low/Mid/High); press the six color-coded harmonic injectors.
5. **CAPTURE STATE** captures three actual wavefield snapshots. After the third capture, deliberately press TRANSMIT to start the transit to Universe. The right-hand direct Universe bypass remains available.

## New V14 mechanics
The user specified a visually literal Y-shaped upright handle instead of the prior horizontal '['-shaped cross-grip. Two short **insulating** fork branches join the free blade ends to one upright Bakelite grip. It is articulated together with the copper blades around ONE stationary common hinge. 

The **two thick external cables are both at the FRONT/BOTTOM**, one visually subdued red supply and one black output, and terminate at **electrically isolated** fixed front contacts. The former front common copper busbar was REMOVED. When ON, each front contact receives one copper blade; the blades are electrically joined through their **floating rear conductive hinge bridge**, which completes the one circuit. OFF has an actual open gap between front terminals. These are an illustrative, non-certified simulation of a contactor; no real high-current hardware is built.

## Site and visual architecture
- The V13 full-page homepage preview was used as the unchanged general site foundation; existing hero, main career sections, resume card ordering, right-side Universe bypass and original gravity curtain are preserved.
- V13's flat 2D left-side component illustration is replaced with a real Three.js model on the LEFT. This scene includes aged iron/wood machine body, an Y-lever main switch, actual metal/porcelain parts, cable conduits, copper coil generator, glass valves, and generator copper tubing. It uses mesh materials/lighting, not a generated still image.
- RIGHT: framed ring-like cymatic projector with the existing dynamically calculated modal field, sand, captured contours and artistic cognitive atlas. This is 2.5D rather than fully volumetric 3D; future art work should increase dimensional depth while continuing to consume the same actual WaveFrame.
- BELOW: V13 central XY joystick, musical voices, octave, colored harmonic injectors, capture bank and deliberate TRANSMIT.
- **No site deployment; no changes to GitHub main branch.** The version lives in an experimental branch.

## Source
- `index.html`: full page integrated preview.
- `src.js`: canonical editable 3D geometry code for the machine, switch and art hardware.
- `machine.bundle.js`: locally bundled executable Three.js for file:// preview.
- `package.json`, `package-lock.json`: dependencies. Rebuild after editing src.js:
```sh
npm ci
npx esbuild src.js --bundle --format=iife --target=es2020 --outfile=machine.bundle.js --minify
```
- `/tmp/qa-v14-integrated.js`: local Puppeteer regression script used for QA.

## QA and limitations
**Verified** at 1440x1000 desktop, 1000x900 laptop and 390x844 mobile: no JavaScript errors, no page horizontal overflow, no model/console or projector/console overlap, 68° OFF → 0° ON, two blades, one hinge, two cables from front/bottom, no front busbar, stable UV/3D generated geometry. Joystick/color changes alter actual wavecanvas pixels, three captures enable TRANSMIT, and transit overlay appears after activation. Mouse click on the actual physical Y-shaped grip toggles power ON. Accessibility of keyboard/touch and final motion/power timing need further dedicated review.

**Not yet artistically approved**: screenshot quality and material realism should be evaluated in the open preview. Generator is real 3D but the cymatic projector uses the existing V13 calculated 2D field with projected mesh contours, not yet full WebGL 3D volume. Sound still needs human listening/comfort test. Mechanical contact alignment is demonstrative, not an electrically validated engineering rating.

**Later changes**: independently approve moving Y-lever silhouette, conductor routing, meaningful 3D wave object and warm audio. Keep working physical geometry isolated from generative image tools and reuse the project production handoff contract.