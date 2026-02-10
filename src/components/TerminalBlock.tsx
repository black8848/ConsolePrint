import { useRef, useState } from 'react';
import { Pencil, Trash2, MessageSquare, Camera } from 'lucide-react';
import { domToPng } from 'modern-screenshot';
import type { ConsoleRecord } from '../types';
import { renderColoredOutput } from '../utils/logColors';

interface TerminalBlockProps {
  record: ConsoleRecord;
  onEdit: (record: ConsoleRecord) => void;
  onDelete: (id: string) => void;
}

export function TerminalBlock({ record, onEdit, onDelete }: TerminalBlockProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [capturing, setCapturing] = useState(false);
  const coloredLines = renderColoredOutput(record.output);
  const hasPromptOrCommand = record.prompt || record.command;

  const handleScreenshot = async () => {
    if (!contentRef.current || capturing) return;

    setCapturing(true);
    try {
      const dataUrl = await domToPng(contentRef.current, {
        scale: 2,
        backgroundColor: '#fafaf9',
      });

      const link = document.createElement('a');
      link.download = `console-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Screenshot failed:', error);
      alert('截图失败，请重试');
    } finally {
      setCapturing(false);
    }
  };

  return (
    <div className="group relative">
      <div
        ref={contentRef}
        className="bg-white rounded-lg overflow-hidden shadow-sm border border-stone-200"
      >
        <div className="p-4 font-mono text-sm leading-relaxed bg-stone-50">
          {hasPromptOrCommand && (
            <div className="pb-2 mb-2 border-b border-stone-200">
              <div className="flex gap-x-2">
                {record.prompt && (
                  <span className="text-emerald-600 font-medium flex-shrink-0">{record.prompt}</span>
                )}
                {record.command && (
                  <span className="text-stone-800 whitespace-pre-wrap">{record.command}</span>
                )}
              </div>
            </div>
          )}

          {record.output && (
            <div className="whitespace-pre-wrap break-words">
              {coloredLines.map((line, index) => (
                <div key={index} className={line.className}>
                  {line.text || '\u00A0'}
                </div>
              ))}
            </div>
          )}

          {record.note && (
            <div className="mt-3 pt-3 border-t border-stone-200 flex items-start gap-1.5 text-stone-500 text-xs">
              <MessageSquare size={12} className="mt-0.5 flex-shrink-0" />
              <span className="italic">{record.note}</span>
            </div>
          )}
        </div>
      </div>

      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-lg shadow-sm border border-stone-200 p-1">
        <button
          onClick={handleScreenshot}
          disabled={capturing}
          className="p-1.5 rounded text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer disabled:opacity-50"
          title="保存截图"
        >
          <Camera size={14} />
        </button>
        <button
          onClick={() => onEdit(record)}
          className="p-1.5 rounded text-stone-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
          title="编辑"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => onDelete(record.id)}
          className="p-1.5 rounded text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          title="删除"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
