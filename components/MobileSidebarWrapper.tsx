'use client';

import MobileSidebar from "@/components/MobileSidebar";
import { useMobileMenu } from "@/lib/MobileMenuContext";

interface MobileSidebarWrapperProps {
  children: React.ReactNode;
}

export default function MobileSidebarWrapper({ children }: MobileSidebarWrapperProps) {
  const { isMobileMenuOpen, closeMobileMenu } = useMobileMenu();
  
  return (
    <>
      <MobileSidebar isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />
      {children}
    </>
  );
}
