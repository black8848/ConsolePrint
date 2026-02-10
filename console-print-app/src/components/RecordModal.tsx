import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { ConsoleRecord, LogStatus } from '../types';
import { STATUS_CONFIG, STATUS_OPTIONS } from '../utils/statusConfig';
import { generateId } from '../utils/storage';

interface RecordModalProps {
  isOpen: boolean;
  record: ConsoleRecord | null;
  onClose: () => void;
  onSave: (record: ConsoleRecord) => void;
}

export function RecordModal({ isOpen, record, onClose, onSave }: RecordModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<LogStatus>('info');

  useEffect(() => {
    if (record) {
      setTitle(record.title);
      setContent(record.content);
      setStatus(record.status);
    } else {
      setTitle('');
      setContent('');
      setStatus('info');
    }
  }, [record, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const now = Date.now();
    onSave({
      id: record?.id || generateId(),
      title: title.trim(),
      content,
      status,
      timestamp: now,
      createdAt: record?.createdAt || now,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-900/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="
          relative w-full max-w-lg bg-white rounded-2xl shadow-xl
          border border-stone-200/60
          animate-in fade-in zoom-in-95 duration-200
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <h2 className="text-lg font-semibold text-stone-800">
            {record ? '编辑记录' : '添加记录'}
          </h2>
          <button
            onClick={onClose}
            className="
              p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100
              transition-colors duration-150 cursor-pointer
            "
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              标题
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="如: 登录API错误, 数据库连接失败..."
              className="
                w-full px-3.5 py-2.5 rounded-lg border border-stone-200
                text-stone-800 placeholder:text-stone-400
                focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                transition-colors duration-150
              "
              autoFocus
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              状态
            </label>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((s) => {
                const config = STATUS_CONFIG[s];
                const isSelected = status === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`
                      px-3 py-1.5 rounded-lg text-sm font-medium
                      border transition-all duration-150 cursor-pointer
                      ${isSelected
                        ? `${config.bgColor} ${config.textColor} ${config.borderColor}`
                        : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300'
                      }
                    `}
                  >
                    {config.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              控制台输出
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="粘贴控制台输出内容..."
              rows={8}
              className="
                w-full px-3.5 py-2.5 rounded-lg border border-stone-200
                font-mono text-sm text-stone-700 placeholder:text-stone-400
                focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                transition-colors duration-150 resize-none
                bg-stone-50/50
              "
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="
                px-4 py-2 rounded-lg text-stone-600 font-medium
                hover:bg-stone-100 transition-colors duration-150 cursor-pointer
              "
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="
                px-5 py-2 rounded-lg bg-stone-800 text-white font-medium
                hover:bg-stone-700 transition-colors duration-150
                disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
              "
            >
              {record ? '保存' : '添加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
