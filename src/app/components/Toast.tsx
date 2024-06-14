import React from 'react';

interface ToastProps {
    type: 'warning' | 'info';
    message: string;
    onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ type, message, onClose, children }) => {
  const icons = {
    warning: (
      <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM10 15a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-4a1 1 0 0 1-2 0V6a1 1 0 0 1 2 0v5Z"/>
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 2a8 8 0 1 0 8 8 8 8 0 0 0-8-8Zm1 12H9v-1h1v-4H9v-1h2v5Zm0-8H9V5h2v1Z"/>
      </svg>
    ),
  };

  const bgColor = {
    warning: 'bg-orange-100 dark:bg-orange-700',
    info: 'bg-blue-100 dark:bg-blue-700',
  };

  const textColor = {
    warning: 'text-orange-500 dark:text-orange-200',
    info: 'text-blue-500 dark:text-blue-200',
  };

  return (
    <div className={`bg-white `}>
        <div className={`flex mt-2 mb-2 items-center w-full m-auto max-w-xs p-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800 ${bgColor[type]}`} role="alert">
            <div className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 ${textColor[type]} rounded-lg`}>
                {icons[type]}
                <span className="sr-only">{type} icon</span>
            </div>
            <div className="ms-3 text-sm font-normal">{message}</div>
            <button
                type="button"
                className="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
                onClick={onClose}
                aria-label="Close"
            >
                <span className="sr-only">Close</span>
                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                </svg>
            </button>
        </div>
        {children}
    </div>
  );
};

export default Toast;
