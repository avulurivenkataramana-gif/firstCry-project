const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

const fetchClient = async (endpoint, options = {}) => {
  // Support both persistent (localStorage) and session-only (sessionStorage) tokens
  const token =
    localStorage.getItem('token') || sessionStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    if (window.location.pathname !== '/login') {
      window.location.href = '/login?expired=true';
    }
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

const api = {
  get: (endpoint) => fetchClient(endpoint, { method: 'GET' }),
  post: (endpoint, body) => fetchClient(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body) => fetchClient(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (endpoint) => fetchClient(endpoint, { method: 'DELETE' }),
};

export default api;
export { API_URL };
