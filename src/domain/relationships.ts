import {
  LENS_IDS,
  type LensId,
} from "./cosmology";

export type RelationshipClass = "direct" | "partial" | "loose";

export type RelationshipKind =
  | "origin"
  | "place"
  | "practice"
  | "craft"
  | "expression"
  | "care"
  | "service"
  | "implementation"
  | "learning"
  | "documentation"
  | "collaboration"
  | "movement";

export interface DirectedRelationship {
  id: string;
  sourceId: string;
  targetId: string;
  kind: RelationshipKind;
  connectionClass: RelationshipClass;
  strength: number;
  persistence: number;
  confidence: number;
  lensChannels: readonly LensId[];
  provenance:
    | "walter-explicit"
    | "documented-source"
    | "calibrated-working";
  status: "locked" | "working";
  evidenceIds?: readonly string[];
}

export function relationshipLensRelevance(
  relationship: DirectedRelationship,
  activeLensIds: readonly LensId[],
): number {
  if (activeLensIds.length === 0) {
    return 0;
  }

  const channelSet = new Set(relationship.lensChannels);
  const overlap = activeLensIds.filter((lensId) => channelSet.has(lensId));
  if (overlap.length === 0) {
    return 0;
  }

  const precision = overlap.length / activeLensIds.length;
  const coverage = overlap.length / relationship.lensChannels.length;
  return Math.min(1, precision * 0.72 + coverage * 0.28);
}

export function effectiveRelationshipStrength(
  relationship: DirectedRelationship,
  activeLensIds: readonly LensId[],
  attentionIds: ReadonlySet<string> = new Set(),
): number {
  const lensRelevance = relationshipLensRelevance(
    relationship,
    activeLensIds,
  );
  const attended =
    attentionIds.has(relationship.sourceId) ||
    attentionIds.has(relationship.targetId);
  const contextualMultiplier =
    activeLensIds.length === 0
      ? 0.34
      : 0.48 + lensRelevance * 0.82;
  const attentionMultiplier = attended ? 1.5 : 1;

  return Math.min(
    1,
    relationship.strength *
      relationship.persistence *
      contextualMultiplier *
      attentionMultiplier,
  );
}

export function validateDirectedRelationships(
  relationships: readonly DirectedRelationship[],
  validNodeIds: ReadonlySet<string>,
  validEvidenceIds?: ReadonlySet<string>,
): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const directions = new Set<string>();

  for (const relationship of relationships) {
    if (ids.has(relationship.id)) {
      errors.push(`duplicate relationship id ${relationship.id}`);
    }
    ids.add(relationship.id);

    const direction = `${relationship.sourceId}->${relationship.targetId}`;
    if (directions.has(direction)) {
      errors.push(`duplicate relationship direction ${direction}`);
    }
    directions.add(direction);

    if (!validNodeIds.has(relationship.sourceId)) {
      errors.push(`${relationship.id} has missing source ${relationship.sourceId}`);
    }
    if (!validNodeIds.has(relationship.targetId)) {
      errors.push(`${relationship.id} has missing target ${relationship.targetId}`);
    }
    if (relationship.sourceId === relationship.targetId) {
      errors.push(`${relationship.id} cannot point to itself`);
    }
    if (relationship.strength < 0 || relationship.strength > 1) {
      errors.push(`${relationship.id} has invalid strength`);
    }
    if (relationship.persistence < 0 || relationship.persistence > 1) {
      errors.push(`${relationship.id} has invalid persistence`);
    }
    if (relationship.confidence < 0 || relationship.confidence > 1) {
      errors.push(`${relationship.id} has invalid confidence`);
    }
    if (relationship.lensChannels.length === 0) {
      errors.push(`${relationship.id} has no lens channels`);
    }
    if (
      relationship.lensChannels.some(
        (lensId) => !LENS_IDS.includes(lensId),
      )
    ) {
      errors.push(`${relationship.id} has an invalid lens channel`);
    }
    if (
      relationship.provenance === "documented-source" &&
      !relationship.evidenceIds?.length
    ) {
      errors.push(`${relationship.id} has no evidence`);
    }
    if (
      validEvidenceIds &&
      relationship.evidenceIds?.some(
        (evidenceId) => !validEvidenceIds.has(evidenceId),
      )
    ) {
      errors.push(`${relationship.id} has missing evidence`);
    }
  }

  return errors;
}