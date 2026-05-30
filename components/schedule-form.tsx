'use client';

import { useState } from 'react';
import type {
  CreateScheduleRequest,
  ScheduleType,
  ScheduleColor,
  ScheduleImportance,
} from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ScheduleFormProps {
  onSubmit: (data: CreateScheduleRequest) => void;
  onClose: () => void;
  defaultDate?: Date;
}

const types: { value: ScheduleType; label: string }[] = [
  { value: 'EVENT', label: 'Event' },
  { value: 'MEETING', label: 'Meeting' },
  { value: 'TASK_REMINDER', label: 'Reminder' },
];

const importances: { value: ScheduleImportance; label: string }[] = [
  { value: 'LOW', label: 'Low' },
  { value: 'NORMAL', label: 'Normal' },
  { value: 'HIGH', label: 'High' },
];

const colors: { value: ScheduleColor; swatch: string }[] = [
  { value: 'blue', swatch: 'bg-blue-500' },
  { value: 'green', swatch: 'bg-green-500' },
  { value: 'orange', swatch: 'bg-orange-500' },
  { value: 'red', swatch: 'bg-red-500' },
  { value: 'purple', swatch: 'bg-purple-500' },
];

// Round `date` to the next hour and format for a datetime-local input (local tz).
function toLocalInput(date: Date): string {
  const d = new Date(date);
  d.setMinutes(0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function ScheduleForm({ onSubmit, onClose, defaultDate }: ScheduleFormProps) {
  const base = defaultDate ?? new Date();
  const startDefault = toLocalInput(new Date(base.getTime() + 60 * 60 * 1000));
  const endDefault = toLocalInput(new Date(base.getTime() + 2 * 60 * 60 * 1000));

  const [title, setTitle] = useState('');
  const [start, setStart] = useState(startDefault);
  const [end, setEnd] = useState(endDefault);
  const [type, setType] = useState<ScheduleType>('EVENT');
  const [color, setColor] = useState<ScheduleColor>('blue');
  const [importance, setImportance] = useState<ScheduleImportance>('NORMAL');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 3) {
      setError('Title must be at least 3 characters.');
      return;
    }
    const startTime = new Date(start);
    const endTime = new Date(end);
    if (!(startTime < endTime)) {
      setError('Start time must be before end time.');
      return;
    }

    onSubmit({
      title: title.trim(),
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      type,
      color,
      importance,
      description: description.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="schedule-title">Title</Label>
        <Input
          id="schedule-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Calculus Lecture"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="schedule-start">Starts</Label>
          <Input
            id="schedule-start"
            type="datetime-local"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="schedule-end">Ends</Label>
          <Input
            id="schedule-end"
            type="datetime-local"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="schedule-type">Type</Label>
          <Select value={type} onValueChange={(v) => setType(v as ScheduleType)}>
            <SelectTrigger id="schedule-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {types.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="schedule-importance">Importance</Label>
          <Select
            value={importance}
            onValueChange={(v) => setImportance(v as ScheduleImportance)}
          >
            <SelectTrigger id="schedule-importance">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {importances.map((i) => (
                <SelectItem key={i.value} value={i.value}>
                  {i.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex gap-2">
          {colors.map((c) => (
            <button
              key={c.value}
              type="button"
              aria-label={c.value}
              aria-pressed={color === c.value}
              onClick={() => setColor(c.value)}
              className={`h-8 w-8 rounded-full ${c.swatch} transition-transform ${
                color === c.value
                  ? 'ring-2 ring-offset-2 ring-offset-background ring-foreground scale-110'
                  : 'opacity-60 hover:opacity-100'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="schedule-description">Description</Label>
        <Textarea
          id="schedule-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional details..."
          className="resize-none min-h-[80px]"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Create Event</Button>
      </div>
    </form>
  );
}
