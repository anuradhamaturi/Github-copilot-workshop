import {
  createTask,
  deleteTask,
  filterTasksByCategory,
  getTaskById,
  listTasks,
  updateTask
} from './services/taskService.js';
import { colorPriority, colorStatus } from './utils/colors.js';

/**
 * Colorize status and priority fields while preserving other task data.
 *
 * @param {unknown} value - Value to format for display.
 * @returns {unknown} Display-friendly value.
 */
function formatForDisplay(value) {
  if (Array.isArray(value)) {
    return value.map((item) => formatForDisplay(item));
  }

  if (value !== null && typeof value === 'object') {
    const record = /** @type {Record<string, unknown>} */ (value);
    const formatted = { ...record };

    if (Object.prototype.hasOwnProperty.call(record, 'status')) {
      formatted.status = colorStatus(record.status);
    }

    if (Object.prototype.hasOwnProperty.call(record, 'priority')) {
      formatted.priority = colorPriority(record.priority);
    }

    return formatted;
  }

  return value;
}

/**
 * Print labeled output as formatted JSON.
 *
 * @param {string} label - Heading label.
 * @param {unknown} value - Value to print.
 * @returns {void}
 */
function printStep(label, value) {
  console.log(`\n${label}`);
  const formatted = formatForDisplay(value);
  console.log(JSON.stringify(formatted, null, 2));
}

/**
 * Run a full CRUD demonstration for the in-memory Task Manager.
 *
 * @returns {void}
 */
export function runDemo() {
  try {
    const firstTask = createTask({
      title: 'Prepare workshop notes',
      description: 'Draft examples for Copilot custom instructions.',
      priority: 'high',
      category: 'work'
    });
    printStep('Created first task (category: work):', firstTask);

    const secondTask = createTask({
      title: 'Review exercise 04',
      description: 'Verify skill loading instructions are clear.',
      status: 'in-progress',
      priority: 'medium',
      category: 'work'
    });
    printStep('Created second task (category: work):', secondTask);

    const thirdTask = createTask({
      title: 'Plan weekend hike',
      description: 'Research trails in nearby mountains.',
      priority: 'low',
      category: 'personal'
    });
    printStep('Created third task (category: personal):', thirdTask);

    const fourthTask = createTask({
      title: 'Fix critical bug',
      description: 'Production issue affecting users.',
      status: 'in-progress',
      priority: 'high'
    });
    printStep('Created fourth task (default category: general):', fourthTask);

    const allTasks = listTasks();
    printStep('Listed all tasks:', allTasks);

    const workTasks = filterTasksByCategory('work');
    printStep('Filtered tasks by category: work', workTasks);

    const personalTasks = filterTasksByCategory('personal');
    printStep('Filtered tasks by category: personal', personalTasks);

    const fetchedTask = getTaskById(firstTask.id);
    printStep('Fetched first task by id:', fetchedTask);

    const updatedTask = updateTask(firstTask.id, {
      status: 'done',
      description: 'Examples are ready for student walkthrough.',
      category: 'general'
    });
    printStep('Updated first task (changed category to general):', updatedTask);

    const deletedTask = deleteTask(secondTask.id);
    printStep('Deleted second task:', deletedTask);

    const remainingTasks = listTasks();
    printStep('Remaining tasks:', remainingTasks);
  } catch (error) {
    console.error('Task Manager demo failed.');
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

runDemo();
