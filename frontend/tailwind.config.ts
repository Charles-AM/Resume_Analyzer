import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#15191f",
        panel: "#f7f5ef",
        line: "#d8d3c7",
        signal: "#2f7d79",
        accent: "#b84a39",
        gold: "#c58a2b"
      }
    }
  },
  plugins: []
};

export default config;
