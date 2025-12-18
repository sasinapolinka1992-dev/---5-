import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon,
  className = '',
  onClick,
  ...props 
}) => {
  // Mapping variant to data-attribute for CSS styling defined in index.html
  
  return (
    <div 
      className={`UNI_button ${className}`} 
      data-variant={variant}
      onClick={onClick}
      role="button"
      tabIndex={0}
      {...props}
    >
      {icon && <span className="mr-2 flex items-center">{icon}</span>}
      {children}
    </div>
  );
};