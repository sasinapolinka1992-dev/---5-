import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from './ui/Button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-fade-in-up">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 text-danger">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={24} />
            </button>
          </div>
          
          <p className="text-gray-600 mb-8 leading-relaxed">
            {message}
          </p>

          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={onClose}>
              Отмена
            </Button>
            <Button variant="danger" onClick={() => { onConfirm(); onClose(); }}>
              Удалить
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};