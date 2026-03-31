import assert from 'node:assert/strict';
import test from 'node:test';

import { Task } from '../../src/models/task.js';

test('Task constructor sets defaults and timestamps', () => {
  const task = new Task({ title: 'Write docs' });
  const json = task.toJSON();

  assert.equal(typeof json.id, 'string');
  assert.equal(json.title, 'Write docs');
  assert.equal(json.description, '');
  assert.equal(json.status, 'todo');
  assert.equal(json.priority, 'medium');
  assert.equal(json.category, 'general');
  assert.equal(typeof json.createdAt, 'string');
  assert.equal(typeof json.updatedAt, 'string');
});

test('Task constructor normalizes optional fields', () => {
  const task = new Task({
    title: '  Build tests  ',
    description: '  include edge cases  ',
    status: 'in-progress',
    priority: 'high'
  });

  const json = task.toJSON();
  assert.equal(json.title, 'Build tests');
  assert.equal(json.description, 'include edge cases');
  assert.equal(json.status, 'in-progress');
  assert.equal(json.priority, 'high');
});

test('Task constructor rejects invalid title', () => {
  assert.throws(() => new Task({ title: '   ' }), /must not be empty/);
});

test('Task constructor rejects invalid status and priority', () => {
  assert.throws(() => new Task({ title: 'x', status: 'blocked' }), /must be one of/);
  assert.throws(() => new Task({ title: 'x', priority: 'urgent' }), /must be one of/);
});

test('Task constructor accepts boundary string lengths', () => {
  const title120 = 't'.repeat(120);
  const description1000 = 'd'.repeat(1000);

  const task = new Task({
    title: title120,
    description: description1000
  }).toJSON();

  assert.equal(task.title.length, 120);
  assert.equal(task.description.length, 1000);
});

test('Task constructor rejects strings above max lengths', () => {
  assert.throws(() => new Task({ title: 't'.repeat(121) }), /at most 120 characters/);
  assert.throws(() => new Task({ title: 'ok', description: 'd'.repeat(1001) }), /at most 1000 characters/);
});

test('Task constructor rejects type mismatches', () => {
  assert.throws(() => new Task({ title: 123 }), /title must be a string/);
  assert.throws(() => new Task({ title: 'ok', description: 999 }), /description must be a string/);
  assert.throws(() => new Task({ title: 'ok', status: 1 }), /status must be a string/);
  assert.throws(() => new Task({ title: 'ok', priority: {} }), /priority must be a string/);
});

test('Task constructor supports missing optional fields', () => {
  const task = new Task({ title: 'Only required field' }).toJSON();

  assert.equal(task.description, '');
  assert.equal(task.status, 'todo');
  assert.equal(task.priority, 'medium');
  assert.equal(task.category, 'general');
});

test('Task constructor accepts explicit category', () => {
  const task = new Task({ title: 'Work task', category: 'work' }).toJSON();
  assert.equal(task.category, 'work');
});

test('Task constructor normalizes category with leading/trailing whitespace', () => {
  const task = new Task({ title: 'Task', category: '  personal  ' }).toJSON();
  assert.equal(task.category, 'personal');
});

test('Task constructor rejects invalid category type', () => {
  assert.throws(() => new Task({ title: 'x', category: 123 }), /category must be a string/);
});

test('Task constructor accepts boundary category length', () => {
  const category50 = 'c'.repeat(50);
  const task = new Task({ title: 'x', category: category50 }).toJSON();
  assert.equal(task.category.length, 50);
});

test('Task constructor rejects category above max length', () => {
  assert.throws(() => new Task({ title: 'x', category: 'c'.repeat(51) }), /at most 50 characters/);
});

test('Task.fromRecord rehydrates a valid record', () => {
  const base = new Task({ title: 'Seed task', category: 'work' }).toJSON();
  const rehydrated = Task.fromRecord(base).toJSON();

  assert.deepEqual(rehydrated, base);
});

test('Task.fromRecord rejects malformed records', () => {
  const base = new Task({ title: 'Seed task' }).toJSON();
  const bad = { ...base, createdAt: 'bad-date' };

  assert.throws(() => Task.fromRecord(bad), /valid ISO-8601 timestamp/);
});

test('Task.fromRecord allows duplicate records with same id', () => {
  const record = new Task({ title: 'Duplicate id source' }).toJSON();
  const first = Task.fromRecord(record).toJSON();
  const second = Task.fromRecord(record).toJSON();

  assert.equal(first.id, second.id);
  assert.equal(first.title, second.title);
});

test('Task.validateUpdatePatch accepts mutable fields', () => {
  const patch = Task.validateUpdatePatch({
    title: '  New title  ',
    description: '  New desc  ',
    status: 'done',
    priority: 'low',
    category: '  urgent  '
  });

  assert.deepEqual(patch, {
    title: 'New title',
    description: 'New desc',
    status: 'done',
    priority: 'low',
    category: 'urgent'
  });
});

test('Task.validateUpdatePatch rejects empty or unsupported fields', () => {
  assert.throws(() => Task.validateUpdatePatch({}), /at least one field/);
  assert.throws(() => Task.validateUpdatePatch({ foo: 1 }), /Unsupported task field/);
});

test('Task.validateUpdatePatch rejects immutable fields', () => {
  assert.throws(() => Task.validateUpdatePatch({ id: 'abc' }), /immutable/);
  assert.throws(() => Task.validateUpdatePatch({ createdAt: new Date().toISOString() }), /immutable/);
});

test('Task.validateUpdatePatch rejects type mismatches in patch values', () => {
  assert.throws(() => Task.validateUpdatePatch({ title: 42 }), /title must be a string/);
  assert.throws(() => Task.validateUpdatePatch({ status: 42 }), /status must be a string/);
  assert.throws(() => Task.validateUpdatePatch({ priority: [] }), /priority must be a string/);
  assert.throws(() => Task.validateUpdatePatch({ category: 999 }), /category must be a string/);
});

test('Task.update mutates mutable fields and changes updatedAt', async () => {
  const task = new Task({ title: 'Before', description: 'old', status: 'todo', priority: 'medium', category: 'work' });
  const before = task.toJSON();

  await new Promise((resolve) => setTimeout(resolve, 2));
  task.update({ title: 'After', status: 'done', category: 'personal' });

  const after = task.toJSON();
  assert.equal(after.id, before.id);
  assert.equal(after.createdAt, before.createdAt);
  assert.equal(after.title, 'After');
  assert.equal(after.status, 'done');
  assert.equal(after.category, 'personal');
  assert.equal(after.priority, 'medium');
  assert.notEqual(after.updatedAt, before.updatedAt);
});

test('Task.update throws for invalid patch input', () => {
  const task = new Task({ title: 'Task' });
  assert.throws(() => task.update([]), /plain object/);
});

test('Task.update handles concurrent patch list modifications while iterating', () => {
  const task = new Task({ title: 'Initial', status: 'todo', priority: 'low' });
  const patches = [{ title: 'Step 1' }, { status: 'in-progress' }];

  for (const patch of patches) {
    task.update(patch);

    if (patch.title === 'Step 1') {
      patches.push({ priority: 'high' });
    }
  }

  const updated = task.toJSON();
  assert.equal(updated.title, 'Step 1');
  assert.equal(updated.status, 'in-progress');
  assert.equal(updated.priority, 'high');
});
