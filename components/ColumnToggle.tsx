'use client';

import React from 'react';
import { Eye } from 'lucide-react';

interface ColumnToggleProps {
  columns: { key: string; label: string; visible: boolean }[];
  onToggle: (key: string) => void;
}

export default function ColumnToggle({ columns, onToggle }: ColumnToggleProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-pink-100 text-pink-700 px-3 py-2 rounded-lg hover:bg-pink-200 transition text-sm flex items-center gap-2"
      >
        <Eye size={16} />
        Hiển thị cột
      </button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-2 right-0 bg-white border rounded-lg shadow-lg p-3 z-20 min-w-[200px]">
            <div className="space-y-2">
              {columns.map((col) => (
                <label
                  key={col.key}
                  className="flex items-center gap-2 cursor-pointer text-sm"
                >
                  <input
                    type="checkbox"
                    checked={col.visible}
                    onChange={() => onToggle(col.key)}
                    className="rounded"
                  />
                  <span>{col.label}</span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

