import { AuthResponse, User, Group, Person, PersonFormData, GroupShare } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/api';

// Helper function to get auth token
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Helper function to create headers
const getHeaders = (includeAuth = true): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

// Helper function to handle responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || 'Something went wrong');
  }
  return response.json();
}

// Authentication API
export const authApi = {
  register: async (email: string, password: string, name: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ email, password, name }),
    });
    return handleResponse<AuthResponse>(response);
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<AuthResponse>(response);
  },

  me: async (): Promise<{ user: User }> => {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse<{ user: User }>(response);
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ email }),
    });
    return handleResponse<{ message: string }>(response);
  },

  resetPassword: async (token: string, password: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ token, password }),
    });
    return handleResponse<{ message: string }>(response);
  },
};

// Groups API
export const groupsApi = {
  getAll: async (): Promise<{ owned: Group[]; shared: Group[] }> => {
    const response = await fetch(`${API_URL}/groups`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse<{ owned: Group[]; shared: Group[] }>(response);
  },

  getById: async (id: number): Promise<Group> => {
    const response = await fetch(`${API_URL}/groups/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse<Group>(response);
  },

  create: async (name: string): Promise<{ message: string; id: number }> => {
    const response = await fetch(`${API_URL}/groups`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name }),
    });
    return handleResponse<{ message: string; id: number }>(response);
  },

  update: async (id: number, name: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_URL}/groups/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ name }),
    });
    return handleResponse<{ message: string }>(response);
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const response = await fetch(`${API_URL}/groups/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<{ message: string }>(response);
  },
};

// People API
export const peopleApi = {
  getByGroup: async (groupId: number): Promise<Person[]> => {
    const response = await fetch(`${API_URL}/groups/${groupId}/people`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse<Person[]>(response);
  },

  getById: async (id: number): Promise<Person> => {
    const response = await fetch(`${API_URL}/people/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse<Person>(response);
  },

  create: async (groupId: number, data: PersonFormData): Promise<{ message: string; id: number }> => {
    const formData = new FormData();
    formData.append('first_name', data.first_name);
    if (data.middle_name) formData.append('middle_name', data.middle_name);
    if (data.last_name) formData.append('last_name', data.last_name);
    if (data.suffix) formData.append('suffix', data.suffix);
    if (data.nickname) formData.append('nickname', data.nickname);
    if (data.description) formData.append('description', data.description);
    if (data.notes) formData.append('notes', data.notes);
    if (data.photo) formData.append('photo', data.photo);

    const token = getToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/groups/${groupId}/people`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return handleResponse<{ message: string; id: number }>(response);
  },

  update: async (id: number, data: PersonFormData): Promise<{ message: string }> => {
    const formData = new FormData();
    formData.append('first_name', data.first_name);
    if (data.middle_name) formData.append('middle_name', data.middle_name);
    if (data.last_name) formData.append('last_name', data.last_name);
    if (data.suffix) formData.append('suffix', data.suffix);
    if (data.nickname) formData.append('nickname', data.nickname);
    if (data.description) formData.append('description', data.description);
    if (data.notes) formData.append('notes', data.notes);
    if (data.photo) formData.append('photo', data.photo);

    const token = getToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/people/${id}`, {
      method: 'POST', // Using POST to support multipart/form-data
      headers,
      body: formData,
    });
    return handleResponse<{ message: string }>(response);
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const response = await fetch(`${API_URL}/people/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<{ message: string }>(response);
  },
};

// Sharing API
export const sharingApi = {
  getShares: async (groupId: number): Promise<GroupShare[]> => {
    const response = await fetch(`${API_URL}/groups/${groupId}/shares`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse<GroupShare[]>(response);
  },

  share: async (groupId: number, email: string, permission: 'view' | 'edit'): Promise<{ message: string }> => {
    const response = await fetch(`${API_URL}/groups/${groupId}/share`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, permission }),
    });
    return handleResponse<{ message: string }>(response);
  },

  unshare: async (groupId: number, userId: number): Promise<{ message: string }> => {
    const response = await fetch(`${API_URL}/groups/${groupId}/share/${userId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<{ message: string }>(response);
  },
};
