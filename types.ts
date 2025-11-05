export enum Permission {
  CAN_MANAGE_USERS = 'CAN_MANAGE_USERS',
  CAN_MANAGE_ROLES = 'CAN_MANAGE_ROLES',
  CAN_UPLOAD_FILE = 'CAN_UPLOAD_FILE',
  CAN_FORWARD_FILE = 'CAN_FORWARD_FILE',
  CAN_VIEW_ALL_FILES = 'CAN_VIEW_ALL_FILES',
}

export enum Status {
  PENDING = 'Pending',
  SEEN = 'Seen',
  UNDER_PROCESS = 'Under Process',
  SUBMITTED = 'Submitted',
  OVERDUE = 'Overdue',
}

export interface RoleData {
  id: string;
  name: string;
  permissions: Permission[];
}

export interface User {
  id: string;
  name: string;
  roleId: string;
  username: string;
  password?: string;
}

export interface FileHistory {
  action: string;
  user: string;
  timestamp: string;
  details?: string;
  attachment?: {
    name: string;
    content: string; // data URL
    mimeType: string;
  };
}

export interface FileData {
  id: string;
  name: string;
  description: string;
  uploadDate: string;
  deadline: string;
  status: Status;
  assignedTo?: string[]; // User IDs
  history: FileHistory[];
}