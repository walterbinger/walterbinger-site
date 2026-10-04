import {
  type CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  LENSES,
  mixLensColors,
  type LensId,
} from "../domain/cosmology";

interface GravitySignal {
  label: string;
  strength: number;
}

interface GravityContext {
  id: string;
  label: string;
  note: string;
  signals: readonly GravitySignal[];
}

interface PieSatellite {
  id: string;
  label: string;
  src: string;
  contextId: string;
  orbitClass: string;
}

interface ArchivePhoto {
  id: string;
  label: string;
  src: string;
}

const CONTEXTS: readonly GravityContext[] = [
  {
    id: "home",
    label: "Home",
    note: "Caruso, My Little, and the Brooklyn argument over what “best” means.",
    signals: [
      { label: "memory", strength: 0.98 },
      { label: "comfort", strength: 0.94 },
      { label: "ritual", strength: 0.82 },
      { label: "craft", strength: 0.48 },
    ],
  },
  {
    id: "street",
    label: "2 A.M.",
    note: "Fold it. Keep moving. Cheap, available, familiar.",
    signals: [
      { label: "access", strength: 0.98 },
      { label: "portability", strength: 1 },
      { label: "cost", strength: 0.94 },
      { label: "nostalgia", strength: 0.72 },
    ],
  },
  {
    id: "table",
    label: "The Table",
    note: "Feeding people turns food into temporary common ground.",
    signals: [
      { label: "connection", strength: 1 },
      { label: "care", strength: 0.98 },
      { label: "ritual", strength: 0.86 },
      { label: "flavor", strength: 0.8 },
    ],
  },
  {
    id: "road",
    label: "The Road",
    note: "A familiar form travels, survives translation, and changes.",
    signals: [
      { label: "discovery", strength: 0.98 },
      { label: "identity", strength: 0.92 },
      { label: "translation", strength: 0.96 },
      { label: "flavor", strength: 0.84 },
    ],
  },
  {
    id: "scarcity",
    label: "Scarcity",
    note: "When choices collapse, predictability and access become the meal.",
    signals: [
      { label: "comfort", strength: 1 },
      { label: "access", strength: 1 },
      { label: "cost", strength: 0.98 },
      { label: "craft", strength: 0.28 },
    ],
  },
  {
    id: "craft",
    label: "Craft",
    note: "Heat, time, sequence, restraint. Same ingredients, different system.",
    signals: [
      { label: "technique", strength: 1 },
      { label: "time", strength: 0.96 },
      { label: "restraint", strength: 0.9 },
      { label: "flavor", strength: 0.88 },
    ],
  },
  {
    id: "pageant",
    label: "Pageant",
    note: "Pizza Hut can lose on the slice and still win the experience.",
    signals: [
      { label: "ritual", strength: 1 },
      { label: "atmosphere", strength: 0.95 },
      { label: "nostalgia", strength: 0.94 },
      { label: "technique", strength: 0.42 },
    ],
  },
] as const;

const LENS_CONTEXT: Partial<Record<LensId, string>> = {
  red: "table",
  orange: "craft",
  yellow: "home",
  green: "craft",
  blue: "pageant",
  indigo: "road",
  violet: "table",
  magenta: "road",
};

const ORBIT_LABELS = [
  "Home Slice",
  "Hands & Heat",
  "The Road",
  "The Table",
  "The Street",
  "The Pageant",
] as const;

const PIE_SATELLITES: readonly PieSatellite[] = [
  {
    id: "slice-grandma-top",
    label: "Grandma slice A",
    src: "/universe/assets/source/life-of-pie/stickers/grandma-slice-top.png",
    contextId: "home",
    orbitClass: "orbit-e",
  },
  {
    id: "slice-grandma-bottom",
    label: "Grandma slice B",
    src: "/universe/assets/source/life-of-pie/stickers/grandma-slice-bottom.png",
    contextId: "craft",
    orbitClass: "orbit-f",
  },
  {
    id: "pie-8856",
    label: "Heirloom / salami pie",
    src: "/universe/assets/source/life-of-pie/stickers/pie-8856.png",
    contextId: "home",
    orbitClass: "orbit-a",
  },
  {
    id: "pie-8882",
    label: "Chicken / mushroom / pesto pie",
    src: "/universe/assets/source/life-of-pie/stickers/pie-8882.png",
    contextId: "craft",
    orbitClass: "orbit-b",
  },
  {
    id: "pie-8776",
    label: "Fresh mozzarella / basil pie",
    src: "/universe/assets/source/life-of-pie/stickers/pie-8776.png",
    contextId: "road",
    orbitClass: "orbit-c",
  },
  {
    id: "slice-8857",
    label: "Slice profile",
    src: "/universe/assets/source/life-of-pie/stickers/slice-8857.png",
    contextId: "street",
    orbitClass: "orbit-d",
  },
];

