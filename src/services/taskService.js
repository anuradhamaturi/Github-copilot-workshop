import { Task } from '../models/task.js';
import { assertPlainObject, assertRequiredString } from '../utils/validators.js';

const taskStore = [];

/**
 * Return a cloned task object to protect internal state.
 *
 * @param {Record<string, unknown>} task - Task object to clone.
 * @returns {Record<string, unknown>} Cloned task object.
 */
function cloneTask(task) {
  return { ...task };
}

/**
 * Create a new task record.
 *
 * @param {{title: unknown, description?: unknown, status?: unknown, priority?: unknown}} input - Raw task input.
 * @returns {Record<string, unknown>} Created task.
 */
export function createTask(input) {
  const task = new Task(input);
  const record = task.toJSON();
  taskStore.push(record);
  return cloneTask(record);
}

/**
 * List all task records.
 *
 * @returns {Record<string, unknown>[]} All tasks as copies.
 */
export function listTasks() {
  return taskStore.map((task) => cloneTask(task));
}

/**
 * Get a task record by id.
 *
 * @param {unknown} id - Task id.
 * @returns {Record<string, unknown>} Matching task.
 */
export function getTaskById(id) {
  const normalizedId = assertRequiredString(id, 'id', 200);
  const found = taskStore.find((task) => task.id === normalizedId);

  if (!found) {
    throw new Error(`Task with id "${normalizedId}" was not found.`);
  }

  return cloneTask(found);
}

/**
 * Update a task by id.
 *
 * @param {unknown} id - Task id.
 * @param {Record<string, unknown>} patch - Partial task update.
 * @returns {Record<string, unknown>} Updated task.
 */
export function updateTask(id, patch) {
  const normalizedId = assertRequiredString(id, 'id', 200);
  const normalizedPatch = assertPlainObject(patch, 'patch');

  const index = taskStore.findIndex((task) => task.id === normalizedId);

  if (index === -1) {
    throw new Error(`Task with id "${normalizedId}" was not found.`);
  }

  const task = Task.fromRecord(taskStore[index]);
  task.update(normalizedPatch);
  const updatedRecord = task.toJSON();
  taskStore[index] = updatedRecord;

  return cloneTask(updatedRecord);
}

/**
 * Delete a task by id.
 *
 * @param {unknown} id - Task id.
 * @returns {Record<string, unknown>} Deleted task.
 */
export function deleteTask(id) {
  const normalizedId = assertRequiredString(id, 'id', 200);
  const index = taskStore.findIndex((task) => task.id === normalizedId);

  if (index === -1) {
    throw new Error(`Task with id "${normalizedId}" was not found.`);
  }

  const [deletedTask] = taskStore.splice(index, 1);
  return cloneTask(deletedTask);
}
