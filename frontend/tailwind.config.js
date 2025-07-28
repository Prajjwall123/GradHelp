/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  important: true,  // Add this to ensure our styles take precedence
  theme: {
    extend: {
      colors: {
        primary: '#000000',  // Black as primary
        secondary: '#1f2937',  // Dark gray as secondary
        accent: '#4b5563',  // Medium gray as accent
        background: {
          light: '#f9fafb',
          DEFAULT: '#ffffff',
          dark: '#111827',  // Very dark gray/black
        },
        text: {
          primary: '#111827',
          secondary: '#4b5563',
          muted: '#6b7280',
          light: '#f9fafb',
        },
      },
    },
  },
  plugins: [],
}