const ARCHIVE_PHOTOS: readonly ArchivePhoto[] = [
  {
    id: "grandma-pie",
    label: "My Little “supreme style” clone · whole pie",
    src: "/universe/assets/source/life-of-pie/gallery/grandma-pie.jpg",
  },
  {
    id: "grandma-profile",
    label: "Grandma slice · profile",
    src: "/universe/assets/source/life-of-pie/gallery/grandma-profile.jpg",
  },
  {
    id: "grandma-two-slices",
    label: "Grandma slices · plated pair",
    src: "/universe/assets/source/life-of-pie/gallery/grandma-two-slices.jpg",
  },
  {
    id: "8856",
    label: "Whole pie · 8856",
    src: "/universe/assets/source/life-of-pie/gallery/8856.jpg",
  },
  {
    id: "8857",
    label: "Slice profile · 8857",
    src: "/universe/assets/source/life-of-pie/gallery/8857.jpg",
  },
  {
    id: "8861",
    label: "Walter with slice · 8861",
    src: "/universe/assets/source/life-of-pie/gallery/8861.jpg",
  },
  {
    id: "8881",
    label: "Whole pie · 8881",
    src: "/universe/assets/source/life-of-pie/gallery/8881.jpg",
  },
  {
    id: "8882",
    label: "Whole pie · 8882",
    src: "/universe/assets/source/life-of-pie/gallery/8882.jpg",
  },
  {
    id: "8930",
    label: "Whole pie · 8930",
    src: "/universe/assets/source/life-of-pie/gallery/8930.jpg",
  },
  {
    id: "8776",
    label: "Whole pie · 8776",
    src: "/universe/assets/source/life-of-pie/gallery/8776.jpg",
  },
  {
    id: "dough",
    label: "Dough process",
    src: "/universe/assets/source/life-of-pie/gallery/dough.jpg",
  },
  {
    id: "tomatoes",
    label: "Heirloom tomatoes",
    src: "/universe/assets/source/life-of-pie/gallery/tomatoes.jpg",
  },
  {
    id: "sliced-tomatoes",
    label: "Sliced heirloom tomatoes",
    src: "/universe/assets/source/life-of-pie/gallery/sliced-tomatoes.jpg",
  },
  {
    id: "sticker",
    label: "When it's good…",
    src: "/universe/assets/source/life-of-pie/gallery/sticker.jpg",
  },
] as const;

function wrap(value: number, total: number) {
  return ((value % total) + total) % total;
}

function circularOffset(index: number, position: number, total: number) {
  let offset = index - position;
  while (offset > total / 2) offset -= total;
  while (offset < -total / 2) offset += total;
  return offset;
}

function carouselStyle(offset: number): CSSProperties {
  const distance = Math.abs(offset);
  return {
    "--lop-carousel-x": `${offset * 118}px`,
    "--lop-carousel-x-mobile": `${offset * 74}px`,
    "--lop-carousel-y": `${Math.min(24, distance * 8)}px`,
    "--lop-carousel-z": `${Math.max(-80, 62 - distance * 34)}px`,
    "--lop-carousel-rotate": `${offset * -16}deg`,
    "--lop-carousel-scale": Math.max(0.67, 1 - distance * 0.09),
    "--lop-carousel-opacity":
      distance > 3.55 ? 0 : Math.max(0.28, 1 - distance * 0.16),
    "--lop-carousel-z-index": Math.round(20 - distance * 3),
  } as CSSProperties;
}

