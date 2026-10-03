import { describe, expect, it } from "vitest";
import { validateBidirectionalRelationships } from "../domain/cosmology";
import { ALL_BODIES, AUTHORED_BODIES } from "./bodies";
import { getWorldContent } from "./worldContent";

describe("authored universe registry", () => {
  it("contains durable depth without publishing unfinished objects", () => {
    expect(ALL_BODIES.length).toBeGreaterThanOrEqual(90);
    expect(AUTHORED_BODIES.length).toBeGreaterThanOrEqual(12);
    expect(
      ALL_BODIES.filter((body) => body.tier !== "authored").every(
        (body) => !body.inspectable && body.publicLabel === undefined,
      ),
    ).toBe(true);
  });

  it("keeps authored relationships bidirectional", () => {
    expect(validateBidirectionalRelationships(AUTHORED_BODIES)).toEqual([]);
  });

  it("keeps PREP/PERP content separate from the universe topology", () => {
    const content = getWorldContent("field-tools");
    expect(content?.resources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "prep-3-alpha-interactive",
          kind: "tool",
        }),
        expect.objectContaining({
          id: "perp-13-alpha-interactive",
          kind: "tool",
        }),
      ]),
    );
    expect(content?.slots).toContainEqual(
      expect.objectContaining({
        id: "prep-perp-interactive",
        status: "available",
      }),
    );
  });
});
