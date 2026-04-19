// @ts-check
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

import showTailwindcssBreakpoint from "astro-show-tailwindcss-breakpoint";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [showTailwindcssBreakpoint(), react()],
});