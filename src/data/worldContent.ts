import type {
  ContentSlot,
  ResourceReference,
  WorldContentDefinition,
} from "../domain/content";
import type {
  SourceKind,
  SourceReference as EvidenceSourceReference,
  SubstanceRecord,
} from "../domain/substance";
import {
  SOURCE_REFERENCES,
  SUBSTANCE_RECORDS,
} from "./substance";

const SOURCE_INDEX =
  SOURCE_REFERENCES as Readonly<Record<string, EvidenceSourceReference>>;

function resourceKind(kind: SourceKind): ResourceReference["kind"] {
  if (kind === "tool-document") return "tool";
  if (kind === "writing-archive" || kind === "design-canon") return "writing";
  if (kind === "professional-document") return "document";
  return "link";
}

function contentStatus(
  status: SubstanceRecord["status"],
): WorldContentDefinition["status"] {
  if (status === "published") return "published";
  if (status === "seeded") return "seeded";
  return "curating";
}

function generatedContent(
  substanceRecord: SubstanceRecord,
): WorldContentDefinition {
  const resources = substanceRecord.sourceIds.flatMap<ResourceReference>(
    (sourceId) => {
      const source = SOURCE_INDEX[sourceId];
      if (!source?.href || source.visibility !== "public") {
        return [];
      }
      return [
        {
          id: `${substanceRecord.nodeId}-${source.id}`,
          label: source.label,
          kind: resourceKind(source.kind),
          href: source.href,
          description: substanceRecord.summary,
          external: source.href.startsWith("https://"),
        },
      ];
    },
  );
  const slots: ContentSlot[] = [
    ...substanceRecord.outcomes.map((result) => ({
      id: `${substanceRecord.nodeId}-${result.id}`,
      kind: "document" as const,
      status: "available" as const,
      label: result.label,
    })),
    ...(substanceRecord.artifactCount > 0
      ? [
          {
            id: `${substanceRecord.nodeId}-curated-artifacts`,
            kind: "artifact" as const,
            status:
              substanceRecord.status === "published"
                ? ("available" as const)
                : ("curation-needed" as const),
            label: `${substanceRecord.artifactCount} source artifacts`,
          },
        ]
      : []),
  ];

  return {
    nodeId: substanceRecord.nodeId,
    status: contentStatus(substanceRecord.status),
    resources,
    slots,
  };
}

const GENERATED_CONTENT = Object.fromEntries(
  SUBSTANCE_RECORDS.map((substanceRecord) => [
    substanceRecord.nodeId,
    generatedContent(substanceRecord),
  ]),
) as Record<string, WorldContentDefinition>;

const CURATED_CONTENT: Record<string, WorldContentDefinition> = {
  "field-tools": {
    nodeId: "field-tools",
    status: "curating",
    resources: [
      {
        id: "prep-3-alpha-interactive",
        label: "PREP 3.0 Alpha",
        kind: "tool",
        href: "/universe/field-tools/prep-3.0-alpha.html",
        description:
          "Ground-up field observation: map the signal, test one local move, return, and preserve the evidence.",
      },
      {
        id: "perp-13-alpha-interactive",
        label: "PERP 1.3 Alpha",
        kind: "tool",
        href: "/universe/field-tools/perp-1.3-alpha.html",
        description:
          "System-facing diagnostic across Pressure, Evidence, Repair, and Proof, with transparent Alpha signal profiles.",
      },
    ],
    slots: [
      {
        id: "prep-perp-interactive",
        kind: "tool",
        status: "available",
        label: "Interactive PREP / PERP Alpha tools",
      },
      {
        id: "prep-field-cards",
        kind: "artifact",
        status: "available",
        label: "PREP field cards",
      },
      {
        id: "prep-perp-case-studies",
        kind: "writing",
        status: "planned",
        label: "Field cases and validated repairs",
      },
    ],
  },
  "thinking-in-4d": {
    nodeId: "thinking-in-4d",
    status: "curating",
    resources: [
      {
        id: "thinking-in-4d-note",
        label: "Thinking in 4D",
        kind: "writing",
        href: "#/world/thinking-in-4d",
        description:
          "Working notes on perspective, systems, and what changes when the observer moves.",
      },
      {
        id: "thinking-in-4d-cosmology-master",
        label: "Cosmology & Design Bible — Living Master",
        kind: "writing",
        href: "https://docs.google.com/document/d/1lBfT_3gdxaKCt6-fOLVdUgSzFq8Zmh9ZsK4G8WLPis0/edit",
        description: "The living construction record for this universe.",
        external: true,
      },
    ],
    slots: [
      {
        id: "thinking-in-4d-essays",
        kind: "writing",
        status: "curation-needed",
        label: "Essays and working notes",
      },
    ],
  },
  "library-writing": {
    nodeId: "library-writing",
    status: "seeded",
    resources: [
      {
        id: "cosmology-living-master",
        label: "Cosmology & Design Bible — Living Master",
        kind: "writing",
        href: "https://docs.google.com/document/d/1lBfT_3gdxaKCt6-fOLVdUgSzFq8Zmh9ZsK4G8WLPis0/edit",
        description: "The living construction record for this universe.",
        external: true,
      },
    ],
    slots: [
      {
        id: "library-essays",
        kind: "writing",
        status: "curation-needed",
        label: "Published and working essays",
      },
      {
        id: "library-project-records",
        kind: "document",
        status: "planned",
        label: "Project records",
      },
    ],
  },
};

export const WORLD_CONTENT: Readonly<Record<string, WorldContentDefinition>> = {
  ...GENERATED_CONTENT,
  ...CURATED_CONTENT,
};

export function getWorldContent(
  nodeId: string,
): WorldContentDefinition | undefined {
  return WORLD_CONTENT[nodeId];
}