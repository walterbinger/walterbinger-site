import {
  LENS_IDS,
  type LensId,
  type LensWeights,
} from "../domain/cosmology";
import {
  deriveContentMass,
  deriveImportance,
  deriveLensWeights,
  type LensSignal,
  type SourceReference,
  type SubstanceOutcome,
  type SubstanceRecord,
} from "../domain/substance";

export const SOURCE_REFERENCES = {
  "walter-directives": {
    id: "walter-directives",
    label: "Walter's approved directives and project handoffs",
    kind: "first-person-directive",
    visibility: "internal",
    confidence: 1,
  },
  "cv-2026": {
    id: "cv-2026",
    label: "Walter Binger CV 2026",
    kind: "professional-document",
    visibility: "public",
    confidence: 0.98,
    href: "../Walter-Binger-CV-2026.pdf",
  },
  "operations-resume": {
    id: "operations-resume",
    label: "Operations resume",
    kind: "professional-document",
    visibility: "public",
    confidence: 0.96,
    href: "../Walter-Binger-Operations-Resume.pdf",
  },
  "implementation-resume": {
    id: "implementation-resume",
    label: "Implementation resume",
    kind: "professional-document",
    visibility: "public",
    confidence: 0.96,
    href: "../Walter-Binger-Implementation-Resume.pdf",
  },
  "customer-success-resume": {
    id: "customer-success-resume",
    label: "Customer success resume",
    kind: "professional-document",
    visibility: "public",
    confidence: 0.96,
    href: "../Walter-Binger-CustomerSuccess-Resume.pdf",
  },
  "cosmology-master": {
    id: "cosmology-master",
    label: "Cosmology & Design Bible — Living Master",
    kind: "design-canon",
    visibility: "public",
    confidence: 0.96,
    href: "https://docs.google.com/document/d/1lBfT_3gdxaKCt6-fOLVdUgSzFq8Zmh9ZsK4G8WLPis0/edit",
  },
  "asset-registry": {
    id: "asset-registry",
    label: "Constellation Asset Registry",
    kind: "design-canon",
    visibility: "internal",
    confidence: 0.94,
  },
  "reference-library-index": {
    id: "reference-library-index",
    label: "WalterBinger.com curated reference library",
    kind: "project-archive",
    visibility: "internal",
    confidence: 0.92,
  },
  "empanadas-content-map": {
    id: "empanadas-content-map",
    label: "Empanadas Son! content map",
    kind: "project-archive",
    visibility: "internal",
    confidence: 0.96,
  },
  "empanadas-public-archive": {
    id: "empanadas-public-archive",
    label: "Empanadas Son! public visual archive",
    kind: "published-artifact",
    visibility: "public",
    confidence: 0.94,
  },
  "life-of-pie-intake": {
    id: "life-of-pie-intake",
    label: "Life of Pie working source map and discovery intake",
    kind: "project-archive",
    visibility: "internal",
    confidence: 0.99,
  },
  "life-of-pie-photo-archive": {
    id: "life-of-pie-photo-archive",
    label: "Life of Pie photo candidate archive",
    kind: "project-archive",
    visibility: "approval-required",
    confidence: 0.96,
  },
  "prep-field-kit": {
    id: "prep-field-kit",
    label: "PREP Beta 1.0 — Complete Field Kit",
    kind: "tool-document",
    visibility: "public",
    confidence: 0.96,
    href: "https://docs.google.com/document/d/1d6e135C203qSSBP1gL6vJCGL4j3gItdRGcOuE9wJ1ok/edit",
  },
  "prep-architecture": {
    id: "prep-architecture",
    label: "PREP / PERP Closed-Circuit Architecture",
    kind: "tool-document",
    visibility: "public",
    confidence: 0.96,
    href: "https://docs.google.com/document/d/1R4UZj36SiO1VrYy0qd3WVEMwGDayOnh8XmtzLThBKoM/edit",
  },
  "writing-library": {
    id: "writing-library",
    label: "Essays and thinkpieces source library",
    kind: "writing-archive",
    visibility: "internal",
    confidence: 0.9,
  },
  "casting-hand": {
    id: "casting-hand",
    label: "College casting hand",
    kind: "published-artifact",
    visibility: "approval-required",
    confidence: 1,
  },
  "table-workshop": {
    id: "table-workshop",
    label: "Senior thesis table and workshop archive",
    kind: "project-archive",
    visibility: "approval-required",
    confidence: 0.96,
  },
  "maine-place-archive": {
    id: "maine-place-archive",
    label: "Maine and places archive",
    kind: "project-archive",
    visibility: "approval-required",
    confidence: 0.92,
  },
  "photo-archive-private": {
    id: "photo-archive-private",
    label: "Private travel and life photo archive",
    kind: "project-archive",
    visibility: "approval-required",
    confidence: 0.9,
  },
  "audio-archive": {
    id: "audio-archive",
    label: "Listening and audio archive",
    kind: "project-archive",
    visibility: "approval-required",
    confidence: 0.82,
  },
  "sports-archive": {
    id: "sports-archive",
    label: "Africa soccer tournament archive",
    kind: "project-archive",
    visibility: "approval-required",
    confidence: 0.9,
  },
  "nimbus-archive": {
    id: "nimbus-archive",
    label: "Nimbus / Poetic Kinetics archive",
    kind: "project-archive",
    visibility: "approval-required",
    confidence: 0.94,
  },
  "fire-in-balance-archive": {
    id: "fire-in-balance-archive",
    label: "Fire in Balance installation archive",
    kind: "project-archive",
    visibility: "approval-required",
    confidence: 0.92,
  },
} as const satisfies Record<string, SourceReference>;

