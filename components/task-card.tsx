'use client';

import { motion } from 'framer-motion';
import { Task, TaskPriority } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  CalendarIcon, 
  MoreHorizontal, 
  CheckCircle2, 
  Circle,
  Clock,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { format, isToday, isTomorrow, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Task['status']) => void;
  viewMode?: 'list' | 'board';
}

const priorityConfig: Record<TaskPriority, { color: string; border: string; bg: string; shadow: string }> = {
  LOW: { 
    color: 'text-emerald-400', 
    border: 'border-l-emerald-500', 
    bg: 'bg-emerald-500/20',
    shadow: 'shadow-emerald-500/20'
  },
  MEDIUM: { 
    color: 'text-amber-400', 
    border: 'border-l-amber-500', 
    bg: 'bg-amber-500/20',
    shadow: 'shadow-amber-500/20'
  },
  HIGH: { 
    color: 'text-rose-400', 
    border: 'border-l-rose-500', 
    bg: 'bg-rose-500/20',
    shadow: 'shadow-rose-500/20'
  }
};

export function TaskCard({ task, onEdit, onDelete, onStatusChange, viewMode = 'list' }: TaskCardProps) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';

  const effectivePriority = priorityConfig[task.priority] ? task.priority : 'LOW';
  const priority = priorityConfig[effectivePriority];
  
  const isDone = task.status === 'DONE';

  const CardWrapper = viewMode === 'list' ? motion.div : motion.li;

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d');
  };

  const handleStatusToggle = () => {
    onStatusChange(task.id, isDone ? 'TODO' : 'DONE');
  };

  // Board View (Card Layout)
  if (viewMode === 'board') {
    return (
      <CardWrapper
        layoutId={`${task.id}-${viewMode}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ y: -5, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.5)" }}
        className={cn(
          "group relative mb-4 transition-all duration-300",
          isDone && "opacity-60 grayscale-[0.5]"
        )}
      >
        <div className={cn(
          "flex flex-col rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-lg transition-all duration-300 relative overflow-hidden",
          priority.border.replace('border-l-', 'border-t-[3px]'),
          isDone ? "bg-black/20" : "bg-black/40"
        )}>
           {/* Glass sheen effect */}
           <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

          <div className="p-4 pb-2 flex flex-row items-start justify-between relative z-10">
            <Badge variant="outline" className={cn("text-[10px] font-bold px-2 py-0.5 tracking-wider border-0 backdrop-blur-md", priority.bg, priority.color)}>
              {effectivePriority}
            </Badge>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 text-white/40 hover:text-white hover:bg-white/10 rounded-full">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-panel bg-black/90 text-white border-white/10">
                <DropdownMenuItem onClick={() => onEdit(task)} className="focus:bg-white/10 focus:text-white cursor-pointer">Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange(task.id, 'IN_PROGRESS')} className="focus:bg-white/10 focus:text-white cursor-pointer">Mark In Progress</DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer" onClick={() => onDelete(task.id)}>Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="p-4 pt-2 flex-1 space-y-3 relative z-10">
            <div>
              <div className="flex items-start gap-3">
                <button
                  onClick={handleStatusToggle}
                  className={cn(
                    "mt-0.5 rounded-full transition-all duration-300 hover:bg-white/10 active:scale-95 shadow-lg",
                    isDone ? "text-emerald-400 bg-emerald-500/10" : "text-white/20 hover:text-white hover:bg-white/10"
                  )}
                >
                  {isDone ? <CheckCircle2 className="w-5 h-5 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" /> : <Circle className="w-5 h-5" />}
                </button>
                <h3 className={cn("font-bold text-white leading-tight transition-all", isDone && "line-through text-white/40")}>
                  {task.title}
                </h3>
              </div>
              {task.description && (
                <p className="text-sm text-white/60 mt-2 line-clamp-3 pl-8">
                  {task.description}
                </p>
              )}
            </div>

            {task.status === 'IN_PROGRESS' && (
              <div className="space-y-1.5 pt-2 pl-8">
                <div className="flex justify-between text-[10px] text-white/50 font-medium uppercase tracking-wider">
                  <span>Progress</span>
                  <span>{task.progress}%</span>
                </div>
                <Progress value={task.progress} className="h-1.5 bg-white/10" />
              </div>
            )}
          </div>

          <div className="p-4 pt-0 mt-auto relative z-10">
             <div className="border-t border-white/5 pt-3 flex items-center justify-between w-full text-xs text-white/40">
              <div className={cn(
                "flex items-center gap-1.5 font-medium px-2 py-1 rounded-md transition-colors",
                isOverdue ? "text-red-400 bg-red-500/10" : "bg-white/5"
              )}>
                {isOverdue ? <AlertCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                <span>{task.dueDate ? formatDate(task.dueDate) : 'No date'}</span>
              </div>
              
              {task.userId && (
                 <Avatar className="h-6 w-6 border border-white/10 shadow-sm">
                  <AvatarFallback className="text-[9px] bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold">ME</AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
        </div>
      </CardWrapper>
    );
  }

  // List View
  return (
    <CardWrapper
      layoutId={`${task.id}-${viewMode}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ x: 4, backgroundColor: "rgba(255,255,255,0.03)" }}
      className={cn(
        "group relative mb-3 transition-all duration-300",
        isDone && "opacity-60 grayscale-[0.5]"
      )}
    >
      <div className={cn(
        "flex items-center p-4 gap-4 border-l-4 hover:shadow-xl transition-all duration-300 rounded-xl bg-black/40 backdrop-blur-xl border-white/5 border-y border-r relative overflow-hidden",
        priority.border,
        isDone ? "bg-black/20" : "bg-black/40"
      )}>
        {/* Glass sheen effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Status Checkbox */}
        <button
          onClick={handleStatusToggle}
          className={cn(
            "flex-shrink-0 rounded-full p-1 transition-all duration-300 hover:bg-white/10 active:scale-95 z-10",
            isDone ? "text-emerald-400" : "text-white/20 hover:text-white"
          )}
        >
          {isDone ? <CheckCircle2 className="w-6 h-6 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" /> : <Circle className="w-6 h-6" />}
        </button>

        {/* Main Content */}
        <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center z-10">
          {/* Title & Description */}
          <div className="md:col-span-6">
            <h3 className={cn(
              "font-bold text-white truncate transition-all text-lg",
              isDone && "line-through text-white/40"
            )}>
              {task.title}
            </h3>
            {task.description && (
              <p className="text-xs text-white/50 truncate font-medium">
                {task.description}
              </p>
            )}
          </div>

          {/* Badges & Meta */}
          <div className="md:col-span-4 flex items-center gap-3 text-xs text-white/40">
             <Badge variant="outline" className={cn("text-[10px] px-2 py-0.5 font-bold capitalize border-0 backdrop-blur-sm shadow-sm", priority.bg, priority.color)}>
                {effectivePriority.toLowerCase()}
             </Badge>
             
             {task.dueDate && (
              <div className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-colors",
                isOverdue ? "text-red-400 bg-red-500/10" : "bg-white/5"
              )}>
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>{formatDate(task.dueDate)}</span>
              </div>
             )}
          </div>

           {/* Progress (if active) */}
           {task.status === 'IN_PROGRESS' && (
            <div className="md:col-span-2 w-full">
              <div className="flex justify-between text-[10px] text-white/50 mb-1 font-medium tracking-wider">
                <span>PROGRESS</span>
                <span>{task.progress}%</span>
              </div>
              <Progress value={task.progress} className="h-1.5 bg-white/10" />
            </div>
          )}
        </div>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-white/20 hover:text-white hover:bg-white/10 rounded-full md:opacity-0 md:group-hover:opacity-100 transition-all z-10">
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass-panel bg-black/90 text-white border-white/10">
            <DropdownMenuItem onClick={() => onEdit(task)} className="focus:bg-white/10 focus:text-white cursor-pointer">Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange(task.id, 'IN_PROGRESS')} className="focus:bg-white/10 focus:text-white cursor-pointer">Mark In Progress</DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem 
              className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer"
              onClick={() => onDelete(task.id)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </CardWrapper>
  );
}
