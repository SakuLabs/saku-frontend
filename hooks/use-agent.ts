import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { API_CONFIG } from '@/lib/api-config';
import { emitDataChange } from '@/lib/data-events';
import type {
  AgentAction,
  AgentChatResponse,
  AgentConversation,
  AgentMessage,
} from '@/lib/types';

// A single rendered bubble. Tool turns and empty assistant turns are not shown.
export interface AgentBubble {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  actions?: AgentAction[];
}

let bubbleSeq = 0;
const nextId = () => `b${++bubbleSeq}`;

interface UseAgentReturn {
  conversations: AgentConversation[];
  activeId: string | null;
  bubbles: AgentBubble[];
  sending: boolean;
  loadingHistory: boolean;
  error: string | null;
  refreshConversations: () => Promise<void>;
  selectConversation: (id: string) => Promise<void>;
  newChat: () => void;
  sendMessage: (content: string) => Promise<void>;
}

export function useAgent(): UseAgentReturn {
  const [conversations, setConversations] = useState<AgentConversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [bubbles, setBubbles] = useState<AgentBubble[]>([]);
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshConversations = useCallback(async () => {
    try {
      const data = await apiClient.get<AgentConversation[]>(
        API_CONFIG.ENDPOINTS.AGENT.CONVERSATIONS,
      );
      setConversations(data);
    } catch {
      // A failed list shouldn't block the chat itself.
    }
  }, []);

  const selectConversation = useCallback(async (id: string) => {
    setActiveId(id);
    setError(null);
    setLoadingHistory(true);
    try {
      const msgs = await apiClient.get<AgentMessage[]>(
        API_CONFIG.ENDPOINTS.AGENT.CONVERSATION_MESSAGES(id),
      );
      setBubbles(
        msgs
          .filter(
            (m) =>
              (m.role === 'user' || m.role === 'assistant') && !!m.content,
          )
          .map((m) => ({
            id: nextId(),
            role: m.role as 'user' | 'assistant',
            content: m.content as string,
          })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
      setBubbles([]);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  const newChat = useCallback(() => {
    setActiveId(null);
    setBubbles([]);
    setError(null);
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || sending) return;

      setError(null);
      setSending(true);
      setBubbles((prev) => [
        ...prev,
        { id: nextId(), role: 'user', content: trimmed },
      ]);

      try {
        const res = await apiClient.post<AgentChatResponse>(
          API_CONFIG.ENDPOINTS.AGENT.CHAT,
          { content: trimmed, conversationId: activeId ?? undefined },
        );
        setActiveId(res.conversationId);
        setBubbles((prev) => [
          ...prev,
          {
            id: nextId(),
            role: 'assistant',
            content: res.reply,
            actions: res.actions?.length ? res.actions : undefined,
          },
        ]);
        // The agent mutates tasks/schedules on the backend directly, in a
        // separate hook instance from the list views. Refetch both so AI
        // changes show up without a reload. We do this on every reply rather
        // than inspecting res.actions, because the backend doesn't always
        // populate actions even when it created something (the reply text may
        // be the only signal). Two cheap GETs per turn keeps it correct.
        emitDataChange('tasks');
        emitDataChange('schedules');
        // Title may have been generated on the first turn.
        void refreshConversations();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Assistant is unavailable',
        );
      } finally {
        setSending(false);
      }
    },
    [activeId, sending, refreshConversations],
  );

  return {
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
  };
}