type Profile = readonly [
  red: number,
  orange: number,
  yellow: number,
  green: number,
  blue: number,
  indigo: number,
  violet: number,
  magenta: number,
];

function lensSignals(
  profile: Profile,
  evidenceIds: readonly string[],
): readonly LensSignal[] {
  return LENS_IDS.map((lensId, index) => ({
    lensId,
    weight: profile[index],
    evidenceIds,
  }));
}

function outcome(
  id: string,
  label: string,
  impact: number,
): SubstanceOutcome {
  return { id, label, impact };
}

interface RecordInput {
  nodeId: string;
  summary: string;
  period?: string;
  places?: readonly string[];
  sources: readonly string[];
  artifacts?: number;
  outcomes?: readonly SubstanceOutcome[];
  profile: Profile;
  status?: SubstanceRecord["status"];
}

function record(input: RecordInput): SubstanceRecord {
  return {
    nodeId: input.nodeId,
    summary: input.summary,
    period: input.period,
    placeIds: input.places ?? [],
    sourceIds: input.sources,
    artifactCount: input.artifacts ?? 0,
    outcomes: input.outcomes ?? [],
    lensSignals: lensSignals(input.profile, input.sources),
    status: input.status ?? "seeded",
  };
}

const CORE_SUBSTANCE: readonly SubstanceRecord[] = [
  record({
    nodeId: "cv-archive",
    summary: "The public record of Walter's operating, implementation, client-delivery, and making work.",
    sources: [
      "cv-2026",
      "operations-resume",
      "implementation-resume",
      "customer-success-resume",
    ],
    artifacts: 4,
    outcomes: [outcome("career-record", "A documented cross-sector professional record", 0.92)],
    profile: [0.62, 0.55, 0.22, 0.92, 0.58, 0.42, 0.84, 0.51],
    status: "published",
  }),
  record({
    nodeId: "brooklyn",
    summary: "A place-world connecting restaurant openings, fabrication, hospitality, and entrepreneurship.",
    places: ["brooklyn", "new-york-city"],
    sources: ["cv-2026", "empanadas-public-archive", "photo-archive-private"],
    artifacts: 10,
    profile: [0.66, 0.57, 0.7, 0.46, 0.72, 0.86, 0.96, 0.72],
  }),
  record({
    nodeId: "maine",
    summary: "A place-world connecting care operations, landscape, family, memory, and stewardship.",
    places: ["maine"],
    sources: ["cv-2026", "maine-place-archive"],
    artifacts: 4,
    profile: [0.48, 0.42, 0.65, 0.94, 0.8, 0.68, 0.58, 0.74],
  }),
  record({
    nodeId: "argentina",
    summary: "A formative place-world for language, hospitality, movement, food, and independent operation.",
    places: ["buenos-aires", "argentina"],
    sources: ["cv-2026", "photo-archive-private", "walter-directives"],
    artifacts: 8,
    profile: [0.78, 0.62, 0.84, 0.45, 0.7, 0.98, 0.91, 0.82],
  }),
  record({
    nodeId: "hospitality",
    summary: "Restaurants, bars, dining rooms, kitchens, and care settings treated as lived systems.",
    sources: ["cv-2026", "empanadas-content-map", "walter-directives"],
    outcomes: [outcome("cross-sector-service", "Hospitality practiced across restaurants and care settings", 0.9)],
    profile: [0.96, 0.92, 0.88, 0.72, 0.62, 0.66, 0.92, 0.65],
  }),
  record({
    nodeId: "healthcare",
    summary: "Care environments understood through dignity, operations, implementation, and system repair.",
    sources: ["cv-2026", "operations-resume", "prep-field-kit"],
    outcomes: [outcome("multi-site-care", "Multi-site operating and implementation work in skilled care", 1)],
    profile: [1, 0.62, 0.55, 1, 0.66, 0.28, 0.86, 0.54],
  }),
  record({
    nodeId: "field-tools",
    summary: "PREP and PERP turn field signals, leadership action, repair, and learning into a closed loop.",
    sources: ["prep-field-kit", "prep-architecture", "walter-directives"],
    artifacts: 10,
    outcomes: [outcome("ten-card-kit", "A ten-card field kit with a repeatable observation and repair loop", 0.88)],
    profile: [0.86, 0.74, 0.28, 1, 0.54, 0.42, 0.92, 0.78],
  }),
  record({
    nodeId: "thinking-in-4d",
    summary: "Working essays on perspective, systems, causality, and what changes when the observer moves.",
    sources: ["writing-library", "cosmology-master", "walter-directives"],
    artifacts: 8,
    profile: [0.42, 0.66, 0.34, 0.78, 0.92, 0.58, 0.88, 1],
  }),
  record({
    nodeId: "empanadas-son",
    summary: "A Lower East Side restaurant built from concept through brand, menu, production, and service.",
    period: "2015–2016",
    places: ["new-york-city", "argentina"],
    sources: ["cv-2026", "empanadas-content-map", "empanadas-public-archive"],
    artifacts: 20,
    outcomes: [
      outcome("restaurant-launch", "Built and operated the restaurant from concept through daily service", 1),
      outcome("timeout-feature", "Featured by Time Out New York", 0.78),
    ],
    profile: [0.82, 0.96, 1, 0.68, 0.52, 0.82, 0.88, 0.72],
    status: "published",
  }),
  record({
    nodeId: "life-of-pie",
    summary: "Pizza as portable comfort, craft, migration, memory, and a stable form that can keep changing without losing itself.",
    places: ["brooklyn", "new-york-city", "san-francisco", "france", "argentina", "boston"],
    sources: ["life-of-pie-intake", "life-of-pie-photo-archive", "walter-directives"],
    artifacts: 11,
    profile: [0.95, 0.96, 1, 0.88, 0.72, 0.92, 0.9, 0.88],
    status: "seeded",
  }),
  record({
    nodeId: "art",
    summary: "Objects, installations, casting, drawing, and environments as ways of noticing and making.",
    sources: ["casting-hand", "table-workshop", "asset-registry"],
    artifacts: 6,
    profile: [0.46, 0.96, 0.64, 0.42, 0.76, 0.5, 0.86, 1],
  }),
  record({
    nodeId: "craft",
    summary: "The durable knowledge carried by hands, tools, repetition, repair, and material judgment.",
    sources: ["cv-2026", "table-workshop", "walter-directives"],
    artifacts: 5,
    profile: [0.66, 1, 0.78, 0.88, 0.48, 0.46, 0.58, 0.62],
  }),
  record({
    nodeId: "care",
    summary: "Protection, nourishment, dignity, attention, and the practical work of making people feel held.",
    sources: ["cv-2026", "prep-field-kit", "walter-directives"],
    outcomes: [outcome("care-practice", "Care expressed through operations, food, and communication", 0.92)],
    profile: [1, 0.58, 0.54, 0.9, 0.52, 0.38, 0.84, 0.7],
  }),
  record({
    nodeId: "service",
    summary: "Service as responsive practice: listening, translating, maintaining, and following through.",
    sources: ["cv-2026", "customer-success-resume", "walter-directives"],
    outcomes: [outcome("service-practice", "Service practiced across care, hospitality, and implementation", 0.88)],
    profile: [0.9, 0.66, 0.42, 0.96, 0.5, 0.52, 0.92, 0.58],
  }),
  record({
    nodeId: "library-writing",
    summary: "Essays, field notes, working theories, and project records kept as an evolving public library.",
    sources: ["writing-library", "cosmology-master"],
    artifacts: 12,
    profile: [0.42, 0.58, 0.56, 0.72, 0.8, 0.48, 0.98, 0.92],
  }),
  record({
    nodeId: "listening-room",
    summary: "Sound, performance, listening, and communication gathered as another route through the work.",
    sources: ["audio-archive", "cv-2026", "writing-library"],
    artifacts: 4,
    profile: [0.56, 0.36, 0.7, 0.32, 1, 0.66, 0.96, 0.88],
    status: "intake",
  }),
  record({
    nodeId: "photo-archive",
    summary: "A private source archive being curated into place, project, memory, and process collections.",
    sources: ["photo-archive-private", "reference-library-index"],
    artifacts: 37,
    profile: [0.56, 0.52, 0.82, 0.58, 0.88, 0.92, 0.86, 0.9],
    status: "intake",
  }),
  record({
    nodeId: "sports-playbook",
    summary: "Play, team formation, movement, and collaborative events viewed as operating systems.",
    sources: ["sports-archive", "walter-directives"],
    artifacts: 4,
    profile: [0.78, 0.4, 0.48, 0.7, 0.68, 0.96, 0.9, 0.72],
    status: "intake",
  }),
] as const;

