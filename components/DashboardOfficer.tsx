import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Header from './Header';
import { FileData, Status, Permission } from '../types';
import { useAppContext } from '../App';
import ReplyModal from './ReplyModal';
import FileDetailModal from './FileDetailModal';
import FileUploadModal from './FileUploadModal';
import { ICONS } from '../constants';
import Toast from './Toast';
import FileIcon from './FileIcon';

const statusColors: { [key in Status]: { bg: string; text: string; border: string } } = {
  [Status.PENDING]: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' },
  [Status.SEEN]: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  [Status.UNDER_PROCESS]: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
  [Status.SUBMITTED]: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
  [Status.OVERDUE]: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
};

interface Notification {
  id: string;
  message: string;
}

const FileCard: React.FC<{ file: FileData; onView: (file: FileData) => void; onReply: (file: FileData) => void; canReply: boolean; }> = ({ file, onView, onReply, canReply }) => {
    const colors = statusColors[file.status];

    const isDueSoon = useMemo(() => {
        if (file.status === Status.SUBMITTED || file.status === Status.OVERDUE) {
            return false;
        }
        const today = new Date();
        const deadlineDate = new Date(file.deadline);
        const diffTime = deadlineDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 2;
    }, [file.deadline, file.status]);

    const latestAttachmentMimeType = useMemo(() => {
        const historyWithAttachments = file.history
            .filter(h => h.attachment)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        return historyWithAttachments.length > 0 ? historyWithAttachments[0].attachment!.mimeType : undefined;
    }, [file.history]);

    const cardBorderColor = isDueSoon ? 'border-orange-400' : colors.border;
    const cardBgColor = isDueSoon ? 'bg-orange-50' : colors.bg;

    return (
        <div className={`border-l-4 ${cardBorderColor} ${cardBgColor} p-4 rounded-r-lg shadow-sm`}>
            <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3 min-w-0">
                    <FileIcon mimeType={latestAttachmentMimeType} className="h-6 w-6 flex-shrink-0" />
                    <div className="min-w-0">
                        <h3 className="font-bold text-lg text-slate-800 truncate">{file.name}</h3>
                        <p className="text-sm text-slate-600 mt-1 truncate">{file.description}</p>
                    </div>
                </div>
                <span className={`ml-2 px-3 py-1 text-xs font-semibold rounded-full ${colors.bg.replace('100','200')} ${colors.text}`}>{file.status}</span>
            </div>
            <div className="mt-4 flex justify-between items-center text-sm text-slate-500">
                <div className="flex items-center space-x-4">
                  <span>Deadline: <span className="font-medium text-slate-700">{new Date(file.deadline).toLocaleDateString()}</span></span>
                  {isDueSoon && (
                        <div className="flex items-center space-x-1 text-orange-600 font-semibold">
                            {ICONS.clock}
                            <span>Due Soon</span>
                        </div>
                    )}
                </div>
                <div className="space-x-2">
                    <button onClick={() => onView(file)} className="px-3 py-1 text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition">View Details</button>
                    <button 
                        onClick={() => onReply(file)} 
                        className="px-3 py-1 text-green-700 bg-green-100 hover:bg-green-200 rounded-md transition disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed" 
                        disabled={file.status === Status.SUBMITTED || !canReply}
                        title={!canReply ? "Replies are only allowed on files created by an Admin." : "Submit a reply or update for this file."}
                    >
                        Submit Reply
                    </button>
                </div>
            </div>
        </div>
    );
};

