import * as React from 'react';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => {
  return (
    <button
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition w-full"
      {...props}
    >
      {children}
    </button>
  );
};