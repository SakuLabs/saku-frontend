"use client";

import { useAuth } from "@/hooks/use-auth";
import { useTasks } from "@/hooks/use-tasks";
import { useSchedule } from "@/hooks/use-schedule";
import { useSocial } from "@/hooks/use-social";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
  Calendar as CalendarIcon,
  ArrowRight,
  Sparkles,
  AlertCircle,
  LayoutDashboard,
  Target,
  Zap,
  MoreHorizontal,
  Settings,
} from "lucide-react";
import { useMemo } from "react";
import {
  format,
  isToday,
  isTomorrow,
  isPast,
  parseISO,
  differenceInHours,
} from "date-fns";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import {
  RadialBar,
  RadialBarChart,
  Label,
  PolarRadiusAxis,
  PolarGrid,
  PolarAngleAxis,
} from "recharts";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";

export default function DashboardPage() {
  const { user } = useAuth();
  const { tasks, loading: tasksLoading } = useTasks();
  const { schedules, loading: schedulesLoading } = useSchedule();
  const { groups } = useSocial();
  const reduceMotion = useReducedMotion();

  // Calculate stats
  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "DONE").length;
    const inProgressTasks = tasks.filter(
      (t) => t.status === "IN_PROGRESS",
    ).length;
    const todoTasks = tasks.filter((t) => t.status === "TODO").length;

    const todaySchedules = schedules.filter((s) =>
      isToday(parseISO(s.startTime)),
    );
    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      todaySchedules: todaySchedules.length,
      completionRate,
    };
  }, [tasks, schedules]);

  // Chart Data for Radial Bar (Completion)
  const chartData = useMemo(
    () => [{ name: "completion", rate: stats.completionRate }],
    [stats.completionRate],
  );

  const chartConfig = {
    rate: { label: "Completion" },
  } satisfies ChartConfig;

  // Get today's schedule
  const todaySchedule = useMemo(() => {
    return schedules
      .filter((s) => isToday(parseISO(s.startTime)))
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      )
      .slice(0, 3);
  }, [schedules]);

  // Get urgent tasks
  const urgentTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        if (!t.dueDate || t.status === "DONE") return false;
        const dueDate = parseISO(t.dueDate);
        const hoursUntilDue = differenceInHours(dueDate, new Date());
        return hoursUntilDue <= 72 && hoursUntilDue >= 0;
      })
      .sort(
        (a, b) =>
          new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime(),
      )
      .slice(0, 3);
  }, [tasks]);

  // Get upcoming events beyond today (next few days)
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return schedules
      .filter((s) => {
        const start = parseISO(s.startTime);
        return start > now && !isToday(start);
      })
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      )
      .slice(0, 4);
  }, [schedules]);

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: reduceMotion ? 0 : 0.08 },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  };

  if (tasksLoading || schedulesLoading) {
    return (
      <div className="space-y-8" aria-busy="true" aria-label="Loading workspace">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <Skeleton className="h-4 w-28 bg-white/10" />
            <Skeleton className="h-12 w-72 max-w-full bg-white/10" />
            <Skeleton className="h-5 w-80 max-w-full bg-white/10" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-24 rounded-2xl bg-white/10" />
            <Skeleton className="h-14 w-14 rounded-full bg-white/10" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-36 rounded-[2rem] bg-white/5" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-7">
          <Skeleton className="h-80 rounded-[2.5rem] bg-white/5 lg:col-span-3" />
          <Skeleton className="h-80 rounded-[2.5rem] bg-white/5 lg:col-span-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      {/* Ambient Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between relative z-10">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-white/60 text-sm font-medium uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span>Online Status</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white drop-shadow-lg min-h-[60px] flex items-center flex-wrap gap-x-2">
            <TypewriterEffect
              words={[
                "Hi,",
                "您好,",
                "Bonjour,",
                "Ciao,",
                "こんにちは,",
                "Hola,",
                "Guten Tag,",
                "Namaste,",
              ]}
              className="text-white"
              cursorClassName="bg-blue-400"
            />
            <span className="text-blue-300">
              {user?.name?.split(" ")[0] || "there"}!
            </span>
          </h1>
          <p className="text-white/70 max-w-lg text-lg font-light leading-relaxed">
            You have{" "}
            <span className="font-semibold text-white">
              {stats.inProgressTasks} active tasks
            </span>{" "}
            and{" "}
            <span className="font-semibold text-white">
              {stats.todaySchedules} events
            </span>{" "}
            scheduled for today.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="glass-panel px-4 py-2 rounded-2xl flex flex-col items-end">
            <span className="text-xs text-white/50 font-medium uppercase tracking-wider">
              {format(new Date(), "EEEE")}
            </span>
            <span className="text-2xl font-bold text-white">
              {format(new Date(), "d MMM")}
            </span>
          </div>
          <Link
            href="/settings"
            aria-label="Account settings"
            className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            <Avatar className="h-14 w-14 border-2 border-white/20 shadow-xl ring-2 ring-white/10 transition-transform hover:scale-105">
              <AvatarImage src={user?.avatarUrl} />
              <AvatarFallback className="bg-black/40 backdrop-blur-md text-white">
                {user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 relative z-10"
      >
        <motion.div variants={item}>
          <div className="glass-card rounded-[2rem] p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
              <Target className="h-6 w-6 text-blue-300" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-white/60 uppercase tracking-wide">
                Total Tasks
              </p>
              <div className="text-4xl font-bold text-white tracking-tight">
                {stats.totalTasks}
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-400 transition-[width] duration-500"
                  style={{
                    width: `${
                      stats.totalTasks > 0
                        ? (stats.todoTasks / stats.totalTasks) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
              <span className="text-xs text-blue-300 font-medium whitespace-nowrap">
                {stats.todoTasks} left
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item}>
          <div className="glass-card rounded-[2rem] p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
              <CheckCircle2 className="h-6 w-6 text-green-300" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-white/60 uppercase tracking-wide">
                Completed
              </p>
              <div className="text-4xl font-bold text-white tracking-tight">
                {stats.completedTasks}
              </div>
            </div>
            <div className="mt-4 flex items-center text-green-300 text-xs font-medium gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>{stats.completionRate}% completion rate</span>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item}>
          <div className="glass-card rounded-[2rem] p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
              <Zap className="h-6 w-6 text-amber-300" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-white/60 uppercase tracking-wide">
                In Progress
              </p>
              <div className="text-4xl font-bold text-white tracking-tight">
                {stats.inProgressTasks}
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 transition-[width] duration-500"
                  style={{
                    width: `${
                      stats.totalTasks > 0
                        ? (stats.inProgressTasks / stats.totalTasks) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
              <span className="text-xs text-amber-300 font-medium whitespace-nowrap">
                of {stats.totalTasks}
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item}>
          <div className="glass-card rounded-[2rem] p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
              <Users className="h-6 w-6 text-purple-300" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-white/60 uppercase tracking-wide">
                Study Groups
              </p>
              <div className="text-4xl font-bold text-white tracking-tight">
                {groups.length}
              </div>
            </div>
            <div className="mt-4">
              <Link
                href="/chat"
                className="text-xs text-purple-300 hover:text-purple-200 flex items-center gap-1 font-medium transition-colors"
              >
                Open Hub <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 relative z-10">
        {/* Progress Chart */}
        <motion.div
          className="col-span-4 lg:col-span-3 h-full"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="glass-panel rounded-[2.5rem] p-6 h-full flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Productivity Pulse
              </h3>
              <p className="text-sm text-white/50">Your daily task momentum</p>
            </div>

            <div className="flex-1 flex items-center justify-center py-4">
              <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square w-full max-w-[250px]"
              >
                <RadialBarChart
                  data={chartData}
                  startAngle={-90}
                  endAngle={270}
                  innerRadius={80}
                  outerRadius={110}
                >
                  <PolarGrid
                    gridType="circle"
                    radialLines={false}
                    stroke="none"
                    className="first:fill-white/5 last:fill-transparent"
                    polarRadius={[86, 74]}
                  />
                  <PolarAngleAxis
                    type="number"
                    domain={[0, 100]}
                    dataKey="rate"
                    tick={false}
                  />
                  <RadialBar
                    dataKey="rate"
                    background={{ fill: "rgba(255, 255, 255, 0.05)" }}
                    cornerRadius={10}
                    fill="url(#productivity-gradient)"
                  />
                  <defs>
                    <linearGradient id="productivity-gradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#818cf8" />
                      <stop offset="100%" stopColor="#c084fc" />
                    </linearGradient>
                  </defs>
                  <PolarRadiusAxis
                    tick={false}
                    tickLine={false}
                    axisLine={false}
                  >
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-white text-4xl font-bold"
                              >
                                {stats.completionRate}%
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 24}
                                className="fill-white/50 text-xs uppercase tracking-widest"
                              >
                                Efficiency
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </PolarRadiusAxis>
                </RadialBarChart>
              </ChartContainer>
            </div>

            <div className="text-center">
              <p className="text-sm text-white/70">
                You've completed{" "}
                <span className="text-white font-bold">
                  {stats.completedTasks}
                </span>{" "}
                tasks today. Keep it up!
              </p>
            </div>
          </div>
        </motion.div>

        {/* Today's Schedule */}
        <motion.div
          className="col-span-4 h-full"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="glass-panel rounded-[2.5rem] p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-pink-300" />
                  Today's Flow
                </h3>
                <p className="text-sm text-white/50">Upcoming events</p>
              </div>
              <Link href="/scheduler">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white/50 hover:text-white hover:bg-white/10 rounded-full"
                >
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>

            <div className="space-y-3 flex-1">
              {todaySchedule.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-white/60 space-y-4">
                  <div className="p-4 rounded-full bg-white/5 border border-white/5">
                    <Sparkles className="h-8 w-8 opacity-50" />
                  </div>
                  <p>No events today. Enjoy your free time!</p>
                </div>
              ) : (
                todaySchedule.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="group flex items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-4 transition-colors hover:bg-white/10 hover:border-white/10"
                  >
                    <div className="flex flex-col items-center justify-center rounded-xl bg-white/5 p-2 w-16 h-16 shrink-0 backdrop-blur-sm border border-white/5">
                      <span className="text-[10px] font-medium text-white/50 uppercase tracking-wider">
                        {format(parseISO(schedule.startTime), "a")}
                      </span>
                      <span className="text-xl font-bold text-white">
                        {format(parseISO(schedule.startTime), "h:mm")}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white leading-tight truncate text-lg mb-1">
                        {schedule.title}
                      </p>
                      <div className="flex items-center text-xs text-white/50 gap-3">
                        <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full">
                          <Clock className="h-3 w-3" />
                          {format(parseISO(schedule.startTime), "h:mm")} -{" "}
                          {format(parseISO(schedule.endTime), "h:mm")}
                        </span>
                      </div>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-pink-400 shadow-[0_0_10px_rgba(244,114,182,0.5)]" />
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 relative z-10">
        {/* Urgent Tasks */}
        <motion.div
          className="col-span-4 lg:col-span-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="glass-panel rounded-[2.5rem] p-6 h-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-red-500/15 border border-red-500/20">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-0.5 flex items-center gap-2">
                    Priority Focus
                    {urgentTasks.length > 0 && (
                      <span className="text-xs font-bold text-red-300 bg-red-500/15 rounded-full px-2 py-0.5">
                        {urgentTasks.length}
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-white/50">Due in 72 hours</p>
                </div>
              </div>
              <Link href="/tasks">
                <Button
                  variant="ghost"
                  className="text-xs text-white/50 hover:text-white hover:bg-white/10 rounded-full h-8"
                >
                  View All Tasks
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {urgentTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-white/60">
                  <p>You're clear! No urgent deadlines.</p>
                </div>
              ) : (
                urgentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group"
                  >
                    <div
                      className={`h-3 w-3 rounded-full shadow-lg ${task.priority === "HIGH" ? "bg-red-500 shadow-red-500/50" : "bg-amber-500 shadow-amber-500/50"}`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">
                        {task.title}
                      </p>
                      <p className="text-xs text-white/60 mt-0.5">
                        Due {format(parseISO(task.dueDate!), "MMM d, h:mm a")}
                      </p>
                    </div>
                    {task.progress > 0 && (
                      <div className="w-24 text-right hidden sm:block">
                        <span className="text-xs font-bold text-white/60">
                          {task.progress}%
                        </span>
                        <Progress
                          value={task.progress}
                          className="h-1.5 mt-1 bg-white/10"
                          indicatorClassName="bg-white/80"
                        />
                      </div>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-full text-white/50 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>

        {/* Upcoming Events */}
        <motion.div
          className="col-span-4 lg:col-span-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="glass-panel rounded-[2.5rem] p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-500/15 border border-indigo-500/20">
                  <CalendarIcon className="h-5 w-5 text-indigo-300" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-0.5">
                    Upcoming
                  </h3>
                  <p className="text-sm text-white/50">Next few days</p>
                </div>
              </div>
              <Link href="/scheduler">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white/50 hover:text-white hover:bg-white/10 rounded-full"
                >
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>

            <div className="space-y-3 flex-1">
              {upcomingEvents.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-white/60 gap-3">
                  <div className="p-4 rounded-full bg-white/5 border border-white/5">
                    <CalendarIcon className="h-7 w-7 opacity-50" />
                  </div>
                  <p className="text-sm">Nothing scheduled ahead.</p>
                </div>
              ) : (
                upcomingEvents.map((event) => {
                  const start = parseISO(event.startTime);
                  const dayLabel = isTomorrow(start)
                    ? "Tomorrow"
                    : format(start, "EEEE");
                  return (
                    <div
                      key={event.id}
                      className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 p-3 transition-colors hover:bg-white/10"
                    >
                      <div className="flex w-14 shrink-0 flex-col items-center rounded-xl border border-white/5 bg-white/5 py-1.5">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-white/50">
                          {format(start, "MMM")}
                        </span>
                        <span className="text-lg font-bold leading-none text-white">
                          {format(start, "d")}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-white">
                          {event.title}
                        </p>
                        <p className="mt-0.5 text-xs text-white/50">
                          {dayLabel} · {format(start, "h:mm a")}
                        </p>
                      </div>
                      <div className="h-2 w-2 rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.5)]" />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10 pb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        {[
          { href: "/tasks", label: "Tasks", icon: LayoutDashboard, tint: "bg-blue-500/20 group-hover:bg-blue-500/30", color: "text-blue-300" },
          { href: "/scheduler", label: "Calendar", icon: CalendarIcon, tint: "bg-pink-500/20 group-hover:bg-pink-500/30", color: "text-pink-300" },
          { href: "/chat", label: "Groups", icon: Users, tint: "bg-purple-500/20 group-hover:bg-purple-500/30", color: "text-purple-300" },
          { href: "/settings", label: "Settings", icon: Settings, tint: "bg-white/10 group-hover:bg-white/20", color: "text-white/70" },
        ].map(({ href, label, icon: Icon, tint, color }) => (
          <Link key={href} href={href}>
            <div className="glass-panel rounded-[2rem] p-4 h-28 flex flex-col items-center justify-center gap-3 hover:bg-white/10 hover:scale-[1.02] transition-all cursor-pointer group">
              <div className={`p-3 rounded-full transition-colors ${tint}`}>
                <Icon className={`h-6 w-6 ${color}`} />
              </div>
              <span className="text-sm font-medium text-white/80">{label}</span>
            </div>
          </Link>
        ))}
      </motion.div>
    </div>
  );
}
