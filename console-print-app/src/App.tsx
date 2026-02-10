import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { TerminalBlock } from './components/TerminalBlock';
import { RecordModal } from './components/RecordModal';
import { EmptyState } from './components/EmptyState';
import { ConfirmDialog } from './components/ConfirmDialog';
import type { ConsoleRecord } from './types';
import { loadRecords, saveRecords } from './utils/storage';

function App() {
  const [records, setRecords] = useState<ConsoleRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ConsoleRecord | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'delete' | 'clear';
    targetId?: string;
  }>({ isOpen: false, type: 'delete' });

  useEffect(() => {
    setRecords(loadRecords());
  }, []);

  useEffect(() => {
    saveRecords(records);
  }, [records]);

  const handleAdd = useCallback(() => {
    setEditingRecord(null);
    setIsModalOpen(true);
  }, []);

  const handleEdit = useCallback((record: ConsoleRecord) => {
    setEditingRecord(record);
    setIsModalOpen(true);
  }, []);

  const handleSave = useCallback((record: ConsoleRecord) => {
    setRecords((prev) => {
      const exists = prev.find((r) => r.id === record.id);
      if (exists) {
        return prev.map((r) => (r.id === record.id ? record : r));
      }
      return [record, ...prev];
    });
  }, []);

  const handleDeleteRequest = useCallback((id: string) => {
    setConfirmDialog({ isOpen: true, type: 'delete', targetId: id });
  }, []);

  const handleClearRequest = useCallback(() => {
    setConfirmDialog({ isOpen: true, type: 'clear' });
  }, []);

  const handleConfirm = useCallback(() => {
    if (confirmDialog.type === 'delete' && confirmDialog.targetId) {
      setRecords((prev) => prev.filter((r) => r.id !== confirmDialog.targetId));
    } else if (confirmDialog.type === 'clear') {
      setRecords([]);
    }
    setConfirmDialog({ isOpen: false, type: 'delete' });
  }, [confirmDialog]);

  const sortedRecords = [...records].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <Header
        recordCount={records.length}
        onAdd={handleAdd}
        onClearAll={handleClearRequest}
      />

      <main className="max-w-4xl mx-auto px-6 py-8">
        {records.length === 0 ? (
          <EmptyState onAdd={handleAdd} />
        ) : (
          <div className="space-y-6">
            {sortedRecords.map((record) => (
              <TerminalBlock
                key={record.id}
                record={record}
                onEdit={handleEdit}
                onDelete={handleDeleteRequest}
              />
            ))}
          </div>
        )}
      </main>

      <RecordModal
        isOpen={isModalOpen}
        record={editingRecord}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.type === 'clear' ? '清空所有记录' : '删除记录'}
        message={
          confirmDialog.type === 'clear'
            ? '确定要删除所有记录吗？此操作不可撤销。'
            : '确定要删除这条记录吗？'
        }
        confirmLabel={confirmDialog.type === 'clear' ? '清空' : '删除'}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmDialog({ isOpen: false, type: 'delete' })}
      />
    </div>
  );
}

export default App;
