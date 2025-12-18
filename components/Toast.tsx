import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { ToastMessage } from '../types';

interface ToastProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onRemove: () => void }> = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onRemove]);

  const icons = {
    success: <CheckCircle className="text-green-500" size={20} />,
    error: <AlertCircle className="text-red-500" size={20} />,
    info: <Info className="text-blue-500" size={20} />,
  };

  const colors = {
    success: 'bg-white border-l-4 border-green-500',
    error: 'bg-white border-l-4 border-red-500',
    info: 'bg-white border-l-4 border-blue-500',
  };

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg shadow-lg min-w-[300px] animate-slide-in-right ${colors[toast.type]}`}>
      <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1 text-sm text-gray-800 font-medium">{toast.message}</div>
      <button onClick={onRemove} className="text-gray-400 hover:text-gray-600">
        <X size={16} />
      </button>
    </div>
  );
};
