// 日志级别颜色映射 (浅色背景适用)
const LOG_PATTERNS: Array<{ pattern: RegExp; className: string }> = [
  // Error patterns
  { pattern: /^.*\b(error|err|fatal|exception|failed|failure)\b.*$/i, className: 'text-red-600' },
  { pattern: /^\[ERROR\].*$/i, className: 'text-red-600' },
  { pattern: /^error:.*$/i, className: 'text-red-600' },
  { pattern: /^E\s+\d+.*$/i, className: 'text-red-600' },

  // Warning patterns
  { pattern: /^.*\b(warn|warning|deprecated)\b.*$/i, className: 'text-amber-600' },
  { pattern: /^\[WARN(ING)?\].*$/i, className: 'text-amber-600' },
  { pattern: /^warning:.*$/i, className: 'text-amber-600' },
  { pattern: /^W\s+\d+.*$/i, className: 'text-amber-600' },

  // Success patterns
  { pattern: /^.*\b(success|succeeded|passed|done|completed|ok)\b.*$/i, className: 'text-emerald-600' },
  { pattern: /^\[OK\].*$/i, className: 'text-emerald-600' },
  { pattern: /^✓.*$/i, className: 'text-emerald-600' },

  // Info patterns
  { pattern: /^\[INFO\].*$/i, className: 'text-blue-600' },
  { pattern: /^info:.*$/i, className: 'text-blue-600' },
  { pattern: /^I\s+\d+.*$/i, className: 'text-blue-600' },

  // Debug patterns
  { pattern: /^\[DEBUG\].*$/i, className: 'text-stone-500' },
  { pattern: /^debug:.*$/i, className: 'text-stone-500' },
  { pattern: /^D\s+\d+.*$/i, className: 'text-stone-500' },

  // Stack trace
  { pattern: /^\s+at\s+.*$/i, className: 'text-stone-500' },
  { pattern: /^\s+in\s+.*$/i, className: 'text-stone-500' },

  // File paths
  { pattern: /^.*\.(js|ts|tsx|jsx|py|java|cs|go|rs|cpp|c|h):\d+.*$/i, className: 'text-cyan-600' },

  // Numbers/versions
  { pattern: /^v?\d+\.\d+\.\d+.*$/i, className: 'text-purple-600' },
];

export function getLineClassName(line: string): string {
  for (const { pattern, className } of LOG_PATTERNS) {
    if (pattern.test(line)) {
      return className;
    }
  }
  return 'text-stone-700';
}

export function renderColoredOutput(output: string): Array<{ text: string; className: string }> {
  const lines = output.split('\n');
  return lines.map((line) => ({
    text: line,
    className: getLineClassName(line),
  }));
}
