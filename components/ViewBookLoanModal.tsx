'use client';

import { X, Loader2 } from 'lucide-react';
import ExpandableText from './ExpandableText';

interface ViewBookLoanModalProps {
  isOpen: boolean;
  loan: {
    id: string;
    userId: string;
    bookId: string;
    borrowDate: string;
    dueDate?: string;
    returnDate?: string;
    status: string;
    user: {
      id: string;
      name: string;
      email: string;
      level?: string;
    };
    book: {
      id: string;
      title: string;
      author: string;
      ISBN: string;
      cover_image?: string;
    };
  } | null;
  onClose: () => void;
  onApprove?: (id: string) => void;
  onReturn?: (id: string) => void;
  onReject?: (id: string) => void;
  onRejectReturn?: (id: string) => void;
  loadingActions?: {[key: string]: boolean};
}

export default function ViewBookLoanModal({ isOpen, loan, onClose, onApprove, onReturn, onReject, onRejectReturn, loadingActions = {} }: ViewBookLoanModalProps) {
  if (!isOpen || !loan) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800';
      case 'RETURNED':
        return 'bg-blue-100 text-blue-800';
      case 'REJECTED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pending Approval';
      case 'APPROVED':
        return 'Active Loan';
      case 'OVERDUE':
        return 'Overdue';
      case 'RETURNED':
        return 'Returned';
      case 'REJECTED':
        return 'Rejected';
      default:
        return status;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blur background */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ backgroundColor: '#001240' }}>
          <h2 className="text-lg font-bold text-white">Book Loan Details</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 max-h-[80vh] overflow-y-auto">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Book Cover */}
            <div className="shrink-0">
              <div className="w-40 h-56 bg-gray-300 rounded-lg overflow-hidden">
                {loan.book.cover_image ? (
                  <img src={loan.book.cover_image} alt={loan.book.title} className="w-full h-full object-cover" />
                ) : (
                  <img 
                    src="/assets/book-profile.png" 
                    alt={loan.book.title} 
                    className="w-full h-full object-cover" 
                  />
                )}
              </div>
              <div className="flex items-center gap-2 mt-3">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className={`text-sm font-medium px-2 py-1 rounded ${getStatusColor(loan.status)}`}>
                  {getStatusText(loan.status)}
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <p className="text-sm font-medium text-gray-600">Book Title</p>
                <ExpandableText 
                  text={loan.book.title} 
                  maxLength={50} 
                  className="text-sm font-semibold text-gray-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <p className="text-sm font-medium text-gray-600">Author</p>
                <p className="text-sm font-semibold text-gray-900">{loan.book.author}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <p className="text-sm font-medium text-gray-600">ISBN</p>
                <p className="text-sm font-semibold text-gray-900">{loan.book.ISBN}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <p className="text-sm font-medium text-gray-600">Borrower</p>
                <p className="text-sm font-semibold text-gray-900">{loan.user.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <p className="text-sm font-medium text-gray-600">Email</p>
                <p className="text-sm font-semibold text-gray-900">{loan.user.email}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <p className="text-sm font-medium text-gray-600">Level</p>
                <p className="text-sm font-semibold text-gray-900">{loan.user.level || 'Not specified'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <p className="text-sm font-medium text-gray-600">Borrow date</p>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(loan.borrowDate).toLocaleDateString('en-GB')}
                </p>
              </div>
              {loan.dueDate && (
                <div className="grid grid-cols-2 gap-4">
                  <p className="text-sm font-medium text-gray-600">Expected return date</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(loan.dueDate).toLocaleDateString('en-GB')}
                  </p>
                </div>
              )}
              {loan.returnDate && (
                <div className="grid grid-cols-2 gap-4">
                  <p className="text-sm font-medium text-gray-600">Actual return date</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(loan.returnDate).toLocaleDateString('en-GB')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {(onApprove || onReturn || onReject || onRejectReturn) && (
            <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-200">
              {onApprove && loan.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => {
                      onApprove(loan.id);
                      onClose();
                    }}
                    disabled={loadingActions[`approve-${loan.id}`]}
                    className="px-6 py-2 text-white rounded-lg hover:bg-opacity-90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#001240' }}
                  >
                    {loadingActions[`approve-${loan.id}`] ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Approving...</span>
                      </div>
                    ) : (
                      'Approve Loan'
                    )}
                  </button>
                  {onReject && (
                    <button
                      onClick={() => {
                        onReject(loan.id);
                        onClose();
                      }}
                      disabled={loadingActions[`reject-${loan.id}`]}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingActions[`reject-${loan.id}`] ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Rejecting...</span>
                        </div>
                      ) : (
                        'Reject Loan'
                      )}
                    </button>
                  )}
                </>
              )}
              {onReturn && loan.status === 'RETURN_REQUESTED' && (
                <>
                  <button
                    onClick={() => {
                      onReturn(loan.id);
                      onClose();
                    }}
                    disabled={loadingActions[`return-${loan.id}`]}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingActions[`return-${loan.id}`] ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Approving...</span>
                      </div>
                    ) : (
                      'Approve Return'
                    )}
                  </button>
                  {onRejectReturn && (
                    <button
                      onClick={() => {
                        onRejectReturn(loan.id);
                        onClose();
                      }}
                      disabled={loadingActions[`reject-return-${loan.id}`]}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingActions[`reject-return-${loan.id}`] ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Rejecting...</span>
                        </div>
                      ) : (
                        'Reject Return'
                      )}
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
