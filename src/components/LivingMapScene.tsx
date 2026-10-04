import {
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ArrowLeft, Expand } from "lucide-react";
import { ALL_BODIES, AUTHORED_BODIES } from "../data/bodies";
import { DIRECTED_RELATIONSHIPS } from "../data/relationships";
import { getSubstanceRecord } from "../data/substance";
import {
  LENSES,
  LENS_IDS,
  lensRelevance,
  mixLensColors,
  type CelestialNode,
  type LensId,
  type Vector3,
} from "../domain/cosmology";
import {
  constellationAnchorTargets,
  selectConstellation,
} from "../domain/constellations";
import {
  clamp,
  pointerDistance,
  pointerMidpoint,
  zoomFromPinch,
  type Point2,
} from "../domain/gestures";
import type { GratitudePhase } from "../domain/gratitude";
import {
  easeVector,
  projectVector,
  type CameraState,
  type ProjectedPoint,
} from "../domain/projection";
import {
  createGravitySystem,
  gravityTargetForNode,
  type GravitySystem,
} from "../domain/gravity";
import {
  effectiveRelationshipStrength,
  relationshipLensRelevance,
  type DirectedRelationship,
} from "../domain/relationships";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { useUniverseStore } from "../state/universeStore";
import {
  AmbientStarGlyph,
  BodyGlyph,
  EmergingGlyph,
} from "./BodyGlyph";
import { LensInstrument } from "./LensInstrument";
import { LifeOfPiePrototype } from "./LifeOfPiePrototype";
import { WorldResources } from "./WorldResources";

interface RuntimeBody {
  position: Vector3;
  target: Vector3;
  projected: ProjectedPoint;
  renderScale: number;
  trail: Array<{ position: Vector3; sampledAt: number }>;
  lastTrailPosition: Vector3;
  lastTrailSampledAt: number;
}

interface PointerRecord extends Point2 {
  previousX: number;
  previousY: number;
}

interface PinchState {
  distance: number;
  midpoint: Point2;
  zoom: number;
  panX: number;
  panY: number;
}

const RELATIONSHIPS = DIRECTED_RELATIONSHIPS;
const AUTHORED_BY_ID = new Map(AUTHORED_BODIES.map((node) => [node.id, node]));

type RelationshipFocus = "idle" | "lens" | "attention" | "receding";

function relationshipVisibilityClass(focus: RelationshipFocus): string {
  return focus === "lens" || focus === "attention" ? " is-visible" : "";
}

function relationshipKindLabel(kind: DirectedRelationship["kind"]): string {
  return kind.replace("-", " ");
}

const NODE_SYNTHESIS: Readonly<Record<string, string>> = {
  "life-of-pie":
    "A safe, familiar form with an endlessly variable surface: Brooklyn comfort food became Walter’s laboratory for craft, travel, hospitality, scarcity, memory, and self-discovery. The world asks how much can change while something still feels like home.",
  "empanadas-son":
    "A portable food became a bridge between Argentina, Brooklyn, entrepreneurship, craft, and belonging. Empanadas Son! is less a food archive than a record of what happens when a form migrates and becomes local again.",
  argentina:
    "Argentina behaves less like one destination than a system of connected experiences: language, food, migration, entrepreneurship, identity, and the practice of relearning familiar things in another cultural grammar.",
};

const RELATIONSHIP_SYNTHESIS: Readonly<Record<string, string>> = {
  "brooklyn-forms-life-of-pie":
    "Brooklyn is more than provenance here: it establishes Walter’s baseline for what a slice is supposed to feel like — cheap, foldable, familiar, and tied to memory. Life of Pie starts with that certainty, then tests how much can change without losing the thing itself.",
  "craft-shapes-life-of-pie":
    "Pizza became a practical teacher of patience, preparation, heat, sequence, restraint, and repetition. The craft connection is the shift from simply making tasty food to understanding why a pie works — and being able to reproduce it on purpose.",
  "care-gives-life-of-pie-gravity":
    "Pizza carries comfort because feeding people changes their state: hunger softens, attention synchronizes, and a shared meal creates temporary common ground. Care is part of the physics of this world, not decoration around it.",
  "hospitality-practiced-through-life-of-pie":
    "Life of Pie turns hospitality into something concrete: make something people already want, then use technique, surprise, and generosity to improve the experience without making the guest work for it.",
  "argentina-translates-life-of-pie":
    "Argentina taught Walter that familiar forms survive translation by adapting to local ingredients, habits, language, and pride. The point is not preserving a museum-perfect original; it is noticing what survives the move and what becomes newly authentic.",
  "empanadas-and-pie-share-portability":
    "Pizza and empanadas solve a similar human problem in different forms: comfort that travels. Both can be held, shared, sold on the street, carried across borders, and loaded with local identity without losing their basic usefulness.",
  "life-of-pie-refines-craft":
    "The feedback runs both ways: making enough pizza sharpened Walter’s broader sense of technique — prep first, less rushing, better sequencing, more restraint, and more attention to the system underneath the result.",
  "life-of-pie-offers-care":
    "Pizza gives care back through accessibility: it can be cheap, filling, familiar, portable, celebratory, or simply available at 2 A.M. Its value often comes from meeting the person where they actually are.",
};

function relationshipBrief(
  relationship: DirectedRelationship,
  sourceLabel: string,
  targetLabel: string,
): string {
  const synthesis = RELATIONSHIP_SYNTHESIS[relationship.id];
  if (synthesis) {
    return synthesis;
  }

  switch (relationship.kind) {
    case "origin":
      return `${sourceLabel} helps form the origin story of ${targetLabel}.`;
    case "place":
      return `${sourceLabel} locates or reframes ${targetLabel} through place.`;
    case "practice":
      return `${targetLabel} is a place where ${sourceLabel} gets practiced in the world.`;
    case "craft":
      return `${sourceLabel} shapes how ${targetLabel} is made, refined, or understood.`;
    case "expression":
      return `${targetLabel} is one expression of something carried by ${sourceLabel}.`;
    case "care":
      return `${sourceLabel} and ${targetLabel} connect through care, nourishment, or attention.`;
    case "service":
      return `${sourceLabel} connects to ${targetLabel} through service and usefulness.`;
    case "implementation":
      return `${sourceLabel} becomes concrete through ${targetLabel}.`;
    case "learning":
      return `${sourceLabel} changes what can be learned or understood about ${targetLabel}.`;
    case "documentation":
      return `${sourceLabel} preserves or explains evidence connected to ${targetLabel}.`;
    case "collaboration":
      return `${sourceLabel} and ${targetLabel} are linked by work made with or through others.`;
    case "movement":
      return `${sourceLabel} and ${targetLabel} connect through travel, portability, or translation.`;
  }
}

function dominantLensId(node: CelestialNode): LensId {
  return LENS_IDS.reduce((strongest, lensId) =>
    node.lensWeights[lensId] > node.lensWeights[strongest]
      ? lensId
      : strongest,
  );
}

