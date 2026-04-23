import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide transition-colors',
  {
    variants: {
      variant: {
        default:   'bg-indigo-500/15 text-indigo-300 border-indigo-500/25',
        secondary: 'bg-white/5 text-ink-2 border-line',
        outline:   'bg-transparent border-line text-ink-3',
        brand:     'bg-indigo-500/15 text-indigo-300 border-indigo-500/25',
        pending:   'bg-amber-500/10 text-amber-400 border-amber-500/20',
        review:    'bg-blue-500/10 text-blue-400 border-blue-500/20',
        approved:  'bg-green-500/10 text-green-400 border-green-500/20',
        rejected:  'bg-red-500/10 text-red-400 border-red-500/20',
        disbursed: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
