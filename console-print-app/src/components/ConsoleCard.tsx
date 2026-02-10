import { useState } from 'react';
import { Pencil, Trash2, Copy, Check } from 'lucide-react';
import type { ConsoleRecord } from '../types';
import { StatusBadge } from './StatusBadge';

interface ConsoleCardProps {
  record: ConsoleRecord;
  onEdit: (record: ConsoleRecord) => void;
  onDelete: (id: string) => void;
}

export function ConsoleCard({ record, onEdit, onDelete }: ConsoleCardProps) {
  const [copied, setCopied] = useState(false);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(record.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="
        bg-white rounded-xl shadow-sm border border-stone-200/60
        hover:shadow-md hover:border-stone-300/60
        transition-all duration-200 ease-out
        overflow-hidden
      "
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-stone-100 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-stone-800 truncate">{record.title}</h3>
          <p className="text-xs text-stone-400 mt-0.5">{formatTime(record.timestamp)}</p>
        </div>
        <StatusBadge status={record.status} />
      </div>

      {/* Console Content */}
      <div className="p-4 bg-stone-50/50">
        <pre
          className="
            font-mono text-sm text-stone-700 leading-relaxed
            whitespace-pre-wrap break-words
            max-h-48 overflow-y-auto
            bg-white rounded-lg p-3 border border-stone-200/80
          "
        >
          {record.content || '(empty)'}
        </pre>
      </div>

      {/* Actions */}
      <div className="px-4 py-2.5 bg-stone-50/30 border-t border-stone-100 flex justify-end gap-1">
        <button
          onClick={handleCopy}
          className="
            p-2 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100
            transition-colors duration-150 cursor-pointer
          "
          title="复制内容"
        >
          {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
        </button>
        <button
          onClick={() => onEdit(record)}
          className="
            p-2 rounded-lg text-stone-400 hover:text-blue-600 hover:bg-blue-50
            transition-colors duration-150 cursor-pointer
          "
          title="编辑"
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={() => onDelete(record.id)}
          className="
            p-2 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50
            transition-colors duration-150 cursor-pointer
          "
          title="删除"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
