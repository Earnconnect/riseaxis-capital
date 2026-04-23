/**
 * Shared animation primitives used across the whole platform.
 * Keeps motion config consistent and easy to tweak in one place.
 */
import { motion, type Variants, useSpring, useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

/* ── Page wrapper — fades + slides on every route mount ────── */
export function PageEnter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ── Stagger container — children animate in sequence ──────── */
const staggerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export function StaggerGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={staggerVariants} initial="hidden" animate="show" className={className}>
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  )
}

/* ── Hover-lift card — rises on hover, clicks depress ──────── */
export function HoverCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(99,102,241,0.15)' }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ── Tap button wrapper ─────────────────────────────────────── */
export function TapButton({ children, className, onClick }: {
  children: React.ReactNode; className?: string; onClick?: () => void
}) {
  return (
    <motion.div
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.1 }}
      className={cn('cursor-pointer', className)}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}

/* ── Animated number counter ───────────────────────────────── */
export function AnimatedNumber({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  className,
}: {
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const spring = useSpring(0, { stiffness: 60, damping: 18 })
  const [display, setDisplay] = useState('0')

  useEffect(() => {
    if (inView) spring.set(value)
  }, [inView, value, spring])

  useEffect(() => {
    return spring.on('change', v => {
      setDisplay(v.toFixed(decimals))
    })
  }, [spring, decimals])

  return (
    <span ref={ref} className={className}>
      {prefix}{display}{suffix}
    </span>
  )
}

/* ── Slide-in from left (sidebar items) ────────────────────── */
export function SlideIn({ children, delay = 0, className }: {
  children: React.ReactNode; delay?: number; className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.26, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ── Fade in (generic) ─────────────────────────────────────── */
export function FadeIn({ children, delay = 0, className }: {
  children: React.ReactNode; delay?: number; className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ── Icon container (colored rounded background) ───────────── */
export function IconBox({
  children,
  color = 'green',
  size = 'md',
  className,
}: {
  children: React.ReactNode
  color?: 'green' | 'amber' | 'blue' | 'red' | 'purple' | 'ink' | 'cream'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const colors = {
    green:  'bg-green-500/15  text-green-400',
    amber:  'bg-amber-500/15  text-amber-400',
    blue:   'bg-blue-500/15   text-blue-400',
    red:    'bg-red-500/15    text-red-400',
    purple: 'bg-purple-500/15 text-purple-400',
    ink:    'bg-white/5       text-ink-2',
    cream:  'bg-white/5       text-ink-3',
  }
  const sizes = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-12 h-12' }

  return (
    <div className={cn(
      'rounded-xl flex items-center justify-center shrink-0',
      sizes[size], colors[color], className
    )}>
      {children}
    </div>
  )
}

/* ── Pulse dot (online indicator) ──────────────────────────── */
export function PulseDot({ color = 'green' }: { color?: 'green' | 'amber' | 'red' }) {
  const colors = { green: 'bg-green-400', amber: 'bg-amber-400', red: 'bg-red-400' }
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-60', colors[color])} />
      <span className={cn('relative inline-flex rounded-full h-2.5 w-2.5', colors[color])} />
    </span>
  )
}
