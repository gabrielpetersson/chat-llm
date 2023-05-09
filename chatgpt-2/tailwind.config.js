/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        black: {
          DEFAULT: "#10161a",
        },
        gray: {
          1: "#5c7080",
          2: "#738694",
          3: "#8a9ba8",
          4: "#a7b6c2",
          5: "#bfccd6",
        },
        "dark-gray": {
          DEFAULT: "#1e293b",
          hovered: "#223242",
          active: "#293949",
        },
        red: {
          DEFAULT: "#eb5757",
        },
        blue: {
          DEFAULT: "#2f80ed",
          muted: "#263d5f",
          "muted-hovered": "#1E314C",
        },
        orange: {
          1: "#E8B376",
          2: "#372E23",
          3: "#6A5848",
        },
      },
    },
  },
  // corePlugins: {
  //   preflight: false,
  // },
  plugins: [],
};
