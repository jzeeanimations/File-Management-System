import React from 'react';
import { useAppContext } from '../App';
import { ICONS } from '../constants';

const Header: React.FC<{ notificationCount?: number }> = ({ notificationCount }) => {
  const { currentUser, logout } = useAppContext();

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-slate-800">DC Office FMS</h1>
          </div>
          <div className="flex items-center space-x-4">
             {notificationCount !== undefined && notificationCount > 0 && (
              <div className="relative text-slate-600">
                {ICONS.bell}
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white ring-2 ring-white">
                  {notificationCount}
                </span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <span className="text-slate-500">{ICONS.user}</span>
              <span className="text-sm font-medium text-slate-700">Welcome, {currentUser?.name}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              <span>Logout</span>
              {ICONS.logout}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
