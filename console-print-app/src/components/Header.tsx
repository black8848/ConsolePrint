import { Plus, Trash2 } from 'lucide-react';

interface HeaderProps {
  recordCount: number;
  onAdd: () => void;
  onClearAll: () => void;
}

export function Header({ recordCount, onAdd, onClearAll }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-[#f8f7f4]/80 backdrop-blur-md border-b border-stone-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-stone-800 flex items-center justify-center">
              <span className="text-white font-mono text-sm font-bold">&gt;_</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-stone-800">Console Print</h1>
              <p className="text-xs text-stone-400">
                {recordCount} 条记录
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {recordCount > 0 && (
              <button
                onClick={onClearAll}
                className="
                  flex items-center gap-1.5 px-3 py-2 rounded-lg
                  text-stone-500 hover:text-red-600 hover:bg-red-50
                  transition-colors duration-150 text-sm font-medium cursor-pointer
                "
              >
                <Trash2 size={16} />
                <span className="hidden sm:inline">清空</span>
              </button>
            )}
            <button
              onClick={onAdd}
              className="
                flex items-center gap-1.5 px-4 py-2 rounded-lg
                bg-stone-800 text-white hover:bg-stone-700
                transition-colors duration-150 text-sm font-medium cursor-pointer
              "
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
