/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  important: true,  
  theme: {
    extend: {
      colors: {
        primary: '#000000',  
        secondary: '#1f2937',  
        accent: '#4b5563',  
        background: {
          light: '#f9fafb',
          DEFAULT: '#ffffff',
          dark: '#111827',  
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
