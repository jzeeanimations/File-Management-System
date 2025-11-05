import React, { useState, useEffect, useMemo } from 'react';
import { User } from '../types';
import { useAppContext } from '../App';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, user }) => {
  const { users, roles, refreshData, currentUser } = useAppContext();
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState(user.roleId);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
        setName(user.name);
        setUsername(user.username);
        setRoleId(user.roleId);
        setPassword('');
        setError('');
    }
  }, [user, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (users.some(u => u.username === username && u.id !== user.id)) {
      setError('Username already exists.');
      return;
    }
    setError('');

    const updatedUsers = users.map(u => {
      if (u.id === user.id) {
        return {
          ...u,
          name,
          username,
          roleId,
          password: password ? password : u.password,
        };
      }
      return u;
    });

    localStorage.setItem('users', JSON.stringify(updatedUsers));
    refreshData();
    onClose();
  };
  
  const canChangeRole = useMemo(() => {
      if (!currentUser) return false;
      const currentUserRole = roles.find(r => r.id === currentUser.roleId);
      return currentUserRole?.name === 'Super Admin';
  }, [currentUser, roles]);
  
  const assignableRoles = useMemo(() => {
      // Users cannot be assigned or promoted to Super Admin.
      return roles.filter(r => r.name !== 'Super Admin');
  }, [roles]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Edit User: <span className="font-normal">{user.name}</span></h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-red-500 bg-red-100 p-2 rounded">{error}</p>}
          <div>
            <label htmlFor="editName" className="block text-sm font-medium text-slate-700">Full Name</label>
            <input
              type="text"
              id="editName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="editUsername" className="block text-sm font-medium text-slate-700">Username</label>
            <input
              type="text"
              id="editUsername"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="editPassword" className="block text-sm font-medium text-slate-700">New Password</label>
            <input
              type="password"
              id="editPassword"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Leave blank to keep current password"
            />
          </div>
          <div>
            <label htmlFor="editRole" className="block text-sm font-medium text-slate-700">Role</label>
            <select 
                id="editRole" 
                value={roleId} 
                onChange={e => setRoleId(e.target.value)} 
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md disabled:bg-slate-100 disabled:cursor-not-allowed"
                disabled={!canChangeRole()}
                title={!canChangeRole() ? "Only Super Admins can change user roles." : ""}
            >
                {assignableRoles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 transition">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
