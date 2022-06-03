import { loadCustomRequestHeaders } from "../../src/load-custom-headers";

describe("loadCustomRequestHeaders", () => {
  it("returns correct Headers", () => {
    const headers = [{ key: "headerkey", value: "headervalue" }];
    expect(loadCustomRequestHeaders(headers)).toBe(headers);
  });

  it("returns undefined if no Headers", () => {
    expect(loadCustomRequestHeaders(undefined)).toBe(undefined);
  });

  it("throws when Headers are not an array", () => {
    expect(() => {
      loadCustomRequestHeaders({} as any);
    }).toThrow();
  });

  it("throws when uknown property in Headers presented", () => {
    expect(() => {
      loadCustomRequestHeaders([
        {
          key: "headerkey",
          value: "headervalue",
          unsupported: "unsupportedprop"
        }
      ]);
    }).toThrow();
  });

  it("throws when properties has wrong type", () => {
    expect(() => {
      loadCustomRequestHeaders([
        {
          key: [],
          value: undefined
        }
      ]);
    }).toThrow();

    expect(() => {
      loadCustomRequestHeaders([
        {
          key: "headerkey",
          value: {}
        }
      ]);
    }).toThrow();
  });
});
