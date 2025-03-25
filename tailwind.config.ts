import { heroui } from "@heroui/theme";
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/components/(button|ripple|spinner).js",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)"],
      },
      animation: {
        "slide-down": "slide-down 300ms cubic-bezier(0.87, 0, 0.13, 1)",
        "slide-up": "slide-up 300ms cubic-bezier(0.87, 0, 0.13, 1)",
        "gradient-x": "gradient-x 20s cubic-bezier(0.4, 0, 0.2, 1) infinite",
        "gradient-xy": "gradient-xy 15s cubic-bezier(0.4, 0, 0.2, 1) infinite",
        "gradient-xy-slow": "gradient-xy 25s cubic-bezier(0.4, 0, 0.2, 1) infinite reverse",
        "refraction": "refraction 18s cubic-bezier(0.4, 0, 0.2, 1) infinite",
        "refraction-reverse": "refraction 14s cubic-bezier(0.4, 0, 0.2, 1) infinite reverse",
        "shine": "shine 15s cubic-bezier(0.4, 0, 0.2, 1) infinite",
        "rotate-slow": "rotate 30s linear infinite",
        "rotate-slow-reverse": "rotate 40s linear infinite reverse",
        "pulse-slow": "pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        "slide-down": {
          from: { height: "0px" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "slide-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0px" },
        },
        "gradient-x": {
          "0%": {
            backgroundPosition: "0% 50%",
            backgroundSize: "200% 200%"
          },
          "25%": {
            backgroundPosition: "25% 50%",
            backgroundSize: "200% 200%"
          },
          "50%": {
            backgroundPosition: "100% 50%",
            backgroundSize: "200% 200%"
          },
          "75%": {
            backgroundPosition: "75% 50%",
            backgroundSize: "200% 200%"
          },
          "100%": {
            backgroundPosition: "0% 50%",
            backgroundSize: "200% 200%"
          }
        },
        "gradient-xy": {
          "0%": {
            backgroundPosition: "0% 0%",
            backgroundSize: "400% 400%"
          },
          "20%": {
            backgroundPosition: "60% 20%",
            backgroundSize: "400% 400%"
          },
          "40%": {
            backgroundPosition: "100% 50%",
            backgroundSize: "400% 400%"
          },
          "60%": {
            backgroundPosition: "60% 80%",
            backgroundSize: "400% 400%"
          },
          "80%": {
            backgroundPosition: "20% 90%",
            backgroundSize: "400% 400%"
          },
          "100%": {
            backgroundPosition: "0% 0%",
            backgroundSize: "400% 400%"
          }
        },
        "refraction": {
          "0%": { transform: "translateX(-10%) translateY(-10%)" },
          "20%": { transform: "translateX(0%) translateY(-5%)" },
          "40%": { transform: "translateX(10%) translateY(5%)" },
          "60%": { transform: "translateX(5%) translateY(10%)" },
          "80%": { transform: "translateX(-5%) translateY(5%)" },
          "100%": { transform: "translateX(-10%) translateY(-10%)" }
        },
        "shine": {
          "0%": { transform: "translateX(-100%) translateY(-100%) rotate(25deg)" },
          "50%": { transform: "translateX(0%) translateY(0%) rotate(25deg)" },
          "100%": { transform: "translateX(100%) translateY(100%) rotate(25deg)" }
        },
        "rotate": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" }
        },
        "pulse": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(0.95)" }
        }
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
      },
      transitionDelay: {
        '2000': '2000ms',
      }
    },
  },
  plugins: [heroui()],
};

export default config;