const DashboardOfficer: React.FC = () => {
  const { currentUser, files, users, roles, refreshData, hasPermission } = useAppContext();
  const [myFiles, setMyFiles] = useState<FileData[]>([]);
  const [isReplyModalOpen, setReplyModalOpen] = useState(false);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const isInitialMount = useRef(true);
  const prevPendingFileIds = useRef<Set<string>>(new Set());
  
  const canReplyToFile = useCallback((file: FileData): boolean => {
      const creationHistory = file.history.find(h => h.action === 'Created');
      if (!creationHistory) return false;

      const creatorName = creationHistory.user;
      const creatorUser = users.find(u => u.name === creatorName);
      if (!creatorUser) return false;

      const creatorRole = roles.find(r => r.id === creatorUser.roleId);
      if (!creatorRole) return false;

      return ['Admin', 'Super Admin'].includes(creatorRole.name);
  }, [users, roles]);

  useEffect(() => {
    const officerFiles = files.filter(file => file.assignedTo?.includes(currentUser!.id));
    
    const updatedMyFiles = officerFiles.map(file => {
        if (new Date(file.deadline) < new Date() && file.status !== Status.SUBMITTED) {
           return { ...file, status: Status.OVERDUE };
       }
       return file;
   });

    setMyFiles(updatedMyFiles);

    const allFilesWithUpdatedStatus = files.map(file => {
        if (new Date(file.deadline) < new Date() && file.status !== Status.SUBMITTED) {
           return { ...file, status: Status.OVERDUE };
       }
       return file;
    });

    if(JSON.stringify(files) !== JSON.stringify(allFilesWithUpdatedStatus)){
        localStorage.setItem('files', JSON.stringify(allFilesWithUpdatedStatus));
        refreshData();
    }
  }, [files, currentUser, refreshData]);
  
  useEffect(() => {
    const interval = setInterval(refreshData, 5000); // Refresh frequently
    return () => clearInterval(interval);
  }, [refreshData]);

  useEffect(() => {
    const currentPendingFiles = myFiles.filter(f => f.status === Status.PENDING);
    const currentPendingIds = new Set(currentPendingFiles.map(f => f.id));

    if (isInitialMount.current) {
      prevPendingFileIds.current = currentPendingIds;
      isInitialMount.current = false;
    } else {
      const newAssignments = currentPendingFiles.filter(f => !prevPendingFileIds.current.has(f.id));
      
      if (newAssignments.length > 0) {
        const newNotifs = newAssignments.map(file => ({
          id: `notif-${file.id}-${Date.now()}`,
          message: `New file assigned: "${file.name}"`,
        }));
        setNotifications(prev => [...prev, ...newNotifs]);
      }
      prevPendingFileIds.current = currentPendingIds;
    }
  }, [myFiles]);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const pendingCount = useMemo(() => myFiles.filter(f => f.status === Status.PENDING).length, [myFiles]);

  const handleViewDetails = (file: FileData) => {
    if (file.status === Status.PENDING) {
        updateFileStatus(file.id, Status.SEEN);
    }
    setSelectedFile(file);
    setDetailModalOpen(true);
  };

  const updateFileStatus = (fileId: string, newStatus: Status) => {
    const allFiles: FileData[] = JSON.parse(localStorage.getItem('files') || '[]');
    const updatedFiles = allFiles.map(f => {
        if (f.id === fileId) {
            return {
                ...f,
                status: newStatus,
                history: [...f.history, { action: `Status changed to ${newStatus}`, user: currentUser!.name, timestamp: new Date().toISOString() }]
            };
        }
        return f;
    });
    localStorage.setItem('files', JSON.stringify(updatedFiles));
    refreshData();
  }

  const handleReplyClick = (file: FileData) => {
    if (file.status === Status.SEEN || file.status === Status.PENDING) {
        updateFileStatus(file.id, Status.UNDER_PROCESS);
    }
    setSelectedFile(file);
    setReplyModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div aria-live="assertive" className="fixed inset-0 flex items-start px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-50">
        <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
            {notifications.map(notif => (
              <Toast
                key={notif.id}
                message={notif.message}
                onClose={() => removeNotification(notif.id)}
              />
            ))}
        </div>
      </div>

      <Header notificationCount={pendingCount}/>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">My Assigned Files</h2>
            {hasPermission(Permission.CAN_UPLOAD_FILE) && (
                <button onClick={() => setUploadModalOpen(true)} className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                    {ICONS.upload}
                    <span>Upload File</span>
                </button>
            )}
        </div>
        <div className="space-y-4">
          {myFiles.length > 0 ? (
            myFiles.map(file => (
              <FileCard key={file.id} file={file} onView={handleViewDetails} onReply={handleReplyClick} canReply={canReplyToFile(file)} />
            ))
          ) : (
            <div className="text-center py-10 bg-white rounded-lg shadow-md">
              <p className="text-slate-500">You have no files assigned to you.</p>
            </div>
          )}
        </div>
      </main>
      <FileUploadModal isOpen={isUploadModalOpen} onClose={() => setUploadModalOpen(false)} />
      {selectedFile && (
          <ReplyModal 
              isOpen={isReplyModalOpen} 
              onClose={() => { setReplyModalOpen(false); setSelectedFile(null); }} 
              file={selectedFile} 
          />
      )}
      {selectedFile && (
          <FileDetailModal
              isOpen={isDetailModalOpen}
              onClose={() => { setDetailModalOpen(false); setSelectedFile(null); }}
              file={selectedFile}
          />
      )}
    </div>
  );
};

export default DashboardOfficer;