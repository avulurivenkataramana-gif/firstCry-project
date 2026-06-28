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

  const contentType = response.headers.get('content-type');
  let data;

  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    const text = await response.text();
    console.error('Received non-JSON response:', text);
    throw new Error(
      `Received non-JSON response from server (Status: ${response.status}). This usually means the API URL is misconfigured, the server crashed, or the static server redirected the request to index.html.`
    );
  }

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
