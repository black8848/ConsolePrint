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
  note?: string;
  createdAt: string;
}

export interface ConsoleLog {
  id: number;
  issueId: number;
  prompt: string;
  command: string;
  output: string;
  note?: string;
  logType: 'error' | 'warning' | 'info' | 'success';
  createdAt: string;
}

export type CreateIssue = Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateIssue = Partial<CreateIssue>;

export type CreateConfig = Omit<Config, 'id' | 'createdAt'>;
export type CreateConsoleLog = Omit<ConsoleLog, 'id' | 'createdAt'>;
