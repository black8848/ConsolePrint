export type LogStatus = 'error' | 'warning' | 'info' | 'resolved';

export interface ConsoleRecord {
  id: string;
  title: string;
  content: string;
  status: LogStatus;
  timestamp: number;
  createdAt: number;
}
