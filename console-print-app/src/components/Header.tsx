import { Plus, Trash2 } from 'lucide-react';

interface HeaderProps {
  recordCount: number;
  onAdd: () => void;
  onClearAll: () => void;
}

export function Header({ recordCount, onAdd, onClearAll }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-[#f5f5f0]/90 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-[#1e1e1e] flex items-center justify-center">
              <span className="text-emerald-400 font-mono text-xs font-bold">&gt;_</span>
            </div>
            <div>
              <h1 className="text-base font-semibold text-stone-800">Console Print</h1>
            </div>
          </div>

          {/* Stats & Actions */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-stone-400">{recordCount} 条记录</span>
            {recordCount > 0 && (
              <button
                onClick={onClearAll}
                className="p-2 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                title="清空所有"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button
              onClick={onAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1e1e1e] text-white text-sm font-medium hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <Plus size={16} />
              <span>添加</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
