import { User, FileData, Status, Permission, RoleData } from './types';

export const ALL_PERMISSIONS: { id: Permission, description: string }[] = [
    { id: Permission.CAN_MANAGE_USERS, description: 'Create and manage user accounts.' },
    { id: Permission.CAN_MANAGE_ROLES, description: 'Create, edit, and delete roles and their permissions.' },
    { id: Permission.CAN_UPLOAD_FILE, description: 'Upload new files into the system.' },
    { id: Permission.CAN_FORWARD_FILE, description: 'Forward files to other users.' },
    { id: Permission.CAN_VIEW_ALL_FILES, description: 'View and manage all files in the system.' },
];


export const MOCK_ROLES: RoleData[] = [
    {
        id: 'role-super-admin',
        name: 'Super Admin',
        permissions: [
            Permission.CAN_MANAGE_USERS,
            Permission.CAN_MANAGE_ROLES,
            Permission.CAN_UPLOAD_FILE,
            Permission.CAN_FORWARD_FILE,
            Permission.CAN_VIEW_ALL_FILES,
        ],
    },
    {
        id: 'role-admin',
        name: 'Admin',
        permissions: [
            Permission.CAN_MANAGE_USERS,
            Permission.CAN_UPLOAD_FILE,
            Permission.CAN_FORWARD_FILE,
            Permission.CAN_VIEW_ALL_FILES,
        ],
    },
    {
        id: 'role-officer',
        name: 'Officer',
        permissions: [],
    },
];


export const MOCK_USERS: User[] = [
  { id: 'user-1', name: 'Super Admin User', username: 'superadmin', password: 'password', roleId: 'role-super-admin' },
  { id: 'user-2', name: 'Officer A', username: 'officerA', password: 'password', roleId: 'role-officer' },
  { id: 'user-3', name: 'Officer B', username: 'officerB', password: 'password', roleId: 'role-officer' },
  { id: 'user-4', name: 'Officer C', username: 'officerC', password: 'password', roleId: 'role-officer' },
  { id: 'user-5', name: 'Admin User', username: 'admin', password: 'password', roleId: 'role-admin' },
];

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

const nextWeek = new Date();
nextWeek.setDate(nextWeek.getDate() + 7);

const lastWeek = new Date();
lastWeek.setDate(lastWeek.getDate() - 7);


export const MOCK_FILES: FileData[] = [
  { 
    id: 'file-1', 
    name: 'Urgent Land Dispute Case #1024', 
    description: 'Review and report on the land dispute between Party X and Party Y in Sector 5.',
    uploadDate: new Date().toISOString(),
    deadline: tomorrow.toISOString(),
    status: Status.PENDING,
    assignedTo: ['user-2'],
    history: [{ action: 'Created', user: 'Super Admin User', timestamp: new Date().toISOString() }]
  },
  { 
    id: 'file-2', 
    name: 'Development Project Proposal - Phase II', 
    description: 'Assess the feasibility of the new infrastructure project proposed for the northern region.',
    uploadDate: new Date().toISOString(),
    deadline: nextWeek.toISOString(),
    status: Status.UNDER_PROCESS,
    assignedTo: ['user-3', 'user-4'],
    history: [
      { action: 'Created', user: 'Super Admin User', timestamp: new Date().toISOString() },
      { action: 'Assigned to Officer B, Officer C', user: 'Super Admin User', timestamp: new Date().toISOString() },
      { action: 'Viewed', user: 'Officer B', timestamp: new Date().toISOString() }
    ]
  },
  { 
    id: 'file-3', 
    name: 'Monthly Security Report - May 2024', 
    description: 'Compile and submit the monthly security briefing for all zones.',
    uploadDate: lastWeek.toISOString(),
    deadline: yesterday.toISOString(),
    status: Status.OVERDUE,
    assignedTo: ['user-4'],
    history: [
      { action: 'Created', user: 'Super Admin User', timestamp: lastWeek.toISOString() },
      { action: 'Assigned to Officer C', user: 'Super Admin User', timestamp: lastWeek.toISOString() }
    ]
  },
  { 
    id: 'file-4', 
    name: 'Annual Budget Review', 
    description: 'Final review of the annual budget allocation for all departments.',
    uploadDate: lastWeek.toISOString(),
    deadline: new Date().toISOString(),
    status: Status.SUBMITTED,
    assignedTo: ['user-2'],
    history: [
      { action: 'Created', user: 'Super Admin User', timestamp: lastWeek.toISOString() },
      { action: 'Submitted', user: 'Officer A', timestamp: yesterday.toISOString(), details: 'Budget approved with minor revisions.' }
    ]
  },
   { 
    id: 'file-5', 
    name: 'Public Grievance Redressal #551', 
    description: 'Address the public grievance regarding water supply issues in the west block.',
    uploadDate: new Date().toISOString(),
    deadline: nextWeek.toISOString(),
    status: Status.SEEN,
    assignedTo: ['user-3'],
    history: [
      { action: 'Created', user: 'Super Admin User', timestamp: new Date().toISOString() },
      { action: 'Assigned to Officer B', user: 'Super Admin User', timestamp: new Date().toISOString() }
    ]
  },
];

export const ICONS = {
    user: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    lock: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
    logout: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
    file: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    users: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    dashboard: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    upload: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
    bell: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V5a1 1 0 00-2 0v.083A6 6 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
    clock: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    shield: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944A12.02 12.02 0 0012 22a12.02 12.02 0 009-1.056v-1.056c0-1.815-.758-3.414-2-4.636z" /></svg>,
    download: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
    file_pdf: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 014-4h2a2 2 0 012 2v2m-6 0h-2a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2zm-6-8V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-1" /></svg>,
    file_doc: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    file_xls: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /><path d="M15 12V9" /><path d="M12 15h3" /></svg>,
    file_image: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
};