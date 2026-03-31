import { randomUUID } from 'node:crypto';

import {
  assertEnumValue,
  assertIsoTimestamp,
  assertPlainObject,
  assertRequiredString,
  normalizeOptionalString
} from '../utils/validators.js';

const STATUS_VALUES = ['todo', 'in-progress', 'done'];
const PRIORITY_VALUES = ['low', 'medium', 'high'];
const CATEGORY_VALUES = ['work', 'personal', 'urgent', 'general'];
const IMMUTABLE_FIELDS = new Set(['id', 'createdAt', 'updatedAt']);
const MUTABLE_FIELDS = new Set(['title', 'description', 'status', 'priority', 'category']);

/**
 * Task domain model with built-in field validation and normalization.
 */
export class Task {
  /**
   * Create a new task.
   *
   * @param {{title: unknown, description?: unknown, status?: unknown, priority?: unknown, category?: unknown}} input - Raw task input.
   */
  constructor(input) {
    const data = assertPlainObject(input, 'input');
    const now = new Date().toISOString();

    this.id = randomUUID();
    this.title = assertRequiredString(data.title, 'title', 120);
    this.description = normalizeOptionalString(data.description, 'description', 1000);
    this.status = data.status === undefined
      ? 'todo'
      : assertEnumValue(data.status, 'status', STATUS_VALUES);
    this.priority = data.priority === undefined
      ? 'medium'
      : assertEnumValue(data.priority, 'priority', PRIORITY_VALUES);
    this.category = data.category === undefined
      ? 'general'
      : normalizeOptionalString(data.category, 'category', 50);
    this.createdAt = now;
    this.updatedAt = now;
  }

  /**
   * Rehydrate a Task instance from an existing stored task record.
   *
   * @param {Record<string, unknown>} record - Stored task record.
   * @returns {Task} Rehydrated Task instance.
   */
  static fromRecord(record) {
    const data = assertPlainObject(record, 'record');

    const task = Object.create(Task.prototype);
    task.id = assertRequiredString(data.id, 'id', 200);
    task.title = assertRequiredString(data.title, 'title', 120);
    task.description = normalizeOptionalString(data.description, 'description', 1000);
    task.status = assertEnumValue(data.status, 'status', STATUS_VALUES);
    task.priority = assertEnumValue(data.priority, 'priority', PRIORITY_VALUES);
    task.category = data.category === undefined
      ? 'general'
      : normalizeOptionalString(data.category, 'category', 50);
    task.createdAt = assertIsoTimestamp(data.createdAt, 'createdAt');
    task.updatedAt = assertIsoTimestamp(data.updatedAt, 'updatedAt');

    return task;
  }

  /**
   * Apply a partial update to mutable task fields.
   *
   * @param {Record<string, unknown>} patch - Partial task update object.
   * @returns {Task} This instance for chaining.
   */
  update(patch) {
    const normalizedPatch = Task.validateUpdatePatch(patch);

    if (Object.prototype.hasOwnProperty.call(normalizedPatch, 'title')) {
      this.title = /** @type {string} */ (normalizedPatch.title);
    }

    if (Object.prototype.hasOwnProperty.call(normalizedPatch, 'description')) {
      this.description = /** @type {string} */ (normalizedPatch.description);
    }

    if (Object.prototype.hasOwnProperty.call(normalizedPatch, 'status')) {
      this.status = /** @type {string} */ (normalizedPatch.status);
    }

    if (Object.prototype.hasOwnProperty.call(normalizedPatch, 'priority')) {
      this.priority = /** @type {string} */ (normalizedPatch.priority);
    }

    if (Object.prototype.hasOwnProperty.call(normalizedPatch, 'category')) {
      this.category = /** @type {string} */ (normalizedPatch.category);
    }

    this.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * Validate a partial task update payload.
   *
   * @param {Record<string, unknown>} patch - Partial update object.
   * @returns {Record<string, unknown>} Normalized update payload.
   */
  static validateUpdatePatch(patch) {
    const data = assertPlainObject(patch, 'patch');
    const keys = Object.keys(data);

    if (keys.length === 0) {
      throw new TypeError('patch must include at least one field to update.');
    }

    for (const key of keys) {
      if (IMMUTABLE_FIELDS.has(key)) {
        throw new TypeError(`${key} is immutable and cannot be updated.`);
      }

      if (!MUTABLE_FIELDS.has(key)) {
        throw new TypeError(`Unsupported task field: ${key}.`);
      }
    }

    const normalized = {};

    if (Object.prototype.hasOwnProperty.call(data, 'title')) {
      normalized.title = assertRequiredString(data.title, 'title', 120);
    }

    if (Object.prototype.hasOwnProperty.call(data, 'description')) {
      normalized.description = normalizeOptionalString(data.description, 'description', 1000);
    }

    if (Object.prototype.hasOwnProperty.call(data, 'status')) {
      normalized.status = assertEnumValue(data.status, 'status', STATUS_VALUES);
    }

    if (Object.prototype.hasOwnProperty.call(data, 'priority')) {
      normalized.priority = assertEnumValue(data.priority, 'priority', PRIORITY_VALUES);
    }

    if (Object.prototype.hasOwnProperty.call(data, 'category')) {
      normalized.category = normalizeOptionalString(data.category, 'category', 50);
    }

    return normalized;
  }

  /**
   * Convert the task to a plain serializable object.
   *
   * @returns {{id: string, title: string, description: string, status: string, priority: string, category: string, createdAt: string, updatedAt: string}} Plain task object.
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      status: this.status,
      priority: this.priority,
      category: this.category,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
