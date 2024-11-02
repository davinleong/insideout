import * as React from 'react';

// Main Table component with optional additional styles
export const Table: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <table className={`min-w-full bg-white border border-gray-300 ${className || ''}`}>{children}</table>
);

// Table Head component for the header section
export const TableHead: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <thead className={`bg-gray-100 text-gray-600 uppercase text-sm tracking-wider ${className || ''}`}>{children}</thead>
);

// Table Row component to be used within TableHead and TableBody
export const TableRow: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <tr className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${className || ''}`}>{children}</tr>
);

// Table Header Cell component for individual headers
export const TableHeaderCell: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <th className={`p-3 text-left font-semibold text-gray-700 ${className || ''}`}>{children}</th>
);

// Table Body component for the body section
export const TableBody: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <tbody className={className}>{children}</tbody>
);

// Table Cell component for individual cells in the body
export const TableCell: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <td className={`p-3 text-gray-700 ${className || ''}`}>{children}</td>
);