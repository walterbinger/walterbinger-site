# Production Sprint Board — Portal Machine
Revision 0.1 | 2026-10-10 | Branch: portal-machine-production-system-20261010

Status vocabulary: BACKLOG / READY / IN PROGRESS / BLOCKED / REVIEW / APPROVED. None of the tasks below is approved as delivered.

| ID | Deliverable | Driver | Dependency | Status | Acceptance evidence |
|---|---|---|---|---|---|
| PM-001 | Freeze reference inventory and KEEP/REPLACE audit | Scout + Codex | existing V6,V11,V12,V13 | READY | reference links, no lost approved work, verified baseline |
| PM-002 | Consolidated assembly view: front, 3/4, camera, material sheet | visual specialist | PM-001 | BACKLOG | all components share same geometry/lighting |
| MECH-001 | Knife switch micro-prototype up OFF → down ON | visual specialist + Codex | PM-001 | READY | actual center hinge/contact in 2 views; Walter visual approval |
| MECH-002 | Power+signal routing diagram, ports and cable harness | CAD/3D + Codex | PM-002,MECH-001 | BACKLOG | every cable endpoint named and visible |
| SIM-001 | Decouple WaveSolver from V12/V13 monolithic HTML | Codex physics | PM-001 | READY | deterministic grid snapshots, XY and injector unit tests |
| AUD-001 | Warm instrument A/B listening lab | audio specialist | SIM-001 | BACKLOG | same params as visual, 60-sec comfortable listening, mute |
| VIS-001 | Real wave-driven 3D-looking projector | generative visual engineer | SIM-001,PM-002 | BACKLOG | live nodal field, capture replay, frame-budget checks |
| UX-001 | Joystick/injectors/capture components with accessible controls | Codex | SIM-001 | BACKLOG | touch/pointer/keyboard, no placeholder controls |
| INT-001 | Assemble accepted modules in one site threshold | Codex | MECH-002,AUD-001,VIS-001,UX-001 | BACKLOG | entire artifact and projector visible while controlling |
| QA-001 | Cross-device/audio/a11y/route regression | Scout + Codex + Claude | INT-001 | BACKLOG | checklists, no material errors, independent editorial review |
| REL-001 | User-approved staging→live merge with rollback | Walter + Codex | QA-001 | BLOCKED | explicit approval and real staging evidence |

## FIRST THREE SHIPPABLE WORK PACKAGES
A. Isolated **knife-switch motion test** (mechanical, 2-view, editable geometry, short clip). Do this before full render and reject a pretty drawing with impossible motion.
B. Isolated **XY physics/music/cymatics lab** (minimal UI, real waveform canvas, audio selectors, no lavish art). Prove continuous response and acceptable timbre.
C. **Assembly architectural elevation** (front, 3/4, parts list, named socket map) that physically connects everything. This must be reviewed before final decorative concept art.

## Review and iteration
Walter approves work PACKAGE BY PACKAGE. If a specialist cannot provide source-editable geometry, clean alpha exports and defined pivots/ports, mark concept-only. Claude challenges coherence. Scout updates ledger and board. Codex never bakes unapproved assets into production.
