import { useState, useCallback, useEffect } from 'react';
import { apiClient, getToken } from '@/lib/api-client';
import { API_CONFIG } from '@/lib/api-config';
import type { Task, TaskStatus, RawTask, CreateTaskRequest, UpdateTaskStatusRequest, UpdateTaskProgressRequest } from '@/lib/types';
import { normalizeTask } from '@/lib/types';

// Re-export Task type for components that need it
export type { Task };

interface UseTasksReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  createTask: (taskData: CreateTaskRequest) => Promise<Task | null>;
  updateStatus: (id: string, status: TaskStatus) => Promise<Task | null>;
  updateProgress: (id: string, progress: number) => Promise<Task | null>;
  deleteTask: (id: string) => Promise<boolean>;
  refreshTasks: () => Promise<void>;
}

export function useTasks(): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshTasks = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setError('Not authenticated');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<RawTask[]>(API_CONFIG.ENDPOINTS.TASKS.GET_ALL);
      setTasks(data.map(normalizeTask));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshTasks();
  }, [refreshTasks]);

  const createTask = useCallback(async (taskData: CreateTaskRequest) => {
    try {
      const raw = await apiClient.post<RawTask>(API_CONFIG.ENDPOINTS.TASKS.CREATE, taskData);
      const newTask = normalizeTask(raw);
      setTasks(prev => [...prev, newTask]);
      return newTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  }, []);

  const updateStatus = useCallback(async (id: string, status: TaskStatus) => {
    // Optimistic update: flip status locally first so the board feels instant.
    let previous: Task | undefined;
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        previous = t;
        return { ...t, status };
      }
      return t;
    }));

    try {
      const raw = await apiClient.patch<RawTask>(
        API_CONFIG.ENDPOINTS.TASKS.UPDATE_STATUS(id),
        { status }
      );
      const updated = normalizeTask(raw);
      setTasks(prev => prev.map(t => t.id === id ? updated : t));
      return updated;
    } catch (err) {
      // Roll back to the pre-drag status on failure.
      if (previous) {
        const restored = previous;
        setTasks(prev => prev.map(t => t.id === id ? restored : t));
      }
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  }, []);

  const updateProgress = useCallback(async (id: string, progress: number) => {
    try {
      const raw = await apiClient.patch<RawTask>(
        API_CONFIG.ENDPOINTS.TASKS.UPDATE_PROGRESS(id),
        { progress }
      );
      const updated = normalizeTask(raw);
      setTasks(prev => prev.map(t => t.id === id ? updated : t));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    try {
      await apiClient.delete<{ message: string }>(API_CONFIG.ENDPOINTS.TASKS.DELETE(id));
      setTasks(prev => prev.filter(t => t.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  }, []);

  return { tasks, loading, error, createTask, updateStatus, updateProgress, deleteTask, refreshTasks };
}
