/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        kanit: ['Kanit', 'sans-serif'],
        'finger-paint': ['Finger Paint', 'sans-serif'],
      },
      colors: {
        customBtGreen    : '#99ff63',
        customBtRed      : '#FF5D60',
        customBackGround : '#C9FFBF',
        grey500          : '#666666',
        customBgOrange   : '#F8D68C',
        customTextHead   : '#002FFF',
      },
    },
  },
  plugins: [],
};
