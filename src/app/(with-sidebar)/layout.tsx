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
        <div className="flex-1 p-6 overflow-y-auto bg-gray-100">
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
      <main className={`flex-1 p-6 overflow-y-auto bg-gray-100 transition-all duration-300
        ${isOpen ? "ml-56" : "ml-0"}`}>
        {children}
      </main>
    </div>
  );
}