export function LifeOfPiePrototype({
  activeLensIds,
}: {
  activeLensIds: readonly LensId[];
}) {
  const [contextId, setContextId] = useState("home");
  const [hoveredSatelliteId, setHoveredSatelliteId] = useState<string | null>(null);
  const [pinnedSatelliteId, setPinnedSatelliteId] = useState<string | null>(null);
  const [galleryPosition, setGalleryPosition] = useState(0);
  const [galleryEngaged, setGalleryEngaged] = useState(false);
  const [expandedPhotoId, setExpandedPhotoId] = useState<string | null>(null);
  const [expandedFullScreen, setExpandedFullScreen] = useState(false);

  const steeringRef = useRef(0);
  const arrowRef = useRef(0);
  const impulseRef = useRef(0);
  const velocityRef = useRef(0.16);
  const positionRef = useRef(0);

  const context =
    CONTEXTS.find((candidate) => candidate.id === contextId) ?? CONTEXTS[0];
  const expandedPhoto =
    ARCHIVE_PHOTOS.find((photo) => photo.id === expandedPhotoId) ?? null;

  const suggestedContextId =
    activeLensIds.length === 1 ? LENS_CONTEXT[activeLensIds[0]] : undefined;
  const lensReading = useMemo(() => {
    if (activeLensIds.length === 0) {
      return "No lens loaded";
    }
    return activeLensIds
      .map((id) => LENSES.find((lens) => lens.id === id)?.shortName ?? id)
      .join(" + ");
  }, [activeLensIds]);

  const style = {
    "--lop-tint": mixLensColors(activeLensIds),
  } as CSSProperties;

  useEffect(() => {
    let frame = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (!expandedPhotoId) {
        const target =
          0.16 +
          steeringRef.current * 0.9 +
          arrowRef.current * 1.2 +
          impulseRef.current;

        velocityRef.current +=
          (target - velocityRef.current) * Math.min(1, dt * 3.4);
        impulseRef.current *= Math.exp(-dt * 3.2);
        positionRef.current = wrap(
          positionRef.current + velocityRef.current * dt,
          ARCHIVE_PHOTOS.length,
        );
        setGalleryPosition(positionRef.current);
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [expandedPhotoId]);

  const jumpToPhoto = (index: number) => {
    positionRef.current = index;
    setGalleryPosition(index);
    velocityRef.current *= 0.45;
  };

  const steerWithArrow = (direction: number) => {
    arrowRef.current = direction;
  };

  const releaseArrow = () => {
    arrowRef.current = 0;
  };

  const burstArrow = (direction: number) => {
    impulseRef.current += direction * 2.15;
  };

  const openPhoto = (photo: ArchivePhoto) => {
    setExpandedPhotoId(photo.id);
    setExpandedFullScreen(false);
  };

  const closePhoto = () => {
    setExpandedPhotoId(null);
    setExpandedFullScreen(false);
  };

  return (
    <section
      className="life-of-pie-prototype"
      style={style}
      aria-label="Life of Pie prototype: the same slice under different kinds of gravity"
    >
      <div className="lop-orbit-system">
        <img
          className="lop-grandma-sketch"
          src="/universe/assets/source/life-of-pie/stickers/grandma-sketch.png"
          alt=""
          aria-hidden="true"
        />

        <div className="lop-core lop-grandma-core">
          <img
            src="/universe/assets/source/life-of-pie/stickers/grandma-pie.png"
            alt="Walter's My Little supreme-style grandma pie clone"
          />
          <span className="lop-core-label">current favorite · grandma clone</span>
        </div>

        <span className="lop-proximity-hint" aria-hidden="true">
          scroll / pinch closer to resolve
        </span>

        {PIE_SATELLITES.map((satellite) => {
          const isHovered = hoveredSatelliteId === satellite.id;
          const isPinned = pinnedSatelliteId === satellite.id;
          return (
            <div
              key={satellite.id}
              className={[
                "lop-satellite-track",
                satellite.orbitClass,
                isHovered || isPinned ? "is-paused" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <button
                type="button"
                className={[
                  "lop-pie-satellite",
                  isHovered ? "is-hovered" : "",
                  isPinned ? "is-pinned" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onMouseEnter={() => setHoveredSatelliteId(satellite.id)}
                onMouseLeave={() => setHoveredSatelliteId(null)}
                onFocus={() => setHoveredSatelliteId(satellite.id)}
                onBlur={() => setHoveredSatelliteId(null)}
                onClick={() => {
                  setContextId(satellite.contextId);
                  setPinnedSatelliteId((current) =>
                    current === satellite.id ? null : satellite.id,
                  );
                }}
                aria-pressed={isPinned}
                aria-label={`${satellite.label}. Click to freeze or release this satellite.`}
              >
                <img src={satellite.src} alt="" />
                <span>{satellite.label}</span>
              </button>
            </div>
          );
        })}

        {ORBIT_LABELS.map((label) => (
          <span key={label} className="lop-orbit-label" aria-hidden="true">
            {label}
          </span>
        ))}
      </div>

      <div className="lop-lab">
        <div className="lop-lab-heading">
          <span>Local lab · prototype</span>
          <strong>The Same Slice / Different Gravity</strong>
          <small>{lensReading}</small>
        </div>

        <div className="lop-contexts" aria-label="Choose a context">
          {CONTEXTS.map((candidate) => (
            <button
              key={candidate.id}
              type="button"
              className={[
                candidate.id === context.id ? "is-active" : "",
                candidate.id === suggestedContextId ? "is-lens-suggested" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setContextId(candidate.id)}
            >
              {candidate.label}
            </button>
          ))}
        </div>

        <div className="lop-reading" aria-live="polite">
          <p>{context.note}</p>
          <div className="lop-signals">
            {context.signals.map((signal) => (
              <div className="lop-signal" key={signal.label}>
                <span>{signal.label}</span>
                <i
                  aria-hidden="true"
                  style={{ "--lop-pull": signal.strength } as CSSProperties}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className={["lop-gallery-region", galleryEngaged ? "is-engaged" : ""]
          .filter(Boolean)
          .join(" ")}
        aria-label="Life of Pie photo carousel"
        tabIndex={0}
        onPointerEnter={() => setGalleryEngaged(true)}
        onPointerLeave={() => {
          setGalleryEngaged(false);
          steeringRef.current = 0;
        }}
        onPointerMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const normalized = ((event.clientX - rect.left) / rect.width) * 2 - 1;
          steeringRef.current =
            Math.abs(normalized) < 0.16
              ? 0
              : Math.sign(normalized) * ((Math.abs(normalized) - 0.16) / 0.84);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            burstArrow(-1);
          } else if (event.key === "ArrowRight") {
            event.preventDefault();
            burstArrow(1);
          }
        }}
      >
        <div className="lop-gallery-heading">
          <span>Photo archive</span>
          <small>self-spinning · drift left / right to steer</small>
        </div>

        <div className="lop-carousel-stage">
          {ARCHIVE_PHOTOS.map((photo, index) => {
            const offset = circularOffset(
              index,
              galleryPosition,
              ARCHIVE_PHOTOS.length,
            );
            const isFront = Math.abs(offset) < 0.5;
            const visible = Math.abs(offset) <= 3.65;
            return (
              <button
                key={photo.id}
                type="button"
                className={[
                  "lop-carousel-card",
                  isFront ? "is-front" : "",
                  visible ? "" : "is-back",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={carouselStyle(offset)}
                onClick={() => {
                  if (isFront) {
                    openPhoto(photo);
                  } else {
                    jumpToPhoto(index);
                  }
                }}
                aria-label={
                  isFront
                    ? `Open ${photo.label}`
                    : `Bring ${photo.label} to the front`
                }
              >
                <img src={photo.src} alt={photo.label} />
                <span>{photo.label}</span>
              </button>
            );
          })}
        </div>

        <div className="lop-gallery-controls" aria-label="Carousel direction controls">
          <button
            type="button"
            className="lop-gallery-drive is-left"
            onPointerEnter={() => steerWithArrow(-1)}
            onPointerLeave={releaseArrow}
            onFocus={() => steerWithArrow(-1)}
            onBlur={releaseArrow}
            onClick={() => burstArrow(-1)}
            aria-label="Steer carousel left; click to accelerate left"
          >
            ←
          </button>
          <span>hover to steer · click to accelerate</span>
          <button
            type="button"
            className="lop-gallery-drive is-right"
            onPointerEnter={() => steerWithArrow(1)}
            onPointerLeave={releaseArrow}
            onFocus={() => steerWithArrow(1)}
            onBlur={releaseArrow}
            onClick={() => burstArrow(1)}
            aria-label="Steer carousel right; click to accelerate right"
          >
            →
          </button>
        </div>

        {expandedPhoto && (
          <div
            className={[
              "lop-photo-popover",
              expandedFullScreen ? "is-fullscreen" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            role="dialog"
            aria-modal={expandedFullScreen ? "true" : undefined}
            aria-label={expandedPhoto.label}
          >
            <div className="lop-photo-popover-actions">
              <button type="button" onClick={closePhoto} aria-label="Back to carousel">
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setExpandedFullScreen((current) => !current)}
              >
                {expandedFullScreen ? "Reduce" : "Full screen"}
              </button>
              <a href={expandedPhoto.src} download>
                Download
              </a>
            </div>
            <img src={expandedPhoto.src} alt={expandedPhoto.label} />
            <span>{expandedPhoto.label}</span>
          </div>
        )}
      </div>
    </section>
  );
}