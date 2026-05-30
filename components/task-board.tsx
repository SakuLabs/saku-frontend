'use client';

import { useState } from 'react';
import { Task, TaskStatus } from '@/lib/types';
import { TaskCard } from '@/components/task-card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';

interface TaskBoardProps {
  tasks: Task[];
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (task: Task) => void;
}

const columns: { id: TaskStatus; title: string; color: string; dot: string }[] = [
  { id: 'TODO', title: 'To Do', color: 'border-t-amber-500/50', dot: 'bg-amber-500' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'border-t-blue-500/50', dot: 'bg-blue-500' },
  { id: 'DONE', title: 'Done', color: 'border-t-emerald-500/50', dot: 'bg-emerald-500' },
];

interface CardHandlers {
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
}

// Wraps a TaskCard with drag listeners. Whole card is grabbable; the pointer
// activation distance lets the inner buttons (menu, status toggle) still click.
function DraggableCard({ task, handlers }: { task: Task; handlers: CardHandlers }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task.id });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        'cursor-grab touch-pan-y outline-none active:cursor-grabbing',
        isDragging && 'opacity-40',
      )}
    >
      <TaskCard
        task={task}
        viewMode="board"
        onEdit={handlers.onEdit}
        onDelete={handlers.onDelete}
        onStatusChange={handlers.onStatusChange}
      />
    </div>
  );
}

function DroppableColumn({
  column,
  tasks,
  handlers,
}: {
  column: (typeof columns)[number];
  tasks: Task[];
  handlers: CardHandlers;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className="flex flex-col gap-4 min-h-[150px]" ref={setNodeRef}>
      <AnimatePresence mode="popLayout">
        {tasks.map(task => (
          <DraggableCard key={task.id} task={task} handlers={handlers} />
        ))}
      </AnimatePresence>

      {tasks.length === 0 && (
        <div
          className={cn(
            'h-32 flex flex-col items-center justify-center border-2 border-dashed rounded-xl m-2 transition-colors',
            isOver ? 'border-white/30 bg-white/10' : 'border-white/5 bg-white/5/50',
          )}
        >
          <p className="text-sm font-medium text-white/20">{isOver ? 'Drop here' : 'Empty'}</p>
        </div>
      )}
    </div>
  );
}

export function TaskBoard({ tasks, onUpdateTask, onDeleteTask, onEditTask }: TaskBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor),
  );

  const getTasksByStatus = (status: TaskStatus) => tasks.filter(task => task.status === status);

  const handleStatusChange = (id: string, status: TaskStatus) => onUpdateTask(id, { status });

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTask(tasks.find(t => t.id === event.active.id) ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const task = tasks.find(t => t.id === active.id);
    const newStatus = over.id as TaskStatus;
    if (task && task.status !== newStatus) {
      onUpdateTask(task.id, { status: newStatus });
    }
  };

  const cardHandlers: CardHandlers = {
    onDelete: onDeleteTask,
    onEdit: onEditTask,
    onStatusChange: handleStatusChange,
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveTask(null)}
    >
      <div className="flex h-full gap-6 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory">
        {columns.map((column, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={column.id}
            className="flex-shrink-0 w-80 snap-center rounded-2xl bg-black/20 backdrop-blur-xl border border-white/5 flex flex-col shadow-xl"
          >
            <div className={`p-5 flex items-center justify-between sticky top-0 z-10 bg-white/5 backdrop-blur-md rounded-t-2xl border-b border-white/5 ${column.color} border-t-2`}>
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${column.dot} shadow-[0_0_10px_currentColor] opacity-80`} />
                <h3 className="font-bold text-white tracking-wide">{column.title}</h3>
              </div>
              <span className="text-xs font-bold text-white/40 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                {getTasksByStatus(column.id).length}
              </span>
            </div>

            <ScrollArea className="flex-1 p-4">
              <DroppableColumn
                column={column}
                tasks={getTasksByStatus(column.id)}
                handlers={cardHandlers}
              />
            </ScrollArea>
          </motion.div>
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="cursor-grabbing rotate-3 w-72">
            <TaskCard
              task={activeTask}
              viewMode="board"
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onStatusChange={handleStatusChange}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
