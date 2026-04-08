"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen">
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {/* Mobile hamburger button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed left-3 top-3 z-40 flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-md dark:bg-zinc-900 md:hidden"
        aria-label="Open menu"
      >
        <svg className="h-5 w-5 text-zinc-700 dark:text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
