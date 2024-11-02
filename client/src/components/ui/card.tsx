import * as React from 'react';

// Card component
interface CardProps extends React.PropsWithChildren<{ className?: string }> {}
export const Card: React.FC<CardProps> = ({ children, className }) => (
  <div className={`bg-white shadow-md rounded-lg ${className || ''}`}>{children}</div>
);

// Card Header component
interface CardHeaderProps extends React.PropsWithChildren<{ className?: string }> {}
export const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => (
  <div className={`p-4 border-b border-gray-200 ${className || ''}`}>{children}</div>
);

// Card Title component
interface CardTitleProps extends React.PropsWithChildren<{ className?: string }> {}
export const CardTitle: React.FC<CardTitleProps> = ({ children, className }) => (
  <h2 className={`text-xl font-semibold ${className || ''}`}>{children}</h2>
);

// Card Content component
interface CardContentProps extends React.PropsWithChildren<{ className?: string }> {}
export const CardContent: React.FC<CardContentProps> = ({ children, className }) => (
  <div className={`p-4 ${className || ''}`}>{children}</div>
);