/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F0FDF8',
          100: '#DDF5EA',
          200: '#B6E8D3',
          300: '#7CD1B2',
          400: '#20A88A',
          500: '#087F5B',
          600: '#075E4B',
          700: '#06493B',
          800: '#05392F',
          900: '#042D25',
        },
        med: {
          bg: '#F7FAF8',
          surface: '#FFFFFF',
          text: '#172B25',
          secondary: '#64756D',
          muted: '#8C9E96',
          border: '#E1EAE5',
          borderLight: '#EDF3F0',
          warning: '#D97706',
          warningBg: '#FFFBEB',
          warningBorder: '#FDE68A',
          critical: '#C62828',
          criticalBg: '#FEF2F2',
          criticalBorder: '#FECACA',
          success: '#087F5B',
          successBg: '#F0FDF4',
          successBorder: '#BBF7D0',
          teal: '#20A88A',
          mint: '#DDF5EA',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)',
        'elevated': '0 4px 14px 0 rgba(7, 94, 75, 0.08)',
        'modal': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
