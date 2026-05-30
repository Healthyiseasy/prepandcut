import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        void: '#08080D', surface: '#131318', card: '#1C1C24',
        elevated: '#2A2A34', border: '#3A3A44',
        gold: { DEFAULT: '#D4A24E', light: '#F5C66A', deep: '#A67C35' },
        cyan: { DEFAULT: '#4EC9D4', deep: '#2D6E8A' },
        success: '#1B6B42', warning: '#D4A24E', danger: '#C43E3E',
        'text-primary': '#F0ECE4', 'text-secondary': '#B0ADA5',
        'text-muted': '#8A877E', 'text-disabled': '#5E5C56',
      },
      fontFamily: { sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'] },
    },
  },
  plugins: [],
}
export default config
