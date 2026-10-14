import { describe, expect, it } from "vitest";
import { formatiereMenge } from "./einheiten";

describe("formatiereMenge", () => {
  it("zeigt Stückzahlen mit Kürzel", () => {
    expect(formatiereMenge(3, "stueck")).toBe("3 Stk.");
  });

  it("bleibt unter 1000 bei der Grundeinheit", () => {
    expect(formatiereMenge(250, "g")).toBe("250 g");
    expect(formatiereMenge(500, "ml")).toBe("500 ml");
  });

  it("rechnet ab 1000 in kg bzw. l um, mit deutschem Komma", () => {
    expect(formatiereMenge(1500, "g")).toBe("1,5 kg");
    expect(formatiereMenge(1000, "ml")).toBe("1 l");
  });

  it("rechnet Stückzahlen nie um", () => {
    expect(formatiereMenge(1200, "stueck")).toBe("1.200 Stk.");
  });
});
