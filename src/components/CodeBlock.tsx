import { useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
// Import common languages
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-shell-session';
import 'prismjs/components/prism-nginx';
import 'prismjs/components/prism-ini';
import 'prismjs/components/prism-toml';
import 'prismjs/components/prism-xml-doc';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-docker';
import 'prismjs/components/prism-properties';

export const SUPPORTED_LANGUAGES = [
  { value: 'text', label: '纯文本' },
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'bash', label: 'Bash/Shell' },
  { value: 'nginx', label: 'Nginx' },
  { value: 'ini', label: 'INI' },
  { value: 'toml', label: 'TOML' },
  { value: 'xml', label: 'XML' },
  { value: 'sql', label: 'SQL' },
  { value: 'properties', label: 'Properties' },
  { value: 'docker', label: 'Dockerfile' },
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'log', label: 'Log' },
] as const;

interface CodeBlockProps {
  code: string;
  language: string;
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [code, language]);

  // Map language to Prism language class
  const getPrismLanguage = (lang: string): string => {
    const mapping: Record<string, string> = {
      log: 'bash',
      shell: 'bash',
      text: 'text',
    };
    return mapping[lang] || lang;
  };

  return (
    <pre className="!m-0 !p-4 !bg-gray-50 overflow-x-auto text-sm">
      <code
        ref={codeRef}
        className={`language-${getPrismLanguage(language)}`}
      >
        {code}
      </code>
    </pre>
  );
}

// Auto-detect language from file path
export function detectLanguageFromPath(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase();
  const mapping: Record<string, string> = {
    json: 'json',
    yaml: 'yaml',
    yml: 'yaml',
    sh: 'bash',
    bash: 'bash',
    zsh: 'bash',
    conf: 'nginx',
    nginx: 'nginx',
    ini: 'ini',
    toml: 'toml',
    xml: 'xml',
    sql: 'sql',
    py: 'python',
    js: 'javascript',
    ts: 'typescript',
    java: 'java',
    cs: 'csharp',
    go: 'go',
    rs: 'rust',
    dockerfile: 'docker',
    properties: 'properties',
    log: 'log',
  };

  // Check for special file names
  const fileName = filePath.split('/').pop()?.toLowerCase() || '';
  if (fileName === 'dockerfile') return 'docker';
  if (fileName.endsWith('.conf')) return 'nginx';
  if (fileName.endsWith('.log')) return 'log';

  return mapping[ext || ''] || 'text';
}