const PROJECT_SUBSTANCE: readonly SubstanceRecord[] = [
  record({
    nodeId: "hcsg-district-operations",
    summary: "Multi-site dining operations across skilled nursing, rehabilitation, and memory-care facilities.",
    period: "2023–2026",
    places: ["maine"],
    sources: ["cv-2026", "operations-resume", "implementation-resume"],
    outcomes: [
      outcome("district-growth", "Expanded the assigned district from five to eight facilities", 0.92),
      outcome("operating-scale", "Approximately 850 residents, 100+ staff, and a $5M+ budget", 1),
      outcome("survey-record", "More than 90% deficiency-free across roughly 32 surveys", 0.96),
      outcome("kitchen-reopenings", "Reopened two kitchens closed by inspectors", 0.9),
      outcome("leadership-pipeline", "Promoted five cooks, trained four outside managers, and advanced one manager to district leadership", 0.9),
    ],
    profile: [0.86, 0.56, 0.45, 1, 0.36, 0.38, 0.84, 0.42],
    status: "published",
  }),
  record({
    nodeId: "mealtracker-pcc-rollout",
    summary: "A day-one implementation and adoption program for MealTracker and PointClickCare workflows.",
    period: "2023–2026",
    places: ["maine"],
    sources: ["cv-2026", "implementation-resume"],
    outcomes: [
      outcome("day-one-go-lives", "Led day-one go-lives across assigned facilities", 0.94),
      outcome("first-week-adoption", "Built first-week competence through field training and follow-through", 0.88),
    ],
    profile: [0.72, 0.62, 0.2, 1, 0.3, 0.32, 0.82, 0.48],
    status: "published",
  }),
  record({
    nodeId: "livewell-turnaround",
    summary: "A rapid operating recovery across an eleven-facility dining portfolio.",
    period: "2023",
    sources: ["cv-2026", "operations-resume"],
    outcomes: [
      outcome("deficit-recovery", "Recovered an approximately $45K monthly deficit in under six weeks", 1),
      outcome("eleven-facility-scope", "Worked across an eleven-facility portfolio", 0.86),
    ],
    profile: [0.82, 0.48, 0.4, 1, 0.34, 0.32, 0.78, 0.38],
    status: "published",
  }),
  record({
    nodeId: "island-nursing-home",
    summary: "A rebuilt dining department carried through survey work, resident participation, and COVID crisis response.",
    period: "2020–2021",
    places: ["maine"],
    sources: ["cv-2026", "operations-resume"],
    outcomes: [
      outcome("department-rebuild", "Rebuilt the dining department and operating routines", 0.94),
      outcome("resident-food-council", "Created a Resident Food Council", 0.86),
      outcome("resident-relocation", "Supported the relocation of roughly 70 residents during crisis operations", 0.96),
    ],
    profile: [1, 0.62, 0.64, 0.92, 0.46, 0.3, 0.94, 0.46],
    status: "published",
  }),
  record({
    nodeId: "circus-restobar",
    summary: "A Buenos Aires hotel restaurant and bar rebuilt in Spanish across concept, menu, brand, vendors, events, POS, and operations.",
    period: "2009–2012",
    places: ["buenos-aires", "argentina"],
    sources: ["cv-2026", "photo-archive-private"],
    artifacts: 8,
    outcomes: [
      outcome("restaurant-rebuild", "Rebuilt the restaurant-bar operating model and guest experience", 1),
      outcome("spanish-operation", "Led the work entirely in Spanish", 0.9),
      outcome("profitability", "Established a functioning, profitable operation", 0.94),
    ],
    profile: [0.88, 0.92, 0.95, 0.82, 0.64, 1, 0.88, 0.72],
    status: "published",
  }),
  record({
    nodeId: "prospect-restaurant",
    summary: "A Brooklyn restaurant opening carried from buildout through kitchen, bar, floor, and management.",
    period: "2012–2014",
    places: ["brooklyn", "new-york-city"],
    sources: ["cv-2026", "operations-resume"],
    outcomes: [
      outcome("opening-buildout", "Helped carry the restaurant from buildout through opening and operations", 0.94),
      outcome("michelin-guide", "The restaurant later appeared in the Michelin Guide", 0.72),
    ],
    profile: [0.88, 0.88, 0.9, 0.72, 0.64, 0.55, 0.8, 0.62],
    status: "published",
  }),
  record({
    nodeId: "nimbus-installation",
    summary: "Rigging, fabrication, sewing, and production logistics for Poetic Kinetics at Walt Disney Concert Hall.",
    period: "2016",
    places: ["los-angeles"],
    sources: ["cv-2026", "nimbus-archive"],
    artifacts: 8,
    outcomes: [outcome("concert-hall-installation", "Supported fabrication and installation at Walt Disney Concert Hall", 0.9)],
    profile: [0.32, 1, 0.18, 0.56, 1, 0.6, 0.86, 1],
    status: "seeded",
  }),
  record({
    nodeId: "fire-in-balance",
    summary: "A collaborative Burning Man installation held in the archive for source-led curation.",
    places: ["black-rock-city"],
    sources: ["fire-in-balance-archive", "photo-archive-private", "walter-directives"],
    artifacts: 6,
    profile: [0.54, 1, 0.38, 0.62, 0.9, 0.82, 0.94, 1],
    status: "intake",
  }),
  record({
    nodeId: "construction-cabinetry",
    summary: "Restaurant buildouts, cabinet work, foreman leadership, and a senior thesis table.",
    period: "2006–2008 and studio practice",
    places: ["new-york-city", "pitzer-college"],
    sources: ["cv-2026", "table-workshop"],
    artifacts: 6,
    outcomes: [
      outcome("foreman-team", "Led a team of more than twelve through restaurant buildouts", 0.92),
      outcome("demo-to-opening", "Carried projects from demolition through opening", 0.9),
    ],
    profile: [0.36, 1, 0.2, 0.92, 0.86, 0.42, 0.64, 0.58],
    status: "seeded",
  }),
  record({
    nodeId: "bio-benin",
    summary: "Board and consulting work joining hospitality, renovation, workflow, guest experience, and community collaboration.",
    places: ["benin"],
    sources: ["cv-2026", "sports-archive", "photo-archive-private"],
    artifacts: 5,
    outcomes: [outcome("hospitality-consulting", "Supported bar, renovation, workflow, and guest-experience work", 0.84)],
    profile: [0.86, 0.72, 0.84, 0.8, 0.56, 1, 0.94, 0.88],
    status: "seeded",
  }),
  record({
    nodeId: "pitzer-studio-art",
    summary: "International and Intercultural Studies joined with Studio Art, material practice, and the senior thesis table.",
    places: ["pitzer-college"],
    sources: ["cv-2026", "casting-hand", "table-workshop"],
    artifacts: 4,
    outcomes: [outcome("degree", "Completed a BA in International and Intercultural Studies with Studio Art", 0.88)],
    profile: [0.44, 0.98, 0.4, 0.56, 0.82, 0.65, 0.82, 1],
    status: "seeded",
  }),
  record({
    nodeId: "secret-garden-tour",
    summary: "A first national theatrical tour at age eleven: performance, ensemble work, movement, and communication.",
    sources: ["cv-2026"],
    outcomes: [outcome("national-tour", "Performed in the first national tour of The Secret Garden", 0.82)],
    profile: [0.56, 0.88, 0.45, 0.48, 0.92, 0.96, 1, 0.94],
    status: "published",
  }),
  record({
    nodeId: "argentiere-france",
    summary: "Restaurant work in Argentière, France, extending food and service practice through another language and place.",
    places: ["argentiere", "france"],
    sources: ["cv-2026", "photo-archive-private"],
    artifacts: 3,
    outcomes: [outcome("cross-cultural-service", "Worked in food service in Argentière, France", 0.72)],
    profile: [0.92, 0.76, 0.88, 0.5, 0.72, 1, 0.8, 0.84],
    status: "seeded",
  }),
] as const;

