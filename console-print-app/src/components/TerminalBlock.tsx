import { Pencil, Trash2, MessageSquare } from 'lucide-react';
import type { ConsoleRecord } from '../types';
import { renderColoredOutput } from '../utils/logColors';

interface TerminalBlockProps {
  record: ConsoleRecord;
  onEdit: (record: ConsoleRecord) => void;
  onDelete: (id: string) => void;
}

export function TerminalBlock({ record, onEdit, onDelete }: TerminalBlockProps) {
  const coloredLines = renderColoredOutput(record.output);
  const hasPromptOrCommand = record.prompt || record.command;

  return (
    <div className="group relative">
      {/* Terminal Window */}
      <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-stone-200 hover:shadow-md transition-shadow">
        {/* Terminal Content */}
        <div className="p-4 font-mono text-sm leading-relaxed bg-stone-50">
          {/* Command Line */}
          {hasPromptOrCommand && (
            <div className="flex flex-wrap gap-x-2 pb-2 mb-2 border-b border-stone-200">
              {record.prompt && (
                <span className="text-emerald-600 font-medium">{record.prompt}</span>
              )}
              {record.command && (
                <span className="text-stone-800">{record.command}</span>
              )}
            </div>
          )}

          {/* Output */}
          {record.output && (
            <div className="whitespace-pre-wrap break-words">
              {coloredLines.map((line, index) => (
                <div key={index} className={line.className}>
                  {line.text || '\u00A0'}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions Bar */}
        <div className="px-4 py-2 bg-white border-t border-stone-100 flex items-center justify-between">
          {/* Note */}
          {record.note ? (
            <div className="flex items-center gap-1.5 text-stone-500 text-xs">
              <MessageSquare size={12} />
              <span className="italic">{record.note}</span>
            </div>
          ) : (
            <div />
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
      </div>
    </div>
  );
}
