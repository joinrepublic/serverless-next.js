import { CustomHeader } from "./types";

const allowedProperties = new Set<string>(["key", "value"]);

export const loadCustomRequestHeaders = (
  headers: CustomHeader[] | undefined
): CustomHeader[] | undefined => {
  if (headers === undefined) {
    return headers;
  }

  if (!Array.isArray(headers)) {
    throw new Error(
      `CustomRequestHeaders: must be undefined or an array of header objects, received ${typeof headers}`
    );
  }

  const invalidHeaders = [];

  for (const header of headers) {
    const invalidHeaderParts: string[] = [];

    if (typeof header.key !== "string") {
      invalidHeaderParts.push(`invalid key "${header.key}"`);
    }

    if (typeof header.value !== "string") {
      invalidHeaderParts.push(`invalid value "${header.value}"`);
    }

    for (const headerProperty in header) {
      if (!allowedProperties.has(headerProperty)) {
        invalidHeaderParts.push(
          `unsupported header property "${headerProperty}"`
        );
      }
    }

    if (invalidHeaderParts.length > 0) {
      invalidHeaders.push(
        `${invalidHeaderParts.join(", ")} for ${JSON.stringify(header)}`
      );
    }
  }

  if (invalidHeaders.length > 0) {
    throw new Error(
      `Invalid \`CustomRequestHeaders\` ${invalidHeaders.join("\n")}`
    );
  }

  return headers;
};
