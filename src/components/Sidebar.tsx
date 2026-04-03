"use client";
import { LayoutDashboard, ListChecks, Timer, X, Menu, Rocket } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Sidebar = ({isOpen, setIsOpen}: {isOpen: boolean, setIsOpen: (open: boolean) => void}) => {
  const pathname = usePathname();

  const getLinkClass = (path: string) => {
    const isActive = pathname === path;
    return `flex items-center space-x-3 transition-all duration-200 py-3 px-4 rounded-xl font-medium ${
      isActive 
        ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20' 
        : 'text-slate-600 hover:bg-violet-50 hover:text-violet-700'
    }`;
  };

  return (
    <div className='relative'>
        {/* Menu button - only show when sidebar is closed */}
        {!isOpen && (
          <button 
            onClick={()=> setIsOpen(true)} 
            className="fixed top-4 left-4 p-3 rounded-xl z-50 bg-white/80 backdrop-blur-md shadow-sm border border-slate-200/60 hover:shadow-md hover:bg-white transition-all duration-300"
          >
            <Menu className="text-slate-700" size={22} />
          </button>
        )}

        {/* sidebar background overlay for mobile */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 transition-opacity md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* sidebar */}
        <div className={`fixed top-0 left-0 h-full bg-white/90 backdrop-blur-xl shadow-2xl border-r border-slate-200 w-72 px-6 py-8 transition-transform duration-400 cubic-bezier(0.16, 1, 0.3, 1) z-40
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
          
          {/* Close button inside sidebar */}
          <div className="flex items-center justify-between mb-12 relative">
            <div className="flex items-center gap-3">
              <div className="bg-linear-to-br from-violet-500 to-fuchsia-600 p-2 rounded-xl shadow-inner text-white">
                <Rocket size={24} />
              </div>
              <span className="text-2xl font-black bg-clip-text text-transparent bg-linear-to-r from-violet-600 to-fuchsia-600">
                FOD
              </span>
            </div>
            <button 
              onClick={()=> setIsOpen(false)}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors md:hidden"
            >
              <X size={20} />
            </button>
          </div>

          <ul className='space-y-3'>
            <li>
                <Link href="/dashboard" className={getLinkClass('/dashboard')} onClick={() => window.innerWidth < 768 && setIsOpen(false)}>
                  <LayoutDashboard size={20} />
                  <span>Dashboard</span>
                </Link>
            </li>
            <li>
                <Link href="/goal" className={getLinkClass('/goal')} onClick={() => window.innerWidth < 768 && setIsOpen(false)}>
                  <ListChecks size={20} />
                  <span>Tasks</span>
                </Link>
            </li>
            <li>
                <Link href="/timer" className={getLinkClass('/timer')} onClick={() => window.innerWidth < 768 && setIsOpen(false)}>
                  <Timer size={20} />
                  <span>Timer</span>
                </Link>
            </li>
          </ul>
        </div>
    </div>
  )
}

export default Sidebar