import type { Config } from 'tailwindcss'
import animatePlugin from 'tailwindcss-animate'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: { center: true, padding: '2rem', screens: { '2xl': '1440px' } },
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        // ── Core semantic tokens ──────────────────────────────
        page:    '#070B18',
        surface: '#0C1526',
        panel:   '#111E36',
        line:    'rgba(255,255,255,0.08)',
        subtle:  '#090D1F',
        ink:     '#FFFFFF',
        'ink-2': '#CBD5E1',
        'ink-3': '#94A3B8',
        'ink-4': '#475569',
        // ── Green primary (accent) ────────────────────────────
        green: {
          50:  '#F0FDF4', 100: '#DCFCE7', 200: '#BBF7D0',
          300: '#86EFAC', 400: '#4ADE80', 500: '#22C55E',
          600: '#16A34A', 700: '#15803D', 800: '#166534', 900: '#14532D',
        },
        // ── Lime (gradient pair) ──────────────────────────────
        lime: {
          300: '#BEF264', 400: '#A3E635', 500: '#84CC16',
          600: '#65A30D', 700: '#4D7C0F',
        },
        // ── Indigo secondary ──────────────────────────────────
        indigo: {
          50:  '#EEF2FF', 100: '#E0E7FF', 200: '#C7D2FE',
          300: '#A5B4FC', 400: '#818CF8', 500: '#6366F1',
          600: '#4F46E5', 700: '#4338CA', 800: '#3730A3',
          900: '#312E81', 950: '#1E1B4B',
        },
        // ── Blue accent ───────────────────────────────────────
        blue: {
          300: '#93C5FD', 400: '#60A5FA', 500: '#3B82F6',
          600: '#2563EB', 700: '#1D4ED8',
        },
        // ── Amber / status ────────────────────────────────────
        amber: {
          300: '#FCD34D', 400: '#FBBF24', 500: '#F59E0B',
          600: '#D97706',
        },
        // ── Red ───────────────────────────────────────────────
        red: {
          300: '#FCA5A5', 400: '#F87171', 500: '#EF4444',
          600: '#DC2626',
        },
        // ── Purple ───────────────────────────────────────────
        purple: {
          300: '#D8B4FE', 400: '#C084FC', 500: '#A855F7',
          600: '#9333EA',
        },
        // ── Gold ─────────────────────────────────────────────
        gold: { 400: '#FBBF24', 500: '#F59E0B', 600: '#D97706' },
        // ── Legacy compat ─────────────────────────────────────
        navy: {
          50:  '#070B18', 100: '#0C1526', 200: '#111E36',
          300: 'rgba(255,255,255,0.08)', 400: '#475569',
          500: '#64748B', 600: '#94A3B8', 700: '#CBD5E1',
          800: '#E2E8F0', 900: '#F8FAFC', 950: '#FFFFFF',
        },
        cream: {
          50: '#070B18', 100: '#0C1526', 200: '#111E36',
          300: 'rgba(255,255,255,0.08)', 400: '#475569',
        },
        // ── shadcn compat ─────────────────────────────────────
        border:      'hsl(var(--border))',
        input:       'hsl(var(--input))',
        ring:        'hsl(var(--ring))',
        background:  'hsl(var(--background))',
        foreground:  'hsl(var(--foreground))',
        primary:     { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary:   { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        muted:       { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent:      { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        popover:     { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        card:        { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        brand:       { 400:'#4ADE80', 500:'#22C55E', 600:'#16A34A' },
        sage:        { 400:'#4ADE80', 500:'#22C55E', 600:'#16A34A' },
      },
      fontSize: {
        'display':    ['3.5rem', { lineHeight: '1.05', fontWeight: '800', letterSpacing: '-0.03em' }],
        'display-sm': ['2.5rem', { lineHeight: '1.1',  fontWeight: '700', letterSpacing: '-0.025em' }],
        'metric':     ['2.75rem',{ lineHeight: '1',    fontWeight: '700', letterSpacing: '-0.02em' }],
        'metric-sm':  ['1.75rem',{ lineHeight: '1',    fontWeight: '700', letterSpacing: '-0.015em' }],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: '0.75rem', '2xl': '1rem', '3xl': '1.5rem', '4xl': '2rem',
        'pill': '100px',
      },
      boxShadow: {
        'card':       '0 4px 24px rgba(0,0,0,0.4)',
        'card-md':    '0 8px 32px rgba(0,0,0,0.5)',
        'card-lg':    '0 24px 64px rgba(0,0,0,0.6)',
        'glass':      '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
        'glow':       '0 0 40px rgba(34,197,94,0.3)',
        'glow-green': '0 0 30px rgba(34,197,94,0.35)',
        'glow-blue':  '0 0 30px rgba(59,130,246,0.3)',
        'glow-pill':  '0 4px 20px rgba(34,197,94,0.25)',
        'inner-line': 'inset 0 1px 0 rgba(255,255,255,0.08)',
      },
      backgroundImage: {
        'gradient-green':  'linear-gradient(90deg, #22C55E 0%, #A3E635 60%, #FACC15 100%)',
        'gradient-green-v':'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
        'gradient-hero':   'linear-gradient(135deg, #070B18 0%, #0D1A35 45%, #071828 75%, #070B18 100%)',
        'gradient-card':   'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 100%)',
        'gradient-glass':  'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)',
        'gradient-indigo': 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
        'glow-radial':     'radial-gradient(ellipse at top, rgba(34,197,94,0.15) 0%, transparent 60%)',
        'dots-pattern':    'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
      },
      keyframes: {
        'accordion-down': { from:{height:'0'}, to:{height:'var(--radix-accordion-content-height)'} },
        'accordion-up':   { from:{height:'var(--radix-accordion-content-height)'}, to:{height:'0'} },
        'fade-up':   { from:{opacity:'0',transform:'translateY(16px)'},  to:{opacity:'1',transform:'translateY(0)'} },
        'fade-in':   { from:{opacity:'0'}, to:{opacity:'1'} },
        'scale-in':  { from:{opacity:'0',transform:'scale(0.95)'},       to:{opacity:'1',transform:'scale(1)'} },
        'slide-right':{ from:{opacity:'0',transform:'translateX(-16px)'}, to:{opacity:'1',transform:'translateX(0)'} },
        'slide-up':   { from:{opacity:'0',transform:'translateY(24px)'}, to:{opacity:'1',transform:'translateY(0)'} },
        'glow-pulse': {
          '0%,100%': { boxShadow:'0 0 0 0 rgba(34,197,94,0.4)' },
          '50%':     { boxShadow:'0 0 0 12px rgba(34,197,94,0)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-600px 0' },
          '100%': { backgroundPosition: '600px 0' },
        },
        'ticker': {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'ken-burns': {
          '0%':   { transform: 'scale(1) translate(0, 0)' },
          '50%':  { transform: 'scale(1.08) translate(-1%, -1%)' },
          '100%': { transform: 'scale(1) translate(0, 0)' },
        },
        'float': {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-12px)' },
        },
        'blob-pulse': {
          '0%,100%': { transform: 'scale(1)', opacity: '0.3' },
          '50%':     { transform: 'scale(1.4)', opacity: '0.5' },
        },
        'spin-slow': {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
        'fade-up':    'fade-up  0.4s cubic-bezier(0.25,0.46,0.45,0.94)',
        'fade-in':    'fade-in  0.3s ease-out',
        'scale-in':   'scale-in 0.3s cubic-bezier(0.25,0.46,0.45,0.94)',
        'slide-right':'slide-right 0.3s ease-out',
        'slide-up':   'slide-up 0.4s cubic-bezier(0.25,0.46,0.45,0.94)',
        'glow-pulse': 'glow-pulse 2.5s ease-in-out infinite',
        'shimmer':    'shimmer 1.8s linear infinite',
        'ticker':     'ticker 30s linear infinite',
        'ken-burns':  'ken-burns 20s ease-in-out infinite',
        'float':      'float 6s ease-in-out infinite',
        'blob-pulse': 'blob-pulse 8s ease-in-out infinite',
        'spin-slow':  'spin-slow 20s linear infinite',
      },
    },
  },
  plugins: [animatePlugin],
}

export default config
