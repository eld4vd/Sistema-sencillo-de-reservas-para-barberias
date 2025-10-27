export const toTrimmedString = (value: unknown): string => {
  if (typeof value === 'string') {
    return value.trim();
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return value.toString().trim();
  }
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return '';
};

export const toTrimmedStringOrNull = (value: unknown): string | null => {
  if (value === undefined || value === null) {
    return null;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    const coerced = value.toString().trim();
    return coerced.length > 0 ? coerced : null;
  }
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return null;
};

export const toTrimmedLowerCaseString = (value: unknown): string => {
  const base = toTrimmedString(value);
  return base.toLowerCase();
};

export const toTrimmedLowerCaseStringOrNull = (
  value: unknown,
): string | null => {
  const normalized = toTrimmedStringOrNull(value);
  return normalized?.toLowerCase() ?? null;
};

export const toOptionalBoolean = (value: unknown): boolean | undefined => {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'on'].includes(normalized)) {
      return true;
    }
    if (['false', '0', 'no', 'off'].includes(normalized)) {
      return false;
    }
    return undefined;
  }
  if (typeof value === 'number') {
    if (value === 1) {
      return true;
    }
    if (value === 0) {
      return false;
    }
  }
  return undefined;
};
