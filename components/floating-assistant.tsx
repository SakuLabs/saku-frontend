'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useAgent } from '@/hooks/use-agent';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  X,
  Send,
  Plus,
  History,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

const SUGGESTIONS = [
  'Apa saja tugas saya minggu ini?',
  'Buat jadwal belajar besok jam 7 malam',
  'Tugas mana yang paling mendesak?',
];

export function FloatingAssistant() {
  const { user, loading } = useAuth();
  const {
    conversations,
    activeId,
    bubbles,
    sending,
    loadingHistory,
    error,
    refreshConversations,
    selectConversation,
    newChat,
    sendMessage,
  } = useAgent();

  const [isOpen, setIsOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) void refreshConversations();
  }, [isOpen, refreshConversations]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [bubbles, sending]);

  if (loading || !user) return null;

  const submit = () => {
    const value = input;
    setInput('');
    void sendMessage(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const openConversation = (id: string) => {
    setShowHistory(false);
    void selectConversation(id);
  };

  return (
    <>
      {/* Launcher bubble: sits to the left of the group-chat bubble */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => setIsOpen(true)}
            aria-label="Open Saku AI assistant"
            className="fixed bottom-6 right-24 z-50 h-14 w-14 rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-[0_8px_32px_rgba(99,102,241,0.45)] hover:scale-105 active:scale-95 transition-transform"
          >
            <Sparkles className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-6 right-6 z-50 flex h-[600px] max-h-[calc(100vh-3rem)] w-[380px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-3xl glass-panel"
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-white/10 bg-white/5 px-4 py-3">
              {showHistory ? (
                <button
                  onClick={() => setShowHistory(false)}
                  aria-label="Back to chat"
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shrink-0">
                  <Sparkles className="h-5 w-5" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white leading-tight">
                  {showHistory ? 'Conversations' : 'Saku AI'}
                </p>
                {!showHistory && (
                  <p className="text-xs text-white/50">Your scheduling assistant</p>
                )}
              </div>
              {!showHistory && (
                <>
                  <button
                    onClick={() => setShowHistory(true)}
                    aria-label="Conversation history"
                    className="text-white/60 hover:text-white transition-colors p-1"
                  >
                    <History className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => {
                      newChat();
                      setInput('');
                    }}
                    aria-label="New chat"
                    className="text-white/60 hover:text-white transition-colors p-1"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </>
              )}
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close assistant"
                className="text-white/60 hover:text-white transition-colors p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            {showHistory ? (
              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {conversations.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center text-white/50 gap-2 px-6">
                    <History className="h-8 w-8 opacity-50" />
                    <p className="text-sm">No conversations yet.</p>
                  </div>
                ) : (
                  conversations.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => openConversation(c.id)}
                      className={cn(
                        'w-full text-left rounded-xl px-3 py-2.5 transition-colors',
                        c.id === activeId
                          ? 'bg-white/15 text-white'
                          : 'text-white/70 hover:bg-white/10',
                      )}
                    >
                      <p className="truncate text-sm font-medium">
                        {c.title || 'Untitled chat'}
                      </p>
                      <p className="truncate text-xs text-white/40">
                        {new Date(c.updatedAt).toLocaleString()}
                      </p>
                    </button>
                  ))
                )}
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {loadingHistory ? (
                  <div className="flex h-full items-center justify-center text-white/50">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : bubbles.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center gap-4 px-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <p className="text-white/70 text-sm">
                      Ask me to organize your tasks and schedule.
                    </p>
                    <div className="flex flex-col gap-2 w-full">
                      {SUGGESTIONS.map((s) => (
                        <button
                          key={s}
                          onClick={() => void sendMessage(s)}
                          className="text-left text-sm text-white/80 rounded-xl border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10 transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  bubbles.map((b) => (
                    <div
                      key={b.id}
                      className={cn(
                        'flex',
                        b.role === 'user' ? 'justify-end' : 'justify-start',
                      )}
                    >
                      <div
                        className={cn(
                          'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words',
                          b.role === 'user'
                            ? 'bg-indigo-500 text-white rounded-br-md'
                            : 'bg-white/10 text-white/90 rounded-bl-md',
                        )}
                      >
                        {b.content}
                        {b.actions && b.actions.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {b.actions.map((a, i) => (
                              <span
                                key={`${a.tool}-${i}`}
                                className={cn(
                                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
                                  a.ok
                                    ? 'bg-green-500/15 text-green-300'
                                    : 'bg-red-500/15 text-red-300',
                                )}
                              >
                                {a.ok ? (
                                  <CheckCircle2 className="h-3 w-3" />
                                ) : (
                                  <AlertCircle className="h-3 w-3" />
                                )}
                                {a.tool}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}

                {sending && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-white/10 px-4 py-3">
                      <span className="h-2 w-2 rounded-full bg-white/60 animate-bounce [animation-delay:-0.3s]" />
                      <span className="h-2 w-2 rounded-full bg-white/60 animate-bounce [animation-delay:-0.15s]" />
                      <span className="h-2 w-2 rounded-full bg-white/60 animate-bounce" />
                    </div>
                  </div>
                )}

                {error && (
                  <p className="text-center text-xs text-red-300">{error}</p>
                )}

                <div ref={bottomRef} />
              </div>
            )}

            {/* Composer */}
            {!showHistory && (
              <div className="border-t border-white/10 bg-white/5 p-3">
                <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 focus-within:border-white/20 transition-colors">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    placeholder="Message Saku AI..."
                    className="flex-1 resize-none bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none max-h-28"
                  />
                  <button
                    onClick={submit}
                    disabled={sending || !input.trim()}
                    aria-label="Send message"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-white transition-all hover:bg-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
