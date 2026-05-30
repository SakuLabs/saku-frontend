'use client';

import { useAuth } from '@/hooks/use-auth';
import { ChatSystem } from '@/components/chat-system';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function ChatPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // Optional: Redirect to login if not authenticated
      // router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex flex-col items-center gap-4 relative z-10">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="glass-panel p-8 rounded-3xl flex flex-col items-center gap-6 text-center relative z-10 max-w-md mx-4">
          <h2 className="text-2xl font-bold text-white">Authentication Required</h2>
          <p className="text-white/60">Please log in to access the chat and connect with your study groups.</p>
          <Button onClick={() => router.push('/login')} className="glass-button w-full">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Ambient Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="relative z-10">
        <ChatSystem userId={user.id} userCode={user.userCode} userName={user.name} />
      </div>
    </div>
  );
}