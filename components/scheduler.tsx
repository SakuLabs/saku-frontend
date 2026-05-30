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
import type { CreateScheduleRequest } from '@/lib/types';
import { format, isSameDay } from 'date-fns';
import { Calendar as CalendarIcon, Clock, LayoutList, ListTodo, Plus } from 'lucide-react';

interface SchedulerProps {
  userId: string;
}

export function Scheduler({ userId }: SchedulerProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { tasks } = useTasks();
  const { schedules, createSchedule, error: scheduleError } = useSchedule();
  const [activeView, setActiveView] = useState<'calendar' | 'daily' | 'timeline'>('calendar');
  const [createOpen, setCreateOpen] = useState(false);

  const handleCreateSchedule = async (data: CreateScheduleRequest) => {
    const created = await createSchedule(data);
    if (created) setCreateOpen(false);
  };

  const upcomingDeadlines = tasks
    .filter(t => t.dueDate && new Date(t.dueDate) >= new Date())
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5);

  const todaysTasks = tasks.filter(t => t.dueDate && isSameDay(new Date(t.dueDate), new Date()));

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col gap-6 p-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Schedule</h2>
          <p className="text-muted-foreground">Manage your time and upcoming assignments.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)} className="w-full md:w-auto">
            <TabsList className="grid w-full grid-cols-3 md:w-[360px]">
              <TabsTrigger value="calendar" className="gap-2">
                <CalendarIcon className="w-4 h-4" /> Calendar
              </TabsTrigger>
              <TabsTrigger value="daily" className="gap-2">
                <Clock className="w-4 h-4" /> Daily
              </TabsTrigger>
              <TabsTrigger value="timeline" className="gap-2">
                <LayoutList className="w-4 h-4" /> Timeline
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-0">
        {/* Main Content Area */}
        <div className="lg:col-span-8 flex flex-col gap-4 min-h-0">
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
                  <CardContent className="p-6">
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
                  <div className="p-6 h-full overflow-y-auto">
                    <DailySchedule slots={schedules.map(s => ({
                      id: s.id,
                      title: s.title,
                      start_time: s.startTime,
                      end_time: s.endTime,
                      type: 'schedule' as const
                    }))} date={selectedDate} />
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
        <div className="lg:col-span-4 flex flex-col gap-6 min-h-0">
          {/* Today's Focus */}
          <Card className="flex-1 min-h-0 flex flex-col border-none shadow-md bg-gradient-to-br from-card to-muted/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-primary" />
                Up Next
              </CardTitle>
              <CardDescription>Deadlines approaching soon</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full px-6 pb-6">
                <div className="space-y-4">
                  {upcomingDeadlines.length > 0 ? (
                    upcomingDeadlines.map((task, i) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="group flex flex-col gap-2 p-3 rounded-lg border bg-background/50 hover:bg-background hover:shadow-sm transition-all"
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-medium line-clamp-1">{task.title}</span>
                          <Badge variant={task.priority === 'HIGH' ? 'destructive' : 'secondary'} className="text-[10px] px-1.5 py-0 h-5">
                            {task.priority}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span>{task.description || 'General'}</span>
                          <span className={isSameDay(new Date(task.dueDate!), new Date()) ? 'text-orange-500 font-medium' : ''}>
                            {format(new Date(task.dueDate!), 'MMM d, h:mm a')}
                          </span>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>No upcoming deadlines.</p>
                      <p className="text-xs mt-1">Time to relax!</p>
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
