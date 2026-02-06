'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  BookOpen, 
  History, 
  User,
  LogOut,
  Library as LibraryIcon,
  Bell,
  DollarSign
} from "lucide-react";
import { useSidebar } from "@/contexts/SidebarContext";
import { useAuth } from "@/hooks/useAuth";

const userMenuItems = [
  {
    name: "Dashboard",
    href: "/user",
    icon: LayoutDashboard,
  },
  {
    name: "Books",
    href: "/user/books",
    icon: BookOpen,
  },
  {
    name: "Borrowings",
    href: "/user/borrowings",
    icon: History,
  },
  {
    name: "Fines",
    href: "/user/fines",
    icon: DollarSign,
  },
  {
    name: "Notifications",
    href: "/user/notifications",
    icon: Bell,
  },
  {
    name: "Profile",
    href: "/user/profile",
    icon: User,
  },
];

export default function UserSidebar() {
  const pathname = usePathname();
  const { isExpanded, toggleSidebar } = useSidebar();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Mobile overlay - only show when sidebar is open on mobile */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`
          fixed left-0 top-0 h-screen text-white flex flex-col z-50 transition-all duration-300 ease-in-out
          ${isExpanded ? 'w-64 lg:w-48' : 'w-16'} 
          ${isExpanded ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `} 
        style={{ backgroundColor: "#001240" }}
      >
        <div className="p-4 lg:p-6 pt-12">
          <div className="flex items-center gap-3">
            <img 
              src="/assets/white-book.png" 
              alt="RCA Library" 
              className="h-6 w-6 shrink-0 object-contain"
            />
            {isExpanded && (
              <h1 className="text-lg font-bold whitespace-nowrap">RCA Library</h1>
            )}
          </div>
        </div>
        
        <nav className="flex-1 mt-8 lg:mt-12 flex flex-col">
          {userMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => {
                  // Close sidebar on mobile after navigation
                  if (window.innerWidth < 1024) {
                    toggleSidebar();
                  }
                }}
                className={`flex items-center ${
                  isExpanded ? 'px-4 lg:px-6' : 'px-4 justify-center'
                } py-4 text-sm font-medium transition-colors relative group ${
                  isActive
                    ? "bg-white"
                    : "text-white hover:bg-white/70"
                }`}
                style={isActive ? { color: "#001240" } : {}}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#001240";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = "white";
                  }
                }}
              >
                <Icon className={`h-5 w-5 shrink-0 ${isExpanded ? 'mr-4' : ''}`} />
                {isExpanded && <span className="whitespace-nowrap">{item.name}</span>}
                
                {/* Tooltip for collapsed state on desktop only */}
                {!isExpanded && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 hidden lg:block">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className={`p-4 lg:p-6 ${!isExpanded ? 'px-4' : ''}`}>
          <button 
            onClick={handleLogout}
            className={`flex items-center w-full text-sm font-medium text-white hover:bg-red-600 hover:bg-opacity-20 transition-colors rounded px-2 py-2 relative group ${
              !isExpanded ? 'justify-center' : ''
            }`}
          >
            <LogOut className={`h-5 w-5 shrink-0 group-hover:text-blue-400 ${isExpanded ? 'mr-4' : ''}`} />
            {isExpanded && <span className="whitespace-nowrap">Logout</span>}
            
            {/* Tooltip for collapsed state on desktop only */}
            {!isExpanded && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 hidden lg:block">
                Logout
              </div>
            )}
          </button>
        </div>
      </div>
    </>
  );
}