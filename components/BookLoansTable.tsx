'use client';

import { Eye, Loader2 } from 'lucide-react';

export interface BookLoanData {
  id: string;
  cover?: string;
  title: string;
  borrower: string;
  borrowDate: string;
  returnDate: string;
  status: 'Active' | 'Overdue' | 'Pending' | 'Return Pending' | 'Returned' | 'Rejected';
}

interface BookLoansTableProps {
  data: BookLoanData[];
  onEdit?: (id: string) => void;
  onView?: (id: string) => void;
  onApprove?: (id: string) => void;
  onReturn?: (id: string) => void;
  onReject?: (id: string) => void;
  onRejectReturn?: (id: string) => void;
  isLoading?: boolean;
  loadingActions?: {[key: string]: boolean};
}

export default function BookLoansTable({ data, onEdit, onView, onApprove, onReturn, onReject, onRejectReturn, isLoading = false, loadingActions = {} }: BookLoansTableProps) {
  return (
    <div className="w-full">
      {/* Desktop View */}
      <div className="hidden md:block">
        {/* Header */}
        <div className="grid grid-cols-[80px_1fr_150px_120px_120px_100px_160px] gap-4 items-center px-6 py-4 text-white font-medium text-sm" style={{ backgroundColor: '#001240' }}>
          <div>Cover</div>
          <div>Book Title</div>
          <div>Borrower</div>
          <div>Borrow Date</div>
          <div>Due/Return Date</div>
          <div>Status</div>
          <div>Action</div>
        </div>
        
        {/* Content */}
        <div className="bg-white">
          {isLoading ? (
            // Loading skeleton rows
            Array.from({ length: 5 }).map((_, index) => (
              <div key={`loading-${index}`} className="grid grid-cols-[80px_1fr_150px_120px_120px_100px_160px] gap-4 items-center px-6 py-4">
                <div className="h-10 w-12 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))
          ) : data.length > 0 ? (
            data.map((loan, index) => (
              <div key={loan.id} className={`grid grid-cols-[80px_1fr_150px_120px_120px_100px_160px] gap-4 items-center px-6 py-4 hover:bg-gray-100 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <div className="shrink-0">
                  {loan.cover ? (
                    <img
                      src={loan.cover}
                      alt={loan.title}
                      className="h-10 w-12 object-cover rounded bg-gray-800"
                    />
                  ) : (
                    <img
                      src="/assets/book-profile.png"
                      alt={loan.title}
                      className="h-10 w-12 object-cover rounded"
                    />
                  )}
                </div>
                <div className="min-w-0 truncate">
                  <span className="text-gray-900 font-medium">{loan.title}</span>
                </div>
                <div className="min-w-0 truncate">
                  <span className="text-gray-900 text-sm">{loan.borrower}</span>
                </div>
                <div className="text-gray-900 text-sm">
                  {loan.borrowDate}
                </div>
                <div className="text-gray-900 text-sm">
                  {loan.returnDate}
                </div>
                <div className="shrink-0">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                      loan.status === 'Active'
                        ? 'text-white'
                        : loan.status === 'Overdue'
                        ? 'bg-red-100 text-red-800'
                        : loan.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : loan.status === 'Return Pending'
                        ? 'bg-blue-100 text-blue-800'
                        : loan.status === 'Returned'
                        ? 'bg-green-100 text-green-800'
                        : loan.status === 'Rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                    style={loan.status === 'Active' ? { backgroundColor: '#001240' } : {}}
                  >
                    {loan.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onView?.(loan.id)}
                    className="p-2 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                    aria-label="View"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4 text-gray-600" />
                  </button>
                  {onApprove && loan.status === 'Pending' && (
                    <>
                      <button
                        onClick={() => onApprove(loan.id)}
                        disabled={loadingActions[`approve-${loan.id}`]}
                        className="px-3 py-1 text-xs text-white rounded hover:bg-opacity-90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: '#001240' }}
                        title="Approve Borrow Request"
                      >
                        {loadingActions[`approve-${loan.id}`] ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          'Approve'
                        )}
                      </button>
                      {onReject && (
                        <button
                          onClick={() => onReject(loan.id)}
                          disabled={loadingActions[`reject-${loan.id}`]}
                          className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Reject Borrow Request"
                        >
                          {loadingActions[`reject-${loan.id}`] ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            'Reject'
                          )}
                        </button>
                      )}
                    </>
                  )}
                  {onReturn && loan.status === 'Return Pending' && (
                    <>
                      <button
                        onClick={() => onReturn(loan.id)}
                        disabled={loadingActions[`return-${loan.id}`]}
                        className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Approve Return Request"
                      >
                        {loadingActions[`return-${loan.id}`] ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          'Approve Return'
                        )}
                      </button>
                      {onRejectReturn && (
                        <button
                          onClick={() => onRejectReturn(loan.id)}
                          disabled={loadingActions[`reject-return-${loan.id}`]}
                          className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Reject Return Request"
                        >
                          {loadingActions[`reject-return-${loan.id}`] ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            'Reject Return'
                          )}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-16 text-center">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-gray-600 font-medium mb-2">No book loans found</p>
              <p className="text-sm text-gray-500">Loan records will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {isLoading ? (
          // Loading skeleton cards
          Array.from({ length: 3 }).map((_, index) => (
            <div key={`mobile-loading-${index}`} className="bg-white rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="h-12 w-10 bg-gray-200 rounded animate-pulse shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-2 shrink-0">
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2 mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                </div>
                <div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3 mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                </div>
                <div className="col-span-2">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/4 mb-1"></div>
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
                </div>
              </div>
            </div>
          ))
        ) : data.length > 0 ? (
          data.map((loan) => (
            <div key={loan.id} className="bg-white rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {loan.cover ? (
                    <img
                      src={loan.cover}
                      alt={loan.title}
                      className="h-12 w-10 object-cover rounded bg-gray-800 shrink-0"
                    />
                  ) : (
                    <img
                      src="/assets/book-profile.png"
                      alt={loan.title}
                      className="h-12 w-10 object-cover rounded shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 line-clamp-2">{loan.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{loan.borrower}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-2 shrink-0">
                  <button
                    onClick={() => onView?.(loan.id)}
                    className="p-2 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                    aria-label="View"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4 text-gray-600" />
                  </button>
                  {onApprove && loan.status === 'Pending' && (
                    <>
                      <button
                        onClick={() => onApprove(loan.id)}
                        disabled={loadingActions[`approve-${loan.id}`]}
                        className="px-2 py-1 text-xs text-white rounded hover:bg-opacity-90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: '#001240' }}
                        title="Approve Borrow Request"
                      >
                        {loadingActions[`approve-${loan.id}`] ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          'Approve'
                        )}
                      </button>
                      {onReject && (
                        <button
                          onClick={() => onReject(loan.id)}
                          disabled={loadingActions[`reject-${loan.id}`]}
                          className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Reject Borrow Request"
                        >
                          {loadingActions[`reject-${loan.id}`] ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            'Reject'
                          )}
                        </button>
                      )}
                    </>
                  )}
                  {onReturn && loan.status === 'Return Pending' && (
                    <>
                      <button
                        onClick={() => onReturn(loan.id)}
                        disabled={loadingActions[`return-${loan.id}`]}
                        className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Approve Return Request"
                      >
                        {loadingActions[`return-${loan.id}`] ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          'Approve Return'
                        )}
                      </button>
                      {onRejectReturn && (
                        <button
                          onClick={() => onRejectReturn(loan.id)}
                          disabled={loadingActions[`reject-return-${loan.id}`]}
                          className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Reject Return Request"
                        >
                          {loadingActions[`reject-return-${loan.id}`] ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            'Reject Return'
                          )}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-600 text-xs">Borrow date</p>
                  <p className="font-medium text-gray-900">{loan.borrowDate}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs">Due/Return date</p>
                  <p className="font-medium text-gray-900 line-clamp-2">{loan.returnDate}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-600 text-xs mb-1">Status</p>
                  <span
                    className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                      loan.status === 'Active'
                        ? 'text-white'
                        : loan.status === 'Overdue'
                        ? 'bg-red-100 text-red-800'
                        : loan.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : loan.status === 'Return Pending'
                        ? 'bg-blue-100 text-blue-800'
                        : loan.status === 'Returned'
                        ? 'bg-green-100 text-green-800'
                        : loan.status === 'Rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                    style={loan.status === 'Active' ? { backgroundColor: '#001240' } : {}}
                  >
                    {loan.status}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-16 text-center">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-gray-600 font-medium mb-2">No book loans found</p>
            <p className="text-sm text-gray-500">Loan records will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
