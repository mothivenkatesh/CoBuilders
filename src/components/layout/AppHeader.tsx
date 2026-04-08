"use client";

import { Title } from "@tremor/react";

type AppHeaderProps = {
  title?: string;
  actions?: React.ReactNode;
};

export function AppHeader({ title, actions }: AppHeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-tremor-border bg-tremor-background px-4 pl-14 md:px-6 md:pl-6">
      {title && <Title>{title}</Title>}
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
