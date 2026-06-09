/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        hud: { bg:'#050508', panel:'#0a0c12', 'panel-hover':'#0f1219', border:'#1a2030' },
        brand: { 400:'#60a5fa', 500:'#3b82f6', 600:'#2563eb' },
        ok: '#22c55e',
        warn: '#f59e0b',
        crit: '#ef4444',
        info: '#06b6d4',
        dim: '#4b5563',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'SF Mono', 'monospace'],
        display: ['Orbitron', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        breathe: 'breathe 4s ease-in-out infinite',
        glow: 'glow 2s ease-in-out infinite alternate',
        scan: 'scan 4s linear infinite',
        fadeIn: 'fadeIn 0.15s ease-out',
        slideIn: 'slideIn 0.2s ease-out',
      },
      keyframes: {
        glow: { '0%': { opacity: '0.4' }, '100%': { opacity: '1' } },
        scan: { '0%': { transform: 'translateY(-100%)' }, '100%': { transform: 'translateY(100%)' } },
        breathe: { '0%,100%': { opacity: '0.6' }, '50%': { opacity: '1' } },
        fadeIn: { '0%': { opacity: '0', transform: 'translateY(-4px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideIn: { '0%': { opacity: '0', transform: 'translateX(8px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
      },
      boxShadow: {
        'glow-sm': '0 0 6px rgba(37,99,235,0.3)',
        'glow-md': '0 0 12px rgba(37,99,235,0.4)',
        'glow-lg': '0 0 24px rgba(37,99,235,0.3), 0 0 48px rgba(37,99,235,0.1)',
        'glow-warn': '0 0 12px rgba(245,158,11,0.4)',
        'glow-crit': '0 0 12px rgba(239,68,68,0.5)',
        'panel': '0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)',
      },
    },
  },
  plugins: [],
}