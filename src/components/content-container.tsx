"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useContentWidth, type ContentWidth } from "@/components/width-toggle";

const widthClasses: Record<ContentWidth, string> = {
  medium: "max-w-5xl",
  wide: "max-w-7xl",
  full: "max-w-full",
};

interface ContentContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function ContentContainer({
  children,
  className,
}: ContentContainerProps) {
  const { width, mounted } = useContentWidth();

  return (
    <div
      className={cn(
        "mx-auto w-full transition-all duration-200",
        mounted ? widthClasses[width] : widthClasses.wide,
        className,
      )}
    >
      {children}
    </div>
  );
}
