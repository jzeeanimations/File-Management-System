import React, { useState, createContext, useContext, useMemo, useEffect, useCallback } from 'react';
import { User, FileData, RoleData, Permission } from './types';
import Login from './components/Login';
import DashboardAdmin from './components/DashboardAdmin';
import DashboardOfficer from './components/DashboardOfficer';
import { MOCK_USERS, MOCK_FILES, MOCK_ROLES } from './constants';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  files: FileData[];
  roles: RoleData[];
  login: (user: User) => void;
  logout: () => void;
  refreshData: () => void;
  hasPermission: (permission: Permission) => boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [files, setFiles] = useState<FileData[]>([]);
  const [roles, setRoles] = useState<RoleData[]>([]);

  const refreshData = useCallback(() => {
      const storedFiles: FileData[] = JSON.parse(localStorage.getItem('files') || '[]');
      const storedUsers: User[] = JSON.parse(localStorage.getItem('users') || '[]');
      const storedRoles: RoleData[] = JSON.parse(localStorage.getItem('roles') || '[]');
      setFiles(storedFiles);
      setUsers(storedUsers);
      setRoles(storedRoles);
  }, []);

  useEffect(() => {
    // Initialize mock data in localStorage if it doesn't exist
    if (!localStorage.getItem('files')) localStorage.setItem('files', JSON.stringify(MOCK_FILES));
    if (!localStorage.getItem('users')) localStorage.setItem('users', JSON.stringify(MOCK_USERS));
    if (!localStorage.getItem('roles')) localStorage.setItem('roles', JSON.stringify(MOCK_ROLES));
    
    refreshData();

    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, [refreshData]);

  const login = (user: User) => {
    const { password, ...userToStore } = user;
    setCurrentUser(userToStore);
    localStorage.setItem('currentUser', JSON.stringify(userToStore));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const hasPermission = useCallback((permission: Permission): boolean => {
    if (!currentUser) return false;
    const userRole = roles.find(r => r.id === currentUser.roleId);
    return userRole?.permissions.includes(permission) || false;
  }, [currentUser, roles]);

  const appContextValue = useMemo(() => ({
    currentUser,
    users,
    files,
    roles,
    login,
    logout,
    refreshData,
    hasPermission
  }), [currentUser, users, files, roles, hasPermission, refreshData]);

  const renderContent = () => {
    if (!currentUser) {
      return <Login />;
    }
    
    if (hasPermission(Permission.CAN_VIEW_ALL_FILES)) {
        return <DashboardAdmin />;
    }
    
    // Default to officer dashboard if user doesn't have admin view permissions
    return <DashboardOfficer />;
  };

  return (
    <AppContext.Provider value={appContextValue}>
      {children}
    </AppContext.Provider>
  );
};


const App: React.FC = () => {
    
  const renderContent = () => {
      const { currentUser, hasPermission } = useAppContext();
      if (!currentUser) {
          return <Login />;
      }
      if (hasPermission(Permission.CAN_VIEW_ALL_FILES)) {
          return <DashboardAdmin />;
      }
      return <DashboardOfficer />;
  };

  return (
      <AppProvider>
          <div className="min-h-screen">
              <AppContent />
          </div>
      </AppProvider>
  );
};

const AppContent: React.FC = () => {
    const { currentUser, hasPermission } = useAppContext();
    if (!currentUser) {
        return <Login />;
    }
    if (hasPermission(Permission.CAN_VIEW_ALL_FILES)) {
        return <DashboardAdmin />;
    }
    return <DashboardOfficer />;
};


export default App;
