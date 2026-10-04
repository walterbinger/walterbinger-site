import {
  LENS_IDS,
  emptyLensWeights,
  type LensId,
  type LensWeights,
} from "./cosmology";

export type SourceKind =
  | "design-canon"
  | "first-person-directive"
  | "professional-document"
  | "project-archive"
  | "published-artifact"
  | "tool-document"
  | "writing-archive";

export interface SourceReference {
  id: string;
  label: string;
  kind: SourceKind;
  visibility: "public" | "internal" | "approval-required";
  confidence: number;
  href?: string;
}

export interface LensSignal {
  lensId: LensId;
  weight: number;
  evidenceIds: readonly string[];
}

export interface SubstanceOutcome {
  id: string;
  label: string;
  impact: number;
}

export interface SubstanceRecord {
  nodeId: string;
  summary: string;
  period?: string;
  placeIds: readonly string[];
  sourceIds: readonly string[];
  artifactCount: number;
  outcomes: readonly SubstanceOutcome[];
  lensSignals: readonly LensSignal[];
  status: "intake" | "seeded" | "published";
}

const clamp = (value: number, minimum = 0, maximum = 1) =>
  Math.min(maximum, Math.max(minimum, value));

export function deriveLensWeights(record: SubstanceRecord): LensWeights {
  const result = emptyLensWeights();
  for (const signal of record.lensSignals) {
    result[signal.lensId] = clamp(signal.weight);
  }
  return result;
}

export function deriveContentMass(
  record: SubstanceRecord,
  sources: Readonly<Record<string, SourceReference>>,
): number {
  const sourceMass = record.sourceIds.reduce(
    (total, sourceId) => total + (sources[sourceId]?.confidence ?? 0),
    0,
  );
  const outcomeMass = record.outcomes.reduce(
    (total, outcome) => total + clamp(outcome.impact),
    0,
  );
  const lensBreadth =
    record.lensSignals.filter((signal) => signal.weight >= 0.5).length /
    LENS_IDS.length;
  const statusMass =
    record.status === "published"
      ? 0.1
      : record.status === "seeded"
        ? 0.065
        : 0.025;

  return Number(
    clamp(
      0.16 +
        Math.min(0.23, sourceMass * 0.065) +
        Math.min(0.28, outcomeMass * 0.075) +
        Math.min(0.12, Math.log2(record.artifactCount + 1) * 0.035) +
        Math.min(0.08, record.placeIds.length * 0.035) +
        lensBreadth * 0.13 +
        statusMass,
      0.18,
      1,
    ).toFixed(3),
  );
}

export function deriveImportance(contentMass: number): number {
  return Number(clamp(0.42 + contentMass * 0.58).toFixed(3));
}

export function validateSubstanceRegistry(
  records: readonly SubstanceRecord[],
  sources: Readonly<Record<string, SourceReference>>,
): string[] {
  const errors: string[] = [];
  const nodeIds = new Set<string>();
  const sourceIds = new Set(Object.keys(sources));

  for (const [sourceId, source] of Object.entries(sources)) {
    if (source.id !== sourceId) {
      errors.push(`source key ${sourceId} does not match id ${source.id}`);
    }
    if (source.confidence < 0 || source.confidence > 1) {
      errors.push(`${sourceId} has invalid confidence`);
    }
  }

  for (const record of records) {
    if (nodeIds.has(record.nodeId)) {
      errors.push(`duplicate substance record ${record.nodeId}`);
    }
    nodeIds.add(record.nodeId);

    if (!record.summary.trim()) {
      errors.push(`${record.nodeId} has no summary`);
    }
    if (record.sourceIds.length === 0) {
      errors.push(`${record.nodeId} has no sources`);
    }
    for (const sourceId of record.sourceIds) {
      if (!sourceIds.has(sourceId)) {
        errors.push(`${record.nodeId} has missing source ${sourceId}`);
      }
    }

    const lensIds = new Set<LensId>();
    for (const signal of record.lensSignals) {
      if (lensIds.has(signal.lensId)) {
        errors.push(`${record.nodeId} repeats lens ${signal.lensId}`);
      }
      lensIds.add(signal.lensId);
      if (signal.weight < 0 || signal.weight > 1) {
        errors.push(`${record.nodeId} has invalid ${signal.lensId} weight`);
      }
      if (signal.evidenceIds.length === 0) {
        errors.push(`${record.nodeId} has unsupported ${signal.lensId} signal`);
      }
      for (const evidenceId of signal.evidenceIds) {
        if (!sourceIds.has(evidenceId)) {
          errors.push(
            `${record.nodeId} ${signal.lensId} signal has missing evidence ${evidenceId}`,
          );
        }
      }
    }

    if (lensIds.size !== LENS_IDS.length) {
      errors.push(`${record.nodeId} does not define all lens signals`);
    }
    for (const outcome of record.outcomes) {
      if (outcome.impact < 0 || outcome.impact > 1) {
        errors.push(`${record.nodeId} outcome ${outcome.id} has invalid impact`);
      }
    }
  }

  return errors;
}