'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useAgent } from '@/hooks/use-agent';
import { ChatMarkdown } from '@/components/chat-markdown';
import { cn } from '@/lib/utils';
import {
  X,
  Send,
  Plus,
  History,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ListChecks,
  CalendarClock,
  Flame,
  ChevronRight,
} from 'lucide-react';

const SUGGESTIONS = [
  { icon: ListChecks, label: 'Apa saja tugas saya minggu ini?' },
  { icon: CalendarClock, label: 'Buat jadwal belajar besok jam 7 malam' },
  { icon: Flame, label: 'Tugas mana yang paling mendesak?' },
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
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="group fixed bottom-6 right-24 z-50"
          >
            <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-black/70 px-2.5 py-1 text-xs font-medium text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
              Saku AI
            </span>
            <button
              onClick={() => setIsOpen(true)}
              aria-label="Open Saku AI assistant"
              className="relative h-14 w-14 overflow-hidden rounded-full shadow-[0_8px_32px_rgba(99,102,241,0.45)] transition-transform hover:scale-105 active:scale-95"
            >
              <Image
                src="/ai.png"
                alt=""
                fill
                sizes="56px"
                className="object-cover"
                priority
              />
            </button>
          </motion.div>
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
                <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full">
                  <Image src="/ai.png" alt="" fill sizes="36px" className="object-cover" />
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
                  <div className="flex h-full flex-col items-center justify-center gap-7 px-1">
                    <div className="flex flex-col items-center gap-3 text-center">
                      <div className="relative">
                        <div className="absolute inset-0 -z-10 rounded-full bg-indigo-500/40 blur-2xl" />
                        <div className="relative h-14 w-14 overflow-hidden rounded-2xl shadow-lg shadow-indigo-500/30">
                          <Image src="/ai.png" alt="" fill sizes="56px" className="object-cover" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-base font-semibold text-white">
                          Halo
                          {user?.name ? `, ${user.name.split(' ')[0]}` : ''}
                        </p>
                        <p className="mx-auto max-w-[15rem] text-sm leading-relaxed text-white/50">
                          Saya bisa bantu atur tugas dan jadwalmu. Coba tanya:
                        </p>
                      </div>
                    </div>
                    <div className="flex w-full flex-col gap-2">
                      {SUGGESTIONS.map(({ icon: Icon, label }) => (
                        <button
                          key={label}
                          onClick={() => void sendMessage(label)}
                          className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-left transition-colors hover:border-white/20 hover:bg-white/10"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-indigo-300 transition-colors group-hover:bg-indigo-500/20">
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="flex-1 text-sm leading-snug text-white/80">
                            {label}
                          </span>
                          <ChevronRight className="h-4 w-4 shrink-0 text-white/30 transition-all group-hover:translate-x-0.5 group-hover:text-white/70" />
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
                          'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed break-words',
                          b.role === 'user'
                            ? 'bg-indigo-500 text-white rounded-br-md whitespace-pre-wrap'
                            : 'bg-white/10 text-white/90 rounded-bl-md',
                        )}
                      >
                        {b.role === 'user' ? (
                          b.content
                        ) : (
                          <ChatMarkdown>{b.content}</ChatMarkdown>
                        )}
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