function lensColor(lensId: LensId): string {
  return LENSES.find((lens) => lens.id === lensId)?.color ?? "#171717";
}

const INITIAL_CAMERA: CameraState = {
  yaw: -0.18,
  pitch: 0.1,
  zoom: 0.5,
  panX: 0,
  panY: 0,
};

function skyZoomForWidth(width: number): number {
  if (width < 480) {
    return 0.94;
  }
  if (width < 720) {
    return 0.78;
  }
  return INITIAL_CAMERA.zoom;
}

function copyVector(point: Vector3): Vector3 {
  return { x: point.x, y: point.y, z: point.z };
}

function constellationSegmentPath(
  from: ProjectedPoint,
  to: ProjectedPoint,
  bend = 0,
): string {
  if (!bend) {
    return `M${from.x.toFixed(1)} ${from.y.toFixed(1)}L${to.x.toFixed(1)} ${to.y.toFixed(1)}`;
  }

  const deltaX = to.x - from.x;
  const deltaY = to.y - from.y;
  const length = Math.hypot(deltaX, deltaY) || 1;
  const midpointX = (from.x + to.x) / 2;
  const midpointY = (from.y + to.y) / 2;
  const controlX = midpointX - (deltaY / length) * length * bend;
  const controlY = midpointY + (deltaX / length) * length * bend;
  return `M${from.x.toFixed(1)} ${from.y.toFixed(1)}Q${controlX.toFixed(1)} ${controlY.toFixed(1)} ${to.x.toFixed(1)} ${to.y.toFixed(1)}`;
}

function relationshipGeometry(
  relationship: DirectedRelationship,
  from: ProjectedPoint,
  to: ProjectedPoint,
): { path: string; destinationNib: string } {
  const deltaX = to.x - from.x;
  const deltaY = to.y - from.y;
  const length = Math.hypot(deltaX, deltaY) || 1;
  const midpointX = (from.x + to.x) / 2;
  const midpointY = (from.y + to.y) / 2;
  const classBend = {
    direct: 0.055,
    partial: 0.14,
    loose: 0.22,
  }[relationship.connectionClass];
  const direction = relationship.sourceId < relationship.targetId ? 1 : -1;
  const bow = clamp(
    length * (classBend + (1 - relationship.strength) * 0.035),
    18,
    relationship.connectionClass === "direct" ? 74 : 156,
  );
  const controlX = midpointX - (deltaY / length) * bow * direction;
  const controlY = midpointY + (deltaX / length) * bow * direction;
  const tangentX = to.x - controlX;
  const tangentY = to.y - controlY;
  const tangentLength = Math.hypot(tangentX, tangentY) || 1;
  const unitX = tangentX / tangentLength;
  const unitY = tangentY / tangentLength;
  const normalX = -unitY;
  const normalY = unitX;
  const nibLength = 7 + relationship.strength * 3;
  const nibWidth = 2.5 + relationship.strength * 1.5;
  const nibBaseX = to.x - unitX * nibLength;
  const nibBaseY = to.y - unitY * nibLength;

  return {
    path: `M${from.x.toFixed(1)} ${from.y.toFixed(1)}Q${controlX.toFixed(1)} ${controlY.toFixed(1)} ${to.x.toFixed(1)} ${to.y.toFixed(1)}`,
    destinationNib: `M${(nibBaseX + normalX * nibWidth).toFixed(1)} ${(nibBaseY + normalY * nibWidth).toFixed(1)}L${to.x.toFixed(1)} ${to.y.toFixed(1)}L${(nibBaseX - normalX * nibWidth).toFixed(1)} ${(nibBaseY - normalY * nibWidth).toFixed(1)}`,
  };
}

function phaseTargetForNode(
  node: CelestialNode,
  gratitudePhase: GratitudePhase,
): Vector3 {
  if (
    node.tier === "authored" &&
    ["circle", "mycelium", "mosaic", "flash", "negative", "portal"].includes(
      gratitudePhase,
    )
  ) {
    const index = AUTHORED_BODIES.findIndex((body) => body.id === node.id);
    const angle = (index / AUTHORED_BODIES.length) * Math.PI * 2 - Math.PI / 2;
    return {
      x: Math.cos(angle) * 760,
      y: Math.sin(angle) * 760,
      z: Math.sin(angle * 2) * 90,
    };
  }

  if (["collapse", "transit"].includes(gratitudePhase)) {
    const drift = node.tier === "ambient" ? 24 : 8;
    return {
      x: Math.sin(node.basePosition.x) * drift,
      y: Math.cos(node.basePosition.y) * drift,
      z: Math.sin(node.basePosition.z) * drift,
    };
  }

  return copyVector(node.basePosition);
}

function environmentPaths(glyphKey?: string) {
  switch (glyphKey) {
    case "empanadas-sun":
      return (
        <>
          <path d="M0 810Q250 720 500 810T1000 810 1500 810" />
          <path d="M130 760h360M190 760v95M430 760v95M250 760q60-80 120 0" />
          <path d="M1080 850q130-210 260 0M1140 765q70-105 140 0M710 610v95M675 705q35-55 70 0" />
        </>
      );
    case "archive":
    case "book":
      return (
        <>
          <path d="M0 820Q350 790 760 820T1600 815" />
          <path d="M120 610h260M105 675h300M135 740h235M1220 595h250M1190 665h310M1235 735h225" />
          <path d="M710 790h230M745 790v70M905 790v70M260 820V560M230 610h60M230 670h60M230 730h60" />
        </>
      );
    case "healthcare":
    case "balance":
      return (
        <>
          <path d="M0 830Q360 800 760 830T1600 825" />
          <path d="M130 730h310M1170 700h330M240 730v105M1370 700v130" />
          <path d="M670 790h260M730 790v70M870 790v70M800 610v180M750 665h100" />
        </>
      );
    case "field-tools":
      return (
        <>
          <path d="M0 835Q320 790 650 825T1220 815 1600 835" />
          <path d="M130 760q170-120 340-10M1130 750q155-125 310-5" />
          <path d="M690 760q110-170 220 0M800 590v170M755 635h90M720 690h160" />
        </>
      );
    case "bridge":
      return (
        <>
          <path d="M0 850h1600M110 850V590M1490 850V590" />
          <path d="M110 590Q800 1020 1490 590M110 590h1380" />
          <path d="M260 650v170M460 720v100M1140 720v100M1340 650v170" />
        </>
      );
    case "pine":
      return (
        <>
          <path d="M0 830Q300 770 560 830T1120 820 1600 830" />
          <path d="M260 830q-15-145 30-270M285 590l-100 70M290 630l120 50M278 690l-140 80M285 730l130 65" />
          <path d="M1280 830q-10-110 25-210M1300 650l-90 70M1300 700l100 55" />
        </>
      );
    case "life-of-pie":
      return (
        <>
          <path d="M0 838Q300 800 580 830T1100 820 1600 838" />
          <path d="M180 830h360M1060 830h350" />
          <path d="M585 830Q800 530 1015 830" />
          <path d="M640 830Q800 625 960 830" />
          <path d="M675 770h250M710 710h180M755 650h90" />
          <path d="M330 830v-120M1270 830v-120M290 710h80M1230 710h80" />
        </>
      );
    default:
      return (
        <>
          <path d="M0 840Q300 790 560 830T1080 820 1600 840" />
          <path d="M120 840q140-210 280 0M1190 840q150-260 300 0" />
        </>
      );
  }
}

