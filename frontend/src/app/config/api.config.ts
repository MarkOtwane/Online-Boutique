export const API_CONFIG = {
  BASE_URL: 'http://localhost:3000',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
    },
    PRODUCTS: {
      BASE: '/products',
      RECENT: '/products/recent',
      BY_ID: (id: number) => `/products/${id}`,
      COMMENTS: (id: number) => `/products/${id}/comments`,
    },
    USERS: {
      BASE: '/users',
      ME: '/users/me',
      BY_ID: (id: number) => `/users/${id}`,
    },
    CATEGORIES: {
      BASE: '/categories',
    },
    ORDERS: {
      BASE: '/orders',
      ALL: '/orders/all',
    },
    COMMENTS: {
      BASE: '/comments',
      BY_ID: (id: number) => `/comments/${id}`,
    },
    CHAT: {
      CONVERSATIONS: '/chat/conversations',
      CONVERSATION_MESSAGES: (id: number) => `/chat/conversations/${id}/messages`,
      MESSAGES: '/chat/messages',
      MESSAGE_READ: (id: number) => `/chat/messages/${id}/read`,
      ONLINE_USERS: '/chat/users/online',
      GLOBAL_GROUP: '/chat/global-group',
    },
  },
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};
