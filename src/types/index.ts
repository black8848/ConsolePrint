export interface ConsoleRecord {
  id: string;
  prompt: string;      // user@hostname:path$
  command: string;     // 执行的命令
  output: string;      // 输出内容
  note?: string;       // 可选注释
  timestamp: number;
  createdAt: number;
}
