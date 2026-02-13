const API_BASE = 'http://localhost:3001/api';

export interface Issue {
  id: number;
  title: string;
  description: string;
  location: string;
  impact: string;
  status: 'open' | 'investigating' | 'resolved';
  createdAt: string;
  updatedAt: string;
}

export interface Config {
  id: number;
  issueId: number;
  filePath: string;
  content: string;
  note: string | null;
  createdAt: string;
}

export interface ConsoleLog {
  id: number;
  issueId: number;
  prompt: string;
  command: string;
  output: string;
  note: string | null;
  logType: 'info' | 'warning' | 'error' | 'success';
  createdAt: string;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

export const issueApi = {
  list: () => request<Issue[]>('/issues'),

  get: (id: number) => request<Issue>(`/issues/${id}`),

  create: (data: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>) =>
    request<Issue>('/issues', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<Issue>) =>
    request<Issue>(`/issues/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    request<void>(`/issues/${id}`, { method: 'DELETE' }),
};

export const configApi = {
  listByIssue: (issueId: number) =>
    request<Config[]>(`/configs/issue/${issueId}`),

  create: (data: Omit<Config, 'id' | 'createdAt'>) =>
    request<Config>('/configs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<Config>) =>
    request<Config>(`/configs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    request<void>(`/configs/${id}`, { method: 'DELETE' }),
};

export const logApi = {
  listByIssue: (issueId: number) =>
    request<ConsoleLog[]>(`/logs/issue/${issueId}`),

  create: (data: Omit<ConsoleLog, 'id' | 'createdAt'>) =>
    request<ConsoleLog>('/logs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<ConsoleLog>) =>
    request<ConsoleLog>(`/logs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    request<void>(`/logs/${id}`, { method: 'DELETE' }),
};
