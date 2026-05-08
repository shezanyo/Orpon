/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1B4332",
        accent: "#F59E0B",
      },
      boxShadow: {
        soft: "0 10px 35px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
};
