import { generateAmbientStars } from "../domain/ambient";
import {
  type CelestialNode,
  type LensWeights,
  type Vector3,
} from "../domain/cosmology";
import { DIRECTED_RELATIONSHIPS } from "./relationships";
import { substancePhysics } from "./substance";

const sourceAsset = (path: string) =>
  `${import.meta.env.BASE_URL}assets/source/${path}`;

function weights(
  red: number,
  orange: number,
  yellow: number,
  green: number,
  blue: number,
  indigo: number,
  violet: number,
  magenta: number,
): LensWeights {
  return { red, orange, yellow, green, blue, indigo, violet, magenta };
}

interface AuthoredBodyInput {
  id: string;
  label: string;
  kind: CelestialNode["kind"];
  state: CelestialNode["state"];
  position: Vector3;
  lensWeights: LensWeights;
  importance: number;
  route?: string;
  glyphKey: string;
  relatedNodeIds: string[];
  motionClass: CelestialNode["motionClass"];
  inspectable?: boolean;
  artifacts?: CelestialNode["artifacts"];
}

function authoredBody(input: AuthoredBodyInput): CelestialNode {
  const physics = substancePhysics(input.id);
  const causalNeighbors = DIRECTED_RELATIONSHIPS.flatMap((relationship) => {
    if (relationship.sourceId === input.id) return [relationship.targetId];
    if (relationship.targetId === input.id) return [relationship.sourceId];
    return [];
  });

  return {
    id: input.id,
    kind: input.kind,
    state: input.state,
    tier: "authored",
    publicLabel: input.label,
    internalLabel: input.label,
    basePosition: input.position,
    lensWeights: physics.lensWeights,
    contentMass: physics.contentMass,
    importance: physics.importance,
    inspectable: input.inspectable ?? true,
    route: input.route,
    glyphKey: input.glyphKey,
    motionClass: input.motionClass,
    relatedNodeIds: [...new Set([...input.relatedNodeIds, ...causalNeighbors])],
    projectIds: input.kind === "project" ? [input.id] : [],
    conceptIds: input.kind === "concept" ? [input.id] : [],
    artifactIds: input.artifacts?.map((artifact) => artifact.id) ?? [],
    constellationIds: [],
    mysteryTags: [],
    artifacts: input.artifacts,
  };
}

function sourceBackedBody(
  input: Omit<
    AuthoredBodyInput,
    "lensWeights" | "importance" | "relatedNodeIds"
  >,
): CelestialNode {
  const physics = substancePhysics(input.id);
  return authoredBody({
    ...input,
    lensWeights: physics.lensWeights,
    importance: physics.importance,
    relatedNodeIds: [],
  });
}

