import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-page disabled:pointer-events-none disabled:opacity-40',
  {
    variants: {
      variant: {
        default:      'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20',
        primary:      'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20',
        gold:         'bg-amber-500 text-white hover:bg-amber-400 shadow-sm',
        outline:      'border border-line bg-surface/60 text-ink hover:bg-surface hover:border-indigo-500/40',
        ghost:        'text-ink-3 hover:bg-white/5 hover:text-ink',
        destructive:  'bg-red-600 text-white hover:bg-red-500 shadow-sm',
        success:      'bg-green-600 text-white hover:bg-green-500 shadow-sm',
        soft:         'bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25',
        'soft-danger':'bg-red-500/10 text-red-400 hover:bg-red-500/20',
        link:         'text-indigo-400 underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        default:   'h-10 px-5 py-2',
        sm:        'h-8 px-3.5 py-1.5 text-xs',
        lg:        'h-12 px-7 text-base',
        xl:        'h-14 px-8 text-base',
        icon:      'h-10 w-10',
        'icon-sm': 'h-8 w-8',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
