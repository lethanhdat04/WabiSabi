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
        neutral: {
          200: "#e5e5e5",
          400: "#a3a3a3",
          700: "#404040",
          800: "#262626",
          900: "#171717",
        },
        yellow: {
          500: "#eab308",
        },
      },
      fontFamily: {
        heading: ["var(--font-montserrat)", "sans-serif"],
        body: ["var(--font-vietnam)", "sans-serif"],
      },
      spacing: {
        "2": "8px",
        "3": "12px",
        "4": "16px",
      },
      borderRadius: {
        md: "6px",
        lg: "8px",
        xl: "12px",
      },
    },
  },
  plugins: [],
};

export default config;
