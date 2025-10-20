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
  },
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};
