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
        <div className="flex-1 p-6 pl-20 overflow-y-auto bg-gray-100">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen}/>

      {/* Main content */}
      <main className={`flex-1 overflow-y-auto bg-gray-100 transition-all duration-300
        ${isOpen ? "ml-64 p-6" : "ml-0 p-6 pl-20"}`}>
        {children}
      </main>
    </div>
  );
}
