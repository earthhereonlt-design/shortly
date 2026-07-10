"use client";

import * as React from "react";
import { ThemeProvider as NextThemes } from "@/components/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemes>
      <TooltipProvider delayDuration={150}>
        <ToastProvider>{children}</ToastProvider>
      </TooltipProvider>
    </NextThemes>
  );
}
