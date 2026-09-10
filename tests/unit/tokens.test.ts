import { describe, it, expect } from "vitest";
import { TOKENS } from "../../lib/tokens";

describe("design tokens", () => {
  it("matches the main brief section 4.1 palette exactly", () => {
    expect(TOKENS).toMatchObject({
      ink: "#010320",
      body: "#66676C",
      blue: "#0A68F5",
      heroBlue: "#1269EA",
      line: "#E2E8F0",
      lineSoft: "#E9EDF3",
      panel: "#000320",
      white: "#FFFFFF",
      tealTop: "#26FADE",
      tealBottom: "#0EE8CC",
    });
  });

  it("carries the two side colours from update section 7", () => {
    expect(TOKENS.above).toBe("#0EE8CC");
    expect(TOKENS.below).toBe("#A48CFE");
  });

  it("exposes the two spec easings", () => {
    expect(TOKENS.easeOut).toBe("cubic-bezier(0.22, 1, 0.36, 1)");
    expect(TOKENS.easeInOut).toBe("cubic-bezier(0.65, 0, 0.35, 1)");
  });
});