const CORE_BODIES: readonly CelestialNode[] = [
  authoredBody({
    id: "cv-archive",
    label: "Professional Archive",
    kind: "world",
    state: "world",
    position: { x: -840, y: -390, z: 220 },
    lensWeights: weights(0.62, 0.55, 0.22, 0.92, 0.58, 0.42, 0.84, 0.51),
    importance: 0.92,
    route: "professional-archive",
    glyphKey: "archive",
    relatedNodeIds: ["healthcare", "hospitality", "library-writing"],
    motionClass: "stable",
  }),
  authoredBody({
    id: "brooklyn",
    label: "Brooklyn / NYC",
    kind: "place",
    state: "world",
    position: { x: -1040, y: 260, z: -180 },
    lensWeights: weights(0.66, 0.57, 0.7, 0.46, 0.72, 0.86, 0.96, 0.72),
    importance: 0.86,
    route: "brooklyn",
    glyphKey: "bridge",
    relatedNodeIds: ["empanadas-son", "hospitality", "photo-archive"],
    motionClass: "orbital",
  }),
  authoredBody({
    id: "maine",
    label: "Maine",
    kind: "place",
    state: "world",
    position: { x: -440, y: 820, z: 360 },
    lensWeights: weights(0.48, 0.42, 0.65, 0.94, 0.8, 0.68, 0.58, 0.74),
    importance: 0.78,
    route: "maine",
    glyphKey: "pine",
    relatedNodeIds: ["photo-archive", "sports-playbook"],
    motionClass: "orbital",
  }),
  authoredBody({
    id: "argentina",
    label: "Argentina",
    kind: "place",
    state: "world",
    position: { x: 180, y: 980, z: -360 },
    lensWeights: weights(0.78, 0.62, 0.84, 0.45, 0.7, 0.98, 0.91, 0.82),
    importance: 0.9,
    route: "argentina",
    glyphKey: "sun-of-may",
    relatedNodeIds: ["hospitality", "empanadas-son", "photo-archive"],
    motionClass: "orbital",
  }),
  authoredBody({
    id: "hospitality",
    label: "Hospitality",
    kind: "world",
    state: "world",
    position: { x: 840, y: 660, z: 260 },
    lensWeights: weights(0.96, 0.92, 0.88, 0.72, 0.62, 0.66, 0.92, 0.65),
    importance: 1,
    route: "hospitality",
    glyphKey: "doorway",
    relatedNodeIds: [
      "cv-archive",
      "brooklyn",
      "argentina",
      "empanadas-son",
      "healthcare",
    ],
    motionClass: "stable",
  }),
  authoredBody({
    id: "healthcare",
    label: "Healthcare",
    kind: "world",
    state: "world",
    position: { x: 1110, y: -10, z: -220 },
    lensWeights: weights(1, 0.62, 0.55, 1, 0.66, 0.28, 0.86, 0.54),
    importance: 1,
    route: "healthcare",
    glyphKey: "balance",
    relatedNodeIds: [
      "cv-archive",
      "hospitality",
      "thinking-in-4d",
      "field-tools",
      "craft",
      "care",
      "service",
    ],
    motionClass: "stable",
  }),
  authoredBody({
    id: "field-tools",
    label: "PREP / PERP Field Tools",
    kind: "project",
    state: "world",
    position: { x: 560, y: -430, z: 690 },
    lensWeights: weights(0.86, 0.74, 0.28, 1, 0.54, 0.42, 0.92, 0.78),
    importance: 0.94,
    route: "field-tools",
    glyphKey: "field-tools",
    relatedNodeIds: ["healthcare", "thinking-in-4d", "library-writing"],
    motionClass: "stable",
  }),
  authoredBody({
    id: "thinking-in-4d",
    label: "Thinking in 4D",
    kind: "essay",
    state: "world",
    position: { x: 960, y: -720, z: 420 },
    lensWeights: weights(0.42, 0.66, 0.34, 0.78, 0.92, 0.58, 0.88, 1),
    importance: 0.94,
    route: "thinking-in-4d",
    glyphKey: "torus",
    relatedNodeIds: [
      "healthcare",
      "library-writing",
      "listening-room",
      "field-tools",
    ],
    motionClass: "warp",
  }),
  authoredBody({
    id: "empanadas-son",
    label: "Empanadas Son!",
    kind: "project",
    state: "world",
    position: { x: 230, y: -980, z: -290 },
    lensWeights: weights(0.82, 0.96, 1, 0.68, 0.52, 0.82, 0.88, 0.72),
    importance: 1,
    route: "empanadas-son",
    glyphKey: "empanadas-sun",
    relatedNodeIds: [
      "brooklyn",
      "argentina",
      "hospitality",
      "art",
      "craft",
      "care",
    ],
    motionClass: "orbital",
    artifacts: [
      {
        id: "empanada-beef-burgundy",
        label: "Beef Burgundy menu drawing",
        src: sourceAsset("empanadas-son/beef-burgundy.png"),
      },
      {
        id: "empanada-verduras",
        label: "Verduras menu drawing",
        src: sourceAsset("empanadas-son/verduras.png"),
      },
      {
        id: "empanada-smores",
        label: "S'mores menu drawing",
        src: sourceAsset("empanadas-son/smores.png"),
      },
      {
        id: "empanada-carne",
        label: "Carne menu drawing",
        src: sourceAsset("empanadas-son/carne.png"),
      },
      {
        id: "empanada-apple-pie",
        label: "Apple pie menu drawing",
        src: sourceAsset("empanadas-son/apple-pie.png"),
      },
    ],
  }),
  authoredBody({
    id: "life-of-pie",
    label: "Life of Pie",
    kind: "world",
    state: "world",
    position: { x: -520, y: -160, z: 960 },
    lensWeights: weights(0.95, 0.96, 1, 0.88, 0.72, 0.92, 0.9, 0.88),
    importance: 0.94,
    route: "life-of-pie",
    glyphKey: "life-of-pie",
    relatedNodeIds: [],
    motionClass: "stable",
  }),
  authoredBody({
    id: "art",
    label: "Art",
    kind: "concept",
    state: "star",
    position: { x: -90, y: -520, z: 210 },
    lensWeights: weights(0.46, 0.96, 0.64, 0.42, 0.76, 0.5, 0.86, 1),
    importance: 0.72,
    route: "art",
    glyphKey: "concept-art",
    relatedNodeIds: ["empanadas-son"],
    motionClass: "reflective",
  }),
  authoredBody({
    id: "craft",
    label: "Craft",
    kind: "concept",
    state: "star",
    position: { x: 610, y: -580, z: 180 },
    lensWeights: weights(0.66, 1, 0.78, 0.88, 0.48, 0.46, 0.58, 0.62),
    importance: 0.8,
    route: "craft",
    glyphKey: "concept-craft",
    relatedNodeIds: ["empanadas-son", "healthcare"],
    motionClass: "stable",
  }),
  authoredBody({
    id: "care",
    label: "Care",
    kind: "concept",
    state: "star",
    position: { x: 760, y: 160, z: 360 },
    lensWeights: weights(1, 0.58, 0.54, 0.9, 0.52, 0.38, 0.84, 0.7),
    importance: 0.84,
    route: "care",
    glyphKey: "concept-care",
    relatedNodeIds: ["empanadas-son", "healthcare"],
    motionClass: "pulsing",
  }),
  authoredBody({
    id: "service",
    label: "Service",
    kind: "concept",
    state: "star",
    position: { x: 1160, y: -330, z: 320 },
    lensWeights: weights(0.9, 0.66, 0.42, 0.96, 0.5, 0.52, 0.92, 0.58),
    importance: 0.78,
    route: "service",
    glyphKey: "concept-service",
    relatedNodeIds: ["healthcare"],
    motionClass: "stable",
  }),
  authoredBody({
    id: "library-writing",
    label: "Library / Writing",
    kind: "world",
    state: "world",
    position: { x: -360, y: -900, z: 480 },
    lensWeights: weights(0.42, 0.58, 0.56, 0.72, 0.8, 0.48, 0.98, 0.92),
    importance: 0.84,
    route: "library-writing",
    glyphKey: "book",
    relatedNodeIds: [
      "cv-archive",
      "thinking-in-4d",
      "listening-room",
      "field-tools",
    ],
    motionClass: "stable",
  }),
  authoredBody({
    id: "listening-room",
    label: "Listening Room",
    kind: "world",
    state: "world",
    position: { x: -930, y: -720, z: -430 },
    lensWeights: weights(0.56, 0.36, 0.7, 0.32, 1, 0.66, 0.96, 0.88),
    importance: 0.74,
    route: "listening-room",
    glyphKey: "wave",
    relatedNodeIds: ["thinking-in-4d", "library-writing", "sports-playbook"],
    motionClass: "pulsing",
  }),
  authoredBody({
    id: "photo-archive",
    label: "Photo Archive",
    kind: "world",
    state: "world",
    position: { x: -1160, y: 40, z: 590 },
    lensWeights: weights(0.56, 0.52, 0.82, 0.58, 0.88, 0.92, 0.86, 0.9),
    importance: 0.8,
    route: "photo-archive",
    glyphKey: "aperture",
    relatedNodeIds: ["brooklyn", "maine", "argentina"],
    motionClass: "reflective",
  }),
  authoredBody({
    id: "sports-playbook",
    label: "Sports Field / Playbook",
    kind: "world",
    state: "world",
    position: { x: 540, y: 260, z: 880 },
    lensWeights: weights(0.78, 0.4, 0.48, 0.7, 0.68, 0.96, 0.9, 0.72),
    importance: 0.68,
    route: "sports-playbook",
    glyphKey: "play",
    relatedNodeIds: ["maine", "listening-room"],
    motionClass: "pulsing",
  }),
] as const;

