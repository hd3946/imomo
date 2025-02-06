"use client";

import { Button } from "@repo/ui/components/ui/button";
import { useState } from "react";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 w-full border-b bg-background/40 backdrop-blur-sm z-50">
      <div className="flex h-16 items-center justify-between px-10">
        <span className="font-mono text-lg font-bold">Portfolio</span>

        <div className="hidden md:flex items-center gap-6">
          {["Home", "About", "Projects", "Skills", "Contact"].map((item) => (
            <Button key={item} variant="ghost" size="sm">
              {item}
            </Button>
          ))}
        </div>
      </div>
    </nav>
  );
}
