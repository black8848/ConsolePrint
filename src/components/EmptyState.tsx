import { Terminal } from 'lucide-react';

interface EmptyStateProps {
  onAdd: () => void;
}

export function EmptyState({ onAdd }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-14 h-14 rounded-xl bg-[#1e1e1e] flex items-center justify-center mb-4">
        <Terminal size={24} className="text-emerald-400" />
      </div>
      <h3 className="text-base font-medium text-stone-700 mb-1">暂无记录</h3>
      <p className="text-sm text-stone-400 mb-5 text-center max-w-xs">
        添加控制台输出记录，方便排查问题和截图分享
      </p>
      <button
        onClick={onAdd}
        className="px-4 py-2 rounded-lg bg-[#1e1e1e] text-white text-sm font-medium hover:bg-stone-800 transition-colors cursor-pointer"
      >
        添加第一条记录
      </button>
    </div>
  );
}
