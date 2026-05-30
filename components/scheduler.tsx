'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTasks } from '@/hooks/use-tasks';
import { useSchedule } from '@/hooks/use-schedule';
import { CalendarView } from '@/components/calendar-view';
import { DailySchedule } from '@/components/daily-schedule';
import { TimelineView } from '@/components/timeline-view';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScheduleForm } from '@/components/schedule-form';
import type { CreateScheduleRequest, ScheduleColor, TaskPriority } from '@/lib/types';
import { addDays, format, isSameDay } from 'date-fns';
import { Calendar as CalendarIcon, CalendarClock, Clock, LayoutList, ListTodo, Plus } from 'lucide-react';

interface SchedulerProps {
  userId: string;
}

export function Scheduler({ userId }: SchedulerProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { tasks } = useTasks();
  const { schedules, createSchedule, deleteSchedule, error: scheduleError } = useSchedule();
  const [activeView, setActiveView] = useState<'calendar' | 'daily' | 'timeline'>('calendar');
  const [createOpen, setCreateOpen] = useState(false);

  const handleCreateSchedule = async (data: CreateScheduleRequest) => {
    const created = await createSchedule(data);
    if (created) setCreateOpen(false);
  };

  const todaysTasks = tasks.filter(t => t.dueDate && isSameDay(new Date(t.dueDate), new Date()));

  // Unified "Up Next": schedule events + task deadlines, interleaved by time.
  type UpNextItem =
    | { kind: 'event'; id: string; title: string; when: Date; subtitle: string; color: ScheduleColor; high: boolean }
    | { kind: 'deadline'; id: string; title: string; when: Date; subtitle: string; priority: TaskPriority; high: boolean };

  const now = new Date();
  const eventItems: UpNextItem[] = schedules
    .filter(s => new Date(s.endTime) >= now)
    .map(s => ({
      kind: 'event',
      id: s.id,
      title: s.title,
      when: new Date(s.startTime),
      subtitle: s.type === 'MEETING' ? 'Meeting' : s.type === 'TASK_REMINDER' ? 'Reminder' : 'Event',
      color: s.color,
      high: s.importance === 'HIGH',
    }));
  const deadlineItems: UpNextItem[] = tasks
    .filter(t => t.dueDate && new Date(t.dueDate) >= now)
    .map(t => ({
      kind: 'deadline',
      id: t.id,
      title: t.title,
      when: new Date(t.dueDate!),
      subtitle: t.description || 'Deadline',
      priority: t.priority,
      high: t.priority === 'HIGH',
    }));
  const upNext = [...eventItems, ...deadlineItems]
    .sort((a, b) => a.when.getTime() - b.when.getTime())
    .slice(0, 8);

  const handleDeleteSchedule = async (id: string) => {
    await deleteSchedule(id);
  };

  return (
    <div className="flex flex-col gap-4 p-4 sm:gap-6 sm:p-6 lg:h-[calc(100vh-4rem)]">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Schedule</h2>
          <p className="text-muted-foreground">Manage your time and upcoming assignments.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)} className="w-full md:w-auto">
            <TabsList className="grid w-full grid-cols-3 md:w-[360px]">
              <TabsTrigger value="calendar" className="gap-1.5 text-xs sm:gap-2 sm:text-sm">
                <CalendarIcon className="w-4 h-4 shrink-0" /> Calendar
              </TabsTrigger>
              <TabsTrigger value="daily" className="gap-1.5 text-xs sm:gap-2 sm:text-sm">
                <Clock className="w-4 h-4 shrink-0" /> Daily
              </TabsTrigger>
              <TabsTrigger value="timeline" className="gap-1.5 text-xs sm:gap-2 sm:text-sm">
                <LayoutList className="w-4 h-4 shrink-0" /> Timeline
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={() => setCreateOpen(true)} className="gap-2 shrink-0">
            <Plus className="w-4 h-4" /> New Event
          </Button>
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>New Event</DialogTitle>
            <DialogDescription>
              Add an event, meeting, or reminder to your schedule.
            </DialogDescription>
          </DialogHeader>
          <ScheduleForm
            defaultDate={selectedDate}
            onSubmit={handleCreateSchedule}
            onClose={() => setCreateOpen(false)}
          />
          {scheduleError && (
            <p className="text-sm text-destructive">{scheduleError}</p>
          )}
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:h-full lg:min-h-0">
        {/* Main Content Area */}
        <div className="lg:col-span-8 flex flex-col gap-4 min-h-0 h-[60vh] lg:h-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeView === 'calendar' && (
                <Card className="h-full border-none shadow-md bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-4 sm:p-6 h-full overflow-y-auto">
                    <CalendarView
                      tasks={tasks}
                      onDateSelect={(date) => {
                        setSelectedDate(date);
                        setActiveView('daily');
                      }}
                      selectedDate={selectedDate}
                    />
                  </CardContent>
                </Card>
              )}

              {activeView === 'daily' && (
                <div className="h-full overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
                  <div className="p-4 sm:p-6 h-full overflow-hidden">
                    <DailySchedule
                      slots={schedules
                        .filter(s => isSameDay(new Date(s.startTime), selectedDate))
                        .map(s => ({
                          id: s.id,
                          title: s.title,
                          start: s.startTime,
                          end: s.endTime,
                          type: s.type,
                          color: s.color,
                          importance: s.importance,
                        }))}
                      date={selectedDate}
                      onDeleteSlot={handleDeleteSchedule}
                      onPrevDay={() => setSelectedDate(d => addDays(d, -1))}
                      onNextDay={() => setSelectedDate(d => addDays(d, 1))}
                      onToday={() => setSelectedDate(new Date())}
                    />
                  </div>
                </div>
              )}

              {activeView === 'timeline' && (
                <Card className="h-full border-none shadow-md bg-card/50 backdrop-blur-sm">
                   <CardHeader>
                    <CardTitle>Project Timeline</CardTitle>
                    <CardDescription>Visual overview of your task durations.</CardDescription>
                  </CardHeader>
                  <CardContent className="h-full overflow-y-auto">
                    <TimelineView tasks={tasks} />
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-4 sm:gap-6 min-h-0">
          {/* Today's Focus */}
          <Card className="h-[420px] lg:h-auto lg:flex-1 min-h-0 flex flex-col border-none shadow-md bg-gradient-to-br from-card to-muted/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-primary" />
                Up Next
              </CardTitle>
              <CardDescription>Deadlines approaching soon</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full px-4 pb-4 sm:px-6 sm:pb-6">
                <div className="space-y-3">
                  {upNext.length > 0 ? (
                    upNext.map((item, i) => (
                      <motion.div
                        key={`${item.kind}-${item.id}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="group flex gap-3 p-3 rounded-lg border bg-background/50 hover:bg-background hover:shadow-sm transition-all"
                      >
                        {/* Kind icon */}
                        <div
                          className={
                            'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md ' +
                            (item.kind === 'event'
                              ? 'bg-primary/10 text-primary'
                              : 'bg-orange-500/10 text-orange-500')
                          }
                        >
                          {item.kind === 'event' ? (
                            <CalendarClock className="h-4 w-4" />
                          ) : (
                            <ListTodo className="h-4 w-4" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-medium line-clamp-1">{item.title}</span>
                            {item.kind === 'deadline' ? (
                              <Badge
                                variant={item.priority === 'HIGH' ? 'destructive' : 'secondary'}
                                className="shrink-0 text-[10px] px-1.5 py-0 h-5"
                              >
                                {item.priority}
                              </Badge>
                            ) : (
                              item.high && (
                                <Badge variant="destructive" className="shrink-0 text-[10px] px-1.5 py-0 h-5">
                                  HIGH
                                </Badge>
                              )
                            )}
                          </div>
                          <div className="mt-1 flex justify-between items-center text-xs text-muted-foreground gap-2">
                            <span className="truncate">{item.subtitle}</span>
                            <span
                              className={
                                'shrink-0 ' +
                                (isSameDay(item.when, new Date()) ? 'text-orange-500 font-medium' : '')
                              }
                            >
                              {format(item.when, 'MMM d, h:mm a')}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>Nothing upcoming.</p>
                      <p className="text-xs mt-1">You&apos;re all caught up!</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Quick Stats or Mini-Widget */}
          <Card className="border-none shadow-sm bg-primary/5">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tasks Due Today</p>
                <p className="text-2xl font-bold">{todaysTasks.length}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <ListTodo className="w-5 h-5 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
