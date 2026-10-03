import type { WorldContentDefinition } from "../domain/content";

export const WORLD_CONTENT = {
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
} as const satisfies Record<string, WorldContentDefinition>;

export function getWorldContent(
  nodeId: string,
): WorldContentDefinition | undefined {
  return WORLD_CONTENT[nodeId as keyof typeof WORLD_CONTENT];
}
