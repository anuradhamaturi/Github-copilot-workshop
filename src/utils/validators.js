/**
 * Ensure a value is a plain object.
 *
 * @param {unknown} value - Value to validate.
 * @param {string} name - Human-readable field name.
 * @returns {Record<string, unknown>} The same value when valid.
 * @throws {TypeError} If value is not a plain object.
 * @example
 * assertPlainObject({ title: 'Plan sprint' }, 'input');
 * @example
 * assertPlainObject({}, 'patch');
 */
export function assertPlainObject(value, name) {
  if (typeof name !== 'string' || name.trim() === '') {
    throw new TypeError('name must be a non-empty string.');
  }

  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError(`${name} must be a plain object.`);
  }

  return /** @type {Record<string, unknown>} */ (value);
}

/**
 * Validate and normalize a required string field.
 *
 * @param {unknown} value - Value to validate.
 * @param {string} name - Human-readable field name.
 * @param {number} maxLength - Maximum allowed string length.
 * @returns {string} The trimmed and validated string.
 * @throws {TypeError} If the value is not a valid non-empty string.
 * @example
 * assertRequiredString('Write tests', 'title', 120);
 * @example
 * assertRequiredString('  Review PR  ', 'title', 120);
 */
export function assertRequiredString(value, name, maxLength) {
  if (typeof name !== 'string' || name.trim() === '') {
    throw new TypeError('name must be a non-empty string.');
  }

  if (!Number.isInteger(maxLength) || maxLength <= 0) {
    throw new TypeError('maxLength must be a positive integer.');
  }

  if (typeof value !== 'string') {
    throw new TypeError(`${name} must be a string.`);
  }

  const normalized = value.trim();

  if (normalized.length === 0) {
    throw new TypeError(`${name} must not be empty.`);
  }

  if (normalized.length > maxLength) {
    throw new TypeError(`${name} must be at most ${maxLength} characters.`);
  }

  return normalized;
}

/**
 * Validate and normalize an optional string field.
 *
 * @param {unknown} value - Value to validate.
 * @param {string} name - Human-readable field name.
 * @param {number} maxLength - Maximum allowed string length.
 * @returns {string} A normalized string, defaulting to empty string when omitted.
 * @throws {TypeError} If the value is not a valid optional string.
 * @example
 * normalizeOptionalString(undefined, 'description', 1000);
 * @example
 * normalizeOptionalString('  Follow up with design team  ', 'description', 1000);
 */
export function normalizeOptionalString(value, name, maxLength) {
  if (typeof name !== 'string' || name.trim() === '') {
    throw new TypeError('name must be a non-empty string.');
  }

  if (!Number.isInteger(maxLength) || maxLength <= 0) {
    throw new TypeError('maxLength must be a positive integer.');
  }

  if (value === undefined) {
    return '';
  }

  if (typeof value !== 'string') {
    throw new TypeError(`${name} must be a string.`);
  }

  const normalized = value.trim();

  if (normalized.length > maxLength) {
    throw new TypeError(`${name} must be at most ${maxLength} characters.`);
  }

  return normalized;
}

/**
 * Validate an enum string against a fixed allowed list.
 *
 * @param {unknown} value - Value to validate.
 * @param {string} name - Human-readable field name.
 * @param {readonly string[]} allowed - Allowed values.
 * @returns {string} The validated enum value.
 * @throws {TypeError} If value is not one of the allowed values.
 * @example
 * assertEnumValue('todo', 'status', ['todo', 'in-progress', 'done']);
 * @example
 * assertEnumValue('high', 'priority', ['low', 'medium', 'high']);
 */
export function assertEnumValue(value, name, allowed) {
  if (typeof name !== 'string' || name.trim() === '') {
    throw new TypeError('name must be a non-empty string.');
  }

  if (!Array.isArray(allowed) || allowed.length === 0 || allowed.some((item) => typeof item !== 'string')) {
    throw new TypeError('allowed must be a non-empty array of strings.');
  }

  if (typeof value !== 'string') {
    throw new TypeError(`${name} must be a string.`);
  }

  if (!allowed.includes(value)) {
    throw new TypeError(`${name} must be one of: ${allowed.join(', ')}.`);
  }

  return value;
}

/**
 * Validate an ISO-8601 timestamp string.
 *
 * @param {unknown} value - Value to validate.
 * @param {string} name - Human-readable field name.
 * @returns {string} The validated ISO string.
 * @throws {TypeError} If value is not a valid ISO timestamp.
 * @example
 * assertIsoTimestamp('2026-03-31T12:00:00.000Z', 'createdAt');
 * @example
 * assertIsoTimestamp(new Date().toISOString(), 'updatedAt');
 */
export function assertIsoTimestamp(value, name) {
  if (typeof name !== 'string' || name.trim() === '') {
    throw new TypeError('name must be a non-empty string.');
  }

  if (typeof value !== 'string') {
    throw new TypeError(`${name} must be a string.`);
  }

  const time = Date.parse(value);

  if (Number.isNaN(time)) {
    throw new TypeError(`${name} must be a valid ISO-8601 timestamp.`);
  }

  return value;
}
