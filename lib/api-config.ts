// API Configuration for backend integration
export const API_CONFIG = {
  // Backend API base URL - adjust this based on your backend port
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  
  // API endpoints
  ENDPOINTS: {
    // Auth endpoints
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
    },
    
    // User endpoints
    USERS: {
      ME: '/users/me',
      UPDATE_ME: '/users/me',
      UPLOAD_AVATAR: '/users/me/avatar',
    },
    
    // Task endpoints
    TASKS: {
      GET_ALL: '/tasks',
      CREATE: '/tasks',
      UPDATE_STATUS: (id: string) => `/tasks/${id}/status`,
      UPDATE_PROGRESS: (id: string) => `/tasks/${id}/progress`,
      DELETE: (id: string) => `/tasks/${id}`,
    },
    
    // Schedule endpoints
    SCHEDULES: {
      GET_ALL: '/schedules',
      CREATE: '/schedules',
      CHECK_CONFLICTS: '/schedules/conflicts',
      UPDATE: (id: string) => `/schedules/${id}`,
      DELETE: (id: string) => `/schedules/${id}`,
    },
    
    // Chat endpoints
    CHAT: {
      GET_GROUP_MESSAGES: (groupId: string) => `/chat/group/${groupId}`,
      GET_DIRECT_MESSAGES: (userId: string) => `/chat/dm/${userId}`,
      SEND_MESSAGE: '/chat/messages',
    },

    // AI Agent endpoints
    AGENT: {
      CHAT: '/agent/chat',
      CONVERSATIONS: '/agent/conversations',
      CONVERSATION_MESSAGES: (id: string) =>
        `/agent/conversations/${id}/messages`,
    },

    // Social endpoints
    SOCIAL: {
      GET_FRIENDS: '/social/friends',
      SEARCH_USERS: '/social/friends/search',
      SEARCH_USERS_BY_NAME: '/social/friends/search-name',
      SEARCH_USERS_BY_ID: '/social/friends/search-id',
      REQUEST_FRIEND: '/social/friends/request',
      GET_FRIEND_REQUESTS: '/social/friends/requests',
      GET_SENT_REQUESTS: '/social/friends/requests/sent',
      ACCEPT_REQUEST: (id: string) => `/social/friends/requests/${id}/accept`,
      REJECT_REQUEST: (id: string) => `/social/friends/requests/${id}/reject`,
      REMOVE_FRIEND: (friendId: string) => `/social/friends/${friendId}`,
      GET_GROUPS: '/social/groups',
      CREATE_GROUP: '/social/groups',
      ADD_MEMBER: (groupId: string) => `/social/groups/${groupId}/members`,
    },
  },
} as const;

// Helper function to get full URL for an endpoint
export function getApiUrl(endpoint: string): string {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}
