"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full text-xs font-bold uppercase tracking-[0.3em] transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#2A3320] text-white hover:bg-[#232B1B]",
        outline: "border border-[#2A3320] text-[#2A3320] hover:bg-[#2A3320] hover:text-white",
        ghost: "text-[#2A3320] hover:bg-[#F8F3EA]",
        destructive: "border border-red-300 text-red-600 hover:bg-red-50",
      },
      size: {
        sm: "px-3 py-2 text-[10px]",
        md: "px-4 py-2 text-[10px]",
        lg: "px-5 py-3 text-[11px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
