// @ts-check
import { defineConfig, fontProviders  } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

import showTailwindcssBreakpoint from "astro-show-tailwindcss-breakpoint";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Noto Sans Bengali",
      cssVariable: "--font-noto-sans-bengali",
    },
  ],
  integrations: [showTailwindcssBreakpoint(), react()],
});
