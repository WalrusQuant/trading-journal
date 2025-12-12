import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'SF Mono', 'Consolas', 'monospace'],
        terminal: ['JetBrains Mono', 'Fira Code', 'SF Mono', 'Consolas', 'monospace'],
      },
      colors: {
        // Bloomberg Terminal Dark Backgrounds
        terminal: {
          bg: '#0a0e17',
          panel: '#0d1117',
          card: '#131a24',
          border: '#1e2a3a',
          hover: '#1a2332',
        },
        // Bloomberg Orange/Amber - Primary accent
        bloomberg: {
          50: '#fff8e6',
          100: '#ffecb3',
          200: '#ffe082',
          300: '#ffd54f',
          400: '#ffca28',
          500: '#ff9500', // Main Bloomberg orange
          600: '#ff8c00',
          700: '#f57c00',
          800: '#ef6c00',
          900: '#e65100',
        },
        // Terminal Green - Classic terminal text
        matrix: {
          50: '#e8f5e9',
          100: '#c8e6c9',
          200: '#a5d6a7',
          300: '#81c784',
          400: '#66bb6a',
          500: '#00ff88', // Bright terminal green
          600: '#00e676',
          700: '#00c853',
          800: '#00a844',
          900: '#008836',
        },
        // Profit colors - Bright green for gains
        profit: {
          50: '#e0fff0',
          100: '#b3ffd9',
          200: '#80ffc0',
          300: '#4dffa6',
          400: '#26ff91',
          500: '#00ff7f', // Bright profit green
          600: '#00e070',
          700: '#00c261',
          800: '#00a352',
          900: '#008543',
        },
        // Loss colors - Terminal red
        loss: {
          50: '#ffe5e5',
          100: '#ffb3b3',
          200: '#ff8080',
          300: '#ff4d4d',
          400: '#ff2626',
          500: '#ff0040', // Bright terminal red
          600: '#e0003a',
          700: '#c20032',
          800: '#a3002a',
          900: '#850022',
        },
        // Info/Secondary - Cyan blue
        info: {
          50: '#e0f7ff',
          100: '#b3ecff',
          200: '#80e0ff',
          300: '#4dd4ff',
          400: '#26cbff',
          500: '#00bfff', // Terminal cyan
          600: '#00a8e0',
          700: '#0091c2',
          800: '#007aa3',
          900: '#006385',
        },
        // Warning - Amber
        warning: {
          50: '#fff8e1',
          100: '#ffecb3',
          200: '#ffe082',
          300: '#ffd54f',
          400: '#ffca28',
          500: '#ffc107',
          600: '#ffb300',
          700: '#ffa000',
          800: '#ff8f00',
          900: '#ff6f00',
        },
        // Gray scale for terminal
        gray: {
          50: '#e8eaed',
          100: '#c4c9cf',
          200: '#9ea5ae',
          300: '#78818d',
          400: '#5c6574',
          500: '#404a5a',
          600: '#343d4a',
          700: '#28303b',
          800: '#1c232c',
          900: '#10151c',
          950: '#080b10',
        },
      },
      boxShadow: {
        'terminal': '0 0 0 1px rgba(0, 255, 136, 0.1)',
        'terminal-glow': '0 0 20px rgba(0, 255, 136, 0.15)',
        'bloomberg-glow': '0 0 20px rgba(255, 149, 0, 0.15)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'scan': 'scan 8s linear infinite',
      },
      keyframes: {
        glow: {
          '0%': { opacity: '0.5' },
          '100%': { opacity: '1' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(0, 255, 136, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 136, 0.03) 1px, transparent 1px)',
        'scan-lines': 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.1) 2px, rgba(0, 0, 0, 0.1) 4px)',
      },
      backgroundSize: {
        'grid': '20px 20px',
      },
    },
  },
  plugins: [],
}
export default config
