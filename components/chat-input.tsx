'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Paperclip, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ChatInputProps {
  onSend: (message: string) => void;
  onTyping?: () => void;
  isLoading?: boolean;
}

export function ChatInput({ onSend, onTyping, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSend(message);
      setMessage('');
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3 bg-secondary/50 backdrop-blur-md rounded-2xl border border-border/50 shadow-inner">
      <div className="flex gap-1">
        <Button 
            type="button" 
            size="icon" 
            variant="ghost" 
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
            title="Attach File (Not implemented)"
        >
            <Paperclip className="h-5 w-5" />
        </Button>
        <Popover>
          <PopoverTrigger asChild>
             <Button 
                type="button" 
                size="icon" 
                variant="ghost" 
                className="h-9 w-9 text-muted-foreground hover:text-foreground"
                title="Add Emoji (Not implemented)"
            >
                <Smile className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2 text-center text-sm text-muted-foreground">
             Emoji picker coming soon!
          </PopoverContent>
        </Popover>
      </div>

      <Input
        ref={inputRef}
        value={message}
        onChange={(e) => {
          setMessage(e.target.value);
          onTyping?.();
        }}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        disabled={isLoading}
        className="flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-2 h-10 text-base md:text-sm"
        autoComplete="off"
      />
      
      <Button
        type="submit"
        size="icon"
        disabled={!message.trim() || isLoading}
        className={cn(
          'h-10 w-10 rounded-xl transition-all duration-200',
          message.trim() && !isLoading 
            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-100' 
            : 'bg-secondary text-muted-foreground scale-95 opacity-50'
        )}
      >
        <Send className="w-5 h-5 ml-0.5" />
      </Button>
    </form>
  );
}