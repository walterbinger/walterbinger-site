import type { CSSProperties } from "react";
import type { CelestialNode } from "../domain/cosmology";

interface BodyGlyphProps {
  node: CelestialNode;
  active: boolean;
  selected: boolean;
  color: string;
}

const sharedStroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

function PlaceholderGlyph({ glyphKey }: { glyphKey?: string }) {
  switch (glyphKey) {
    case "archive":
      return (
        <>
          <path {...sharedStroke} d="M-25-13h24M-28-3H2M-22 7H0M-14 17H4" />
          <circle {...sharedStroke} cx="13" cy="-2" r="10" />
          <path {...sharedStroke} d="m20 6 10 10M8-2h10M13-7v10" />
        </>
      );
    case "bridge":
      return (
        <>
          <path {...sharedStroke} d="M-31 20V-8M31 20V-8M-37 20h74" />
          <path {...sharedStroke} d="M-31-8C-20 15 20 15 31-8M-31-8h62M-22-8v22M22-8v22" />
          <path {...sharedStroke} d="M-31-8-22-20-13-8M31-8 22-20 13-8" />
        </>
      );
    case "pine":
      return (
        <>
          <path {...sharedStroke} d="M2 28C0 10-1-10 5-29" />
          <path {...sharedStroke} d="M4-22-13-8M5-15 22-4M2-8-23 4M3 0 25 10M1 7-18 20M2 15 16 25" />
          <path {...sharedStroke} d="M8-34 9-30M6-32h6" />
        </>
      );
    case "sun-of-may":
      return (
        <>
          <circle {...sharedStroke} r="18" />
          {Array.from({ length: 16 }, (_, index) => {
            const angle = (index / 16) * Math.PI * 2;
            const inner = 22;
            const outer = index % 2 === 0 ? 35 : 30;
            return (
              <path
                key={index}
                {...sharedStroke}
                d={`M${Math.cos(angle) * inner} ${Math.sin(angle) * inner}L${Math.cos(angle) * outer} ${Math.sin(angle) * outer}`}
              />
            );
          })}
          <path {...sharedStroke} d="M-10-4q5-5 10 0M3-4q5-5 10 0M-7 8q7 7 14 0" />
        </>
      );
    case "doorway":
      return (
        <>
          <path {...sharedStroke} d="M-27 28V-3C-27-20-16-30 0-30S27-20 27-3v31" />
          <path {...sharedStroke} d="M-15 28V-1C-15-11-9-18 0-18S15-11 15-1v29" />
          <path {...sharedStroke} d="M-33 28h66M-7 8q7 9 14 0M0-3v19" />
        </>
      );
    case "balance":
      return (
        <>
          <path {...sharedStroke} d="M0-30v55M-24 25h48M-19-17h38M0-24l-7 7 7 7 7-7Z" />
          <path {...sharedStroke} d="m-19-17-11 25h22Zm38 0L8 8h22Z" />
        </>
      );
    case "torus":
      return (
        <>
          <ellipse {...sharedStroke} rx="34" ry="16" />
          <ellipse {...sharedStroke} rx="15" ry="33" transform="rotate(28)" />
          <path {...sharedStroke} d="M-30-11C-5 10 9 12 30 11M-30 11C-5-10 9-12 30-11" />
        </>
      );
    case "book":
      return (
        <>
          <path {...sharedStroke} d="M0-20C-9-26-21-25-30-18v39c10-6 21-6 30 1Z" />
          <path {...sharedStroke} d="M0-20C9-26 21-25 30-18v39c-10-6-21-6-30 1Z" />
          <path {...sharedStroke} d="M-23-10h15M8-10h15M-23-2h15M8-2h15" />
        </>
      );
    case "wave":
      return (
        <>
          <path {...sharedStroke} d="M-34 0c8-22 16 22 24 0S6-22 14 0s16 22 24 0" />
          <path {...sharedStroke} d="M-28-14c10-10 17-10 27 0M1 14c10 10 17 10 27 0" />
        </>
      );
    case "aperture":
      return (
        <>
          <circle {...sharedStroke} r="31" />
          <circle {...sharedStroke} r="9" />
          <path {...sharedStroke} d="M0-31 10-8M27-15 9-5M27 15 0 9M0 31-10 8M-27 15-9 5M-27-15 0-9" />
        </>
      );
    case "play":
      return (
        <>
          <path {...sharedStroke} d="M-31 18C-16-6-1-7 13-20M-16 18h22M13-20l-4 12 12-4" />
          <circle {...sharedStroke} cx="-23" cy="-11" r="7" />
          <path {...sharedStroke} d="M-23-4v19M-23 4-33 10M-23 5-13 9" />
        </>
      );
    case "field-tools":
      return (
        <>
          <path {...sharedStroke} d="M-28-15h18M-30-4h27M-25 7h16" />
          <circle {...sharedStroke} cx="16" cy="-12" r="6" />
          <path {...sharedStroke} d="M16-28v10M16-6V8M0-12h10M22-12h10" />
          <path {...sharedStroke} d="M-8 25C0 13 7 11 16 8M-15 27h14M-8 20v7" />
        </>
      );
    case "life-of-pie":
      return (
        <>
          <ellipse {...sharedStroke} rx="34" ry="25" transform="rotate(-5)" />
          <ellipse {...sharedStroke} rx="28" ry="19" transform="rotate(3)" />
          <path {...sharedStroke} d="M-30 9C-18 14-5 11 5 9S22 10 30 4" />
          <path {...sharedStroke} d="M-24-12c7-3 13-1 18 2M8-16c5 1 9 4 12 9M-18 1c4 2 9 1 13-1M11 3c5-2 10 0 13 4" />
          <path {...sharedStroke} d="M-29-3q3-5 7-6M-3 14q5-3 10-2M21-7q4 2 6 6" />
          <circle {...sharedStroke} cx="-14" cy="-6" r="2.3" />
          <circle {...sharedStroke} cx="5" cy="-11" r="1.7" />
          <circle {...sharedStroke} cx="18" cy="10" r="2.7" />
          <circle {...sharedStroke} cx="-22" cy="8" r="1.5" />
          <path {...sharedStroke} d="M-35 17q15 9 33 8t37-10" />
        </>
      );
    case "concept-art":
      return (
        <>
          <path {...sharedStroke} d="M-27 18C-16 2-15-20-2-26 9-31 10-8 3 2-4 13 4 24 18 20" />
          <path {...sharedStroke} d="M-19 7c8 3 13 9 13 18M8-18l15-8M11-11l19 1M15-3l13 8" />
          <circle {...sharedStroke} cx="-2" cy="-4" r="3" />
        </>
      );
    case "concept-craft":
      return (
        <>
          <path {...sharedStroke} d="M-25 21 8-25M-16 25 18-22M-25 21l9 4M8-25l10 3" />
          <path {...sharedStroke} d="M-8-8c8 8 16 12 28 13M-18 7c9 3 16 8 22 17" />
          <circle {...sharedStroke} cx="21" cy="7" r="5" />
        </>
      );
    case "concept-care":
      return (
        <>
          <path {...sharedStroke} d="M-31 8C-20 25-7 29 0 19M31 8C20 25 7 29 0 19" />
          <path {...sharedStroke} d="M-31 8C-24-3-17-8-8-6M31 8C24-3 17-8 8-6" />
          <path {...sharedStroke} d="M0 15C-18 2-14-14-4-14 1-14 3-10 4-7 6-12 10-15 15-12 24-5 16 7 0 15Z" />
        </>
      );
    case "concept-service":
      return (
        <>
          <path {...sharedStroke} d="M-29 22h18V9H5V-5h18v-15" />
          <path {...sharedStroke} d="m14-13 9-7 6 10M-23-4c8-9 15-9 22 0M-17-12v16M-8-12V4" />
          <circle {...sharedStroke} cx="-15" cy="-19" r="5" />
        </>
      );
    default:
      return (
        <>
          <path {...sharedStroke} d="M-25 5c10-31 18 25 29-5S20 24 27-12" />
          <path {...sharedStroke} d="M-19-17c12 4 22-7 31 2M-9 21c9-8 19-6 27-14" />
        </>
      );
  }
}

