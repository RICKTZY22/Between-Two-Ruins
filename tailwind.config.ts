import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Josef's world — warm, cream, sepia tones
        human: {
          bg: '#F5EFE6',
          surface: '#EBE3D5',
          text: '#1F1812',
          muted: '#5C4F42',
          accent: '#A87F32',
          line: '#C9BBA6',
        },
        // The demon's world — deep midnight, bone, blood
        demon: {
          bg: '#0A0E1A',
          surface: '#141826',
          text: '#E8DDD0',
          muted: '#7E7468',
          accent: '#8B2C2C',
          line: '#2A2F40',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        body: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        ui: ['"Inter Tight"', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
      animation: {
        'fade-in': 'fadeIn 1.2s ease-out',
        'fade-in-slow': 'fadeIn 2s ease-out',
        'rise': 'rise 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        rise: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
