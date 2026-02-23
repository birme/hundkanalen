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
          50: '#f0f7f0',
          100: '#dceddc',
          200: '#bcdcbc',
          300: '#91c491',
          400: '#64a864',
          500: '#438a43',
          600: '#336e33',
          700: '#2a572a',
          800: '#234623',
          900: '#1d3a1d',
          950: '#0d200d',
        },
        wood: {
          50: '#faf6f1',
          100: '#f0e6d6',
          200: '#e0ccab',
          300: '#cdab79',
          400: '#bf9255',
          500: '#b07d3e',
          600: '#996434',
          700: '#7d4d2d',
          800: '#683f2a',
          900: '#573526',
          950: '#311b13',
        },
        cream: {
          50: '#fefdf8',
          100: '#fdf9ed',
          200: '#faf1d4',
          300: '#f5e5b1',
          400: '#eed484',
          500: '#e6c05e',
          600: '#d4a63a',
          700: '#b1852e',
          800: '#8f6a2b',
          900: '#755726',
          950: '#422e12',
        },
        falu: {
          50: '#fdf3f3',
          100: '#fbe5e5',
          200: '#f8d0d0',
          300: '#f2aeae',
          400: '#e97f7f',
          500: '#db5757',
          600: '#c73a3a',
          700: '#a72d2d',
          800: '#8b2929',
          900: '#742828',
          950: '#3e1111',
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
