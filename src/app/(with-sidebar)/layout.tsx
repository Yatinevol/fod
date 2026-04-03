"use client";
import Sidebar from "@/components/Sidebar";
import { useState, useEffect } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Return a static version for SSR to prevent hydration mismatch
    return (
      <div className="flex h-screen">
        {/* Static button for SSR */}
        <button className="fixed top-4 left-4 p-3 rounded-lg z-50 bg-white shadow-lg border border-gray-200">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex-1 p-6 pl-20 lg:p-10 lg:pl-10 overflow-y-auto bg-slate-50 relative">
          <div className="absolute top-0 right-0 -z-10 w-125 h-125 bg-violet-600/10 rounded-full blur-[100px] mix-blend-multiply opacity-50" />
          <div className="absolute top-40 left-20 -z-10 w-100 h-100 bg-fuchsia-600/10 rounded-full blur-[100px] mix-blend-multiply opacity-50" />
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[20%] -right-[10%] w-150 h-150 bg-violet-600/10 rounded-full blur-[120px] mix-blend-multiply opacity-70 animate-pulse transition-all" />
        <div className="absolute top-[30%] -left-[10%] w-125 h-125 bg-fuchsia-600/10 rounded-full blur-[120px] mix-blend-multiply opacity-70 animate-pulse transition-all" />
        <div className="absolute -bottom-[20%] right-[20%] w-125 h-125 bg-emerald-600/10 rounded-full blur-[120px] mix-blend-multiply opacity-50 animate-pulse transition-all" />
      </div>
      {/* Sidebar */}
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen}/>

      {/* Main content */}
      <main className={`flex-1 overflow-y-auto transition-all duration-300
        ${isOpen ? "ml-70 p-6 lg:p-10" : "ml-0 p-6 pl-20 lg:p-10 lg:pl-28"}`}>
        <div className="w-full max-w-7xl mx-auto backdrop-blur-sm">
          {children}
        </div>
      </main>
    </div>
  );
}
