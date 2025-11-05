import React, { useState, useMemo } from 'react';
import { FileData } from '../types';
import { useAppContext } from '../App';

interface BulkForwardFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileForward: () => void;
  selectedFileIds: string[];
}

const BulkForwardFileModal: React.FC<BulkForwardFileModalProps> = ({ isOpen, onClose, onFileForward, selectedFileIds }) => {
  const { currentUser, users, roles, refreshData } = useAppContext();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const assignableUsers = useMemo(() => {
    const adminRoleNames = ['Admin', 'Officer'];
    const assignableRoleIds = roles.filter(r => adminRoleNames.includes(r.name)).map(r => r.id);
    return users.filter(user => assignableRoleIds.includes(user.roleId));
  }, [users, roles]);


  const handleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUsers.length === 0) return;

    const allFiles: FileData[] = JSON.parse(localStorage.getItem('files') || '[]');
    const userNames = selectedUsers.map(id => users.find(u => u.id === id)?.name || 'Unknown').join(', ');
    
    const updatedFiles = allFiles.map(f => {
      if (selectedFileIds.includes(f.id)) {
        return {
          ...f,
          assignedTo: selectedUsers,
          history: [...f.history, { action: `Assigned to ${userNames}`, user: currentUser!.name, timestamp: new Date().toISOString() }],
        };
      }
      return f;
    });

    localStorage.setItem('files', JSON.stringify(updatedFiles));
    refreshData();
    onFileForward(); // Used to reset selections in parent
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Bulk Forward Files</h2>
        <p className="text-slate-600 mb-6">You are forwarding <span className="font-medium">{selectedFileIds.length}</span> file(s).</p>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="officer-bulk" className="block text-sm font-medium text-slate-700 mb-2">Select Users to Assign</label>
            <div className="border border-slate-300 rounded-md max-h-60 overflow-y-auto">
              {assignableUsers.map(user => (
                <div key={user.id} className="flex items-center p-3 border-b border-slate-200 last:border-b-0 hover:bg-slate-50">
                  <input
                    type="checkbox"
                    id={`bulk-forward-user-${user.id}`}
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleUserSelection(user.id)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor={`bulk-forward-user-${user.id}`} className="ml-3 block text-sm font-medium text-slate-700 cursor-pointer">
                    {user.name} <span className="text-xs text-slate-500">({roles.find(r=>r.id === user.roleId)?.name})</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end space-x-4 pt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 transition">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">Forward Files</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BulkForwardFileModal;
