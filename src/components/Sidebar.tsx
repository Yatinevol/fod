"use client";
import { Calendar1, LayoutDashboard, ListChecks,Timer, X } from 'lucide-react';
import Link from 'next/link';

const Sidebar = ({isOpen, setIsOpen}:any) => {
  
  return (
    <div className='relative'>
        <button onClick={()=> setIsOpen(!isOpen)} className='p-2 text-white rounded-md relative top-4 left-4 z-50  bg-gray-100'>
        {isOpen ? (
          <X size={24} color='black' className="transition-transform duration-300 ease-in-out cursor-pointer" />
        ) : (
          <Calendar1
            className="rounded cursor-move"
            color="black"
            size={26}
          />
        )}
        </button>

        {/* sidebar */}
        <div className={`fixed top-0 left-0 h-full bg-gray-300 text-white w-64 p-10 transition-transform duration-300 ease-in-out z-40
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>

          <ul className='mt-8 space-y-4'>
          <li>
              <Link href="/dashboard" className='flex items-center space-x-2 text-black'>
              <LayoutDashboard size={18} color='black'/>
              <span>Dashboard</span>
              </Link>
          </li>

            <li>
              <Link href="/goal" className='flex items-center space-x-2 text-black'>
                <ListChecks size={18} color='black' />
                <span >Tasks</span>
              </Link>
            </li>

          <li>
              <Link href="/timer" className='flex items-center space-x-2 text-black'>
                <Timer size={18} color='black' />
                <span >Timer</span>
              </Link>
          </li>
          </ul>
        </div>
    </div>
  )
}

export default Sidebar