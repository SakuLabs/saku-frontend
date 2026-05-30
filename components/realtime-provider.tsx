'use client';

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { apiClient, getToken } from '@/lib/api-client';
import { API_CONFIG } from '@/lib/api-config';
import { useAuth } from '@/hooks/use-auth';
import type { Message, Friend, FriendRequest, UnreadCount } from '@/lib/types';

type ConversationType = 'group' | 'direct';

export interface TypingData {
  userId: string;
  isTyping: boolean;
  groupId?: string;
  directMessageUserId?: string;
}

interface FriendRequestEvent {
  request?: FriendRequest;
  senderName?: string;
  senderId?: string;
}

interface RealtimeContextValue {
  isConnected: boolean;

  // Messaging
  sendMessage: (
    content: string,
    groupId?: string,
    directMessageUserId?: string,
  ) => void;
  onMessage: (cb: (message: Message) => void) => () => void;
  onTyping: (cb: (data: TypingData) => void) => () => void;
  sendTyping: (
    isTyping: boolean,
    groupId?: string,
    directMessageUserId?: string,
  ) => void;
  joinConversation: (id: string, type: ConversationType) => void;
  leaveConversation: (id: string, type: ConversationType) => void;

  // Unread (persisted) — keyed by conversationKey
  unread: Record<string, number>;
  totalUnread: number;
  markRead: (type: ConversationType, id: string) => void;
  // Tell the provider which conversation is open so it doesn't badge it.
  setActiveConversation: (type: ConversationType, id: string | null) => void;

  // Presence
  presence: Set<string>;
  isOnline: (userId: string) => boolean;

  // Friend realtime
  onFriendRequest: (cb: (data: FriendRequestEvent) => void) => () => void;
  onFriendAccepted: (cb: (data: { friend: Friend }) => void) => () => void;
  onFriendRejected: (cb: (data: { requestId: string }) => void) => () => void;
}

const RealtimeContext = createContext<RealtimeContextValue | undefined>(
  undefined,
);

