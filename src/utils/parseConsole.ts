export interface ParsedConsole {
  prompt: string;
  command: string;
  output: string;
}

// 常见的 shell prompt 模式
const PROMPT_PATTERNS = [
  // user@host:path$ command
  /^([\w-]+@[\w.-]+:[~\/][\w\/.-]*[#$%>])\s*/,
  // user@host$ command
  /^([\w-]+@[\w.-]+[#$%>])\s*/,
  // [user@host path]$ command
  /^(\[[\w-]+@[\w.-]+\s+[~\/]?[\w\/.-]*\][#$%>]?)\s*/,
  // host:path$ command
  /^([\w.-]+:[~\/][\w\/.-]*[#$%>])\s*/,
  // PS C:\path> command (PowerShell)
  /^(PS\s+[A-Z]:\\[\w\\.-]*>)\s*/i,
  // C:\path> command (CMD)
  /^([A-Z]:\\[\w\\.-]*>)\s*/i,
  // $ command or # command (simple)
  /^([#$%>])\s*/,
  // >>> command (Python REPL)
  /^(>>>)\s*/,
  // mysql> command
  /^(mysql>)\s*/i,
  // redis> command
  /^([\w-]+>)\s*/,
];

// 检测是否是续行（多行命令的一部分）
function isContinuationLine(line: string): boolean {
  // 以 > 开头（PS continuation）、以空格/tab开头、或者上一行以 \ 结尾
  return /^>\s/.test(line) || /^\s+/.test(line);
}

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
      const prompt = match[1];
      const restOfFirstLine = firstLine.slice(match[0].length);

      // 收集多行命令
      const commandLines: string[] = [restOfFirstLine];
      let outputStartIndex = 1;

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        // 检查是否是续行或者以 \ 结尾的上一行
        if (isContinuationLine(line) || commandLines[commandLines.length - 1].endsWith('\\')) {
          commandLines.push(line);
          outputStartIndex = i + 1;
        } else {
          break;
        }
      }

      return {
        prompt,
        command: commandLines.join('\n'),
        output: lines.slice(outputStartIndex).join('\n'),
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
