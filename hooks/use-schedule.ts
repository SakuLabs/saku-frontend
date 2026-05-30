import { useState, useCallback, useEffect } from 'react';
import { apiClient, getToken } from '@/lib/api-client';
import { API_CONFIG } from '@/lib/api-config';
import type { Schedule, CreateScheduleRequest, UpdateScheduleRequest, CheckConflictsRequest, ConflictCheckResponse } from '@/lib/types';

interface UseScheduleReturn {
  schedules: Schedule[];
  loading: boolean;
  error: string | null;
  createSchedule: (scheduleData: CreateScheduleRequest) => Promise<Schedule | null>;
  updateSchedule: (id: string, updates: UpdateScheduleRequest) => Promise<Schedule | null>;
  deleteSchedule: (id: string) => Promise<boolean>;
  checkConflicts: (request: CheckConflictsRequest) => Promise<ConflictCheckResponse | null>;
  refreshSchedules: () => Promise<void>;
}

export function useSchedule(): UseScheduleReturn {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshSchedules = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setError('Not authenticated');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<Schedule[]>(API_CONFIG.ENDPOINTS.SCHEDULES.GET_ALL);
      setSchedules(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSchedules();
  }, [refreshSchedules]);

  const createSchedule = useCallback(async (scheduleData: CreateScheduleRequest) => {
    try {
      const newSchedule = await apiClient.post<Schedule>(
        API_CONFIG.ENDPOINTS.SCHEDULES.CREATE,
        scheduleData
      );
      setSchedules(prev => [...prev, newSchedule]);
      return newSchedule;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  }, []);

  const updateSchedule = useCallback(async (id: string, updates: UpdateScheduleRequest) => {
    try {
      const updated = await apiClient.patch<Schedule>(
        API_CONFIG.ENDPOINTS.SCHEDULES.UPDATE(id),
        updates
      );
      
      // If the schedule was deleted (progress >= 100), remove it from the list
      if ((updated as any).deleted) {
        setSchedules(prev => prev.filter(s => s.id !== id));
        return updated as any;
      }
      
      setSchedules(prev => prev.map(s => s.id === id ? updated : s));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  }, []);

  const deleteSchedule = useCallback(async (id: string) => {
    try {
      await apiClient.delete<{ message: string }>(API_CONFIG.ENDPOINTS.SCHEDULES.DELETE(id));
      setSchedules(prev => prev.filter(s => s.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  }, []);

  const checkConflicts = useCallback(async (request: CheckConflictsRequest) => {
    try {
      const result = await apiClient.post<ConflictCheckResponse>(
        API_CONFIG.ENDPOINTS.SCHEDULES.CHECK_CONFLICTS,
        request
      );
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  }, []);

  return { schedules, loading, error, createSchedule, updateSchedule, deleteSchedule, checkConflicts, refreshSchedules };
}
