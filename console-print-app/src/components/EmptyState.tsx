import { Terminal } from 'lucide-react';

interface EmptyStateProps {
  onAdd: () => void;
}

export function EmptyState({ onAdd }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4">
      <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mb-5">
        <Terminal size={28} className="text-stone-400" />
      </div>
      <h3 className="text-lg font-medium text-stone-700 mb-1">暂无记录</h3>
      <p className="text-sm text-stone-400 mb-6 text-center max-w-xs">
        添加控制台输出记录,方便排查问题和整理调试信息
      </p>
      <button
        onClick={onAdd}
        className="
          px-5 py-2.5 rounded-lg bg-stone-800 text-white font-medium
          hover:bg-stone-700 transition-colors duration-150 cursor-pointer
        "
      >
        添加第一条记录
      </button>
    </div>
  );
}
