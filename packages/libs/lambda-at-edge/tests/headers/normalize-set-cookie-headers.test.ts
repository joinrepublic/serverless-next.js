import {
  normalizeSetCookieHeaders,
  splitCookiesString
} from "../../src/headers/normalize-set-cookie-headers";

type CookieSerializeOptions = {
  [key: string]: string | number | boolean | Date;
};

const cookieSerialize = (
  name: string,
  value: string,
  opts: CookieSerializeOptions
) => {
  const addKeyValuePair = (
    key: string,
    value: string | number | boolean | Date
  ) => (value === true ? `${key}` : `${name}=${value.toString()}`);

  const res = [];
  res.push(addKeyValuePair(name, value));
  for (const name in opts) {
    res.push(addKeyValuePair(name, opts[name]));
  }
  return res.join("; ");
};

function generateCookies(
  ...cookieOptions: (CookieSerializeOptions & { name: string; value: string })[]
) {
  const cookies = cookieOptions.map((opts) =>
    cookieSerialize(opts.name, opts.value, opts)
  );
  return {
    joined: cookies.join(", "),
    expected: cookies
  };
}

describe("normalizeSetCookieHeaders", () => {
  const headerName = "set-cookie";
  const fooSetCookie = `foo=abc--def; path=/; expires=${new Date()}; secure; HttpOnly; SameSite=Lax`;
  const barSetCookie = `bar=123; path=/; HttpOnly; secure; SameSite=Lax`;

  it("it splits already joined set-cookie headers", () => {
    const joined = `${fooSetCookie}, ${barSetCookie}`;
    const cloudFrontHeaders = {
      [headerName]: [{ key: headerName, value: joined }]
    };
    normalizeSetCookieHeaders(cloudFrontHeaders);
    expect(cloudFrontHeaders).toEqual({
      [headerName]: [
        { key: headerName, value: fooSetCookie },
        { key: headerName, value: barSetCookie }
      ]
    });
  });

  it("respects separated set-cookie headers", () => {
    const joined = `${fooSetCookie}, ${barSetCookie}`;
    const standAlone = `stand_alone=123; path=/; HttpOnly; secure; SameSite=Lax`;

    const cloudFrontHeaders = {
      [headerName]: [
        { key: headerName, value: joined },
        { key: headerName, value: standAlone }
      ]
    };
    normalizeSetCookieHeaders(cloudFrontHeaders);
    expect(cloudFrontHeaders).toEqual({
      [headerName]: [
        { key: headerName, value: fooSetCookie },
        { key: headerName, value: barSetCookie },
        { key: headerName, value: standAlone }
      ]
    });
  });
});

describe("splitCookiesString", () => {
  describe("with a single cookie", () => {
    it("should parse a plain value", () => {
      const { joined, expected } = generateCookies({
        name: "foo",
        value: "bar"
      });
      const result = splitCookiesString(joined);
      expect(result).toEqual(expected);
    });

    it("should parse expires", () => {
      const { joined, expected } = generateCookies({
        name: "foo",
        value: "bar",
        expires: new Date()
      });
      const result = splitCookiesString(joined);
      expect(result).toEqual(expected);
    });

    it("should parse max-age", () => {
      const { joined, expected } = generateCookies({
        name: "foo",
        value: "bar",
        maxAge: 10
      });
      const result = splitCookiesString(joined);
      expect(result).toEqual(expected);
    });

    it("should parse with all the options", () => {
      const { joined, expected } = generateCookies({
        name: "foo",
        value: "bar",
        expires: new Date(Date.now() + 10 * 1000),
        maxAge: 10,
        domain: "https://foo.bar",
        httpOnly: true,
        path: "/path",
        sameSite: "lax",
        secure: true
      });
      const result = splitCookiesString(joined);
      expect(result).toEqual(expected);
    });
  });

  describe("with a mutliple cookies", () => {
    it("should parse a plain value", () => {
      const { joined, expected } = generateCookies(
        {
          name: "foo",
          value: "bar"
        },
        {
          name: "x",
          value: "y"
        }
      );
      const result = splitCookiesString(joined);
      expect(result).toEqual(expected);
    });

    it("should parse expires", () => {
      const { joined, expected } = generateCookies(
        {
          name: "foo",
          value: "bar",
          expires: new Date()
        },
        {
          name: "x",
          value: "y",
          expires: new Date()
        }
      );
      const result = splitCookiesString(joined);
      expect(result).toEqual(expected);
    });

    it("should parse max-age", () => {
      const { joined, expected } = generateCookies(
        {
          name: "foo",
          value: "bar",
          maxAge: 10
        },
        {
          name: "x",
          value: "y",
          maxAge: 10
        }
      );
      const result = splitCookiesString(joined);
      expect(result).toEqual(expected);
    });

    it("should parse with all the options", () => {
      const { joined, expected } = generateCookies(
        {
          name: "foo",
          value: "bar",
          expires: new Date(Date.now() + 10 * 1000),
          maxAge: 10,
          domain: "https://foo.bar",
          httpOnly: true,
          path: "/path",
          sameSite: "lax",
          secure: true
        },
        {
          name: "x",
          value: "y",
          expires: new Date(Date.now() + 20 * 1000),
          maxAge: 20,
          domain: "https://x.y",
          httpOnly: true,
          path: "/path",
          sameSite: "strict",
          secure: true
        }
      );
      const result = splitCookiesString(joined);
      expect(result).toEqual(expected);
    });
  });
});
