import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createTask,
  deleteTask,
  filterTasksByCategory,
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
  assert.equal(task.category, 'general');
});

test('createTask validates input fields', () => {
  assert.throws(() => createTask(null), /plain object/);
  assert.throws(() => createTask({ title: ' ', status: 'todo' }), /must not be empty/);
  assert.throws(() => createTask({ title: 'x', priority: 'urgent' }), /must be one of/);
  assert.throws(() => createTask({ title: 'x', category: 'c'.repeat(51) }), /at most 50 characters/);
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
    priority: 'medium',
    category: 'work'
  });

  await new Promise((resolve) => setTimeout(resolve, 2));
  const updated = updateTask(created.id, {
    title: 'Updated title',
    description: 'Updated desc',
    status: 'in-progress',
    priority: 'high',
    category: 'personal'
  });

  assert.equal(updated.id, created.id);
  assert.equal(updated.createdAt, created.createdAt);
  assert.equal(updated.title, 'Updated title');
  assert.equal(updated.description, 'Updated desc');
  assert.equal(updated.status, 'in-progress');
  assert.equal(updated.priority, 'high');
  assert.equal(updated.category, 'personal');
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

test('filterTasksByCategory returns tasks matching category', () => {
  const workTask = createTask({ title: 'Work task', category: 'work' });
  const personalTask = createTask({ title: 'Personal task', category: 'personal' });
  const generalTask = createTask({ title: 'General task' });

  const workTasks = filterTasksByCategory('work');
  const personalTasks = filterTasksByCategory('personal');
  const generalTasks = filterTasksByCategory('general');

  assert.ok(workTasks.some((t) => t.id === workTask.id));
  assert.ok(!workTasks.some((t) => t.id === personalTask.id));

  assert.ok(personalTasks.some((t) => t.id === personalTask.id));
  assert.ok(!personalTasks.some((t) => t.id === workTask.id));

  assert.ok(generalTasks.some((t) => t.id === generalTask.id));
});

test('filterTasksByCategory returns cloned task objects', () => {
  const created = createTask({ title: 'Clone test task', category: 'work' });
  const filtered = filterTasksByCategory('work');
  const found = filtered.find((item) => item.id === created.id);

  assert.ok(found);
  found.title = 'tampered';

  const fetched = getTaskById(created.id);
  assert.equal(fetched.title, 'Clone test task');
});

test('filterTasksByCategory validates category parameter', () => {
  assert.throws(() => filterTasksByCategory('   '), /must not be empty/);
  assert.throws(() => filterTasksByCategory(123), /category must be a string/);
});

test('updateTask can update category', () => {
  const created = createTask({ title: 'Category update', category: 'work' });

  const updated = updateTask(created.id, { category: 'personal' });

  assert.equal(updated.category, 'personal');

  const filtered = filterTasksByCategory('personal');
  assert.ok(filtered.some((t) => t.id === created.id));
});
