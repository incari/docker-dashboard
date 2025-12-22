/**
 * Validation and normalization utilities
 */

/**
 * Normalizes a URL by trimming whitespace and ensuring it has a protocol
 */
export const normalizeUrl = (url: string | null | undefined): string => {
  if (!url || typeof url !== "string") return "";

  // Trim whitespace
  url = url.trim();

  // If empty after trim, return empty
  if (!url) return "";

  // If it looks like a domain or IP without protocol, add http://
  if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(url)) {
    url = "http://" + url;
  }

  return url;
};

/**
 * Validates a URL format
 */
export const isValidUrl = (url: string | null | undefined): boolean => {
  if (!url || typeof url !== "string") return false;

  const normalized = normalizeUrl(url);
  if (!normalized) return false;

  try {
    const urlObj = new URL(normalized);
    // Must have a valid protocol (http, https, or custom protocols)
    return urlObj.protocol.length > 0;
  } catch {
    return false;
  }
};

/**
 * Validates a port number
 */
export const isValidPort = (
  port: string | number | null | undefined
): boolean => {
  if (port === null || port === undefined || port === "") return false;

  const portNum = typeof port === "string" ? parseInt(port, 10) : port;

  return !isNaN(portNum) && portNum > 0 && portNum <= 65535;
};

/**
 * Cleans a description by removing extra whitespace
 */
export const cleanDescription = (
  description: string | null | undefined
): string => {
  if (!description || typeof description !== "string") return "";

  return description
    .trim()
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .slice(0, 500); // Limit length
};

/**
 * Validates shortcut form data
 */
export interface ShortcutValidation {
  isValid: boolean;
  errors: {
    name?: string;
    url?: string;
    port?: string;
    icon?: string;
  };
}

export const validateShortcutForm = (
  name: string,
  url: string,
  port: string,
  _iconType: string,
  icon: string,
  containerId: string
): ShortcutValidation => {
  const errors: ShortcutValidation["errors"] = {};

  // Name is required
  if (!name || !name.trim()) {
    errors.name = "Name is required";
  }

  // Either URL or Port is required (unless it's a container)
  if (!containerId) {
    if (!url && !port) {
      errors.url = "Either URL or Port is required";
      errors.port = "Either URL or Port is required";
    } else if (url && !isValidUrl(url)) {
      errors.url = "Invalid URL format";
    } else if (port && !isValidPort(port)) {
      errors.port = "Port must be between 1 and 65535";
    }
  }

  // Icon is required
  if (!icon || !icon.trim()) {
    errors.icon = "Icon is required";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
