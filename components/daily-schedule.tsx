'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ScheduleColor, ScheduleImportance, ScheduleType } from '@/lib/types';

export interface DailyScheduleItem {
  id: string;
  title: string;
  /** ISO datetime strings */
  start: string;
  end: string;
  type?: ScheduleType;
  color?: ScheduleColor;
  importance?: ScheduleImportance;
}

interface DailyScheduleProps {
  slots: DailyScheduleItem[];
  date: Date;
  onDeleteSlot?: (id: string) => void;
  onPrevDay?: () => void;
  onNextDay?: () => void;
  onToday?: () => void;
}

const HOUR_HEIGHT = 60; // px per hour
const GUTTER_PX = 56; // time-label column width

const COLOR_STYLES: Record<ScheduleColor, string> = {
  purple: 'bg-purple-500/15 border-purple-500/30 text-purple-700 dark:text-purple-200',
  blue: 'bg-blue-500/15 border-blue-500/30 text-blue-700 dark:text-blue-200',
  green: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-200',
  orange: 'bg-orange-500/15 border-orange-500/30 text-orange-700 dark:text-orange-200',
  red: 'bg-red-500/15 border-red-500/30 text-red-700 dark:text-red-200',
};

const minutesOf = (iso: string) => {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
};

const fmtHour = (h: number) => {
  const hour = ((h + 11) % 12) + 1;
  return `${hour} ${h < 12 ? 'AM' : 'PM'}`;
};

interface PositionedItem extends DailyScheduleItem {
  startMin: number;
  endMin: number;
  lane: number;
  lanes: number;
}

// Greedy overlap layout: events sharing time get side-by-side lanes instead
// of stacking on top of each other.
function layout(items: DailyScheduleItem[]): PositionedItem[] {
  const sorted = items
    .map((it) => ({ ...it, startMin: minutesOf(it.start), endMin: minutesOf(it.end) }))
    .sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin);

  const positioned: PositionedItem[] = [];
  let cluster: PositionedItem[] = [];
  let clusterMaxEnd = -1;
  let laneEnds: number[] = [];

  const flush = () => {
    const lanes = cluster.reduce((m, c) => Math.max(m, c.lane + 1), 1);
    cluster.forEach((c) => positioned.push({ ...c, lanes }));
    cluster = [];
    laneEnds = [];
    clusterMaxEnd = -1;
  };

  for (const it of sorted) {
    if (cluster.length && it.startMin >= clusterMaxEnd) flush();
    let lane = laneEnds.findIndex((end) => end <= it.startMin);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(it.endMin);
    } else {
      laneEnds[lane] = it.endMin;
    }
    cluster.push({ ...it, lane, lanes: 0 });
    clusterMaxEnd = Math.max(clusterMaxEnd, it.endMin);
  }
  if (cluster.length) flush();
  return positioned;
}

