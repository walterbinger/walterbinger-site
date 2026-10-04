import {
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  type Force,
  type Simulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from "d3-force-3d";
import {
  LENS_IDS,
  lensRelevance,
  type CelestialNode,
  type LensId,
  type Vector3,
} from "./cosmology";
import {
  effectiveRelationshipStrength,
  type DirectedRelationship,
} from "./relationships";

export const LENS_DIRECTIONS: Record<LensId, Vector3> = {
  red: { x: -0.82, y: -0.42, z: 0.38 },
  orange: { x: -0.34, y: -0.88, z: -0.34 },
  yellow: { x: 0.34, y: -0.88, z: 0.34 },
  green: { x: 0.82, y: -0.42, z: -0.38 },
  blue: { x: 0.82, y: 0.42, z: 0.38 },
  indigo: { x: 0.34, y: 0.88, z: -0.34 },
  violet: { x: -0.34, y: 0.88, z: 0.34 },
  magenta: { x: -0.82, y: 0.42, z: -0.38 },
};

export interface GravityNode extends SimulationNodeDatum {
  id: string;
  source: CelestialNode;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
}

interface GravityLink extends SimulationLinkDatum<GravityNode> {
  affinity: number;
}

interface GravityContext {
  activeLensIds: readonly LensId[];
  anchorTargets: ReadonlyMap<string, Vector3>;
  attentionIds: ReadonlySet<string>;
}

export interface GravitySystem {
  setContext(
    activeLensIds: readonly LensId[],
    anchorTargets?: ReadonlyMap<string, Vector3>,
    attentionIds?: ReadonlySet<string>,
  ): void;
  tick(deltaMilliseconds: number): void;
  position(nodeId: string): Vector3 | undefined;
  velocity(nodeId: string): Vector3 | undefined;
  sync(positions: ReadonlyMap<string, Vector3>): void;
  dispose(): void;
}

function magnitude(point: Vector3): number {
  return Math.hypot(point.x, point.y, point.z);
}

function normalized(point: Vector3): Vector3 {
  const length = magnitude(point) || 1;
  return {
    x: point.x / length,
    y: point.y / length,
    z: point.z / length,
  };
}

export function relationshipAffinity(
  from: CelestialNode,
  to: CelestialNode,
): number {
  let dot = 0;
  let fromMagnitude = 0;
  let toMagnitude = 0;

  for (const lensId of LENS_IDS) {
    const fromWeight = from.lensWeights[lensId];
    const toWeight = to.lensWeights[lensId];
    dot += fromWeight * toWeight;
    fromMagnitude += fromWeight * fromWeight;
    toMagnitude += toWeight * toWeight;
  }

  const similarity =
    dot / (Math.sqrt(fromMagnitude) * Math.sqrt(toMagnitude) || 1);
  const importance = (from.importance + to.importance) / 2;
  const substance = (from.contentMass + to.contentMass) / 2;
  return Math.max(
    0,
    Math.min(
      1,
      0.12 + similarity * 0.46 + importance * 0.22 + substance * 0.2,
    ),
  );
}

export function gravityTargetForNode(
  node: CelestialNode,
  activeLensIds: readonly LensId[],
): Vector3 {
  if (activeLensIds.length === 0) {
    return { ...node.basePosition };
  }

  const baseDirection = normalized(node.basePosition);
  const relevance = lensRelevance(node, activeLensIds);
  const activeMean =
    activeLensIds.reduce(
      (total, lensId) => total + node.lensWeights[lensId],
      0,
    ) / activeLensIds.length;
  const composition = activeLensIds.reduce<Vector3>(
    (result, lensId) => {
      const difference = node.lensWeights[lensId] - activeMean;
      const direction = LENS_DIRECTIONS[lensId];
      result.x += direction.x * difference;
      result.y += direction.y * difference;
      result.z += direction.z * difference;
      return result;
    },
    { x: 0, y: 0, z: 0 },
  );
  const hasCompositionDirection = magnitude(composition) > 0.015;
  const compositionDirection = normalized(composition);
  const direction = normalized({
    x:
      baseDirection.x * 0.58 +
      (hasCompositionDirection ? compositionDirection.x * 0.82 : 0),
    y:
      baseDirection.y * 0.58 +
      (hasCompositionDirection ? compositionDirection.y * 0.82 : 0),
    z:
      baseDirection.z * 0.58 +
      (hasCompositionDirection ? compositionDirection.z * 0.82 : 0),
  });

  const tierFloor =
    node.tier === "authored" ? 240 : node.tier === "emerging" ? 430 : 720;
  const tierRange =
    node.tier === "authored" ? 820 : node.tier === "emerging" ? 680 : 520;
  const radius =
    tierFloor +
    (1 - relevance) * tierRange +
    (1 - node.importance) * (node.tier === "authored" ? 130 : 60) -
    node.contentMass * (node.tier === "authored" ? 105 : 24);

  return {
    x: direction.x * radius,
    y: direction.y * radius,
    z: direction.z * radius,
  };
}

function createLinks(
  nodes: readonly CelestialNode[],
  directedRelationships: readonly DirectedRelationship[],
): GravityLink[] {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const directedPairs = new Set(
    directedRelationships.map((relationship) =>
      [relationship.sourceId, relationship.targetId].sort().join("--"),
    ),
  );
  return nodes.flatMap((node) =>
    node.relatedNodeIds
      .filter(
        (relatedId) =>
          node.id < relatedId &&
          byId.has(relatedId) &&
          !directedPairs.has([node.id, relatedId].sort().join("--")),
      )
      .map((relatedId) => ({
        source: node.id,
        target: relatedId,
        affinity: relationshipAffinity(node, byId.get(relatedId)!),
      })),
  );
}

function createCausalForce(
  context: GravityContext,
  relationships: readonly DirectedRelationship[],
): Force<GravityNode> {
  let byId = new Map<string, GravityNode>();
  const classStrength = {
    direct: 1,
    partial: 0.68,
    loose: 0.42,
  } as const;
  const classDistance = {
    direct: 245,
    partial: 360,
    loose: 500,
  } as const;

  const force = ((alpha: number) => {
    for (const relationship of relationships) {
      const source = byId.get(relationship.sourceId);
      const target = byId.get(relationship.targetId);
      if (!source || !target) {
        continue;
      }

      const dx = source.x - target.x;
      const dy = source.y - target.y;
      const dz = source.z - target.z;
      const distance = Math.hypot(dx, dy, dz) || 1;
      const desiredDistance =
        classDistance[relationship.connectionClass] +
        (1 - relationship.strength) * 180 -
        ((source.source.contentMass + target.source.contentMass) / 2) * 54;
      const extension = Math.max(0, distance - desiredDistance);
      if (extension === 0) {
        continue;
      }

      const effectiveStrength = effectiveRelationshipStrength(
        relationship,
        context.activeLensIds,
        context.attentionIds,
      );
      const pull = Math.min(
        11,
        extension *
          (0.006 + effectiveStrength * 0.012) *
          classStrength[relationship.connectionClass] *
          (0.72 + target.source.contentMass * 0.5) *
          alpha,
      );
      const unitX = dx / distance;
      const unitY = dy / distance;
      const unitZ = dz / distance;

      target.vx += unitX * pull;
      target.vy += unitY * pull;
      target.vz += unitZ * pull;

      const sourceReaction =
        (0.06 + (1 - relationship.strength) * 0.05) /
        (0.68 + source.source.contentMass * 0.62);
      source.vx -= unitX * pull * sourceReaction;
      source.vy -= unitY * pull * sourceReaction;
      source.vz -= unitZ * pull * sourceReaction;
    }
  }) as Force<GravityNode>;

  force.initialize = (initializedNodes) => {
    byId = new Map(initializedNodes.map((node) => [node.id, node]));
  };
  return force;
}

function createTargetForce(
  context: GravityContext,
): Force<GravityNode> {
  let nodes: GravityNode[] = [];
  const force = ((alpha: number) => {
    for (const node of nodes) {
      const gravityTarget = gravityTargetForNode(
        node.source,
        context.activeLensIds,
      );
      const anchorTarget = context.anchorTargets.get(node.id);
      const relevance = lensRelevance(node.source, context.activeLensIds);
      const homeStrength =
        node.source.tier === "authored"
          ? 0.018 + relevance * 0.012
          : node.source.tier === "emerging"
            ? 0.011
            : 0.006;
      const anchorStrength = anchorTarget ? 0.13 : 0;
      const target = anchorTarget ?? gravityTarget;
      const strength = anchorStrength || homeStrength;

      node.vx += (target.x - node.x) * strength * alpha;
      node.vy += (target.y - node.y) * strength * alpha;
      node.vz += (target.z - node.z) * strength * alpha;
    }
  }) as Force<GravityNode>;
  force.initialize = (initializedNodes) => {
    nodes = initializedNodes;
  };
  return force;
}

function createVelocityLimitForce(): Force<GravityNode> {
  let nodes: GravityNode[] = [];
  const force = (() => {
    for (const node of nodes) {
      const speed = Math.hypot(node.vx, node.vy, node.vz);
      const limit =
        node.source.tier === "authored"
          ? 16
          : node.source.tier === "emerging"
            ? 10
            : 4;
      if (speed <= limit) {
        continue;
      }
      const scale = limit / speed;
      node.vx *= scale;
      node.vy *= scale;
      node.vz *= scale;
    }
  }) as Force<GravityNode>;
  force.initialize = (initializedNodes) => {
    nodes = initializedNodes;
  };
  return force;
}

export function createGravitySystem(
  celestialNodes: readonly CelestialNode[],
  directedRelationships: readonly DirectedRelationship[] = [],
): GravitySystem {
  const gravityNodes: GravityNode[] = celestialNodes.map((node) => ({
    id: node.id,
    source: node,
    x: node.basePosition.x,
    y: node.basePosition.y,
    z: node.basePosition.z,
    vx: 0,
    vy: 0,
    vz: 0,
  }));
  const byId = new Map(gravityNodes.map((node) => [node.id, node]));
  const context: GravityContext = {
    activeLensIds: [],
    anchorTargets: new Map(),
    attentionIds: new Set(),
  };
  const links = createLinks(celestialNodes, directedRelationships);
  const linkForce = forceLink<GravityNode, GravityLink>(links)
    .id((node) => node.id)
    .distance((link) => 250 + (1 - link.affinity) * 360)
    .strength((link) => 0.025 + link.affinity * 0.08)
    .iterations(2);
  const collisionForce = forceCollide<GravityNode>()
    .radius((node) =>
      node.source.tier === "authored"
        ? 84 + node.source.contentMass * 48
        : node.source.tier === "emerging"
          ? 34 + node.source.contentMass * 28
          : 9,
    )
    .strength(0.72)
    .iterations(2);
  const chargeForce = forceManyBody<GravityNode>()
    .strength((node) =>
      node.source.tier === "authored"
        ? -280 - node.source.contentMass * 220
        : node.source.tier === "emerging"
          ? -24 - node.source.contentMass * 42
          : -2.5,
    )
    .distanceMin(24)
    .distanceMax(720)
    .theta(0.88);
  const simulation: Simulation<GravityNode, GravityLink> = forceSimulation<
    GravityNode,
    GravityLink
  >(gravityNodes, 3)
    .force("target", createTargetForce(context))
    .force("causal", createCausalForce(context, directedRelationships))
    .force("links", linkForce)
    .force("collision", collisionForce)
    .force("charge", chargeForce)
    .force("speed-limit", createVelocityLimitForce())
    .alpha(0.16)
    .alphaMin(0.001)
    .alphaDecay(0.018)
    .velocityDecay(0.18)
    .stop();

  return {
    setContext(
      activeLensIds,
      anchorTargets = new Map(),
      attentionIds = new Set(),
    ) {
      context.activeLensIds = [...activeLensIds];
      context.anchorTargets = anchorTargets;
      context.attentionIds = attentionIds;
      linkForce.strength((link) =>
        activeLensIds.length > 0 ? 0.025 + link.affinity * 0.08 : 0,
      );
      chargeForce.strength((node) =>
        activeLensIds.length === 0
          ? 0
          : node.source.tier === "authored"
            ? -280 - node.source.contentMass * 220
            : node.source.tier === "emerging"
              ? -24 - node.source.contentMass * 42
              : -2.5,
      );
      simulation.alpha(Math.max(simulation.alpha(), 0.78));
    },
    tick(deltaMilliseconds) {
      const iterations = Math.max(
        1,
        Math.min(3, Math.round(deltaMilliseconds / 16.67)),
      );
      simulation.tick(iterations);
    },
    position(nodeId) {
      const node = byId.get(nodeId);
      return node ? { x: node.x, y: node.y, z: node.z } : undefined;
    },
    velocity(nodeId) {
      const node = byId.get(nodeId);
      return node ? { x: node.vx, y: node.vy, z: node.vz } : undefined;
    },
    sync(positions) {
      for (const [nodeId, position] of positions) {
        const node = byId.get(nodeId);
        if (!node) continue;
        node.x = position.x;
        node.y = position.y;
        node.z = position.z;
        node.vx = 0;
        node.vy = 0;
        node.vz = 0;
      }
      simulation.alpha(0.72);
    },
    dispose() {
      simulation.stop();
    },
  };
}