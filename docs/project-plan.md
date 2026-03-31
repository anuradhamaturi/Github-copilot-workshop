# Task Manager CLI Project Plan

## Project overview
This project is a small Node.js 20+ command-line Task Manager application designed for workshop use. It will support creating, listing, updating, and deleting tasks, with filtering by status, priority, or category and sorting by priority or creation date. Data will be stored only in memory for the runtime session (no database and no file persistence), keeping implementation simple and focused on core CLI design and clean command handling.

## User stories
1. As a user, I can create a task with required and optional fields so I can track work items.
Acceptance criteria:
- Running a create command with a title creates a new task.
- Description is optional; status defaults to `todo`; priority defaults to `medium`.
- `createdAt` and `updatedAt` are set automatically at creation.
- A unique task id is generated and returned in command output.

2. As a user, I can list all tasks so I can see my current workload.
Acceptance criteria:
- A list command prints all tasks in a readable tabular or structured format.
- Empty state message is shown when no tasks exist.

3. As a user, I can update task fields so I can keep task details current.
Acceptance criteria:
- Update command accepts task id and one or more fields (`title`, `description`, `status`, `priority`).
- Status only accepts `todo`, `in-progress`, or `done`.
- Priority only accepts `low`, `medium`, or `high`.
- `updatedAt` changes on every successful update.

4. As a user, I can delete a task so I can remove irrelevant items.
Acceptance criteria:
- Delete command removes a task by id.
- Deleting a missing id returns a clear error message.

5. As a user, I can filter tasks by status or priority so I can focus on relevant work.
Acceptance criteria:
- List command supports `--status` filter with valid status values.
- List command supports `--priority` filter with valid priority values.
- Filters can be used independently or together.

6. As a user, I can sort tasks by priority or creation date so I can view tasks in meaningful order.
Acceptance criteria:
- List command supports `--sort=priority` and `--sort=createdAt`.
- Sorting by priority uses `high > medium > low`.
- Sorting by creation date supports ascending and descending order via `--order=asc|desc`.

7. As a user, I can assign a category to a task so I can organize tasks by type or context.
Acceptance criteria:
- Create and update commands accept an optional `category` field.
- Category defaults to `general` when not provided.
- Valid categories include predefined values such as `work`, `personal`, and `urgent`.
- List command supports `--category` filter to show only tasks matching a specific category.
- Filtering by category works independently and in combination with status and priority filters.

## Data model
- `Task`
- `id: string` - unique identifier (for example, incremented string or `crypto.randomUUID()`).
- `title: string` - required short label.
- `description: string` - optional details (can be empty string).
- `status: "todo" | "in-progress" | "done"`.
- `priority: "low" | "medium" | "high"`.
- `category: string` - optional category label (defaults to `general`; examples: `work`, `personal`, `urgent`).
- `createdAt: string` - ISO-8601 timestamp.
- `updatedAt: string` - ISO-8601 timestamp.

- `TaskStore` (in-memory)
- `tasks: Task[]` - runtime collection of tasks.

## Error handling conventions and input validation rules
### Error handling conventions
- Return non-zero exit code (`process.exitCode = 1`) for user input errors and command failures.
- Print errors to `stderr` using a consistent format: `Error: <message>`.
- Never throw raw internal errors to users; map internal failures to clear, actionable messages.
- Use stable error categories in code for maintainability:
  - `VALIDATION_ERROR` for invalid flags/field values.
  - `NOT_FOUND_ERROR` for unknown task ids.
  - `USAGE_ERROR` for malformed or incomplete commands.
- Keep success output on `stdout` and error output on `stderr` to support shell scripting.

### Input validation rules
- Command validation:
  - Reject unknown commands and flags.
  - Enforce required arguments for each command (for example, task id for update/delete).
- Field validation:
  - `title` is required for create, must be a trimmed non-empty string, and should be capped at 120 characters.
  - `description` is optional, must be a string when provided, capped at 1000 characters.
  - `status` must be one of `todo`, `in-progress`, `done`.
  - `priority` must be one of `low`, `medium`, `high`.
- Update validation:
  - Require at least one updatable field on update.
  - Reject immutable field edits (`id`, `createdAt`).
  - Set `updatedAt` only after all validations pass.
- Filter/sort validation:
  - `--status` and `--priority` filters must match allowed enum values.
  - `--category` filter must match a valid category value or match the default category.
  - `--sort` only allows `priority` or `createdAt`.
  - `--order` only allows `asc` or `desc`; default to `asc` when omitted.
- Category validation:
  - `category` is optional on create and update.
  - When provided, must be a non-empty trimmed string.
  - Defaults to `general` when omitted on create.
  - Maximum length: 50 characters.
- ID validation:
  - Task id must be a non-empty string.
  - Update/delete/list lookups with unknown id return `NOT_FOUND_ERROR`.

## File structure
```text
src/
  index.js               # CLI entrypoint, argument parsing, command routing
  constants/
    enums.js             # Status and priority values, priority rank map
  models/
    task.js              # Task factory and validation helpers
  services/
    task-service.js      # CRUD, filtering, and sorting logic over in-memory array
  utils/
    format.js            # Terminal output formatting helpers
    errors.js            # Consistent user-facing error helpers
```

## Implementation phases
1. CLI skeleton and command routing
- Initialize Node.js entrypoint in `src/index.js`.
- Implement command parser for `create`, `list`, `update`, `delete` using only built-in modules.
- Add unified help text and usage examples.

2. Task model and in-memory store
- Define allowed enums and validation helpers.
- Implement `Task` creation logic with defaults and timestamps.
- Add `TaskStore` array and id generation strategy.

3. CRUD operations
- Implement create/list/update/delete service functions.
- Add validation and clear error messages for invalid ids or field values.
- Ensure `updatedAt` is always refreshed on updates.

4. Filtering and sorting
- Add list-time filtering by `status` and `priority`.
- Add sorting by `priority` and `createdAt` with configurable order.
- Ensure deterministic ordering when values are equal.

5. Output polish and manual verification
- Improve console formatting for readability.
- Verify acceptance criteria through manual command scenarios.
- Document known limitation: in-memory data resets when process exits.
