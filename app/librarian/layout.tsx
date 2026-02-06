'use client';

import LibrarianSidebar from "@/components/LibrarianSidebar";
import TopBar from "@/components/TopBar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";
import { usePathname } from "next/navigation";

function getPageTitle(pathname: string): string {
  switch (pathname) {
    case '/librarian':
      return 'Dashboard';
    case '/librarian/users':
      return 'User & Roles';
    case '/librarian/books':
      return 'Books';
    case '/librarian/catalog':
      return 'Catalog';
    case '/librarian/fines':
      return 'Fines';
    case '/librarian/reports':
      return 'Reports';
    case '/librarian/analytics':
      return 'Analytics';
    case '/librarian/notifications':
      return 'Notifications';
    case '/librarian/profile':
      return 'Profile';
    default:
      return 'Dashboard';
  }
}

function LibrarianLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded } = useSidebar();
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <div className="flex min-h-screen w-full overflow-hidden">
      <LibrarianSidebar />
      <main className={`flex-1 min-w-0 transition-all duration-300 ease-in-out ${
        // Proper spacing for sidebar
        isExpanded 
          ? 'ml-64 lg:ml-48' // Always use margin-left when expanded
          : 'ml-0 lg:ml-16' // Use margin-left only on desktop when collapsed
      }`}>
        <TopBar title={pageTitle} userName="Admin User" />
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 bg-gray-50 min-h-screen w-full overflow-x-hidden">
          <div className="max-w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function LibrarianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="LIBRARIAN">
      <SidebarProvider>
        <LibrarianLayoutContent>{children}</LibrarianLayoutContent>
      </SidebarProvider>
    </ProtectedRoute>
  );
}