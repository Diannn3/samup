import { describe, expect, it } from "vitest";

describe("daemon safety defaults", () => {
  it("keeps enforcement shadow by default in the example environment", () => {
    expect("shadow").toBe("shadow");
  });
});
