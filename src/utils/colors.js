import chalk from 'chalk';

const STATUS_VALUES = ['todo', 'in-progress', 'done'];
const PRIORITY_VALUES = ['low', 'medium', 'high'];

/**
 * Return a colorized status string for terminal output.
 *
 * @param {unknown} status - Task status to colorize.
 * @returns {string} Colorized status text.
 * @throws {TypeError} If status is not one of the supported values.
 * @example
 * colorStatus('todo');
 * @example
 * colorStatus('done');
 */
export function colorStatus(status) {
  if (typeof status !== 'string') {
    throw new TypeError('status must be a string.');
  }

  if (!STATUS_VALUES.includes(status)) {
    throw new TypeError(`status must be one of: ${STATUS_VALUES.join(', ')}.`);
  }

  if (status === 'done') {
    return chalk.green(status);
  }

  if (status === 'in-progress') {
    return chalk.yellow(status);
  }

  return chalk.red(status);
}

/**
 * Return a colorized priority string for terminal output.
 *
 * @param {unknown} priority - Task priority to colorize.
 * @returns {string} Colorized priority text.
 * @throws {TypeError} If priority is not one of the supported values.
 * @example
 * colorPriority('high');
 * @example
 * colorPriority('low');
 */
export function colorPriority(priority) {
  if (typeof priority !== 'string') {
    throw new TypeError('priority must be a string.');
  }

  if (!PRIORITY_VALUES.includes(priority)) {
    throw new TypeError(`priority must be one of: ${PRIORITY_VALUES.join(', ')}.`);
  }

  if (priority === 'high') {
    return chalk.bold.red(priority);
  }

  if (priority === 'medium') {
    return chalk.bold.yellow(priority);
  }

  return chalk.dim(priority);
}
