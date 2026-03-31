import {
  createTask,
  deleteTask,
  getTaskById,
  listTasks,
  updateTask
} from './services/taskService.js';

/**
 * Print labeled output as formatted JSON.
 *
 * @param {string} label - Heading label.
 * @param {unknown} value - Value to print.
 * @returns {void}
 */
function printStep(label, value) {
  console.log(`\n${label}`);
  console.log(JSON.stringify(value, null, 2));
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
      priority: 'high'
    });
    printStep('Created first task:', firstTask);

    const secondTask = createTask({
      title: 'Review exercise 04',
      description: 'Verify skill loading instructions are clear.',
      status: 'in-progress',
      priority: 'medium'
    });
    printStep('Created second task:', secondTask);

    const allTasks = listTasks();
    printStep('Listed all tasks:', allTasks);

    const fetchedTask = getTaskById(firstTask.id);
    printStep('Fetched first task by id:', fetchedTask);

    const updatedTask = updateTask(firstTask.id, {
      status: 'done',
      description: 'Examples are ready for student walkthrough.'
    });
    printStep('Updated first task:', updatedTask);

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