const keyOf = (type: ConversationType, id: string) =>
  type === 'group' ? `group:${id}` : `dm:${id}`;

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  const [isConnected, setIsConnected] = useState(false);
  const [unread, setUnread] = useState<Record<string, number>>({});
  const [presence, setPresence] = useState<Set<string>>(new Set());

  const socketRef = useRef<Socket | null>(null);
  const activeRoomRef = useRef<{ id: string; type: ConversationType } | null>(
    null,
  );
  const activeKeyRef = useRef<string | null>(null);

  // Callback registries — refs so subscribing doesn't re-create the socket.
  const messageCbs = useRef<((m: Message) => void)[]>([]);
  const typingCbs = useRef<((d: TypingData) => void)[]>([]);
  const friendReqCbs = useRef<((d: FriendRequestEvent) => void)[]>([]);
  const friendAccCbs = useRef<((d: { friend: Friend }) => void)[]>([]);
  const friendRejCbs = useRef<((d: { requestId: string }) => void)[]>([]);

  const fetchUnread = useCallback(async () => {
    try {
      const data = await apiClient.get<UnreadCount[]>(
        API_CONFIG.ENDPOINTS.CHAT.GET_UNREAD,
      );
      const map: Record<string, number> = {};
      for (const u of data) map[u.conversationKey] = u.count;
      setUnread(map);
    } catch {
      // unread is best-effort; ignore failures
    }
  }, []);

  // ---- Connection lifecycle ----
  useEffect(() => {
    if (!isAuthenticated) return;
    const token = getToken();
    if (!token) return;

    const socket = io(API_CONFIG.BASE_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      // Re-join active room after reconnect.
      const active = activeRoomRef.current;
      if (active) {
        socket.emit(
          active.type === 'group' ? 'joinGroup' : 'joinDM',
          active.type === 'group'
            ? { groupId: active.id }
            : { userId: active.id },
        );
      }
      // Sync presence snapshot.
      socket.emit('presence:sync', (res: { online?: string[] }) => {
        if (res?.online) setPresence(new Set(res.online));
      });
      // Refresh unread on (re)connect.
      void fetchUnread();
    });

    socket.on('disconnect', () => setIsConnected(false));

    socket.on('receive_message', (message: Message) => {
      messageCbs.current.forEach((cb) => cb(message));
    });

    socket.on('typing', (data: TypingData) => {
      typingCbs.current.forEach((cb) => cb(data));
    });

    // App-wide unread / notification (fires even when convo not open).
    socket.on(
      'message_notification',
      (data: { conversationKey: string; message: Message }) => {
        if (!data?.conversationKey) return;
        // Skip the conversation the user is currently looking at.
        if (data.conversationKey === activeKeyRef.current) return;
        setUnread((prev) => ({
          ...prev,
          [data.conversationKey]: (prev[data.conversationKey] || 0) + 1,
        }));
      },
    );

    socket.on('friendRequest', (data: FriendRequestEvent) => {
      friendReqCbs.current.forEach((cb) => cb(data));
    });
    socket.on('friendRequestAccepted', (data: { friend: Friend }) => {
      friendAccCbs.current.forEach((cb) => cb(data));
    });
    socket.on('friendRequestRejected', (data: { requestId: string }) => {
      friendRejCbs.current.forEach((cb) => cb(data));
    });

    socket.on('presence:update', (data: { userId: string; online: boolean }) => {
      setPresence((prev) => {
        const next = new Set(prev);
        if (data.online) next.add(data.userId);
        else next.delete(data.userId);
        return next;
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setPresence(new Set());
      setUnread({});
    };
  }, [isAuthenticated, fetchUnread]);

  // ---- Messaging API ----
  const sendMessage = useCallback(
    (content: string, groupId?: string, directMessageUserId?: string) => {
      const s = socketRef.current;
      if (!s?.connected) return;
      if (groupId) s.emit('sendGroupMessage', { groupId, content });
      else if (directMessageUserId)
        s.emit('sendDM', { recipientId: directMessageUserId, content });
    },
    [],
  );

  const sendTyping = useCallback(
    (isTyping: boolean, groupId?: string, directMessageUserId?: string) => {
      const s = socketRef.current;
      if (!s?.connected) return;
      s.emit('typing', { isTyping, groupId, directMessageUserId });
    },
    [],
  );

  const onMessage = useCallback((cb: (m: Message) => void) => {
    messageCbs.current.push(cb);
    return () => {
      messageCbs.current = messageCbs.current.filter((c) => c !== cb);
    };
  }, []);

  const onTyping = useCallback((cb: (d: TypingData) => void) => {
    typingCbs.current.push(cb);
    return () => {
      typingCbs.current = typingCbs.current.filter((c) => c !== cb);
    };
  }, []);

  const onFriendRequest = useCallback((cb: (d: FriendRequestEvent) => void) => {
    friendReqCbs.current.push(cb);
    return () => {
      friendReqCbs.current = friendReqCbs.current.filter((c) => c !== cb);
    };
  }, []);

  const onFriendAccepted = useCallback((cb: (d: { friend: Friend }) => void) => {
    friendAccCbs.current.push(cb);
    return () => {
      friendAccCbs.current = friendAccCbs.current.filter((c) => c !== cb);
    };
  }, []);

  const onFriendRejected = useCallback(
    (cb: (d: { requestId: string }) => void) => {
      friendRejCbs.current.push(cb);
      return () => {
        friendRejCbs.current = friendRejCbs.current.filter((c) => c !== cb);
      };
    },
    [],
  );

  const joinConversation = useCallback((id: string, type: ConversationType) => {
    activeRoomRef.current = { id, type };
    const s = socketRef.current;
    if (!s?.connected) return;
    if (type === 'group') s.emit('joinGroup', { groupId: id });
    else s.emit('joinDM', { userId: id });
  }, []);

  const leaveConversation = useCallback((id: string) => {
    if (activeRoomRef.current?.id === id) activeRoomRef.current = null;
    // Backend clears room membership on disconnect; no explicit leave event.
  }, []);

  // ---- Unread API ----
  const markRead = useCallback((type: ConversationType, id: string) => {
    const key = keyOf(type, id);
    setUnread((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      next[key] = 0;
      return next;
    });
    apiClient
      .post(API_CONFIG.ENDPOINTS.CHAT.MARK_READ, { type, id })
      .catch(() => {});
  }, []);

  const setActiveConversation = useCallback(
    (type: ConversationType, id: string | null) => {
      activeKeyRef.current = id ? keyOf(type, id) : null;
    },
    [],
  );

  const isOnline = useCallback(
    (userId: string) => presence.has(userId),
    [presence],
  );

  const totalUnread = Object.values(unread).reduce((a, b) => a + b, 0);

  const value: RealtimeContextValue = {
    isConnected,
    sendMessage,
    onMessage,
    onTyping,
    sendTyping,
    joinConversation,
    leaveConversation,
    unread,
    totalUnread,
    markRead,
    setActiveConversation,
    presence,
    isOnline,
    onFriendRequest,
    onFriendAccepted,
    onFriendRejected,
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime(): RealtimeContextValue {
  const ctx = useContext(RealtimeContext);
  if (ctx === undefined) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return ctx;
}
