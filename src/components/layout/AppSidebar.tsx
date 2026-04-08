"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { Text, Divider } from "@tremor/react";
import { RiHome4Line, RiFlashlightLine, RiSettings3Line, RiLogoutBoxRLine } from "@remixicon/react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: RiHome4Line },
  { href: "/startups", label: "Startups", icon: RiFlashlightLine },
  { href: "/settings", label: "Settings", icon: RiSettings3Line },
];

type AppSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col border-r border-tremor-border bg-tremor-background transition-transform duration-200 md:static md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b border-tremor-border px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-tremor-content-strong">CoBuilders</span>
          </Link>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-tremor-default text-tremor-content-subtle hover:bg-tremor-background-subtle md:hidden"
            aria-label="Close menu"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const IconComp = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-tremor-default px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-tremor-brand-muted text-tremor-brand-emphasis"
                    : "text-tremor-content hover:bg-tremor-background-muted"
                }`}
              >
                <IconComp className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Divider className="my-0" />

        <div className="p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white">
              {user?.email?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="flex-1 truncate">
              <Text className="truncate text-xs">{user?.email}</Text>
            </div>
            <button
              onClick={signOut}
              className="shrink-0 rounded-tremor-default p-1.5 text-tremor-content-subtle hover:bg-tremor-background-muted hover:text-tremor-content"
              title="Sign out"
            >
              <RiLogoutBoxRLine className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
