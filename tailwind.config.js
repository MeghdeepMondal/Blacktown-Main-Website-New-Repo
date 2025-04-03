/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './pages/**/*.{js,ts,jsx,tsx,mdx}',
      './components/**/*.{js,ts,jsx,tsx,mdx}',
      './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      extend: {
        colors: {
          primary: 'black',
          secondary: 'white',
          accent: '#ec4899', // pink-500
        },
        animation: {
          'wave': 'wave 8s ease-in-out infinite',
          'wave-slow': 'wave 10s ease-in-out infinite',
          'wave-slower': 'wave 12s ease-in-out infinite',
          'wave-reverse': 'wave-reverse 8s ease-in-out infinite',
          'wave-slow-reverse': 'wave-reverse 10s ease-in-out infinite',
          'wave-slower-reverse': 'wave-reverse 12s ease-in-out infinite',
        },
        keyframes: {
          wave: {
            '0%, 100%': { transform: 'translateX(0)' },
            '50%': { transform: 'translateX(-5%)' }
          },
          'wave-reverse': {
            '0%, 100%': { transform: 'translateX(0)' },
            '50%': { transform: 'translateX(5%)' }
          },
        },
      },
    },
    plugins: [
      require('@tailwindcss/typography'),
    ],
  }