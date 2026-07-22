import type { ReactNode } from "react";

interface FeaturedGridProps {
  children?: ReactNode;
}

export function FeaturedGrid({ children }: FeaturedGridProps) {
  return <div className="grid gap-5 lg:grid-cols-3">{children}</div>;
}
