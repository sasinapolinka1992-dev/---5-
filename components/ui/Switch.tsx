import React from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onChange, label }) => {
  return (
    <div className="inline-flex items-center">
        {/* Используем label, чтобы клик по "рисунку" переключателя активировал input */}
        <label className="UNI_checkbox cursor-pointer">
            <input 
                type="checkbox" 
                checked={checked} 
                onChange={(e) => onChange(e.target.checked)} 
            />
            <div className="fake"></div>
        </label>
        {label && <span className="ml-3 text-sm font-medium text-gray-700 cursor-pointer" onClick={() => onChange(!checked)}>{label}</span>}
    </div>
  );
};