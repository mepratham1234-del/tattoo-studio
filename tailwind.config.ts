import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // This is your Figma Palette
        brand: {
          black: "#050505",    // The deep background color
          surface: "#1E1E1E",  // The grey card color
          yellow: "#FFC107",   // The 'Ink Cart' yellow
          text: "#FFFFFF",     // White text
          muted: "#A1A1AA",    // Grey text for less important info
        }
      },
    },
  },
  plugins: [],
};
export default config;