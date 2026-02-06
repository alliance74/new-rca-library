'use client';

import { Bell, User, Menu, ChevronDown, LogOut, PanelLeft } from 'lucide-react';
import { useSidebar } from '@/contexts/SidebarContext';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useUnreadCount } from '@/hooks/useNotifications';
import { useState, useRef, useEffect } from 'react';

interface TopBarProps {
  title: string;
  userName?: string;
  userAvatar?: string;
}

export default function TopBar({
  title,
  userName,
  userAvatar,
}: TopBarProps) {
  const { isExpanded, toggleSidebar } = useSidebar();
  const { logout, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get unread notification count
  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.count || 0;

  // Determine if we're in user or librarian portal
  const isUserPortal = pathname.startsWith('/user');
  const isLibrarianPortal = pathname.startsWith('/librarian');

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNotificationClick = () => {
    if (isUserPortal) {
      router.push('/user/notifications');
    } else if (isLibrarianPortal) {
      router.push('/librarian/notifications');
    }
  };

  const handleProfileClick = () => {
    if (isUserPortal) {
      router.push('/user/profile');
    } else if (isLibrarianPortal) {
      router.push('/librarian/profile');
    }
    setIsDropdownOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  // Use actual user name if available
  const displayName = user?.name || userName;

  return (
    <div
      className={`sticky top-0 right-0 h-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-50 w-full min-w-0 overflow-visible`}
      style={{ zIndex: 100 }}
    >
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0 cursor-pointer"
          aria-label="Toggle sidebar"
        >
          <PanelLeft className="h-5 w-5 text-gray-600" />
        </button>
        <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate min-w-0">{title}</h1>
      </div>

      <div className="flex items-center gap-0 shrink-0">
        {/* Notification Bell with Badge */}
        <button
          onClick={handleNotificationClick}
          className="relative p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors cursor-pointer"
          >
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={displayName}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-amber-400 flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
            )}
            <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50" style={{ zIndex: 9999 }}>
              <button
                onClick={handleProfileClick}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <User className="h-4 w-4" />
                Profile
              </button>
              <hr className="my-1 border-gray-200" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
