"use client";
import { LayoutDashboard, ListChecks, Timer, X, Menu, Rocket } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const Sidebar = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) => {
  const pathname = usePathname();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, setIsOpen]);

  const getLinkClass = (path: string) => {
    const isActive = pathname === path;
    return `flex items-center space-x-3 transition-all duration-200 py-3 px-4 rounded-xl font-medium ${
      isActive
        ? "bg-violet-600 text-white shadow-md shadow-violet-600/20"
        : "text-slate-600 hover:bg-violet-50 hover:text-violet-700"
    }`;
  };

  const close = () => setIsOpen(false);

  return (
    <div className="relative">
      {!isOpen && (
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 p-3 rounded-xl z-[200] bg-white shadow-md border border-slate-200 hover:bg-slate-50"
        >
          <Menu className="text-slate-700" size={22} />
        </button>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/30 z-[90]"
          onClick={close}
          aria-hidden
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white shadow-2xl border-r border-slate-200 px-6 py-6 z-[100] transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"}`}
      >
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="bg-linear-to-br from-violet-500 to-fuchsia-600 p-2 rounded-xl text-white">
              <Rocket size={24} />
            </div>
            <span className="text-2xl font-black bg-clip-text text-transparent bg-linear-to-r from-violet-600 to-fuchsia-600">
              FOD
            </span>
          </div>
          <button
            type="button"
            aria-label="Close menu"
            onClick={close}
            className="p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={22} />
          </button>
        </div>

        <ul className="space-y-3">
          <li>
            <Link href="/dashboard" className={getLinkClass("/dashboard")} onClick={close}>
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link href="/goal" className={getLinkClass("/goal")} onClick={close}>
              <ListChecks size={20} />
              <span>Tasks</span>
            </Link>
          </li>
          <li>
            <Link href="/timer" className={getLinkClass("/timer")} onClick={close}>
              <Timer size={20} />
              <span>Timer</span>
            </Link>
          </li>
        </ul>
      </aside>
    </div>
  );
};

export default Sidebar;
