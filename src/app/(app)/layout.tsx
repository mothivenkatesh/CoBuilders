"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { RiMenuLine } from "@remixicon/react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-tremor-background">
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed left-3 top-3 z-40 flex h-10 w-10 items-center justify-center rounded-tremor-default bg-tremor-background shadow-tremor-card border border-tremor-border md:hidden"
        aria-label="Open menu"
      >
        <RiMenuLine className="h-5 w-5 text-tremor-content" />
      </button>
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
