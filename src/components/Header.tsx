import { useRef } from 'react';
import { Plus, Trash2, Download, Upload, Camera, FolderOpen, Link, Unlink } from 'lucide-react';
import type { ConsoleRecord } from '../types';

interface HeaderProps {
  recordCount: number;
  boundFileName: string | null;
  onAdd: () => void;
  onClearAll: () => void;
  onExport: () => void;
  onImport: (records: ConsoleRecord[]) => void;
  onScreenshotAll: () => void;
  onBindFile: () => void;
  onCreateFile: () => void;
  onUnbindFile: () => void;
}

export function Header({
  recordCount,
  boundFileName,
  onAdd,
  onClearAll,
  onExport,
  onImport,
  onScreenshotAll,
  onBindFile,
  onCreateFile,
  onUnbindFile,
}: HeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (Array.isArray(data)) {
          onImport(data);
        }
      } catch (error) {
        console.error('Import failed:', error);
        alert('导入失败：文件格式不正确');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header className="sticky top-0 z-40 bg-[#f5f5f0]/90 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-stone-800 flex items-center justify-center">
              <span className="text-emerald-400 font-mono text-xs font-bold">&gt;_</span>
            </div>
            <div>
              <h1 className="text-base font-semibold text-stone-800">Console Print</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 文件绑定状态 */}
            {boundFileName ? (
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-200">
                <Link size={12} className="text-emerald-600" />
                <span className="text-xs text-emerald-700 max-w-24 truncate">{boundFileName}</span>
                <button
                  onClick={onUnbindFile}
                  className="p-0.5 rounded text-emerald-600 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                  title="解除绑定"
                >
                  <Unlink size={12} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  onClick={onBindFile}
                  className="p-2 rounded-lg text-stone-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                  title="打开本地文件"
                >
                  <FolderOpen size={16} />
                </button>
                <button
                  onClick={onCreateFile}
                  className="p-2 rounded-lg text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                  title="另存为本地文件"
                >
                  <Link size={16} />
                </button>
              </div>
            )}

            <div className="w-px h-5 bg-stone-200 mx-1" />

            <span className="text-xs text-stone-400">{recordCount} 条</span>

            {recordCount > 0 && (
              <>
                <button
                  onClick={onScreenshotAll}
                  className="p-2 rounded-lg text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                  title="保存全部截图"
                >
                  <Camera size={16} />
                </button>
                <button
                  onClick={onExport}
                  className="p-2 rounded-lg text-stone-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                  title="导出 JSON"
                >
                  <Download size={16} />
                </button>
              </>
            )}

            <button
              onClick={handleImportClick}
              className="p-2 rounded-lg text-stone-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
              title="导入 JSON"
            >
              <Upload size={16} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />

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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 text-white text-sm font-medium hover:bg-stone-700 transition-colors cursor-pointer"
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
