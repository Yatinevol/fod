"use client";
import { Calendar1, LayoutDashboard, ListChecks,Timer, X } from 'lucide-react';
import Link from 'next/link';

const Sidebar = ({isOpen, setIsOpen}:any) => {
  
  return (
    <div className='relative'>
        {/* Menu button - only show when sidebar is closed */}
        {!isOpen && (
          <button 
            onClick={()=> setIsOpen(true)} 
            className="fixed top-4 left-4 p-3 rounded-lg z-50 bg-white shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300"
          >
            <Calendar1
              className="transition-transform duration-300 ease-in-out"
              color="black"
              size={20}
            />
          </button>
        )}

        {/* sidebar */}
        <div className={`fixed top-0 left-0 h-full bg-white shadow-xl border-r border-gray-200 w-64 px-6 py-8 transition-transform duration-300 ease-in-out z-40
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
          
          {/* Close button inside sidebar */}
          <button 
            onClick={()=> setIsOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} color='black' />
          </button>

          <ul className='mt-16 space-y-6'>
          <li>
              <Link href="/dashboard" className='flex items-center space-x-3 text-gray-700 hover:text-gray-900 transition-colors py-2 px-3 rounded-lg hover:bg-gray-100'>
              <LayoutDashboard size={20} color='currentColor'/>
              <span className="font-medium">Dashboard</span>
              </Link>
          </li>

            <li>
              <Link href="/goal" className='flex items-center space-x-3 text-gray-700 hover:text-gray-900 transition-colors py-2 px-3 rounded-lg hover:bg-gray-100'>
                <ListChecks size={20} color='currentColor' />
                <span className="font-medium">Tasks</span>
              </Link>
            </li>

          <li>
              <Link href="/timer" className='flex items-center space-x-3 text-gray-700 hover:text-gray-900 transition-colors py-2 px-3 rounded-lg hover:bg-gray-100'>
                <Timer size={20} color='currentColor' />
                <span className="font-medium">Timer</span>
              </Link>
          </li>
          </ul>
        </div>
    </div>
  )
}

export default Sidebar