'use client';

import UserSidebar from "@/components/UserSidebar";
import TopBar from "@/components/TopBar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";
import { usePathname } from "next/navigation";

function getPageTitle(pathname: string): string {
  switch (pathname) {
    case '/user':
      return 'My Dashboard';
    case '/user/books':
      return 'Library Books';
    case '/user/borrowings':
      return 'Borrowings';
    case '/user/fines':
      return 'My Fines';
    case '/user/notifications':
      return 'Notifications';
    case '/user/profile':
      return 'Profile';
    default:
      return 'Dashboard';
  }
}

function UserLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded } = useSidebar();
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <div className="flex min-h-screen">
      <UserSidebar />
      <main className={`flex-1 transition-all duration-300 ease-in-out ${
        // Proper spacing for sidebar
        isExpanded
          ? 'ml-64 lg:ml-48' // Always use margin-left when expanded
          : 'ml-0 lg:ml-16' // Use margin-left only on desktop when collapsed
        }`}>
        <TopBar title={pageTitle} />
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 pt-28 bg-gray-50 min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="STUDENT">
      <SidebarProvider>
        <UserLayoutContent>{children}</UserLayoutContent>
      </SidebarProvider>
    </ProtectedRoute>
  );
}