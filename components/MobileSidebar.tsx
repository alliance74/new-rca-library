'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Library, 
  FileText, 
  BarChart3,
  LogOut,
  Library as LibraryIcon,
  X
} from "lucide-react";
import { useState } from "react";

const adminMenuItems = [
  {
    name: "Dashboard",
    href: "/librarian",
    icon: LayoutDashboard,
  },
  {
    name: "User & Roles",
    href: "/librarian/users",
    icon: Users,
  },
  {
    name: "Books",
    href: "/librarian/books",
    icon: BookOpen,
  },
  {
    name: "Catalog",
    href: "/librarian/catalog",
    icon: Library,
  },
  {
    name: "Reports",
    href: "/librarian/reports",
    icon: FileText,
  },
  {
    name: "Analytics",
    href: "/librarian/analytics",
    icon: BarChart3,
  },
];

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const pathname = usePathname();

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 z-40 md:hidden"
        onClick={onClose}
      />
      
      {/* Mobile Sidebar */}
      <div className="fixed left-0 top-20 bottom-0 w-64 text-white z-40 md:hidden overflow-y-auto flex flex-col" style={{ backgroundColor: "#001240" }}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <LibraryIcon className="h-6 w-6" />
            <h1 className="text-lg font-bold">RCA Library</h1>
          </div>
          
          <nav className="flex flex-col gap-2">
            {adminMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-white text-blue-600"
                      : "text-white hover:bg-white/20"
                  }`}
                  style={isActive ? { backgroundColor: "white", color: "#001240" } : {}}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-white/20">
          <button className="flex items-center gap-3 w-full text-sm font-medium text-white hover:text-white/80 transition-colors">
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