export const SUBSTANCE_RECORDS: readonly SubstanceRecord[] = [
  ...CORE_SUBSTANCE,
  ...PROJECT_SUBSTANCE,
];

const SUBSTANCE_BY_ID = new Map(
  SUBSTANCE_RECORDS.map((substanceRecord) => [
    substanceRecord.nodeId,
    substanceRecord,
  ]),
);

export function getSubstanceRecord(
  nodeId: string,
): SubstanceRecord | undefined {
  return SUBSTANCE_BY_ID.get(nodeId);
}

export function substancePhysics(nodeId: string): {
  contentMass: number;
  importance: number;
  lensWeights: LensWeights;
} {
  const substanceRecord = getSubstanceRecord(nodeId);
  if (!substanceRecord) {
    throw new Error(`Missing substance record for ${nodeId}`);
  }
  const contentMass = deriveContentMass(
    substanceRecord,
    SOURCE_REFERENCES,
  );
  return {
    contentMass,
    importance: deriveImportance(contentMass),
    lensWeights: deriveLensWeights(substanceRecord),
  };
}

export const SOURCE_IDS = new Set(Object.keys(SOURCE_REFERENCES));

export function strongestSubstanceLens(nodeId: string): LensId | undefined {
  const substanceRecord = getSubstanceRecord(nodeId);
  if (!substanceRecord) return undefined;
  return substanceRecord.lensSignals.reduce((strongest, signal) =>
    signal.weight > strongest.weight ? signal : strongest,
  ).lensId;
}