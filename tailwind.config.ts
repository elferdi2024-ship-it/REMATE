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
        bebas: ["'Bebas Neue'", "sans-serif"],
        body: ["'DM Sans'", "system-ui", "sans-serif"],
        serif: ["'DM Serif Display'", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
