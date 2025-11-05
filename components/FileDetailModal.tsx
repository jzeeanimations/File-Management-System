import React from 'react';
import { FileData, Status } from '../types';
import { useAppContext } from '../App';
import FileIcon from './FileIcon';
import { ICONS } from '../constants';

const statusColors: { [key in Status]: string } = {
  [Status.PENDING]: 'bg-gray-200 text-gray-800',
  [Status.SEEN]: 'bg-blue-200 text-blue-800',
  [Status.UNDER_PROCESS]: 'bg-yellow-200 text-yellow-800',
  [Status.SUBMITTED]: 'bg-green-200 text-green-800',
  [Status.OVERDUE]: 'bg-red-200 text-red-800',
};

interface FileDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: FileData;
}

const FileDetailModal: React.FC<FileDetailModalProps> = ({ isOpen, onClose, file }) => {
  const { users } = useAppContext();
  if (!isOpen) return null;

  const findUserName = (userId: string) => users.find(u => u.id === userId)?.name || 'Unknown';
  
  const assignedToNames = file.assignedTo?.map(findUserName).join(', ') || 'N/A';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-slate-800">{file.name}</h2>
            <button onClick={onClose} className="text-4xl font-light text-slate-500 hover:text-slate-800 leading-none">&times;</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-6">
            <div>
                <p className="text-sm font-medium text-slate-500">Status</p>
                <p><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[file.status]}`}>{file.status}</span></p>
            </div>
             <div>
                <p className="text-sm font-medium text-slate-500">Assigned To</p>
                <p className="text-slate-800">{assignedToNames}</p>
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500">Upload Date</p>
                <p className="text-slate-800">{new Date(file.uploadDate).toLocaleString()}</p>
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500">Deadline</p>
                <p className="text-slate-800">{new Date(file.deadline).toLocaleString()}</p>
            </div>
            <div className="md:col-span-2">
                <p className="text-sm font-medium text-slate-500">Description</p>
                <p className="text-slate-800 whitespace-pre-wrap">{file.description}</p>
            </div>
        </div>

        <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4 border-t pt-4">File History</h3>
            <div className="space-y-4">
                {file.history.slice().reverse().map((entry, index) => (
                    <div key={index} className="flex space-x-3">
                        <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-sm font-semibold">
                                {entry.user.substring(0, 1)}
                            </div>
                        </div>
                        <div>
                            <p className="text-sm">
                                <span className="font-semibold text-slate-800">{entry.user}</span>
                                <span className="text-slate-500"> - {entry.action}</span>
                            </p>
                            <p className="text-xs text-slate-400">{new Date(entry.timestamp).toLocaleString()}</p>
                            {entry.details && (
                                <p className="mt-1 text-sm text-slate-600 bg-slate-50 p-2 rounded-md whitespace-pre-wrap">{entry.details}</p>
                            )}
                            {entry.attachment && (
                                <div className="mt-2 p-2 border border-slate-200 rounded-lg flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <FileIcon mimeType={entry.attachment.mimeType} className="h-6 w-6" />
                                        <span className="text-sm text-slate-700">{entry.attachment.name}</span>
                                    </div>
                                    <a 
                                        href={entry.attachment.content} 
                                        download={entry.attachment.name}
                                        className="inline-flex items-center space-x-2 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition"
                                        title={`Download ${entry.attachment.name}`}
                                    >
                                        {ICONS.download}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
        <div className="flex justify-end pt-6 mt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 transition">Close</button>
        </div>
      </div>
    </div>
  );
};

export default FileDetailModal;