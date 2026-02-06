'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function PoweredBy() {
  const [isAtBottom, setIsAtBottom] = useState(false);
  const pathname = usePathname();
  
  // Check if we're on the signin page
  const isSigninPage = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Check if user is near the bottom (within 100px)
      const isNearBottom = scrollTop + windowHeight >= documentHeight - 100;
      setIsAtBottom(isNearBottom);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Don't show on signin page
  if (isSigninPage) {
    return null;
  }

  return (
    <div className={`fixed right-6 z-50 transition-all duration-500 ease-out ${
      isAtBottom ? 'bottom-20' : 'bottom-6'
    }`}>
      <Link 
        href="https://www.blinktechnologiz.com" 
        target="_blank" 
        rel="noopener noreferrer"
        className={`flex items-center rounded-full transition-all duration-700 ease-in-out hover:shadow-2xl group relative overflow-hidden shadow-lg ${
          isAtBottom 
            ? 'gap-0 px-2 py-2' 
            : 'gap-3 px-5 py-3'
        } ${
          'bg-white/70 backdrop-blur-sm border border-gray-200/30 hover:bg-white/90 shadow-xl hover:shadow-2xl'
        }`}
      >
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
        
        <div className="relative">
          {/* Rotating ring around logo */}
          <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-current opacity-30 animate-spin" style={{ animationDuration: '3s' }}></div>
          
          <img 
            src="/assets/bt.png" 
            alt="Blink Tech" 
            className="h-7 w-auto object-contain rounded-full transition-all duration-500 ease-out relative z-10 filter drop-shadow-sm"
          />
          
          {/* Pulsing glow effect */}
          <div className="absolute inset-0 rounded-full bg-current opacity-20 animate-ping group-hover:animate-pulse"></div>
        </div>
        
        <div className={`flex items-center gap-1 relative z-10 transition-all duration-700 ease-in-out ${
          isAtBottom ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
        }`}>
          <span className="text-sm font-semibold transition-colors duration-300 text-gray-700 group-hover:text-gray-900">
            Powered by{' '}
          </span>
          <span className="text-sm font-semibold transition-colors duration-300 group-hover:opacity-80" style={{ color: '#001240' }}>
            blink-tech
          </span>
        </div>
      </Link>
    </div>
  );
}