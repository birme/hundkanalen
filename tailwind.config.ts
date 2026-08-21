import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f3f1ff',
          100: '#e8e3ff',
          200: '#d5ccff',
          300: '#b9a8ff',
          400: '#9876ff',
          500: '#7a4df1',
          600: '#6334d6',
          700: '#4f28ad',
          800: '#35206f',
          900: '#17123b',
          950: '#0d0a24',
        },
        wood: {
          50: '#fff8eb',
          100: '#ffedc6',
          200: '#ffd98a',
          300: '#ffc14d',
          400: '#f8a51d',
          500: '#df8510',
          600: '#b9600c',
          700: '#954512',
          800: '#793817',
          900: '#632f17',
          950: '#391707',
        },
        cream: {
          50: '#f7f7fb',
          100: '#efedf8',
          200: '#ddd9ee',
          300: '#c5bedf',
          400: '#a99dca',
          500: '#8f7db6',
          600: '#75619b',
          700: '#604f7f',
          800: '#514369',
          900: '#463a59',
          950: '#2a2238',
        },
        falu: {
          50: '#fff1f5',
          100: '#ffe4ee',
          200: '#fecddd',
          300: '#fda5c2',
          400: '#fb719f',
          500: '#f2417c',
          600: '#d91f61',
          700: '#b71250',
          800: '#981244',
          900: '#81143d',
          950: '#4f061f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};

export default config;
