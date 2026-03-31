import assert from 'node:assert/strict';
import test from 'node:test';

import {
  assertEnumValue,
  assertIsoTimestamp,
  assertPlainObject,
  assertRequiredString,
  normalizeOptionalString
} from '../../src/utils/validators.js';

test('assertPlainObject returns the same plain object', () => {
  const input = { title: 'Task' };
  const result = assertPlainObject(input, 'input');
  assert.equal(result, input);
});

test('assertPlainObject throws for null and arrays', () => {
  assert.throws(() => assertPlainObject(null, 'input'), /plain object/);
  assert.throws(() => assertPlainObject([], 'input'), /plain object/);
});

test('assertPlainObject throws for invalid name', () => {
  assert.throws(() => assertPlainObject({}, ''), /name must be a non-empty string/);
});

test('assertRequiredString trims and returns string', () => {
  const result = assertRequiredString('  hello  ', 'title', 10);
  assert.equal(result, 'hello');
});

test('assertRequiredString throws for non-string and empty values', () => {
  assert.throws(() => assertRequiredString(5, 'title', 10), /must be a string/);
  assert.throws(() => assertRequiredString('   ', 'title', 10), /must not be empty/);
});

test('assertRequiredString throws when max length exceeded', () => {
  assert.throws(() => assertRequiredString('toolong', 'title', 3), /at most 3 characters/);
});

test('assertRequiredString throws for invalid maxLength', () => {
  assert.throws(() => assertRequiredString('ok', 'title', 0), /positive integer/);
  assert.throws(() => assertRequiredString('ok', 'title', 2.5), /positive integer/);
});

test('normalizeOptionalString returns empty string for undefined', () => {
  assert.equal(normalizeOptionalString(undefined, 'description', 20), '');
});

test('normalizeOptionalString trims valid string values', () => {
  assert.equal(normalizeOptionalString('  notes  ', 'description', 20), 'notes');
});

test('normalizeOptionalString allows blank string after trimming', () => {
  assert.equal(normalizeOptionalString('   ', 'description', 20), '');
});

test('normalizeOptionalString throws for non-string and long values', () => {
  assert.throws(() => normalizeOptionalString(7, 'description', 20), /must be a string/);
  assert.throws(() => normalizeOptionalString('abcd', 'description', 3), /at most 3 characters/);
});

test('assertEnumValue returns value when allowed', () => {
  const allowed = ['todo', 'in-progress', 'done'];
  assert.equal(assertEnumValue('todo', 'status', allowed), 'todo');
});

test('assertEnumValue throws for non-string and disallowed values', () => {
  const allowed = ['low', 'medium', 'high'];
  assert.throws(() => assertEnumValue(1, 'priority', allowed), /must be a string/);
  assert.throws(() => assertEnumValue('urgent', 'priority', allowed), /must be one of/);
});

test('assertEnumValue throws for invalid allowed list', () => {
  assert.throws(() => assertEnumValue('todo', 'status', []), /non-empty array of strings/);
  assert.throws(() => assertEnumValue('todo', 'status', ['todo', 1]), /non-empty array of strings/);
});

test('assertIsoTimestamp accepts a valid ISO string', () => {
  const iso = new Date().toISOString();
  assert.equal(assertIsoTimestamp(iso, 'createdAt'), iso);
});

test('assertIsoTimestamp throws for invalid values', () => {
  assert.throws(() => assertIsoTimestamp(123, 'createdAt'), /must be a string/);
  assert.throws(() => assertIsoTimestamp('not-a-date', 'createdAt'), /valid ISO-8601 timestamp/);
});
