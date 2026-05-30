'use client';

import { useState, useEffect } from 'react';
import { Scheduler } from '@/components/scheduler';
import { Loader2 } from 'lucide-react';

export default function SchedulerPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize or get user ID - for demo purposes, we'll use a fixed ID
    const demoUserId = 'user_demo_' + Math.random().toString(36).substr(2, 9);
    setUserId(demoUserId);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] hidden sm:block pointer-events-none" />
        <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px] hidden sm:block pointer-events-none" />
        
        <div className="flex flex-col items-center gap-4 relative z-10">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading scheduler...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative min-h-screen">
      {/* Ambient Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] hidden sm:block pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px] hidden sm:block pointer-events-none" />
      
      <div className="relative z-10">
        {userId && <Scheduler userId={userId} />}
      </div>
    </div>
  );
}
