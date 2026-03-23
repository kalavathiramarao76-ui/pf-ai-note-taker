module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3498db",
        secondary: "#2ecc71",
        accent: "#9b59b6",
        dark: "#2f2f2f",
        light: "#f9f9f9",
      },
      typography: {
        DEFAULT: {
          css: {
            color: "#333",
            a: {
              color: "#3498db",
              "&:hover": {
                color: "#2ecc71",
              },
            },
          },
        },
      },
    },
  },
  plugins: [],
  darkMode: "class",
};