import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/vite";
import { viteReact } from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import cloudflarePlugin from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [
    tanstackStart({
      server: { entry: "server" },
    }),
    viteReact(),
    tailwindcss(),
    tsConfigPaths(),
    cloudflarePlugin(),
  ],
});
