'use client';

import { Eye, Calendar as CalendarIcon } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Pagination from './Pagination';

export interface BorrowingData {
  id: string;
  cover?: string;
  title: string;
  borrowDate: string;
  daysRemaining: string;
  returnDate: string;
  status: 'Active';
}

interface BorrowingsTableProps {
  data: BorrowingData[];
  onView?: (id: string) => void;
  onCalendar?: (id: string) => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

export default function BorrowingsTable({ 
  data, 
  onView, 
  onCalendar,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}: BorrowingsTableProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Desktop View - Horizontal Scroll Container */}
      <div className="overflow-x-auto">
        <div className="min-w-[700px]"> {/* Minimum width to prevent cramping */}
          <Table className="bg-white">
            <TableHeader style={{ backgroundColor: "#001240" }} className="text-white">
              <TableRow className="hover:bg-opacity-90" style={{ backgroundColor: "#001240" }}>
                <TableHead className="text-white">Book Cover</TableHead>
                <TableHead className="text-white">Book Title</TableHead>
                <TableHead className="text-white">Borrow date</TableHead>
                <TableHead className="text-white">Days remaining</TableHead>
                <TableHead className="text-white">Return date</TableHead>
                <TableHead className="text-white">Status</TableHead>
                <TableHead className="text-white">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((borrowing, index) => (
                <TableRow key={borrowing.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <TableCell className="p-4">
                    {borrowing.cover ? (
                      <img
                        src={borrowing.cover}
                        alt={borrowing.title}
                        className="h-10 w-8 object-cover rounded bg-gray-800"
                      />
                    ) : (
                      <div className="h-10 w-8 rounded flex items-center justify-center" style={{ backgroundColor: "#8B4513" }}>
                        <span className="text-xs text-white">📖</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="p-4 text-gray-900">
                    <div className="truncate" title={borrowing.title}>{borrowing.title}</div>
                  </TableCell>
                  <TableCell className="p-4 text-gray-900">{borrowing.borrowDate}</TableCell>
                  <TableCell className="p-4 text-gray-900">{borrowing.daysRemaining}</TableCell>
                  <TableCell className="p-4 text-gray-900">{borrowing.returnDate}</TableCell>
                  <TableCell className="p-4">
                    <span
                      className="px-3 py-1 rounded text-sm font-medium text-white whitespace-nowrap"
                      style={{ backgroundColor: "#001240" }}
                    >
                      {borrowing.status}
                    </span>
                  </TableCell>
                  <TableCell className="p-4">
                    <div className="flex items-center gap-2">
                      {onCalendar && (
                        <button
                          onClick={() => onCalendar(borrowing.id)}
                          className="p-1.5 text-white rounded transition-colors"
                          style={{ backgroundColor: "#001240" }}
                          aria-label="Calendar"
                        >
                          <CalendarIcon className="h-4 w-4" />
                        </button>
                      )}
                      {onView && (
                        <button
                          onClick={() => onView(borrowing.id)}
                          className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                          aria-label="View"
                        >
                          <Eye className="h-4 w-4 text-gray-600" />
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={onPageChange}
        onItemsPerPageChange={onItemsPerPageChange}
      />
    </div>
  );
}