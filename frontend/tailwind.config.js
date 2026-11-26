/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        isuzu: {
          red: '#ED1C24',         // Official Isuzu Corporate Red
          'red-dark': '#C41219',    // Deep Isuzu Red
          'red-glow': '#FF333B',    // Bright Red Pulse
          'red-light': '#FEE2E2',
          black: '#0A0D14',        // Deep Obsidian Automotive BG
          surface: '#121826',      // Card Surface
          'surface-elevated': '#161F33',
          border: '#253248',       // Metallic Frame Border
          muted: '#64748B',
        },
        alarm: {
          red: '#ED1C24',
          'red-glow': '#DC2626',
          green: '#10B981',
          'green-glow': '#059669',
          yellow: '#F59E0B',
          'yellow-glow': '#D97706',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Roboto Mono', 'ui-monospace', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Chakra Petch', 'Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}
