import React, { useState } from 'react';
import { FileData, Status } from '../types';
import { useAppContext } from '../App';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, refreshData } = useAppContext();
  const [fileName, setFileName] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName || !description || !deadline) return;

    const newFile: FileData = {
      id: `file-${Date.now()}`,
      name: fileName,
      description,
      uploadDate: new Date().toISOString(),
      deadline: new Date(deadline).toISOString(),
      status: Status.PENDING,
      history: [{ action: 'Created', user: currentUser!.name, timestamp: new Date().toISOString() }],
    };

    const files: FileData[] = JSON.parse(localStorage.getItem('files') || '[]');
    files.push(newFile);
    localStorage.setItem('files', JSON.stringify(files));
    
    refreshData();
    onClose();
    setFileName('');
    setDescription('');
    setDeadline('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Upload New File</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fileName" className="block text-sm font-medium text-slate-700">File Name</label>
            <input
              type="text"
              id="fileName"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            ></textarea>
          </div>
          <div>
            <label htmlFor="deadline" className="block text-sm font-medium text-slate-700">Deadline</label>
            <input
              type="date"
              id="deadline"
              value={deadline}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDeadline(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 transition">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">Upload File</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FileUploadModal;