export function DailySchedule({ slots, date, onDeleteSlot, onPrevDay, onNextDay, onToday }: DailyScheduleProps) {
  const isToday = isSameDay(date, new Date());
  const scrollRef = useRef<HTMLDivElement>(null);
  const [nowMin, setNowMin] = useState(() => {
    const n = new Date();
    return n.getHours() * 60 + n.getMinutes();
  });

  useEffect(() => {
    if (!isToday) return;
    const id = setInterval(() => {
      const n = new Date();
      setNowMin(n.getHours() * 60 + n.getMinutes());
    }, 60_000);
    return () => clearInterval(id);
  }, [isToday]);

  const positioned = useMemo(() => layout(slots), [slots]);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const gridHeight = 24 * HOUR_HEIGHT;
  const yOf = (min: number) => (min / 60) * HOUR_HEIGHT;

  // Auto-scroll to the first event (or now) when the day/data changes.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const firstStart = positioned.length
      ? Math.min(...positioned.map((p) => p.startMin))
      : null;
    const target = firstStart ?? (isToday ? nowMin : 8 * 60);
    el.scrollTop = Math.max(0, yOf(target) - HOUR_HEIGHT);
    // run on date / dataset identity changes only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, slots.length]);

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {onPrevDay && (
            <button
              onClick={onPrevDay}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Previous day"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          {onNextDay && (
            <button
              onClick={onNextDay}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Next day"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
          <h3 className="font-semibold text-foreground text-lg truncate">{format(date, 'EEEE, MMMM d')}</h3>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {onToday && !isToday && (
            <button
              onClick={onToday}
              className="rounded-md border px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Today
            </button>
          )}
          <span className="text-xs text-muted-foreground">
            {slots.length} {slots.length === 1 ? 'event' : 'events'}
          </span>
        </div>
      </div>

      {/* Scrollable grid */}
      <div ref={scrollRef} className="relative flex-1 min-h-0 overflow-y-auto">
        <div className="relative" style={{ height: gridHeight }}>
          {/* Hour rows + labels */}
          {hours.map((hour) => (
            <div
              key={hour}
              className="absolute left-0 right-0 flex"
              style={{ top: yOf(hour * 60), height: HOUR_HEIGHT }}
            >
              <div
                className="shrink-0 -translate-y-2 pr-3 text-right"
                style={{ width: GUTTER_PX }}
              >
                <span className="text-[11px] font-medium text-muted-foreground tabular-nums">
                  {fmtHour(hour)}
                </span>
              </div>
              <div className="flex-1 border-t border-border/40" />
            </div>
          ))}

          {/* Now line */}
          {isToday && (
            <div
              className="absolute right-0 z-20 flex items-center pointer-events-none"
              style={{ top: yOf(nowMin), left: GUTTER_PX }}
            >
              <div className="h-2 w-2 -ml-1 rounded-full bg-red-500 shadow-[0_0_0_3px] shadow-red-500/20" />
              <div className="h-px flex-1 bg-red-500/70" />
            </div>
          )}

          {/* Events column */}
          <div className="absolute inset-y-0 right-0" style={{ left: GUTTER_PX }}>
            <AnimatePresence>
              {positioned.map((p, idx) => {
                const top = yOf(p.startMin);
                const height = Math.max(((p.endMin - p.startMin) / 60) * HOUR_HEIGHT, 28);
                const widthPct = 100 / p.lanes;
                const compact = height < 50;
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ delay: idx * 0.03, type: 'spring', stiffness: 220, damping: 22 }}
                    style={{
                      top,
                      height,
                      left: `calc(${p.lane * widthPct}% + ${p.lane === 0 ? 4 : 2}px)`,
                      width: `calc(${widthPct}% - 6px)`,
                    }}
                    className={cn(
                      'group absolute overflow-hidden rounded-lg border px-2.5 shadow-sm transition-shadow hover:shadow-md z-10',
                      compact ? 'py-0.5' : 'py-1.5',
                      COLOR_STYLES[p.color ?? 'purple'],
                    )}
                  >
                    {p.importance === 'HIGH' && (
                      <span className="absolute left-0 top-0 bottom-0 w-1 bg-current opacity-60" />
                    )}
                    <div className="flex items-start justify-between gap-1 h-full">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-[13px] leading-tight truncate">{p.title}</p>
                        {!compact && (
                          <p className="mt-0.5 flex items-center gap-1 text-[11px] opacity-75">
                            <Clock className="h-3 w-3 shrink-0" />
                            <span className="truncate">
                              {format(new Date(p.start), 'h:mm a')} – {format(new Date(p.end), 'h:mm a')}
                            </span>
                          </p>
                        )}
                      </div>
                      {onDeleteSlot && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSlot(p.id);
                          }}
                          className="shrink-0 rounded-full p-0.5 opacity-0 transition-opacity hover:bg-black/10 group-hover:opacity-100"
                          aria-label="Delete event"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {slots.length === 0 && (
          <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center">
            <p className="text-sm text-muted-foreground">No events scheduled for this day.</p>
          </div>
        )}
      </div>
    </div>
  );
}
