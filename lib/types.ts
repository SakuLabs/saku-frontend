// Backend API Types matching the NestJS backend

// Auth Types
export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    userCode: string;
    bio?: string;
    avatarUrl?: string;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  userCode: string;
  bio?: string;
  avatarUrl?: string;
}

export interface UpdateUserRequest {
  name?: string;
  bio?: string;
  avatarUrl?: string;
}

// Task Types
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

// Canonical task shape used throughout the frontend.
export interface Task {
  id: string;
  userId?: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  progress: number;
  startDate?: string;
  dueDate?: string;
  scheduleId?: string;
  createdAt: string;
  updatedAt?: string;
}

// Raw task as returned by the NestJS backend: numeric priority + `deadline`.
export interface RawTask {
  id: string;
  title: string;
  description?: string;
  startDate?: string;
  deadline?: string;
  priority: number;
  status: TaskStatus;
  progress: number;
  createdAt: string;
}

const TASK_PRIORITY_BY_NUMBER: Record<number, TaskPriority> = {
  1: 'LOW',
  2: 'MEDIUM',
  3: 'HIGH',
};

// Map the backend task payload onto the canonical frontend shape.
export function normalizeTask(raw: RawTask): Task {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    priority: TASK_PRIORITY_BY_NUMBER[raw.priority] ?? 'LOW',
    status: raw.status,
    progress: raw.progress ?? 0,
    startDate: raw.startDate,
    dueDate: raw.deadline,
    createdAt: raw.createdAt,
  };
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: TaskPriority;
  deadline?: string;
  scheduleId?: string;
}

export interface UpdateTaskStatusRequest {
  status: TaskStatus;
}

export interface UpdateTaskProgressRequest {
  progress: number;
}

// Schedule Types (values match the NestJS backend)
export type ScheduleType = 'EVENT' | 'MEETING' | 'TASK_REMINDER';
export type ScheduleColor = 'purple' | 'blue' | 'green' | 'orange' | 'red';
export type ScheduleImportance = 'LOW' | 'NORMAL' | 'HIGH';

export interface Schedule {
  id: string;
  userId: string;
  title: string;
  startTime: string;
  endTime: string;
  type: ScheduleType;
  color: ScheduleColor;
  importance: ScheduleImportance;
  progress: number;
  description?: string;
  groupId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateScheduleRequest {
  title: string;
  startTime: string;
  endTime: string;
  type?: ScheduleType;
  color?: ScheduleColor;
  importance?: ScheduleImportance;
  description?: string;
  groupId?: string;
  taskIds?: string[];
}

export interface UpdateScheduleRequest {
  title?: string;
  startTime?: string;
  endTime?: string;
  type?: ScheduleType;
  color?: ScheduleColor;
  importance?: ScheduleImportance;
  progress?: number;
  description?: string;
  taskIds?: string[];
}

export interface CheckConflictsRequest {
  startTime: string;
  endTime: string;
}

export interface ConflictCheckResponse {
  hasConflict: boolean;
  conflicts: Schedule[];
}

// Chat Types
export interface Message {
  id: string;
  senderId: string;
  content: string;
  groupId?: string;
  directMessageUserId?: string;
  recipientId?: string; // Backend DM field (alias for directMessageUserId)
  createdAt: string;
  sender?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}

// Social Types
export interface Friend {
  id: string;
  name: string;
  userCode: string;
  bio?: string;
  avatarUrl?: string;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  sender?: Friend;
  receiver?: Friend;
}

export interface GroupMember {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  role: 'ADMIN' | 'MEMBER';
  canCreateSchedule: boolean;
}

export interface Group {
  id: string;
  name: string;
  createdAt: string;
  members: GroupMember[];
}

export interface CreateGroupRequest {
  name: string;
}

export interface AddMemberRequest {
  userId: string;
  canCreateSchedule?: boolean;
}

export interface RequestFriendRequest {
  userCode?: string;
  friendId?: string;
}

export interface SearchUsersRequest {
  email?: string;
  name?: string;
  id?: string;
}

// AI Agent Types
export type AgentRole = 'user' | 'assistant' | 'tool';

export interface AgentToolCall {
  id?: string;
  function: { name: string; arguments: string };
}

// One stored turn as returned by GET /agent/conversations/:id/messages
export interface AgentMessage {
  role: AgentRole;
  content: string | null;
  toolCalls?: AgentToolCall[];
  toolCallId?: string;
}

export interface AgentAction {
  tool: string;
  ok: boolean;
}

export interface AgentChatResponse {
  conversationId: string;
  reply: string;
  actions: AgentAction[];
}

export interface AgentConversation {
  id: string;
  userId: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatAgentRequest {
  content: string;
  conversationId?: string;
}
