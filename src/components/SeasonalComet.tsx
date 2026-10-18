import { useMemo } from "react";

const COMET_URL = "/comet/park-city/";

/**
 * A recurring visitor, not a permanent planet.
 * Near Earth every October; on the quiet Oort-cloud rim the rest of the year.
 * The linked itinerary remains at one stable URL for each annual return.
 */
export function SeasonalComet() {
  const season = useMemo(() => {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Denver",
      year: "numeric",
      month: "numeric",
    }).formatToParts(new Date());
    const month = Number(parts.find((part) => part.type === "month")?.value ?? "1");
    const year = Number(parts.find((part) => part.type === "year")?.value ?? "2026");
    return { inOctober: month === 10, year };
  }, []);

  return (
    <aside
      className={"park-city-comet " + (season.inOctober ? "park-city-comet--near" : "park-city-comet--oort")}
      aria-label="Park City Film Festival comet"
    >
      <a href={COMET_URL} title={season.inOctober ? "Visit the Park City Film Festival comet" : "Visit the comet in the Oort cloud"}>
        <span className="park-city-comet__symbol" aria-hidden="true">☄</span>
        <span className="park-city-comet__text">
          <strong>Park City Comet</strong>
          <small>{season.inOctober ? "Here this October · Festival orbit" : "Oort cloud · Returns every October"}</small>
        </span>
      </a>
      <style>{`
        .park-city-comet{position:fixed;right:24px;bottom:25px;z-index:40;pointer-events:none;font-family:"Iowan Old Style",Palatino,Georgia,serif}
        .park-city-comet a{display:flex;align-items:center;gap:10px;pointer-events:auto;text-decoration:none;border-radius:40px;transition:opacity .4s,transform .4s,box-shadow .4s;background:#f7f2e8f2;border:1px solid #c9a875;box-shadow:0 6px 26px #70411630;color:#3a2a20;padding:8px 17px 8px 10px}
        .park-city-comet a:hover{transform:translateY(-4px);box-shadow:0 8px 32px #bd753f55}
        .park-city-comet__symbol{display:block;font-family:Georgia,serif;font-size:37px;color:#be7134;text-shadow:0 0 19px #ecc183;transform:rotate(-26deg)}
        .park-city-comet__text{display:grid;gap:2px;font-size:13px;white-space:nowrap}
        .park-city-comet__text small{font:500 10px/1.2 system-ui,sans-serif;color:#746657}
        .park-city-comet--near .park-city-comet__symbol{animation:park-comet-glow 4.8s ease-in-out infinite}
        .park-city-comet--oort{right:10px;bottom:18px;opacity:.38}
        .park-city-comet--oort a{padding:5px 8px;background:#f7f2e8a8;border-color:transparent;box-shadow:none}
        .park-city-comet--oort .park-city-comet__symbol{font-size:19px;color:#796a5d;text-shadow:none;transform:none}
        .park-city-comet--oort .park-city-comet__text{display:none}
        .park-city-comet--oort:hover,.park-city-comet--oort:focus-within{opacity:1}
        .park-city-comet--oort:hover .park-city-comet__text,.park-city-comet--oort:focus-within .park-city-comet__text{display:grid}
        @keyframes park-comet-glow{0%,100%{filter:drop-shadow(0 0 2px #f0ad55)}50%{filter:drop-shadow(0 0 13px #f0ad55)}}
        @media(max-width:680px){.park-city-comet{right:8px;bottom:12px}.park-city-comet--near a{padding:6px 9px}.park-city-comet--near .park-city-comet__text strong{font-size:11px}.park-city-comet--near .park-city-comet__text small{font-size:9px}.park-city-comet__symbol{font-size:28px}}
        @media(prefers-reduced-motion:reduce){.park-city-comet a{transition:none}.park-city-comet--near .park-city-comet__symbol{animation:none}}
      `}</style>
    </aside>
  );
}
