import React, { useState, useMemo } from 'react';
import { User, RoleData, Permission } from '../types';
import { useAppContext } from '../App';
import { ALL_PERMISSIONS } from '../constants';
import EditUserModal from './EditUserModal';

const UserManagement: React.FC = () => {
    const { hasPermission } = useAppContext();
    const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');

    return (
        <div>
            <div className="flex space-x-2 border-b border-slate-200 mb-6">
                <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded-t-lg ${activeTab === 'users' ? 'bg-white text-blue-600 font-semibold' : 'bg-slate-50 text-slate-500'}`}>Users</button>
                {hasPermission(Permission.CAN_MANAGE_ROLES) &&
                    <button onClick={() => setActiveTab('roles')} className={`px-4 py-2 rounded-t-lg ${activeTab === 'roles' ? 'bg-white text-blue-600 font-semibold' : 'bg-slate-50 text-slate-500'}`}>Roles</button>
                }
            </div>
            {activeTab === 'users' ? <ManageUsers /> : <ManageRoles />}
        </div>
    );
};

const ManageUsers: React.FC = () => {
    const { users, roles, refreshData, currentUser } = useAppContext();
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [roleId, setRoleId] = useState<string>(roles.find(r=>r.name === 'Officer')?.id || '');
    const [error, setError] = useState('');
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const creatableRoles = useMemo(() => {
        if (!currentUser) return [];
        const currentUserRole = roles.find(r => r.id === currentUser.roleId);
        if (currentUserRole?.name === 'Super Admin') {
            return roles.filter(r => r.name !== 'Super Admin');
        }
        if (currentUserRole?.name === 'Admin') {
            return roles.filter(r => r.name === 'Admin' || r.name === 'Officer');
        }
        return [];
    }, [currentUser, roles]);

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (users.some(u => u.username === username)) {
            setError('Username already exists.');
            return;
        }

        const newUser: User = {
            id: `user-${Date.now()}`,
            name,
            username,
            password,
            roleId,
        };

        const updatedUsers = [...users, newUser];
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        refreshData();
        
        setName('');
        setUsername('');
        setPassword('');
        setError('');
    };
    
    const handleDeleteUser = (userId: string) => {
        if (window.confirm('Are you sure you want to delete this user? This cannot be undone and may affect file history.')) {
            const updatedUsers = users.filter(u => u.id !== userId);
            localStorage.setItem('users', JSON.stringify(updatedUsers));
            refreshData();
        }
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
    };

    const canManage = useMemo(() => (targetUser: User): boolean => {
        if (!currentUser) return false;
        if (targetUser.id === currentUser.id) return false; // Can't manage self

        const currentUserRole = roles.find(r => r.id === currentUser.roleId);
        const targetUserRole = roles.find(r => r.id === targetUser.roleId);

        if (!currentUserRole || !targetUserRole) return false;

        // Super Admins cannot be managed by anyone
        if (targetUserRole.name === 'Super Admin') return false;

        // Super Admins can manage Admins and Officers
        if (currentUserRole.name === 'Super Admin') return true;

        // Admins can manage other Admins and Officers
        if (currentUserRole.name === 'Admin') {
            return targetUserRole.name === 'Admin' || targetUserRole.name === 'Officer';
        }

        return false;
    }, [currentUser, roles]);


    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Add New User</h3>
                <form onSubmit={handleAddUser} className="space-y-4">
                     {error && <p className="text-sm text-red-500">{error}</p>}
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Full Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Username</label>
                        <input type="text" value={username} onChange={e => setUsername(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Role</label>
                        <select value={roleId} onChange={e => setRoleId(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                            {creatableRoles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">Add User</button>
                </form>
            </div>
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Existing Users</h3>
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Username</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{user.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{user.username}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                         <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">{roles.find(r => r.id === user.roleId)?.name || 'Unknown'}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {canManage(user) && (
                                            <div className="space-x-4">
                                                <button onClick={() => handleEditUser(user)} className="text-blue-600 hover:text-blue-900">Edit</button>
                                                <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {editingUser && (
                <EditUserModal 
                    isOpen={!!editingUser}
                    onClose={() => setEditingUser(null)}
                    user={editingUser}
                />
            )}
        </div>
    );
}

const ManageRoles: React.FC = () => {
    const { roles, refreshData } = useAppContext();
    const [editingRole, setEditingRole] = useState<RoleData | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const handleSaveRole = (roleToSave: RoleData) => {
        const updatedRoles = isCreating 
            ? [...roles, { ...roleToSave, id: `role-${Date.now()}` }]
            : roles.map(r => r.id === roleToSave.id ? roleToSave : r);
        
        localStorage.setItem('roles', JSON.stringify(updatedRoles));
        refreshData();
        setEditingRole(null);
        setIsCreating(false);
    };

    const handleDeleteRole = (roleId: string) => {
        if(window.confirm('Are you sure you want to delete this role? This cannot be undone.')) {
            const updatedRoles = roles.filter(r => r.id !== roleId);
            // You might want to re-assign users with this roleId here
            localStorage.setItem('roles', JSON.stringify(updatedRoles));
            refreshData();
        }
    }
    
    if(isCreating || editingRole) {
        const role = isCreating ? { id: '', name: '', permissions: [] } : editingRole!;
        return <RoleEditor role={role} onSave={handleSaveRole} onCancel={() => { setEditingRole(null); setIsCreating(false); }} />
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-800">Existing Roles</h3>
                <button onClick={() => setIsCreating(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">Create Role</button>
            </div>
            <div className="space-y-3">
                {roles.map(role => (
                    <div key={role.id} className="p-4 border border-slate-200 rounded-lg flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-slate-800">{role.name}</p>
                            <p className="text-xs text-slate-500">{role.permissions.length} permissions</p>
                        </div>
                        <div className="space-x-2">
                           <button onClick={() => setEditingRole(role)} className="text-blue-600 hover:text-blue-900">Edit</button>
                           {role.name !== 'Super Admin' && <button onClick={() => handleDeleteRole(role.id)} className="text-red-600 hover:text-red-900">Delete</button>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const RoleEditor: React.FC<{ role: RoleData, onSave: (role: RoleData) => void, onCancel: () => void }> = ({ role, onSave, onCancel }) => {
    const [name, setName] = useState(role.name);
    const [permissions, setPermissions] = useState<Permission[]>(role.permissions);

    const handlePermissionChange = (permission: Permission, checked: boolean) => {
        setPermissions(prev => 
            checked ? [...prev, permission] : prev.filter(p => p !== permission)
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...role, name, permissions });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">{role.id ? 'Edit Role' : 'Create New Role'}</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Role Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Permissions</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {ALL_PERMISSIONS.map(p => (
                            <div key={p.id} className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id={p.id}
                                        type="checkbox"
                                        checked={permissions.includes(p.id)}
                                        onChange={e => handlePermissionChange(p.id, e.target.checked)}
                                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor={p.id} className="font-medium text-gray-700">{p.id.replace(/_/g, ' ').replace('CAN ', '')}</label>
                                    <p className="text-gray-500">{p.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                    <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 transition">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">Save Role</button>
                </div>
            </form>
        </div>
    );
};


export default UserManagement;