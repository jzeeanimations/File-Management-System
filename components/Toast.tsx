import React, { useState, useEffect } from 'react';

interface ToastProps {
  message: string;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true); // Trigger fade-in
    const timer = setTimeout(() => {
      handleClose();
    }, 5000); // Auto-dismiss after 5 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setVisible(false);
    // Allow fade-out animation to complete before calling onClose
    setTimeout(onClose, 500); 
  };

  return (
    <div 
      className={`
        w-full max-w-sm bg-blue-600 text-white py-3 px-4 rounded-lg shadow-lg 
        transition-all duration-500 ease-in-out transform pointer-events-auto
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'}
      `}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{message}</span>
        <button onClick={handleClose} className="ml-4 -mr-1 p-1 rounded-full text-xl font-semibold opacity-75 hover:opacity-100 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
    </div>
  );
};

export default Toast;
