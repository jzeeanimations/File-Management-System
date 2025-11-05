import React, { useState } from 'react';
import { FileData, Status, FileHistory } from '../types';
import { useAppContext } from '../App';

interface ReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: FileData;
}

const ReplyModal: React.FC<ReplyModalProps> = ({ isOpen, onClose, file }) => {
  const { currentUser, refreshData } = useAppContext();
  const [replyText, setReplyText] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText) return;

    let allFiles: FileData[] = JSON.parse(localStorage.getItem('files') || '[]');
    let submissionDetails = replyText;
    let attachmentData;

    if (attachedFile) {
        const fileContent = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => resolve(event.target?.result as string);
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(attachedFile);
        });
        
        attachmentData = {
            name: attachedFile.name,
            content: fileContent,
            mimeType: attachedFile.type,
        };
    }

    const updatedFiles = allFiles.map(f => {
      if (f.id === file.id) {
        const newHistoryEntry: FileHistory = { 
            action: 'Submitted', 
            user: currentUser!.name, 
            timestamp: new Date().toISOString(), 
            details: submissionDetails,
        };
        if (attachmentData) {
            newHistoryEntry.attachment = attachmentData;
        }
        return {
          ...f,
          status: Status.SUBMITTED,
          history: [...f.history, newHistoryEntry],
        };
      }
      return f;
    });

    localStorage.setItem('files', JSON.stringify(updatedFiles));
    refreshData();
    onClose();
    setReplyText('');
    setAttachedFile(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Submit Reply</h2>
        <p className="text-slate-600 mb-6">File: <span className="font-medium">{file.name}</span></p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="reply" className="block text-sm font-medium text-slate-700">Reply / Notes</label>
            <textarea
              id="reply"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={5}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your reply or notes here..."
              required
            ></textarea>
          </div>
          <div>
            <label htmlFor="attachment" className="block text-sm font-medium text-slate-700">Attach File (Optional)</label>
            <input
              type="file"
              id="attachment"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <div className="flex justify-end space-x-4 pt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 transition">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition">Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReplyModal;