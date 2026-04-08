import { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  padding?: "sm" | "md" | "lg";
};

export function Card({ padding = "md", className = "", children, ...props }: CardProps) {
  const paddings = { sm: "p-3", md: "p-4", lg: "p-6" };

  return (
    <div
      className={`group rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 ${paddings[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