export const PROJECT_BODIES: readonly CelestialNode[] = [
  sourceBackedBody({
    id: "hcsg-district-operations",
    label: "HCSG District Operations",
    kind: "project",
    state: "star",
    position: { x: 1260, y: 330, z: 170 },
    route: "hcsg-district-operations",
    glyphKey: "balance",
    motionClass: "stable",
  }),
  sourceBackedBody({
    id: "mealtracker-pcc-rollout",
    label: "MealTracker / PointClickCare",
    kind: "project",
    state: "star",
    position: { x: 880, y: 210, z: 760 },
    route: "mealtracker-pcc-rollout",
    glyphKey: "field-tools",
    motionClass: "orbital",
  }),
  sourceBackedBody({
    id: "livewell-turnaround",
    label: "LiveWell Turnaround",
    kind: "project",
    state: "star",
    position: { x: 1320, y: -360, z: 130 },
    route: "livewell-turnaround",
    glyphKey: "balance",
    motionClass: "stable",
  }),
  sourceBackedBody({
    id: "island-nursing-home",
    label: "Island Nursing Home",
    kind: "project",
    state: "star",
    position: { x: -170, y: 1080, z: 650 },
    route: "island-nursing-home",
    glyphKey: "concept-care",
    motionClass: "pulsing",
  }),
  sourceBackedBody({
    id: "circus-restobar",
    label: "Circus RestoBar",
    kind: "project",
    state: "star",
    position: { x: 550, y: 1050, z: -520 },
    route: "circus-restobar",
    glyphKey: "doorway",
    motionClass: "orbital",
  }),
  sourceBackedBody({
    id: "prospect-restaurant",
    label: "Prospect",
    kind: "project",
    state: "star",
    position: { x: -780, y: 570, z: -650 },
    route: "prospect-restaurant",
    glyphKey: "doorway",
    motionClass: "orbital",
  }),
  sourceBackedBody({
    id: "nimbus-installation",
    label: "Nimbus",
    kind: "project",
    state: "star",
    position: { x: -230, y: -120, z: -1080 },
    route: "nimbus-installation",
    glyphKey: "concept-art",
    motionClass: "reflective",
  }),
  sourceBackedBody({
    id: "fire-in-balance",
    label: "Fire in Balance",
    kind: "project",
    state: "star",
    position: { x: -610, y: 40, z: -980 },
    route: "fire-in-balance",
    glyphKey: "concept-art",
    motionClass: "pulsing",
  }),
  sourceBackedBody({
    id: "construction-cabinetry",
    label: "Construction / Cabinetry",
    kind: "project",
    state: "star",
    position: { x: 330, y: -690, z: 870 },
    route: "construction-cabinetry",
    glyphKey: "concept-craft",
    motionClass: "stable",
  }),
  sourceBackedBody({
    id: "bio-benin",
    label: "Bio-Benin",
    kind: "project",
    state: "star",
    position: { x: 260, y: 520, z: 1080 },
    route: "bio-benin",
    glyphKey: "play",
    motionClass: "orbital",
  }),
  sourceBackedBody({
    id: "pitzer-studio-art",
    label: "Pitzer / Studio Art",
    kind: "project",
    state: "star",
    position: { x: -410, y: -660, z: 810 },
    route: "pitzer-studio-art",
    glyphKey: "concept-art",
    motionClass: "reflective",
  }),
  sourceBackedBody({
    id: "secret-garden-tour",
    label: "The Secret Garden",
    kind: "project",
    state: "star",
    position: { x: -1210, y: -430, z: -620 },
    route: "secret-garden-tour",
    glyphKey: "wave",
    motionClass: "pulsing",
  }),
  sourceBackedBody({
    id: "argentiere-france",
    label: "Argentière, France",
    kind: "project",
    state: "star",
    position: { x: 760, y: 980, z: 680 },
    route: "argentiere-france",
    glyphKey: "doorway",
    motionClass: "orbital",
  }),
] as const;

export const AUTHORED_BODIES: readonly CelestialNode[] = [
  ...CORE_BODIES,
  ...PROJECT_BODIES,
];

export const AMBIENT_BODIES = generateAmbientStars(64);

export const ALL_BODIES: readonly CelestialNode[] = [
  ...AUTHORED_BODIES,
  ...AMBIENT_BODIES,
];