import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-green-100 text-green-800",
        secondary:
          "border-transparent bg-slate-100 text-slate-800",
        destructive:
          "border-transparent bg-red-100 text-red-800",
        outline: "text-slate-700 border-slate-200",
        // Status penjemputan
        pending: "border-amber-200 bg-amber-50 text-amber-700",
        accepted: "border-blue-200 bg-blue-50 text-blue-700",
        completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
        cancelled: "border-rose-200 bg-rose-50 text-rose-700",
        // Waste categories
        organik: "border-green-200 bg-green-50 text-green-700 font-medium",
        anorganik: "border-sky-200 bg-sky-50 text-sky-700 font-medium",
        b3: "border-red-200 bg-red-50 text-red-700 font-medium",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

