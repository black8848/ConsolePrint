import { useState, useEffect } from 'react';
import { X, Wand2 } from 'lucide-react';
import type { ConsoleRecord } from '../types';
import { generateId } from '../utils/storage';
import { parseConsoleContent } from '../utils/parseConsole';

interface RecordModalProps {
  isOpen: boolean;
  record: ConsoleRecord | null;
  onClose: () => void;
  onSave: (record: ConsoleRecord) => void;
}

export function RecordModal({ isOpen, record, onClose, onSave }: RecordModalProps) {
  const [rawInput, setRawInput] = useState('');
  const [prompt, setPrompt] = useState('');
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState('');
  const [note, setNote] = useState('');
  const [mode, setMode] = useState<'paste' | 'manual'>('paste');

  useEffect(() => {
    if (record) {
      setMode('manual');
      setPrompt(record.prompt);
      setCommand(record.command);
      setOutput(record.output);
      setNote(record.note || '');
      setRawInput('');
    } else {
      setMode('paste');
      setPrompt('');
      setCommand('');
      setOutput('');
      setNote('');
      setRawInput('');
    }
  }, [record, isOpen]);

  const handleParse = () => {
    const parsed = parseConsoleContent(rawInput);
    setPrompt(parsed.prompt);
    setCommand(parsed.command);
    setOutput(parsed.output);
    setMode('manual');
  };

  const handleRawInputChange = (value: string) => {
    setRawInput(value);
    if (value.trim()) {
      const parsed = parseConsoleContent(value);
      setPrompt(parsed.prompt);
      setCommand(parsed.command);
      setOutput(parsed.output);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const now = Date.now();
    onSave({
      id: record?.id || generateId(),
      prompt: prompt.trim(),
      command: command.trim(),
      output,
      note: note.trim() || undefined,
      timestamp: now,
      createdAt: record?.createdAt || now,
    });
    onClose();
  };

  const canSubmit = command.trim() || output.trim();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-stone-900/20 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl border border-stone-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 sticky top-0 bg-white">
          <h2 className="text-lg font-semibold text-stone-800">
            {record ? '编辑记录' : '添加记录'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {!record && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode('paste')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  mode === 'paste'
                    ? 'bg-stone-800 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                粘贴解析
              </button>
              <button
                type="button"
                onClick={() => setMode('manual')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  mode === 'manual'
                    ? 'bg-stone-800 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                手动填写
              </button>
            </div>
          )}

          {mode === 'paste' && !record && (
            <>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  粘贴控制台内容
                </label>
                <textarea
                  value={rawInput}
                  onChange={(e) => handleRawInputChange(e.target.value)}
                  placeholder={'粘贴完整的控制台内容，会自动解析...\n\n例如:\nuser@server:~$ docker run -it \\\n  --name test \\\n  ubuntu:latest\n[ERROR] Container failed...'}
                  rows={10}
                  className="w-full px-3.5 py-3 rounded-lg border border-stone-200 bg-stone-50 font-mono text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200 focus:border-stone-300 transition-colors resize-none"
                  autoFocus
                />
                {rawInput.trim() && (
                  <button
                    type="button"
                    onClick={handleParse}
                    className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-sm font-medium hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    <Wand2 size={14} />
                    确认解析结果
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  注释 <span className="text-stone-400 font-normal">(可选)</span>
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="添加备注说明..."
                  className="w-full px-3 py-2.5 rounded-lg border border-stone-200 text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200 focus:border-stone-300 transition-colors"
                />
              </div>
            </>
          )}

          {(mode === 'manual' || record) && (
            <>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Prompt <span className="text-stone-400 font-normal">(可选)</span>
                </label>
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="user@host:~$"
                  className="w-full px-3 py-2.5 rounded-lg border border-stone-200 bg-stone-50 font-mono text-sm text-emerald-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200 focus:border-stone-300 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  命令 <span className="text-stone-400 font-normal">(支持多行)</span>
                </label>
                <textarea
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  placeholder={'npm run build\n# 或多行命令:\ndocker run -it \\\n  --name test \\\n  ubuntu:latest'}
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg border border-stone-200 bg-stone-50 font-mono text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200 focus:border-stone-300 transition-colors resize-none"
                  autoFocus={mode === 'manual'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  输出内容
                </label>
                <textarea
                  value={output}
                  onChange={(e) => setOutput(e.target.value)}
                  placeholder="控制台输出..."
                  rows={8}
                  className="w-full px-3.5 py-3 rounded-lg border border-stone-200 bg-stone-50 font-mono text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200 focus:border-stone-300 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  注释 <span className="text-stone-400 font-normal">(可选)</span>
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="添加备注说明..."
                  className="w-full px-3 py-2.5 rounded-lg border border-stone-200 text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200 focus:border-stone-300 transition-colors"
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-stone-600 font-medium hover:bg-stone-100 transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="px-5 py-2 rounded-lg bg-stone-800 text-white font-medium hover:bg-stone-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {record ? '保存' : '添加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
