"use client";

type AppHeaderProps = {
  title?: string;
  actions?: React.ReactNode;
};

export function AppHeader({ title, actions }: AppHeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-4 pl-14 dark:border-zinc-800 dark:bg-zinc-900 md:px-6 md:pl-6">
      {title && (
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{title}</h1>
      )}
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