export function BodyGlyph({
  node,
  active,
  selected,
  color,
}: BodyGlyphProps) {
  const style = {
    "--body-color": color,
  } as CSSProperties;

  if (node.glyphKey === "empanadas-sun") {
    return (
      <g
        className={`body-glyph body-glyph--image${active ? " is-spectral" : ""}${selected ? " is-selected" : ""}`}
        style={style}
      >
        <image
          href={`${import.meta.env.BASE_URL}assets/source/empanadas-son/store-sun.png`}
          x="-43"
          y="-39"
          width="86"
          height="78"
          preserveAspectRatio="xMidYMid meet"
        />
      </g>
    );
  }

  if (node.glyphKey === "life-of-pie") {
    return (
      <g
        className={`body-glyph body-glyph--image body-glyph--life-of-pie${active ? " is-spectral" : ""}${selected ? " is-selected" : ""}`}
        style={style}
      >
        <image
          className="life-of-pie-map-sketch"
          href={`${import.meta.env.BASE_URL}assets/source/life-of-pie/stickers/grandma-sketch.png`}
          x="-45"
          y="-37"
          width="90"
          height="74"
          preserveAspectRatio="xMidYMid meet"
        />
        <image
          className="life-of-pie-map-photo"
          href={`${import.meta.env.BASE_URL}assets/source/life-of-pie/stickers/grandma-pie.png`}
          x="-45"
          y="-37"
          width="90"
          height="74"
          preserveAspectRatio="xMidYMid meet"
        />
      </g>
    );
  }

  return (
    <g
      className={`body-glyph${active ? " is-spectral" : ""}${selected ? " is-selected" : ""}`}
      style={style}
    >
      <PlaceholderGlyph glyphKey={node.glyphKey} />
    </g>
  );
}

export function EmergingGlyph({ index }: { index: number }) {
  const phase = (index % 5) * 4;
  return (
    <g className="emerging-glyph" aria-hidden="true">
      <path
        d={`M-8 ${phase - 8}C-2-14 5-9 6-2S14 8 5 11-10 7-7-2 0-10 8-8`}
      />
      <path d="M-2-10 1-16M8 2l7-2M-4 10l-2 7" />
    </g>
  );
}

export function AmbientStarGlyph({ variant }: { variant: number }) {
  const points = 4 + (variant % 3) * 2;
  const outer = 4.6 + (variant % 5) * 0.7;
  const inner = 1.2 + (variant % 3) * 0.35;
  const coords = Array.from({ length: points * 2 }, (_, index) => {
    const radius = index % 2 === 0 ? outer : inner;
    const angle = (index / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    return `${Math.cos(angle) * radius},${Math.sin(angle) * radius}`;
  }).join(" ");
  return <polygon className="ambient-star-glyph" points={coords} />;
}