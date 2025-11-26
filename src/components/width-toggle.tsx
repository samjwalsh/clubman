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

export type ContentWidth = "medium" | "wide" | "full";

const widthLabels: Record<ContentWidth, string> = {
  medium: "Medium",
  wide: "Wide",
  full: "Full Width",
};

const STORAGE_KEY = "content-width";

type WidthContextType = {
  width: ContentWidth;
  setWidth: (width: ContentWidth) => void;
  mounted: boolean;
};

const WidthContext = React.createContext<WidthContextType | null>(null);

export function WidthProvider({ children }: { children: React.ReactNode }) {
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

  return (
    <WidthContext.Provider value={{ width, setWidth, mounted }}>
      {children}
    </WidthContext.Provider>
  );
}

export function useContentWidth() {
  const context = React.useContext(WidthContext);
  if (!context) {
    throw new Error("useContentWidth must be used within a WidthProvider");
  }
  return context;
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
