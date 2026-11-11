/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#000000',
          secondary: '#080808',
          card: '#0c0c0e',
          elevated: '#121215',
        },
        cyan: {
          400: '#38bdf8',
          500: '#00f0ff',
        },
        emerald: {
          400: '#34d399',
          500: '#10b981',
        },
        // InByte Restaurant Theme Colors
        themePrimary: '#114536',
        themeHover: '#0c382b',
        themeLight: '#e6f4f0',
        themeBorder: '#195947',
        themeDark: '#07241c',
      },
      fontFamily: {
        sans: ['GeistSans', 'Geist', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"Geist Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};

