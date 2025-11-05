import React from 'react';
import { ICONS } from '../constants';

interface FileIconProps {
  mimeType?: string;
  className?: string;
}

const FileIcon: React.FC<FileIconProps> = ({ mimeType, className }) => {
  const getIcon = () => {
    let icon;
    if (!mimeType) {
      icon = ICONS.file;
    } else if (mimeType.startsWith('image/')) {
      icon = ICONS.file_image;
    } else if (mimeType.includes('pdf')) {
      icon = ICONS.file_pdf;
    } else if (mimeType.includes('wordprocessingml') || mimeType.includes('msword')) {
      icon = ICONS.file_doc;
    } else if (mimeType.includes('spreadsheetml') || mimeType.includes('ms-excel')) {
      icon = ICONS.file_xls;
    } else {
      icon = ICONS.file;
    }
    
    // Clone to apply the passed className, which will override the default icon's className
    return React.cloneElement(icon, { className: className || icon.props.className });
  };

  return getIcon();
};

export default FileIcon;
