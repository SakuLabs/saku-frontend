# Kanban Drag-and-Drop for Tasks Board

**Date:** 2026-05-30
**Status:** Approved

## Goal

Add drag-and-drop to the existing tasks board view so users can move task
cards between the **TODO**, **IN_PROGRESS**, and **DONE** columns. Moving a card
to a new column persists the new status via the backend API.

The list view is unchanged. The board layout, columns, and `TaskCard` already
exist (`components/task-board.tsx`); this work adds DnD wiring and the
supporting type/state changes.

## Library

`@dnd-kit` — chosen for accessibility (keyboard + touch sensors), React 19
compatibility, and being the standard for kanban interfaces.

Packages:
- `@dnd-kit/core`
- `@dnd-kit/sortable`
- `@dnd-kit/utilities`

## Backend Contract

The backend status endpoint (`PATCH /tasks/:id/status`) currently accepts only
`IN_PROGRESS` and `DONE`. The backend is being extended (by the user) to also
accept `TODO`, so the frontend will send `status=TODO` when a card is dragged
into the TODO column.

### Type changes

`lib/types.ts`:
- `UpdateTaskStatusRequest.status`: `'IN_PROGRESS' | 'DONE'` → `TaskStatus`
  (i.e. include `'TODO'`).

`hooks/use-tasks.ts`:
- `updateStatus` signature: `(id: string, status: 'IN_PROGRESS' | 'DONE')`
  → `(id: string, status: TaskStatus)`.
- Make `updateStatus` **optimistic**: update local `tasks` state immediately,
  then call the API. On API failure, roll back to the previous status and
  surface the error (existing `setError` + caller toast).

## Component Design

### `TaskBoard` (`components/task-board.tsx`)

- Wrap the columns in `<DndContext>`.
- **Sensors:**
  - `PointerSensor` with `activationConstraint: { distance: 8 }` so clicks on
    card buttons (delete / status menu) are not treated as drags.
  - `TouchSensor` with a short press delay so horizontal board scrolling still
    works on mobile.
  - `KeyboardSensor` for accessibility.
- **Columns** are droppable: `useDroppable({ id: status })`. The column id is
  the `TaskStatus`.
- **Cards** are sortable/draggable: `useSortable({ id: task.id })`. This lives
  in a small wrapper (e.g. `SortableTaskCard`) that applies the dnd-kit
  transform/listeners and renders the existing `TaskCard`.
- **`DragOverlay`** renders a floating clone of the dragged `TaskCard` for a
  smooth drag visual.
- **`onDragEnd`:**
  - Resolve the destination column (droppable id, or the column of the card
    being hovered).
  - If destination status === source status → no-op.
  - Otherwise call `onUpdateTask(taskId, { status: destinationStatus })`.
- Keep the existing framer-motion `AnimatePresence` column animations.

The `TaskManagement` → `TaskBoard` prop interface (`onUpdateTask`,
`onDeleteTask`, `onEditTask`) is unchanged. `handleStatusChange` in
`task-management.tsx` already forwards `updates.status` to `updateStatus`; it
only needs to accept the widened `TaskStatus` type.

## Edge Cases

- Drop on the same column → no API call.
- Card action buttons still clickable (activation distance guards drags).
- Empty columns remain valid drop targets (the existing min-height dropzone).
- API failure → optimistic state rolls back, error toast shown.

## Testing

- Manual: drag a card across every column pair (TODO↔IN_PROGRESS↔DONE), verify
  the card moves and the status persists after a page reload.
- Manual: verify card buttons (delete) still work without triggering a drag.
- Manual: verify board horizontal scroll still works on a narrow viewport.
- `pnpm run lint` passes.

## Out of Scope

- Reordering cards within a column (status-only moves).
- Drag-and-drop in the list view.
- Editing task content via the board.
