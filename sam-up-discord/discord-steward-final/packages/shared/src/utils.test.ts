import { describe, expect, it } from "vitest";
import { stableHash, stableJson } from "./utils.js";

describe("stableJson", () => {
  it("sorts object keys recursively", () => {
    expect(stableJson({b: 2, a: {d: 4, c: 3}})).toBe('{"a":{"c":3,"d":4},"b":2}');
  });

  it("produces stable hashes", () => {
    expect(stableHash({a: 1, b: 2})).toBe(stableHash({b: 2, a: 1}));
  });
});
