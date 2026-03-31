import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createTask,
  deleteTask,
  getTaskById,
  listTasks,
  updateTask
} from '../../src/services/taskService.js';

test('createTask creates a task with defaults', () => {
  const task = createTask({ title: 'Service create defaults' });

  assert.equal(typeof task.id, 'string');
  assert.equal(task.title, 'Service create defaults');
  assert.equal(task.description, '');
  assert.equal(task.status, 'todo');
  assert.equal(task.priority, 'medium');
});

test('createTask validates input fields', () => {
  assert.throws(() => createTask(null), /plain object/);
  assert.throws(() => createTask({ title: ' ', status: 'todo' }), /must not be empty/);
  assert.throws(() => createTask({ title: 'x', priority: 'urgent' }), /must be one of/);
});

test('listTasks returns cloned task objects', () => {
  const created = createTask({ title: 'Clone test task' });
  const list = listTasks();
  const found = list.find((item) => item.id === created.id);

  assert.ok(found);
  found.title = 'tampered';

  const fetched = getTaskById(created.id);
  assert.equal(fetched.title, 'Clone test task');
});

test('getTaskById returns matching task and validates id', () => {
  const created = createTask({ title: 'Lookup task' });
  const fetched = getTaskById(created.id);

  assert.equal(fetched.id, created.id);
  assert.equal(fetched.title, 'Lookup task');
  assert.throws(() => getTaskById('   '), /must not be empty/);
});

test('getTaskById throws for unknown id', () => {
  assert.throws(() => getTaskById('missing-id'), /was not found/);
});

test('updateTask updates mutable fields and preserves immutable fields', async () => {
  const created = createTask({
    title: 'Original title',
    description: 'Original desc',
    status: 'todo',
    priority: 'medium'
  });

  await new Promise((resolve) => setTimeout(resolve, 2));
  const updated = updateTask(created.id, {
    title: 'Updated title',
    description: 'Updated desc',
    status: 'in-progress',
    priority: 'high'
  });

  assert.equal(updated.id, created.id);
  assert.equal(updated.createdAt, created.createdAt);
  assert.equal(updated.title, 'Updated title');
  assert.equal(updated.description, 'Updated desc');
  assert.equal(updated.status, 'in-progress');
  assert.equal(updated.priority, 'high');
  assert.notEqual(updated.updatedAt, created.updatedAt);
});

test('updateTask validates patch and id', () => {
  const created = createTask({ title: 'Update validation task' });

  assert.throws(() => updateTask(created.id, {}), /at least one field/);
  assert.throws(() => updateTask(created.id, { id: 'new' }), /immutable/);
  assert.throws(() => updateTask(created.id, []), /patch must be a plain object/);
  assert.throws(() => updateTask('unknown-id', { title: 'x' }), /was not found/);
  assert.throws(() => updateTask('   ', { title: 'x' }), /must not be empty/);
});

test('deleteTask removes and returns deleted task', () => {
  const created = createTask({ title: 'Delete me' });
  const deleted = deleteTask(created.id);

  assert.equal(deleted.id, created.id);
  assert.throws(() => getTaskById(created.id), /was not found/);
});

test('deleteTask validates id and handles unknown id', () => {
  assert.throws(() => deleteTask('   '), /must not be empty/);
  assert.throws(() => deleteTask('missing-id'), /was not found/);
});
