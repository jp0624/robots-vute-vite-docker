// vite.config.ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite"; // Import the plugin

export default defineConfig({
	plugins: [
		vue(),
		tailwindcss(), // Add Tailwind CSS as a plugin
	],
});