interface LivingMapSceneProps {
  gratitudePhase?: GratitudePhase;
}

export function LivingMapScene({
  gratitudePhase = "idle",
}: LivingMapSceneProps) {
  const mode = useUniverseStore((state) => state.mode);
  const activeLensIds = useUniverseStore((state) => state.activeLensIds);
  const pinnedIds = useUniverseStore((state) => state.pinnedIds);
  const hoveredId = useUniverseStore((state) => state.hoveredId);
  const selectedId = useUniverseStore((state) => state.selectedId);
  const centeredId = useUniverseStore((state) => state.centeredId);
  const togglePin = useUniverseStore((state) => state.togglePin);
  const setHovered = useUniverseStore((state) => state.setHovered);
  const setSelected = useUniverseStore((state) => state.setSelected);
  const enterWorld = useUniverseStore((state) => state.enterWorld);
  const returnToSky = useUniverseStore((state) => state.returnToSky);
  const autoSpin = useUniverseStore((state) => state.autoSpin);
  const reducedMotion = useReducedMotion();

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const nodeRefs = useRef(new Map<string, SVGGElement>());
  const nebulaRefs = useRef(new Map<string, SVGCircleElement>());
  const relationRefs = useRef(new Map<string, SVGPathElement>());
  const relationHitRefs = useRef(new Map<string, SVGPathElement>());
  const relationNibRefs = useRef(new Map<string, SVGPathElement>());
  const trailRefs = useRef(new Map<string, SVGPathElement>());
  const constellationPointRefs = useRef(new Map<string, SVGGElement>());
  const constellationSegmentRefs = useRef(
    new Map<string, SVGPathElement>(),
  );
  const previewRef = useRef<HTMLButtonElement>(null);
  const camera = useRef<CameraState>({ ...INITIAL_CAMERA });
  const cameraTarget = useRef<CameraState>({ ...INITIAL_CAMERA });
  const gravity = useRef<GravitySystem | null>(null);
  if (!gravity.current) {
    gravity.current = createGravitySystem(
      ALL_BODIES,
      DIRECTED_RELATIONSHIPS,
    );
  }
  const runtime = useRef(
    new Map<string, RuntimeBody>(
      ALL_BODIES.map((node) => [
        node.id,
        {
          position: copyVector(node.basePosition),
          target: copyVector(node.basePosition),
          projected: {
            x: 0,
            y: 0,
            scale: 1,
            opacity: 1,
            depth: 0,
            visible: true,
          },
          renderScale: 1,
          trail: [],
          lastTrailPosition: copyVector(node.basePosition),
          lastTrailSampledAt: 0,
        },
      ]),
    ),
  );
  const activePointers = useRef(new Map<number, PointerRecord>());
  const pinchState = useRef<PinchState | null>(null);
  const isDragging = useRef(false);
  const spacePressed = useRef(false);
  const lastInteractionAt = useRef(performance.now());
  const previousGratitudePhase = useRef(gratitudePhase);
  const resolveOnEnterRef = useRef<string | null>(null);
  const [size, setSize] = useState({ width: 1600, height: 1000 });
  const [hoveredRelationshipId, setHoveredRelationshipId] = useState<string | null>(null);

  const activeColor = mixLensColors(activeLensIds);
  const activeConstellation = useMemo(
    () =>
      gratitudePhase === "idle"
        ? selectConstellation(activeLensIds)
        : null,
    [activeLensIds, gratitudePhase],
  );
  const activeConstellationAnchorTargets = useMemo(
    () =>
      activeConstellation
        ? constellationAnchorTargets(activeConstellation)
        : new Map<string, Vector3>(),
    [activeConstellation],
  );
  const healthcareConstellationActive =
    activeConstellation?.id === "healthcare-scales";
  const selectedNode = useMemo(
    () => ALL_BODIES.find((node) => node.id === selectedId) ?? null,
    [selectedId],
  );
  const centeredNode = useMemo(
    () => ALL_BODIES.find((node) => node.id === centeredId) ?? null,
    [centeredId],
  );
  const centeredSubstance = useMemo(
    () => (centeredId ? getSubstanceRecord(centeredId) : undefined),
    [centeredId],
  );
  const attentionIds = useMemo(() => {
    const ids = new Set(pinnedIds);
    if (centeredId) {
      ids.add(centeredId);
    }
    return ids;
  }, [centeredId, pinnedIds]);
  const awakenedNodeIds = useMemo(() => {
    const ids = new Set(attentionIds);

    for (const node of AUTHORED_BODIES) {
      if (
        attentionIds.has(node.id) ||
        node.relatedNodeIds.some((relatedId) => attentionIds.has(relatedId))
      ) {
        ids.add(node.id);
      }
      if (
        activeLensIds.length > 0 &&
        lensRelevance(node, activeLensIds) > 0.54
      ) {
        ids.add(node.id);
      }
    }

    return ids;
  }, [activeLensIds, attentionIds]);
  const relationshipStates = useMemo(
    () =>
      RELATIONSHIPS.map((relationship) => {
        const from = AUTHORED_BY_ID.get(relationship.sourceId);
        const to = AUTHORED_BY_ID.get(relationship.targetId);
        if (!from || !to) {
          return null;
        }

        const lensStrength = relationshipLensRelevance(
          relationship,
          activeLensIds,
        );
        const incident =
          attentionIds.has(relationship.sourceId) ||
          attentionIds.has(relationship.targetId);
        let focus: RelationshipFocus = "idle";
        if (attentionIds.size > 0) {
          focus = incident ? "attention" : "receding";
        } else if (activeLensIds.length > 0) {
          focus = lensStrength > 0 ? "lens" : "receding";
        }
        const matchingLensIds = activeLensIds.filter((lensId) =>
          relationship.lensChannels.includes(lensId),
        );
        const colors =
          matchingLensIds.length > 0
            ? matchingLensIds.map(lensColor)
            : focus === "attention"
              ? [
                  lensColor(dominantLensId(from)),
                  lensColor(dominantLensId(to)),
                ]
              : ["#504b43", "#23201b"];

        return {
          ...relationship,
          focus,
          lensStrength,
          effectiveStrength: effectiveRelationshipStrength(
            relationship,
            activeLensIds,
            attentionIds,
          ),
          colors,
        };
      }).filter((relationship) => relationship !== null),
    [activeLensIds, attentionIds],
  );

  const hoveredRelationship = useMemo(
    () =>
      relationshipStates.find(
        (relationship) => relationship.id === hoveredRelationshipId,
      ) ?? null,
    [hoveredRelationshipId, relationshipStates],
  );
  const discoveryNode = useMemo(
    () =>
      ALL_BODIES.find((node) => node.id === hoveredId) ??
      selectedNode ??
      centeredNode ??
      null,
    [centeredNode, hoveredId, selectedNode],
  );
  const discoverySubstance = useMemo(
    () => (discoveryNode ? getSubstanceRecord(discoveryNode.id) : undefined),
    [discoveryNode],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) {
        return;
      }
      setSize({
        width: Math.max(320, entry.contentRect.width),
        height: Math.max(560, entry.contentRect.height),
      });
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (mode === "world" && centeredId) {
      window.scrollTo(0, 0);
    }
  }, [centeredId, mode]);

  useEffect(() => {
    const gravitySystem = gravity.current;
    if (!gravitySystem) {
      return;
    }

    if (
      previousGratitudePhase.current !== "idle" &&
      gratitudePhase === "idle"
    ) {
      gravitySystem.sync(
        new Map(
          [...runtime.current.entries()].map(([nodeId, body]) => [
            nodeId,
            body.position,
          ]),
        ),
      );
    }

    for (const node of ALL_BODIES) {
      const body = runtime.current.get(node.id);
      if (body) {
        body.target =
          gratitudePhase === "idle"
            ? gravityTargetForNode(node, activeLensIds)
            : phaseTargetForNode(node, gratitudePhase);
      }
    }
    gravitySystem.setContext(
      activeLensIds,
      activeConstellation ? activeConstellationAnchorTargets : undefined,
      attentionIds,
    );
    previousGratitudePhase.current = gratitudePhase;
  }, [
    activeConstellation,
    activeConstellationAnchorTargets,
    activeLensIds,
    attentionIds,
    gratitudePhase,
  ]);

  useEffect(
    () => () => {
      gravity.current?.dispose();
    },
    [],
  );

  useEffect(() => {
    if (centeredId) {
      const resolveImmediately =
        mode === "world" &&
        centeredId === "life-of-pie" &&
        resolveOnEnterRef.current === centeredId;
      cameraTarget.current.zoom = resolveImmediately ? 2.08 : 1.44;
      cameraTarget.current.panX = 0;
      cameraTarget.current.panY = mode === "world" ? -size.height * 0.08 : 0;
      if (resolveImmediately) {
        resolveOnEnterRef.current = null;
      }
    } else {
      cameraTarget.current.zoom = skyZoomForWidth(size.width);
      cameraTarget.current.panX = 0;
      cameraTarget.current.panY = 0;
    }
  }, [centeredId, mode, size.height, size.width]);

  useEffect(() => {
    const keyDown = (event: globalThis.KeyboardEvent) => {
      if (event.code === "Space" && event.target === document.body) {
        spacePressed.current = true;
        event.preventDefault();
      }
      if (event.key === "Escape") {
        if (mode === "world") {
          returnToSky();
        } else {
          setSelected(null);
        }
      }
    };
    const keyUp = (event: globalThis.KeyboardEvent) => {
      if (event.code === "Space") {
        spacePressed.current = false;
      }
    };
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    return () => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
    };
  }, [mode, returnToSky, setSelected]);

  useEffect(() => {
    let frame = 0;
    let previousTime = performance.now();
    const renderFrame = (time: number) => {
      const delta = Math.min(40, time - previousTime);
      previousTime = time;
      const easing = reducedMotion ? 0.16 : 1 - Math.pow(0.87, delta / 16.67);
      const cameraEase = reducedMotion ? 0.18 : 1 - Math.pow(0.82, delta / 16.67);

      if (
        autoSpin &&
        !reducedMotion &&
        !isDragging.current &&
        mode === "sky" &&
        time - lastInteractionAt.current > 900 &&
        gratitudePhase === "idle"
      ) {
        cameraTarget.current.yaw += delta * 0.00006;
      }

      cameraTarget.current.pitch = clamp(
        cameraTarget.current.pitch,
        -1.02,
        1.02,
      );
      camera.current = {
        yaw:
          camera.current.yaw +
          (cameraTarget.current.yaw - camera.current.yaw) * cameraEase,
        pitch:
          camera.current.pitch +
          (cameraTarget.current.pitch - camera.current.pitch) * cameraEase,
        zoom:
          camera.current.zoom +
          (cameraTarget.current.zoom - camera.current.zoom) * cameraEase,
        panX:
          camera.current.panX +
          (cameraTarget.current.panX - camera.current.panX) * cameraEase,
        panY:
          camera.current.panY +
          (cameraTarget.current.panY - camera.current.panY) * cameraEase,
      };

      if (containerRef.current) {
        const worldProximity =
          mode === "world" && centeredId === "life-of-pie"
            ? clamp((camera.current.zoom - 1.48) / 0.5, 0, 1)
            : 0;
        const skyArtifactProximity =
          mode === "sky"
            ? clamp((camera.current.zoom - 1.02) / 0.72, 0, 1)
            : 0;
        containerRef.current.style.setProperty(
          "--world-proximity",
          worldProximity.toFixed(3),
        );
        containerRef.current.style.setProperty(
          "--sky-artifact-proximity",
          skyArtifactProximity.toFixed(3),
        );
      }

      if (gratitudePhase === "idle" && !reducedMotion) {
        gravity.current?.tick(delta);
      }

      const centeredRuntime = centeredId
        ? runtime.current.get(centeredId)
        : undefined;
      const origin = centeredRuntime?.position ?? { x: 0, y: 0, z: 0 };

      for (const node of ALL_BODIES) {
        const body = runtime.current.get(node.id);
        const element = nodeRefs.current.get(node.id);
        if (!body || !element) {
          continue;
        }
        if (gratitudePhase === "idle" && !reducedMotion) {
          const gravityPosition = gravity.current?.position(node.id);
          if (gravityPosition) {
            body.position = gravityPosition;
          }
        } else {
          body.position = easeVector(body.position, body.target, easing);
        }
        const localPosition = {
          x: body.position.x - origin.x,
          y: body.position.y - origin.y,
          z: body.position.z - origin.z,
        };
        body.projected = projectVector(
          localPosition,
          camera.current,
          size.width,
          size.height,
        );
        const relevance = lensRelevance(node, activeLensIds);
        const isPinned = pinnedIds.includes(node.id);
        const isHovered = hoveredId === node.id;
        const isCentered = centeredId === node.id;
        const interactionScale = isCentered
          ? 3
          : isPinned
            ? 2.1
            : isHovered
              ? 1.55
              : 1;
        const importanceScale =
          node.tier === "authored"
            ? 0.6 + node.importance * 0.38 + node.contentMass * 0.28
            : node.tier === "emerging"
              ? 0.62
              : 0.48 + node.importance;
        const lensScale =
          activeLensIds.length > 0 ? 0.82 + relevance * 0.6 : 1;
        const phaseScale = gratitudePhase === "collapse" ? 0.46 : 1;
        const zoomScale =
          node.tier === "authored"
            ? clamp(
                0.9 +
                  (camera.current.zoom - skyZoomForWidth(size.width)) * 0.34,
                0.9,
                1.72,
              )
            : 1;
        const totalScale =
          body.projected.scale *
          interactionScale *
          importanceScale *
          lensScale *
          phaseScale *
          zoomScale;
        body.renderScale = totalScale;
        const baseOpacity =
          node.tier === "ambient"
            ? 0.22 + node.importance * 0.6
            : node.tier === "emerging"
              ? 0.24 + relevance * 0.48
              : 0.58 + relevance * 0.38;
        const visibleOpacity = body.projected.visible
          ? baseOpacity * body.projected.opacity
          : 0;

        element.setAttribute(
          "transform",
          `translate(${body.projected.x.toFixed(2)} ${body.projected.y.toFixed(2)}) scale(${totalScale.toFixed(4)})`,
        );
        element.style.opacity = String(clamp(visibleOpacity, 0, 1));
        element.style.setProperty("--depth", body.projected.depth.toFixed(2));

        if (node.tier === "authored") {
          const trail = trailRefs.current.get(node.id);
          const moved = Math.hypot(
            body.position.x - body.lastTrailPosition.x,
            body.position.y - body.lastTrailPosition.y,
            body.position.z - body.lastTrailPosition.z,
          );
          if (
            !reducedMotion &&
            moved > 3 &&
            time - body.lastTrailSampledAt > 68
          ) {
            body.trail.push({
              position: copyVector(body.position),
              sampledAt: time,
            });
            body.trail = body.trail
              .filter((sample) => time - sample.sampledAt < 920)
              .slice(-7);
            body.lastTrailPosition = copyVector(body.position);
            body.lastTrailSampledAt = time;
          } else {
            body.trail = body.trail.filter(
              (sample) => time - sample.sampledAt < 920,
            );
          }

          if (trail) {
            const projectedTrail = body.trail.map((sample) =>
              projectVector(
                {
                  x: sample.position.x - origin.x,
                  y: sample.position.y - origin.y,
                  z: sample.position.z - origin.z,
                },
                camera.current,
                size.width,
                size.height,
              ),
            );
            if (projectedTrail.length > 1) {
              trail.setAttribute(
                "d",
                projectedTrail
                  .map(
                    (point, index) =>
                      `${index === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`,
                  )
                  .join(""),
              );
              const oldest = body.trail[0];
              trail.style.opacity = String(
                oldest
                  ? clamp(
                      (1 - (time - oldest.sampledAt) / 920) * 0.5,
                      0,
                      0.5,
                    )
                  : 0,
              );
            } else {
              trail.style.opacity = "0";
            }
          }
        }

        const nebula = nebulaRefs.current.get(node.id);
        if (nebula) {
          const radius = clamp(
            82 * body.projected.scale * (0.78 + node.importance * 0.38),
            46,
            154,
          );
          nebula.setAttribute("cx", body.projected.x.toFixed(2));
          nebula.setAttribute("cy", body.projected.y.toFixed(2));
          nebula.setAttribute("r", radius.toFixed(2));
          nebula.style.visibility = body.projected.visible
            ? "visible"
            : "hidden";
        }
      }

      const constellationPositions = new Map<string, ProjectedPoint>();
      if (activeConstellation) {
        for (const constellationPoint of activeConstellation.points) {
          const anchoredPosition = constellationPoint.anchorNodeId
            ? runtime.current.get(constellationPoint.anchorNodeId)?.position
            : undefined;
          const worldPosition = anchoredPosition ?? constellationPoint.position;
          const projected = projectVector(
            {
              x: worldPosition.x - origin.x,
              y: worldPosition.y - origin.y,
              z: worldPosition.z - origin.z,
            },
            camera.current,
            size.width,
            size.height,
          );
          constellationPositions.set(constellationPoint.id, projected);

          const helperPoint = constellationPointRefs.current.get(
            constellationPoint.id,
          );
          if (helperPoint) {
            helperPoint.setAttribute(
              "transform",
              `translate(${projected.x.toFixed(2)} ${projected.y.toFixed(2)}) scale(${projected.scale.toFixed(4)})`,
            );
            helperPoint.style.opacity = projected.visible
              ? String(projected.opacity)
              : "0";
          }
        }

        for (const segment of activeConstellation.segments) {
          const path = constellationSegmentRefs.current.get(segment.id);
          const from = constellationPositions.get(segment.from);
          const to = constellationPositions.get(segment.to);
          if (!path || !from || !to) {
            continue;
          }
          path.setAttribute(
            "d",
            constellationSegmentPath(from, to, segment.bend),
          );
          path.style.visibility =
            from.visible && to.visible ? "visible" : "hidden";
        }
      }

      for (const relation of RELATIONSHIPS) {
        const path = relationRefs.current.get(relation.id);
        const hit = relationHitRefs.current.get(relation.id);
        const nib = relationNibRefs.current.get(relation.id);
        const from = runtime.current.get(relation.sourceId)?.projected;
        const to = runtime.current.get(relation.targetId)?.projected;
        if (!path || !from || !to) {
          continue;
        }
        const geometry = relationshipGeometry(relation, from, to);
        path.setAttribute("d", geometry.path);
        hit?.setAttribute("d", geometry.path);
        nib?.setAttribute("d", geometry.destinationNib);
        const visible = from.visible && to.visible;
        path.style.visibility = visible ? "visible" : "hidden";
        if (hit) {
          hit.style.visibility = visible ? "visible" : "hidden";
        }
        if (nib) {
          nib.style.visibility = visible ? "visible" : "hidden";
        }
      }

      const preview = previewRef.current;
      if (preview && selectedId) {
        const selectedBody = runtime.current.get(selectedId);
        const point = selectedBody?.projected;
        if (point && selectedBody) {
          const previewX = point.x;
          const previewY = point.y + selectedBody.renderScale * 72 + 12;
          preview.style.transform = `translate3d(${previewX}px, ${previewY}px, 0) translate(-50%, 0)`;
          preview.style.opacity = point.visible ? "1" : "0";
          preview.style.pointerEvents = point.visible ? "auto" : "none";
        }
      }

      const svg = svgRef.current;
      if (svg) {
        svg.dataset.cameraYaw = camera.current.yaw.toFixed(4);
        svg.dataset.cameraPitch = camera.current.pitch.toFixed(4);
        svg.dataset.cameraZoom = camera.current.zoom.toFixed(4);
      }

      frame = requestAnimationFrame(renderFrame);
    };
    frame = requestAnimationFrame(renderFrame);
    return () => cancelAnimationFrame(frame);
  }, [
    activeLensIds,
    activeConstellation,
    autoSpin,
    centeredId,
    gratitudePhase,
    hoveredId,
    mode,
    pinnedIds,
    reducedMotion,
    selectedId,
    size.height,
    size.width,
  ]);

  const resetView = () => {
    const skyZoom = skyZoomForWidth(size.width);
    camera.current = { ...INITIAL_CAMERA, zoom: skyZoom };
    cameraTarget.current = { ...INITIAL_CAMERA, zoom: skyZoom };
    lastInteractionAt.current = performance.now();
    useUniverseStore.getState().setCentered(null);
  };

  const handlePointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (event.button !== 0 && event.button !== 1 && event.button !== 2) {
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    activePointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
      previousX: event.clientX,
      previousY: event.clientY,
    });
    isDragging.current = true;
    lastInteractionAt.current = performance.now();

    if (activePointers.current.size === 2) {
      const [first, second] = [...activePointers.current.values()];
      if (first && second) {
        pinchState.current = {
          distance: pointerDistance(first, second),
          midpoint: pointerMidpoint(first, second),
          zoom: cameraTarget.current.zoom,
          panX: cameraTarget.current.panX,
          panY: cameraTarget.current.panY,
        };
      }
    }
  };

  const handlePointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    const pointer = activePointers.current.get(event.pointerId);
    if (!pointer) {
      return;
    }
    const previousX = pointer.x;
    const previousY = pointer.y;
    pointer.previousX = previousX;
    pointer.previousY = previousY;
    pointer.x = event.clientX;
    pointer.y = event.clientY;

    if (activePointers.current.size >= 2) {
      const [first, second] = [...activePointers.current.values()];
      const initial = pinchState.current;
      if (first && second && initial) {
        const midpoint = pointerMidpoint(first, second);
        cameraTarget.current.zoom = zoomFromPinch(
          initial.zoom,
          initial.distance,
          pointerDistance(first, second),
        );
        cameraTarget.current.panX =
          initial.panX + (midpoint.x - initial.midpoint.x);
        cameraTarget.current.panY =
          initial.panY + (midpoint.y - initial.midpoint.y);
      }
      return;
    }

    const dx = event.clientX - previousX;
    const dy = event.clientY - previousY;
    const panning =
      event.button === 1 ||
      (event.buttons & 2) === 2 ||
      event.shiftKey ||
      spacePressed.current;
    if (panning) {
      cameraTarget.current.panX += dx;
      cameraTarget.current.panY += dy;
    } else {
      cameraTarget.current.yaw += dx * 0.0062;
      cameraTarget.current.pitch += dy * 0.0054;
    }
  };

  const handlePointerUp = (event: ReactPointerEvent<SVGSVGElement>) => {
    activePointers.current.delete(event.pointerId);
    if (activePointers.current.size < 2) {
      pinchState.current = null;
    }
    if (activePointers.current.size === 0) {
      isDragging.current = false;
    }
  };

  const handleWheel = (event: ReactWheelEvent<SVGSVGElement>) => {
    event.preventDefault();
    const multiplier = Math.exp(-event.deltaY * 0.00115);
    cameraTarget.current.zoom = clamp(
      cameraTarget.current.zoom * multiplier,
      0.42,
      3.2,
    );
    lastInteractionAt.current = performance.now();
  };

  const handleNodeKeyDown = (
    event: KeyboardEvent<SVGGElement>,
    node: CelestialNode,
  ) => {
    if (event.key === " " && node.inspectable) {
      event.preventDefault();
      togglePin(node.id);
    }
    if (event.key === "Enter" && node.inspectable && node.route) {
      event.preventDefault();
      enterWorld(node.id);
    }
  };

  const exploreNode = (node: CelestialNode) => {
    if (node.route) {
      if (node.id === "life-of-pie") {
        resolveOnEnterRef.current = node.id;
      }
      enterWorld(node.id);
    }
  };

  return (
    <main
      ref={containerRef}
      className={`living-map mode-${mode} phase-${gratitudePhase}`}
      data-star-count={ALL_BODIES.length}
      data-authored-count={AUTHORED_BODIES.length}
      data-directed-relationship-count={DIRECTED_RELATIONSHIPS.length}
      data-relationship-focus={
        attentionIds.size > 0
          ? "attention"
          : activeLensIds.length > 0
            ? "lens"
            : "idle"
      }
      data-healthcare-constellation={
        healthcareConstellationActive ? "active" : "dormant"
      }
      data-active-constellation={activeConstellation?.id ?? "none"}
      data-centered-world={centeredId ?? "none"}
    >
      <div className="sky-paper" aria-hidden="true" />
      <svg
        ref={svgRef}
        className="universe-canvas"
        viewBox={`0 0 ${size.width} ${size.height}`}
        role="application"
        aria-label="Living map. Drag to rotate, use the wheel or pinch to move closer, and select a drawn star to inspect it."
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        onContextMenu={(event) => event.preventDefault()}
      >
        <defs>
          <filter id="paper-wobble" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.008"
              numOctaves="2"
              seed="19"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="0.9"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
          <filter id="spectral-soft">
            <feGaussianBlur stdDeviation="2.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter
            id="nebula-wash"
            x="-70%"
            y="-70%"
            width="240%"
            height="240%"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012"
              numOctaves="3"
              seed="31"
              result="wash-noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="wash-noise"
              scale="18"
              xChannelSelector="R"
              yChannelSelector="G"
              result="wobbled-wash"
            />
            <feGaussianBlur in="wobbled-wash" stdDeviation="18" />
          </filter>
          {relationshipStates.map((relationship) => (
            <linearGradient
              key={`gradient-${relationship.id}`}
              id={`relationship-gradient-${relationship.id}`}
            >
              {relationship.colors.map((color, index) => (
                <stop
                  key={`${relationship.id}-${color}-${index}`}
                  offset={`${(index / Math.max(1, relationship.colors.length - 1)) * 100}%`}
                  stopColor={color}
                />
              ))}
            </linearGradient>
          ))}
          <linearGradient
            id="healthcare-constellation-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor={lensColor("red")} />
            <stop offset="46%" stopColor="#f7f2e8" />
            <stop offset="54%" stopColor="#23201b" />
            <stop offset="100%" stopColor={lensColor("green")} />
          </linearGradient>
          <linearGradient
            id="tattoo-heart-constellation-gradient"
            x1="12%"
            y1="0%"
            x2="88%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#23201b" />
            <stop offset="36%" stopColor={lensColor("red")} />
            <stop offset="64%" stopColor={lensColor("red")} />
            <stop offset="100%" stopColor="#23201b" />
          </linearGradient>
        </defs>

        <g className="motion-trail-layer" aria-hidden="true">
          {AUTHORED_BODIES.map((node) => (
            <path
              key={`trail-${node.id}`}
              ref={(element) => {
                if (element) {
                  trailRefs.current.set(node.id, element);
                } else {
                  trailRefs.current.delete(node.id);
                }
              }}
              className="motion-trail"
              style={
                {
                  "--trail-color":
                    activeLensIds.length > 0
                      ? activeColor
                      : lensColor(dominantLensId(node)),
                } as CSSProperties
              }
            />
          ))}
        </g>

        <g className="nebula-layer" aria-hidden="true">
          {AUTHORED_BODIES.map((node) => {
            const awakened = awakenedNodeIds.has(node.id);
            const color =
              activeLensIds.length > 0 &&
              lensRelevance(node, activeLensIds) > 0.54
                ? activeColor
                : lensColor(dominantLensId(node));
            return (
              <circle
                key={`nebula-${node.id}`}
                ref={(element) => {
                  if (element) {
                    nebulaRefs.current.set(node.id, element);
                  } else {
                    nebulaRefs.current.delete(node.id);
                  }
                }}
                className={`relationship-nebula${awakened ? " is-awake" : ""}${attentionIds.has(node.id) ? " is-attended" : ""}`}
                style={{ "--nebula-color": color } as CSSProperties}
              />
            );
          })}
        </g>

        <g className="relationship-layer" aria-hidden="true">
          {relationshipStates.map((relationship, relationshipIndex) => (
            <g key={relationship.id}>
              <path
                ref={(element) => {
                  if (element) {
                    relationHitRefs.current.set(relationship.id, element);
                  } else {
                    relationHitRefs.current.delete(relationship.id);
                  }
                }}
                className="relationship-hit-target"
                onPointerEnter={() => setHoveredRelationshipId(relationship.id)}
                onPointerLeave={() => setHoveredRelationshipId(null)}
              />
              <path
                id={`relationship-${relationship.id}`}
                ref={(element) => {
                  if (element) {
                    relationRefs.current.set(relationship.id, element);
                  } else {
                    relationRefs.current.delete(relationship.id);
                  }
                }}
                className={`relationship-path${relationshipVisibilityClass(relationship.focus)} is-${relationship.focus} relation-${relationship.connectionClass}`}
                style={
                  {
                    stroke: `url(#relationship-gradient-${relationship.id})`,
                    "--relationship-color":
                      relationship.colors[relationship.colors.length - 1],
                    "--relationship-weight": relationship.strength,
                    "--relationship-effective":
                      relationship.effectiveStrength,
                  } as CSSProperties
                }
              />
              <path
                ref={(element) => {
                  if (element) {
                    relationNibRefs.current.set(relationship.id, element);
                  } else {
                    relationNibRefs.current.delete(relationship.id);
                  }
                }}
                className={`relationship-destination${relationshipVisibilityClass(relationship.focus)} is-${relationship.focus} relation-${relationship.connectionClass}`}
                style={
                  {
                    stroke: relationship.colors[
                      relationship.colors.length - 1
                    ],
                    "--relationship-weight": relationship.strength,
                    "--relationship-effective":
                      relationship.effectiveStrength,
                  } as CSSProperties
                }
              />
              <circle
                className={`relationship-particle${relationshipVisibilityClass(relationship.focus)} is-${relationship.focus}`}
                r={1.1 + relationship.strength * 0.9}
                style={{
                  fill: relationship.colors[
                    relationshipIndex % relationship.colors.length
                  ],
                }}
              >
                {!reducedMotion && (
                  <animateMotion
                    dur={`${10.5 - relationship.strength * 4.2}s`}
                    begin={`${-(relationshipIndex * 0.53)}s`}
                    repeatCount="indefinite"
                  >
                    <mpath href={`#relationship-${relationship.id}`} />
                  </animateMotion>
                )}
              </circle>
            </g>
          ))}
        </g>

        <g
          className={`constellation-layer${activeConstellation ? ` ${activeConstellation.className} is-visible` : ""}`}
          aria-hidden="true"
        >
          <g className="constellation-lines">
            {activeConstellation?.segments.map((segment) => (
              <path
                key={segment.id}
                ref={(element) => {
                  if (element) {
                    constellationSegmentRefs.current.set(segment.id, element);
                  } else {
                    constellationSegmentRefs.current.delete(segment.id);
                  }
                }}
                className="constellation-segment"
                style={{
                  "--constellation-stroke": `url(#${activeConstellation.gradientId})`,
                } as CSSProperties}
              />
            ))}
          </g>
          <g className="constellation-helpers">
            {activeConstellation?.points
              .filter((constellationPoint) => !constellationPoint.anchorNodeId)
              .map((constellationPoint, index) => (
                <g
                  key={constellationPoint.id}
                  ref={(element) => {
                    if (element) {
                      constellationPointRefs.current.set(
                        constellationPoint.id,
                        element,
                      );
                    } else {
                      constellationPointRefs.current.delete(
                        constellationPoint.id,
                      );
                    }
                  }}
                  className="constellation-helper"
                  style={{
                    "--constellation-stroke": `url(#${activeConstellation.gradientId})`,
                    "--helper-delay": `${index * 42}ms`,
                  } as CSSProperties}
                >
                  <path d="M0-7L1.8-1.8L7 0L1.8 1.8L0 7L-1.8 1.8L-7 0L-1.8-1.8Z" />
                  <circle r="1.25" />
                </g>
              ))}
          </g>
        </g>

        <g className="mycelium-layer" aria-hidden="true">
          {gratitudePhase !== "idle" &&
            gratitudePhase !== "instrument-lock" &&
            AUTHORED_BODIES.map((node, index) => (
              <path
                key={`mycelium-${node.id}`}
                d={`M${size.width / 2} ${size.height / 2}q${Math.cos(index) * size.width * 0.18} ${Math.sin(index * 1.7) * size.height * 0.2} ${Math.cos((index / AUTHORED_BODIES.length) * Math.PI * 2) * size.width * 0.36 + size.width / 2} ${Math.sin((index / AUTHORED_BODIES.length) * Math.PI * 2) * size.height * 0.38 + size.height / 2}`}
              />
            ))}
        </g>

        <g className="body-layer">
          {ALL_BODIES.map((node, index) => {
            const isPinned = pinnedIds.includes(node.id);
            const isHovered = hoveredId === node.id;
            const isCentered = centeredId === node.id;
            const isSelected = selectedId === node.id;
            const relevant =
              activeLensIds.length > 0 &&
              lensRelevance(node, activeLensIds) > 0.42;
            const interactive = node.inspectable;
            const explorable = Boolean(node.route);
            return (
              <g
                key={node.id}
                ref={(element) => {
                  if (element) {
                    nodeRefs.current.set(node.id, element);
                  } else {
                    nodeRefs.current.delete(node.id);
                  }
                }}
                className={`celestial-body tier-${node.tier} state-${node.state}${relevant ? " is-relevant" : ""}${awakenedNodeIds.has(node.id) ? " is-awake" : ""}${isPinned ? " is-pinned" : ""}${isHovered ? " is-hovered" : ""}${isCentered ? " is-centered" : ""}`}
                data-node-id={node.id}
                data-authored={node.tier === "authored" ? "true" : undefined}
                data-inspectable={interactive ? "true" : "false"}
                role={interactive ? "button" : undefined}
                tabIndex={interactive ? 0 : undefined}
                aria-label={
                  interactive
                    ? explorable
                      ? `${node.publicLabel}. Press Space to pin or Enter to explore.`
                      : `${node.publicLabel}. Press Space to pin.`
                    : undefined
                }
                aria-hidden={interactive ? undefined : true}
                onPointerDown={
                  interactive
                    ? (event) => {
                        event.preventDefault();
                        event.stopPropagation();
                      }
                    : undefined
                }
                onPointerEnter={
                  interactive
                    ? () => {
                        setHovered(node.id);
                        setSelected(node.id);
                      }
                    : undefined
                }
                onPointerLeave={
                  interactive ? () => setHovered(null) : undefined
                }
                onClick={
                  interactive
                    ? (event) => {
                        event.stopPropagation();
                        togglePin(node.id);
                      }
                    : undefined
                }
                onDoubleClick={
                  explorable
                    ? (event) => {
                        event.stopPropagation();
                        exploreNode(node);
                      }
                    : undefined
                }
                onKeyDown={
                  interactive
                    ? (event) => handleNodeKeyDown(event, node)
                    : undefined
                }
              >
                {node.tier === "ambient" ? (
                  <AmbientStarGlyph variant={index} />
                ) : node.tier === "emerging" ? (
                  <EmergingGlyph index={index} />
                ) : (
                  <>
                    <BodyGlyph
                      node={node}
                      active={relevant}
                      selected={isSelected || isPinned || isCentered}
                      color={activeColor}
                    />
                    <circle className="body-hit-target" r="48" />
                    {(isHovered || isPinned) && !isCentered && (
                      <text className="body-label" x="0" y="58">
                        {node.publicLabel}
                      </text>
                    )}
                    {(isPinned || isCentered) &&
                      node.artifacts?.map((artifact, artifactIndex) => {
                        const artifactCount = node.artifacts?.length ?? 1;
                        const startingAngle =
                          (artifactIndex / artifactCount) * 360;
                        const orbitRadius = 92 + (artifactIndex % 2) * 25;
                        const orbitDuration = 17 + artifactIndex * 2.3;
                        return (
                          <g
                            key={artifact.id}
                            className="artifact-orbit"
                            transform={
                              reducedMotion
                                ? `rotate(${startingAngle} 0 0)`
                                : undefined
                            }
                            aria-hidden="true"
                          >
                            {!reducedMotion && (
                              <animateTransform
                                attributeName="transform"
                                type="rotate"
                                from={`${startingAngle} 0 0`}
                                to={`${startingAngle + 360} 0 0`}
                                dur={`${orbitDuration}s`}
                                repeatCount="indefinite"
                              />
                            )}
                            <image
                              href={artifact.src}
                              x={orbitRadius}
                              y="-18"
                              width="44"
                              height="36"
                              preserveAspectRatio="xMidYMid meet"
                            />
                          </g>
                        );
                      })}
                  </>
                )}
              </g>
            );
          })}
        </g>

        {mode === "world" && centeredNode && (
          <g
            className="environment-ground"
            transform={`scale(${size.width / 1600} ${size.height / 1000})`}
            aria-hidden="true"
          >
            {environmentPaths(centeredNode.glyphKey)}
          </g>
        )}

      </svg>

      <LensInstrument onResetView={resetView} />

      {mode === "world" && centeredNode && (
        <div className="world-chrome">
          <button type="button" onClick={returnToSky} title="Return to the sky">
            <ArrowLeft aria-hidden="true" />
            <span className="sr-only">Return to the sky</span>
          </button>
          <div className="world-identity">
            <h1>{centeredNode.publicLabel}</h1>
            {centeredSubstance?.period && (
              <p className="world-period">{centeredSubstance.period}</p>
            )}
            {centeredSubstance?.summary && (
              <p className="world-summary">{centeredSubstance.summary}</p>
            )}
          </div>
        </div>
      )}

      {mode === "world" && centeredNode?.id === "life-of-pie" && (
        <LifeOfPiePrototype activeLensIds={activeLensIds} />
      )}

      {mode === "world" && centeredNode && (
        <WorldResources node={centeredNode} />
      )}

      <aside
        className={[
          "discovery-panel",
          hoveredRelationship ? "is-relationship" : discoveryNode ? "is-node" : "is-idle",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-live="polite"
      >
        {hoveredRelationship ? (
          <>
            <span className="discovery-kicker">
              Connection · {relationshipKindLabel(hoveredRelationship.kind)}
            </span>
            <strong>
              {AUTHORED_BY_ID.get(hoveredRelationship.sourceId)?.publicLabel ??
                hoveredRelationship.sourceId}
              {" → "}
              {AUTHORED_BY_ID.get(hoveredRelationship.targetId)?.publicLabel ??
                hoveredRelationship.targetId}
            </strong>
            <p>
              {relationshipBrief(
                hoveredRelationship,
                AUTHORED_BY_ID.get(hoveredRelationship.sourceId)?.publicLabel ??
                  hoveredRelationship.sourceId,
                AUTHORED_BY_ID.get(hoveredRelationship.targetId)?.publicLabel ??
                  hoveredRelationship.targetId,
              )}
            </p>
            <div className="discovery-metrics">
              <span>{hoveredRelationship.connectionClass} link</span>
              <span>{Math.round(hoveredRelationship.strength * 100)}% strength</span>
              <span>{Math.round(hoveredRelationship.confidence * 100)}% confidence</span>
            </div>
            <small>
              Lenses: {hoveredRelationship.lensChannels
                .map(
                  (lensId) =>
                    LENSES.find((lens) => lens.id === lensId)?.shortName ?? lensId,
                )
                .join(" · ")}
            </small>
          </>
        ) : discoveryNode ? (
          <>
            <span className="discovery-kicker">
              {discoveryNode.tier === "authored" ? "World" : "Signal"}
            </span>
            <strong>{discoveryNode.publicLabel}</strong>
            <p>
              {NODE_SYNTHESIS[discoveryNode.id] ??
                discoverySubstance?.summary ??
                "A body in Walter’s living map. Hover its connecting lines to see why it belongs here."}
            </p>
            <small>
              Hover a connection to inspect its direction, meaning, strength, and lenses.
            </small>
          </>
        ) : (
          <>
            <span className="discovery-kicker">Discovery</span>
            <strong>Read the map</strong>
            <p>
              Hover a world or a connecting line to see what it is and why the connection exists.
            </p>
            <small>Pin and zoom when something earns a closer look.</small>
          </>
        )}
      </aside>

      {selectedNode?.route && mode === "sky" && (
        <button
          ref={previewRef}
          type="button"
          className="explore-control"
          onClick={() => exploreNode(selectedNode)}
        >
          <Expand aria-hidden="true" />
          <span>Explore</span>
        </button>
      )}
    </main>
  );
}