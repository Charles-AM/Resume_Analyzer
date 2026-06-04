import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#eff7f6",
        panel: "#0d141c",
        line: "rgba(255,255,255,0.14)",
        signal: "#7ce3ff",
        accent: "#ee5f56",
        gold: "#e4b85a",
        mint: "#49c9a7",
        void: "#071015"
      }
    }
  },
  plugins: []
};

export default config;
