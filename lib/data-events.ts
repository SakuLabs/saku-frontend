// Tiny in-app pub/sub so isolated hook instances can stay in sync.
//
// The AI agent (useAgent) creates tasks/schedules on the backend directly,
// but the task/schedule lists live in separate hook instances that would
// otherwise only know about their own mutations. After an agent action,
// useAgent emits the affected domain here and the lists refetch — no page
// reload needed.

export type DataDomain = 'tasks' | 'schedules';

type Listener = (domain: DataDomain) => void;

const listeners = new Set<Listener>();

/** Subscribe to data-change events. Returns an unsubscribe function. */
export function onDataChange(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Notify all subscribers that a domain's data changed and should refetch. */
export function emitDataChange(domain: DataDomain): void {
  listeners.forEach((listener) => listener(domain));
}
