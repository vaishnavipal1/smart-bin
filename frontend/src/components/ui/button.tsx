"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "default" | "outline" | "ghost";
}

export function Button({
  className,
  variant = "default",
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(
        "px-4 py-2 rounded-md font-medium transition-colors focus:outline-none",
        variant === "default" &&
          "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800",
        variant === "outline" &&
          "border border-blue-600 text-blue-600 hover:bg-blue-50",
        variant === "ghost" &&
          "text-blue-600 hover:bg-blue-100",
        className
      )}
      {...props}
    />
  );
}
