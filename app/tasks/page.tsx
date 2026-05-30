'use client';

import { TaskManagement } from '@/components/task-management';

export default function TasksPage() {
  return (
    <div className="space-y-8 relative min-h-screen">
      {/* Ambient Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] hidden sm:block pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px] hidden sm:block pointer-events-none" />

      <div className="relative z-10 container mx-auto py-6">
        <TaskManagement />
      </div>
    </div>
  );
}