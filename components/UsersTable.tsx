'use client';

import { Eye, Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  loans: number;
  status: 'Active' | 'Inactive';
}

interface UsersTableProps {
  data: UserData[];
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function UsersTable({ data, onView, onEdit, onDelete }: UsersTableProps) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const toggleAll = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(data.map(u => u.id)));
    }
  };

  return (
    <div className="w-full">
      {/* Desktop View - No Scrolling */}
      <div className="hidden md:block">
        <div className="w-full">
          <div className="grid grid-cols-12 gap-4 items-center px-8 py-4 text-white font-medium" style={{ backgroundColor: '#001240' }}>
            <div className="col-span-1 flex items-center justify-center">
              <input
                type="checkbox"
                checked={selectedRows.size === data.length && data.length > 0}
                onChange={toggleAll}
                className="w-4 h-4 cursor-pointer"
              />
            </div>
            <div className="col-span-3">User name</div>
            <div className="col-span-3">user email</div>
            <div className="col-span-1">Role</div>
            <div className="col-span-1">Loans</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-2">Action</div>
          </div>
          <div className="bg-white">
            {data.map((user, index) => (
              <div key={user.id} className={`grid grid-cols-12 gap-4 items-start border-b border-gray-200 px-8 py-4 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <div className="col-span-1 flex items-center justify-center pt-1">
                  <input
                    type="checkbox"
                    checked={selectedRows.has(user.id)}
                    onChange={() => toggleRow(user.id)}
                    className="w-4 h-4 cursor-pointer"
                  />
                </div>
                <div className="col-span-3 text-gray-900 min-w-0">
                  <div className="break-words" title={user.name}>{user.name}</div>
                </div>
                <div className="col-span-3 text-gray-900 min-w-0">
                  <div className="break-words" title={user.email}>{user.email}</div>
                </div>
                <div className="col-span-1 text-gray-900">{user.role}</div>
                <div className="col-span-1 text-gray-900">{user.loans}</div>
                <div className="col-span-1">
                  <span
                    className="px-3 py-1 rounded text-sm font-medium text-white whitespace-nowrap"
                    style={{ backgroundColor: '#001240' }}
                  >
                    {user.status}
                  </span>
                </div>
                <div className="col-span-2">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onView?.(user.id)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                      aria-label="View"
                    >
                      <Eye className="h-4 w-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => onEdit?.(user.id)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                      aria-label="Edit"
                    >
                      <Edit2 className="h-4 w-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => onDelete?.(user.id)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {data.map((user) => (
          <div key={user.id} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 break-words">{user.name}</h3>
                <p className="text-sm text-gray-600 break-words">{user.email}</p>
              </div>
              <div className="flex items-center gap-2 ml-2 shrink-0">
                <button
                  onClick={() => onView?.(user.id)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                  aria-label="View"
                >
                  <Eye className="h-4 w-4 text-gray-600" />
                </button>
                <button
                  onClick={() => onEdit?.(user.id)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                  aria-label="Edit"
                >
                  <Edit2 className="h-4 w-4 text-gray-600" />
                </button>
                <button
                  onClick={() => onDelete?.(user.id)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm mb-3">
              <div>
                <p className="text-gray-600">Role</p>
                <p className="font-medium text-gray-900">{user.role}</p>
              </div>
              <div>
                <p className="text-gray-600">Loans</p>
                <p className="font-medium text-gray-900">{user.loans}</p>
              </div>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Status</p>
              <span
                className="inline-block px-3 py-1 rounded text-sm font-medium text-white"
                style={{ backgroundColor: '#001240' }}
              >
                {user.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
