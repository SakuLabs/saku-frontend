'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Users, User, Plus, ArrowLeft, Search, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useChat } from '@/hooks/use-chat';
import { useSocial } from '@/hooks/use-social';
import { useAuth } from '@/hooks/use-auth';
import { useWebSocket } from '@/hooks/use-websocket';
import { toast } from "sonner";
import { cn } from '@/lib/utils';
import type { Message, Group, Friend } from '@/lib/types';
import { format, isToday, isYesterday } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

type ConversationType = 'group' | 'direct';

interface Conversation {
  id: string;
  name: string;
  type: ConversationType;
  avatarUrl?: string;
  lastMessage?: string;
  unreadCount?: number;
  isOnline?: boolean;
}

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { user, loading } = useAuth();
  const { groups, friends, friendRequests, refreshGroups, refreshFriends, refreshFriendRequests, createGroup } = useSocial();
  const { messages, loadGroupMessages, loadDirectMessages, sendMessage: sendMessageRest, clearMessages } = useChat();
  const { isConnected, sendMessage: sendMessageWs, onMessage, onFriendRequest, joinConversation, leaveConversation } = useWebSocket();

  useEffect(() => {
    if (user) {
      refreshGroups();
      refreshFriends();
      refreshFriendRequests();
    }
  }, [user, refreshGroups, refreshFriends, refreshFriendRequests]);

  // Real-time friend request notification
  useEffect(() => {
    const handleFriendRequest = (data: any) => {
      refreshFriendRequests();
      toast.info('New friend request!', {
        description: `${data.senderName || 'Someone'} sent you a friend request.`,
      });
    };

    return onFriendRequest(handleFriendRequest);
  }, [onFriendRequest, refreshFriendRequests]);

  useEffect(() => {
    if (activeConversation) {
      if (activeConversation.type === 'group') {
        loadGroupMessages(activeConversation.id);
      } else {
        loadDirectMessages(activeConversation.id);
      }
    }
  }, [activeConversation, loadGroupMessages, loadDirectMessages]);

  // Join/leave Socket.IO room when conversation changes so the server routes messages here.
  // isConnected is included so the join is re-emitted if the socket connects after the conversation was already selected.
  useEffect(() => {
    if (activeConversation && isConnected) {
      joinConversation(activeConversation.id, activeConversation.type);
      return () => leaveConversation(activeConversation.id, activeConversation.type);
    }
  }, [activeConversation, isConnected, joinConversation, leaveConversation]);

  // Sync messages from REST API with local state
  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  // Auto-scroll to newest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages]);

  // WebSocket real-time message listener
  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      // Add message if it belongs to the active conversation
      if (activeConversation) {
        const isRelevant =
          (activeConversation.type === 'group' && message.groupId === activeConversation.id) ||
          (activeConversation.type === 'direct' && (
            message.directMessageUserId === activeConversation.id ||
            message.recipientId === activeConversation.id ||
            message.senderId === activeConversation.id
          ));

        if (isRelevant) {
          setLocalMessages(prev => {
            if (prev.some(m => m.id === message.id)) return prev;
            // Replace matching optimistic message from the same sender with the real one
            const tempIndex = prev.findIndex(
              m => m.id.startsWith('temp-') && m.senderId === message.senderId && m.content === message.content
            );
            if (tempIndex !== -1) {
              const next = [...prev];
              next[tempIndex] = message;
              return next;
            }
            return [...prev, message];
          });
        }
      }
    };

    return onMessage(handleNewMessage);
  }, [activeConversation, onMessage]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeConversation) return;

    const content = messageInput.trim();
    setMessageInput('');

    if (isConnected) {
      // Optimistic insert so the sender sees the message immediately
      const optimistic: Message = {
        id: `temp-${Date.now()}`,
        senderId: user!.id,
        content,
        groupId: activeConversation.type === 'group' ? activeConversation.id : undefined,
        directMessageUserId: activeConversation.type === 'direct' ? activeConversation.id : undefined,
        createdAt: new Date().toISOString(),
        sender: { id: user!.id, name: user!.name },
      };
      setLocalMessages(prev => [...prev, optimistic]);

      if (activeConversation.type === 'group') {
        sendMessageWs(content, activeConversation.id);
      } else {
        sendMessageWs(content, undefined, activeConversation.id);
      }
    } else {
      if (activeConversation.type === 'group') {
        await sendMessageRest(content, activeConversation.id);
      } else {
        await sendMessageRest(content, undefined, activeConversation.id);
      }
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;

    setIsCreatingGroup(true);
    const group = await createGroup({ name: newGroupName });
    setIsCreatingGroup(false);

    if (group) {
      setNewGroupName('');
      setIsNewChatOpen(false);
      setActiveConversation({
        id: group.id,
        name: group.name,
        type: 'group',
      });
    }
  };

  const conversations: Conversation[] = [
    ...groups.map(g => ({
      id: g.id,
      name: g.name,
      type: 'group' as ConversationType,
      unreadCount: 0,
    })),
    ...friends.map(f => ({
      id: f.id,
      name: f.name,
      type: 'direct' as ConversationType,
      avatarUrl: f.avatarUrl,
      unreadCount: 0,
      isOnline: Math.random() > 0.5, // Replace with real status
    })),
  ];

  const filteredConversations = conversations.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return format(date, 'h:mm a');
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d');
  };

  // Don't render if user is not authenticated or still loading
  if (loading || !user) {
    return null;
  }

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="group fixed bottom-6 right-6 z-50"
          >
            <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-black/70 px-2.5 py-1 text-xs font-medium text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
              Study Groups
            </span>
            <Button
              onClick={() => setIsOpen(true)}
              size="icon"
              aria-label="Open Study Groups chat"
              className="h-14 w-14 rounded-full shadow-2xl shadow-primary/50 bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-110"
            >
              <MessageSquare className="h-6 w-6" />
            </Button>
            {friendRequests.length > 0 && (
              <div className="absolute -top-1 -right-1 h-6 w-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-background">
                {friendRequests.length}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-[60] flex flex-col overflow-hidden bg-background shadow-2xl pb-[env(safe-area-inset-bottom)] sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[600px] sm:max-h-[calc(100vh-3rem)] sm:w-[380px] sm:max-w-[calc(100vw-3rem)] sm:rounded-2xl sm:border sm:border-border sm:pb-0"
          >
            {/* Header */}
            <div className="h-16 px-4 border-b border-border bg-background/95 backdrop-blur-md flex items-center justify-between shrink-0">
              {activeConversation ? (
                <>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setActiveConversation(null);
                        clearMessages();
                      }}
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <Avatar className="h-8 w-8 border border-border/50">
                      <AvatarImage src={activeConversation.avatarUrl} />
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {activeConversation.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-sm leading-none">
                        {activeConversation.name}
                      </h3>
                      {activeConversation.type === 'direct' && (
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          {activeConversation.isOnline && (
                            <span className="w-2 h-2 bg-green-500 rounded-full" />
                          )}
                          {activeConversation.isOnline ? 'Active now' : 'Offline'}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </>
              ) : (
                <>
                  <h2 className="text-lg font-semibold">Messages</h2>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setIsNewChatOpen(true)}
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setIsOpen(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </>
              )}
            </div>

            {/* Content */}
            {activeConversation ? (
              <>
                {/* Messages Area */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-3">
                    {localMessages.map((message) => {
                      const isOwn = message.senderId === user?.id;
                      return (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn(
                            'flex w-full',
                            isOwn ? 'justify-end' : 'justify-start'
                          )}
                        >
                          <div
                            className={cn(
                              'max-w-[75%] px-3 py-2 rounded-2xl text-sm break-words shadow-sm',
                              isOwn
                                ? 'bg-primary text-primary-foreground rounded-br-sm'
                                : 'bg-secondary/80 text-foreground rounded-bl-sm'
                            )}
                          >
                            {!isOwn && activeConversation.type === 'group' && (
                              <p className="text-xs font-medium mb-1 opacity-70">
                                {message.sender?.name}
                              </p>
                            )}
                            <p>{message.content}</p>
                            <p
                              className={cn(
                                'text-[10px] mt-1 opacity-60',
                                isOwn ? 'text-right' : 'text-left'
                              )}
                            >
                              {formatMessageTime(message.createdAt)}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                    <div ref={bottomRef} />
                    {localMessages.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-[400px] text-center space-y-2">
                        <div className="h-16 w-16 rounded-full bg-secondary/50 flex items-center justify-center">
                          <MessageSquare className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">No messages yet</p>
                        <p className="text-xs text-muted-foreground">
                          Start the conversation!
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-3 border-t border-border bg-background/95 backdrop-blur-md shrink-0">
                  <div className="flex items-center gap-2 bg-secondary/50 rounded-full px-3 py-2">
                    <Input
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      className="flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-8 text-sm"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-full"
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Search */}
                <div className="p-3 border-b border-border shrink-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search conversations..."
                      className="pl-9 bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/20 h-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {/* Conversations List */}
                <ScrollArea className="flex-1">
                  <div className="p-2 space-y-1">
                    {filteredConversations.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-[400px] text-center space-y-2 px-4">
                        <div className="h-16 w-16 rounded-full bg-secondary/50 flex items-center justify-center">
                          <MessageSquare className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium">No conversations yet</p>
                        <p className="text-xs text-muted-foreground">
                          Create a group or start chatting with friends!
                        </p>
                        <Button
                          size="sm"
                          onClick={() => setIsNewChatOpen(true)}
                          className="mt-2"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          New Chat
                        </Button>
                      </div>
                    ) : (
                      filteredConversations.map((conversation) => (
                        <button
                          key={conversation.id}
                          onClick={() => setActiveConversation(conversation)}
                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors text-left"
                        >
                          <div className="relative">
                            <Avatar className="h-12 w-12 border border-border/50">
                              <AvatarImage src={conversation.avatarUrl} />
                              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                {conversation.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            {conversation.type === 'direct' && conversation.isOnline && (
                              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background" />
                            )}
                            {conversation.type === 'group' && (
                              <span className="absolute bottom-0 right-0 w-5 h-5 bg-background rounded-full border border-border/50 flex items-center justify-center">
                                <Users className="h-3 w-3 text-muted-foreground" />
                              </span>
                            )}
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="font-semibold text-sm truncate">
                                {conversation.name}
                              </h3>
                              {conversation.unreadCount && conversation.unreadCount > 0 && (
                                <Badge
                                  variant="default"
                                  className="h-5 min-w-5 px-1.5 text-xs rounded-full"
                                >
                                  {conversation.unreadCount}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {conversation.lastMessage || 'No messages yet'}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Chat Dialog */}
      <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>New Conversation</DialogTitle>
            <DialogDescription>
              Start a direct message with a friend or create a group.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Direct Message - Friends List */}
            {friends.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  Direct Message
                </Label>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {friends.map((friend) => (
                    <button
                      key={friend.id}
                      onClick={() => {
                        setActiveConversation({
                          id: friend.id,
                          name: friend.name,
                          type: 'direct',
                          avatarUrl: friend.avatarUrl,
                        });
                        setIsNewChatOpen(false);
                      }}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors text-left"
                    >
                      <Avatar className="h-8 w-8 border border-border/50">
                        <AvatarImage src={friend.avatarUrl} />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {friend.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-medium text-sm truncate">{friend.name}</p>
                        <p className="text-xs text-muted-foreground font-mono truncate">{friend.userCode}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/40" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-2 text-muted-foreground">or</span>
              </div>
            </div>

            {/* Create Group */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                Create Group
              </Label>
              <div className="flex gap-2">
                <Input
                  id="group-name"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g. CS101 Study Group"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreateGroup();
                    }
                  }}
                />
                <Button
                  onClick={handleCreateGroup}
                  disabled={!newGroupName.trim() || isCreatingGroup}
                  className="shrink-0"
                >
                  {isCreatingGroup ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
