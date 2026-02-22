import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        playfair: ["var(--font-playfair)", "serif"],
        inter: ["var(--font-inter)", "sans-serif"],
      },
      colors: {
        sting: {
          bg: "#0A0F0E",
          strawberry: "#E63946",
          strawberryDark: "#C41E3A",
          white: "#FFFFFF",
        },
      },
    },
  },
  plugins: [],
};
export default config;
