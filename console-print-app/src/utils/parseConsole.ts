export interface ParsedConsole {
  prompt: string;
  command: string;
  output: string;
}

// 常见的 shell prompt 模式
const PROMPT_PATTERNS = [
  // user@host:path$ command
  /^([\w-]+@[\w.-]+:[~\/][\w\/.-]*[#$%>])\s*(.*)$/,
  // user@host$ command
  /^([\w-]+@[\w.-]+[#$%>])\s*(.*)$/,
  // [user@host path]$ command
  /^(\[[\w-]+@[\w.-]+\s+[~\/]?[\w\/.-]*\][#$%>]?)\s*(.*)$/,
  // host:path$ command
  /^([\w.-]+:[~\/][\w\/.-]*[#$%>])\s*(.*)$/,
  // PS C:\path> command (PowerShell)
  /^(PS\s+[A-Z]:\\[\w\\.-]*>)\s*(.*)$/i,
  // C:\path> command (CMD)
  /^([A-Z]:\\[\w\\.-]*>)\s*(.*)$/i,
  // $ command or # command (simple)
  /^([#$%>])\s*(.*)$/,
  // >>> command (Python REPL)
  /^(>>>)\s*(.*)$/,
  // mysql> command
  /^(mysql>)\s*(.*)$/i,
  // redis> command
  /^([\w-]+>)\s*(.*)$/,
];

export function parseConsoleContent(content: string): ParsedConsole {
  const trimmed = content.trim();
  if (!trimmed) {
    return { prompt: '', command: '', output: '' };
  }

  const lines = trimmed.split('\n');
  const firstLine = lines[0];

  // 尝试匹配各种 prompt 模式
  for (const pattern of PROMPT_PATTERNS) {
    const match = firstLine.match(pattern);
    if (match) {
      return {
        prompt: match[1],
        command: match[2] || '',
        output: lines.slice(1).join('\n'),
      };
    }
  }

  // 如果没匹配到，整个内容作为 output
  return {
    prompt: '',
    command: '',
    output: trimmed,
  };
}
