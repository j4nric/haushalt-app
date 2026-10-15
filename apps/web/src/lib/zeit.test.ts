import { expect, it } from "vitest";
import { zeitWert } from "./zeit";

it("liest ISO- und Postgres-Schreibweisen gleich", () => {
  const ms = Date.UTC(2026, 9, 15, 9, 43, 0, 123);
  expect(zeitWert("2026-10-15T09:43:00.123Z")).toBe(ms);
  expect(zeitWert("2026-10-15 09:43:00.123Z")).toBe(ms);
  expect(zeitWert("2026-10-15 09:43:00.123+00")).toBe(ms);
  expect(zeitWert("2026-10-15 11:43:00.123+0200")).toBe(ms);
  expect(zeitWert("2026-10-15 11:43:00.123+02:00")).toBe(ms);
  expect(Number.isNaN(zeitWert("kaputt"))).toBe(true);
});
