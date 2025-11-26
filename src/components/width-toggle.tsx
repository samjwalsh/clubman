"use client";

import * as React from "react";
import { Maximize2, Minimize2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type ContentWidth = "narrow" | "medium" | "wide" | "full";

const widthLabels: Record<ContentWidth, string> = {
  narrow: "Narrow",
  medium: "Medium",
  wide: "Wide",
  full: "Full Width",
};

const STORAGE_KEY = "content-width";

export function useContentWidth() {
  const [width, setWidthState] = React.useState<ContentWidth>("wide");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY) as ContentWidth | null;
    if (stored && Object.keys(widthLabels).includes(stored)) {
      setWidthState(stored);
    }
  }, []);

  const setWidth = React.useCallback((newWidth: ContentWidth) => {
    setWidthState(newWidth);
    localStorage.setItem(STORAGE_KEY, newWidth);
  }, []);

  return { width, setWidth, mounted };
}

export function WidthToggle() {
  const { width, setWidth } = useContentWidth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          {width === "full" ? (
            <Maximize2 className="h-[1.2rem] w-[1.2rem]" />
          ) : (
            <Minimize2 className="h-[1.2rem] w-[1.2rem]" />
          )}
          <span className="sr-only">Toggle content width</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(Object.keys(widthLabels) as ContentWidth[]).map((w) => (
          <DropdownMenuItem
            key={w}
            onClick={() => setWidth(w)}
            className={width === w ? "bg-accent" : ""}
          >
            {widthLabels[w]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
