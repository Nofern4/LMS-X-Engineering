import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        warm: {
          bg: '#f9f6f0',
          surface: '#ffffff',
          card: '#ffffff',
          border: '#e8dec9',
          borderSoft: '#f4efe6',
          dark: '#211710',
          heading: '#3d2c20',
          body: '#75583f',
          muted: '#8e827b',
          bronze: '#9c6843',
          bronzeDark: '#75583f',
          bronzeLight: '#f4efe6',
          gold: '#c69b76',
          goldLight: '#fcf8f2',
          accent: '#947252',
          green: '#4a6b53',
          greenLight: '#eaf4ed',
          amber: '#b48135',
          amberLight: '#fdf6e7',
          red: '#a84338',
          redLight: '#fdf0ed',
        },
        brand: {
          50: '#f9f6f0',
          100: '#f4efe6',
          200: '#e8dec9',
          300: '#d9c9b0',
          400: '#c69b76',
          500: '#9c6843',
          600: '#75583f',
          700: '#5c4533',
          800: '#3d2c20',
          900: '#211710',
        },
      },
      fontFamily: {
        sans: [
          '"Sukhumvit Set"',
          '"Thonburi"',
          '"IBM Plex Sans Thai"',
          '"Prompt"',
          '"Kanit"',
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Inter"',
          'sans-serif',
        ],
      },
      boxShadow: {
        'warm-xs': '0 1px 3px rgba(61, 44, 32, 0.04)',
        'warm-sm': '0 2px 8px rgba(61, 44, 32, 0.06)',
        'warm-md': '0 4px 16px rgba(61, 44, 32, 0.08)',
        'warm-lg': '0 8px 30px rgba(61, 44, 32, 0.10)',
        'warm-xl': '0 12px 40px rgba(61, 44, 32, 0.14)',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};
export default config;


