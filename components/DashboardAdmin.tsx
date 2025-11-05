import React, { useState, useEffect, useMemo, useRef } from 'react';
import Header from './Header';
import { FileData, Status, Permission } from '../types';
import { ICONS } from '../constants';
import FileUploadModal from './FileUploadModal';
import ForwardFileModal from './ForwardFileModal';
import UserManagement from './UserManagement';
import FileDetailModal from './FileDetailModal';
import BulkForwardFileModal from './BulkForwardFileModal';
import { useAppContext } from '../App';
import FileIcon from './FileIcon';

const statusColors: { [key in Status]: string } = {
  [Status.PENDING]: 'bg-gray-500 text-white',
  [Status.SEEN]: 'bg-blue-500 text-white',
  [Status.UNDER_PROCESS]: 'bg-yellow-400 text-black',
  [Status.SUBMITTED]: 'bg-green-500 text-white',
  [Status.OVERDUE]: 'bg-red-500 text-white',
};

const SummaryCard: React.FC<{ title: string; value: number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
        <div className={`p-3 rounded-full ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-500">{title}</p>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
        </div>
    </div>
);

const StatusBarChart: React.FC<{ data: { name: Status, value: number }[] }> = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">File Status Overview</h3>
            <div className="space-y-4">
                {data.map(item => (
                    <div key={item.name} className="flex items-center">
                        <span className="w-32 text-sm text-slate-600">{item.name}</span>
                        <div className="flex-1 bg-slate-200 rounded-full h-6">
                            <div
                                className={`${statusColors[item.name].split(' ')[0]} h-6 rounded-full flex items-center justify-end pr-2`}
                                style={{ width: `${(item.value / maxValue) * 100}%` }}
                            >
                               <span className="text-xs font-bold text-slate-700">{item.value}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


const DashboardAdmin: React.FC = () => {
    const { users, files, refreshData, hasPermission } = useAppContext();
    const [currentFiles, setCurrentFiles] = useState<FileData[]>([]);
    
    const [isUploadModalOpen, setUploadModalOpen] = useState(false);
    const [isForwardModalOpen, setForwardModalOpen] = useState(false);
    const [isDetailModalOpen, setDetailModalOpen] = useState(false);
    const [isBulkForwardModalOpen, setBulkForwardModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
    const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'users'>('dashboard');
    const [searchTerm, setSearchTerm] = useState('');
    const headerCheckboxRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const updatedFiles = files.map(file => {
             if (new Date(file.deadline) < new Date() && file.status !== Status.SUBMITTED) {
                return { ...file, status: Status.OVERDUE };
            }
            return file;
        });
        
        const allFilesStr = JSON.stringify(files);
        const updatedFilesStr = JSON.stringify(updatedFiles);

        if(allFilesStr !== updatedFilesStr){
            localStorage.setItem('files', JSON.stringify(updatedFiles));
            refreshData();
        }
        setCurrentFiles(updatedFiles);

    }, [files, refreshData]);

    useEffect(() => {
        // Ensure non-permitted users cannot stay on the users tab
        if (!hasPermission(Permission.CAN_MANAGE_USERS)) {
            setActiveTab('dashboard');
        }
    }, [hasPermission]);

    const summaryData = useMemo(() => {
        const total = currentFiles.length;
        const pending = currentFiles.filter(f => f.status === Status.PENDING || f.status === Status.SEEN).length;
        const inProcess = currentFiles.filter(f => f.status === Status.UNDER_PROCESS).length;
        const overdue = currentFiles.filter(f => f.status === Status.OVERDUE).length;
        return { total, pending, inProcess, overdue };
    }, [currentFiles]);
    
    const chartData = useMemo(() => {
      const counts = Object.values(Status).reduce((acc, status) => {
        acc[status] = 0;
        return acc;
      }, {} as Record<Status, number>);

      currentFiles.forEach(file => {
          counts[file.status]++;
      });

      return Object.entries(counts).map(([name, value]) => ({ name: name as Status, value }));
    }, [currentFiles]);

    const handleForwardClick = (e: React.MouseEvent, file: FileData) => {
        e.stopPropagation();
        setSelectedFile(file);
        setForwardModalOpen(true);
    };
    
    const handleFileRowClick = (file: FileData) => {
        setSelectedFile(file);
        setDetailModalOpen(true);
    };
    
    const getUserNamesByIds = useMemo(() => (userIds?: string[]) => {
        if (!userIds || userIds.length === 0) return 'N/A';
        return userIds.map(id => users.find(u => u.id === id)?.name || 'Unknown').join(', ');
    }, [users]);


    const filteredFiles = useMemo(() => {
        if (!searchTerm) {
            return currentFiles;
        }
        const lowercasedFilter = searchTerm.toLowerCase();
        return currentFiles.filter(file =>
            file.name.toLowerCase().includes(lowercasedFilter) ||
            file.description.toLowerCase().includes(lowercasedFilter) ||
            getUserNamesByIds(file.assignedTo).toLowerCase().includes(lowercasedFilter)
        );
    }, [currentFiles, searchTerm, getUserNamesByIds]);

    useEffect(() => {
        const isIndeterminate = selectedFileIds.length > 0 && selectedFileIds.length < filteredFiles.length;
        if (headerCheckboxRef.current) {
            headerCheckboxRef.current.indeterminate = isIndeterminate;
        }
    }, [selectedFileIds, filteredFiles]);
    
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedFileIds(filteredFiles.map(f => f.id));
        } else {
            setSelectedFileIds([]);
        }
    };

    const handleSelectOne = (fileId: string) => {
        setSelectedFileIds(prev =>
            prev.includes(fileId) ? prev.filter(id => id !== fileId) : [...prev, fileId]
        );
    };

    const getLatestAttachmentMimeType = (file: FileData): string | undefined => {
        const historyWithAttachments = file.history
            .filter(h => h.attachment)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        return historyWithAttachments.length > 0 ? historyWithAttachments[0].attachment!.mimeType : undefined;
    };
    
    return (
        <div className="min-h-screen bg-slate-100">
            <Header />
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="flex space-x-4 border-b border-slate-300 mb-6">
                    <button onClick={() => setActiveTab('dashboard')} className={`flex items-center space-x-2 py-3 px-4 ${activeTab === 'dashboard' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500'}`}>
                        {ICONS.dashboard} <span>Dashboard</span>
                    </button>
                    {hasPermission(Permission.CAN_MANAGE_USERS) && (
                        <button onClick={() => setActiveTab('users')} className={`flex items-center space-x-2 py-3 px-4 ${activeTab === 'users' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500'}`}>
                            {ICONS.users} <span>User Management</span>
                        </button>
                    )}
                </div>
                
                {activeTab === 'dashboard' ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <SummaryCard title="Total Files" value={summaryData.total} icon={ICONS.file} color="bg-blue-100 text-blue-600" />
                            <SummaryCard title="Pending" value={summaryData.pending} icon={ICONS.file} color="bg-gray-100 text-gray-600" />
                            <SummaryCard title="In Process" value={summaryData.inProcess} icon={ICONS.file} color="bg-yellow-100 text-yellow-600" />
                            <SummaryCard title="Overdue" value={summaryData.overdue} icon={ICONS.file} color="bg-red-100 text-red-600" />
                        </div>

                         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                             <div className="lg:col-span-1">
                                <StatusBarChart data={chartData} />
                             </div>
                             <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-slate-800">All Files</h3>
                                    {selectedFileIds.length > 0 ? (
                                        hasPermission(Permission.CAN_FORWARD_FILE) && (
                                            <div className="flex items-center space-x-4">
                                                <span className="text-sm font-medium text-slate-600">{selectedFileIds.length} selected</span>
                                                <button onClick={() => setBulkForwardModalOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                                                    Forward Selected
                                                </button>
                                            </div>
                                        )
                                    ) : (
                                        hasPermission(Permission.CAN_UPLOAD_FILE) && (
                                            <button onClick={() => setUploadModalOpen(true)} className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                                                {ICONS.upload}
                                                <span>Upload File</span>
                                            </button>
                                        )
                                    )}
                                </div>
                                <div className="mb-4">
                                  <input
                                    type="text"
                                    placeholder="Search by name, description, or assignee..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                  />
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-slate-200">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th scope="col" className="px-4 py-3">
                                                    <input
                                                        type="checkbox"
                                                        ref={headerCheckboxRef}
                                                        checked={filteredFiles.length > 0 && selectedFileIds.length === filteredFiles.length}
                                                        onChange={handleSelectAll}
                                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                    />
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">File Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Assigned To</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Deadline</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-slate-200">
                                            {filteredFiles.map(file => (
                                                <tr key={file.id} className={`transition-colors duration-150 ${selectedFileIds.includes(file.id) ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedFileIds.includes(file.id)}
                                                            onChange={() => handleSelectOne(file.id)}
                                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                        />
                                                    </td>
                                                    <td onClick={() => handleFileRowClick(file)} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 cursor-pointer">
                                                        <div className="flex items-center space-x-3">
                                                            <FileIcon mimeType={getLatestAttachmentMimeType(file)} />
                                                            <span className="hover:underline">{file.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{getUserNamesByIds(file.assignedTo)}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(file.deadline).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[file.status]}`}>{file.status}</span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        {hasPermission(Permission.CAN_FORWARD_FILE) && (
                                                            <button onClick={(e) => handleForwardClick(e, file)} className="text-blue-600 hover:text-blue-900">Forward</button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <UserManagement />
                )}
            </main>
            <FileUploadModal isOpen={isUploadModalOpen} onClose={() => setUploadModalOpen(false)} />
            {selectedFile && <ForwardFileModal isOpen={isForwardModalOpen} onClose={() => { setForwardModalOpen(false); setSelectedFile(null); }} file={selectedFile} />}
            {selectedFile && <FileDetailModal isOpen={isDetailModalOpen} onClose={() => { setDetailModalOpen(false); setSelectedFile(null); }} file={selectedFile} />}
            <BulkForwardFileModal 
                isOpen={isBulkForwardModalOpen}
                onClose={() => setBulkForwardModalOpen(false)}
                onFileForward={() => {
                    setBulkForwardModalOpen(false);
                    setSelectedFileIds([]);
                }}
                selectedFileIds={selectedFileIds}
            />
        </div>
    );
};

export default DashboardAdmin;