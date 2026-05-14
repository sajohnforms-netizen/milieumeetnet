/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50:  '#f0f7f2',
          100: '#dcede1',
          200: '#badcc5',
          300: '#8ec4a2',
          400: '#5fa67a',
          500: '#3d895a',
          600: '#2c6e45',
          700: '#245838',
          800: '#1e452e',
          900: '#193a26',
          950: '#0d2015',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
