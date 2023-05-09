import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
// import pluginChecker from "vite-plugin-checker";
import eslint from "vite-plugin-eslint";

export default defineConfig({
  plugins: [react(), eslint()], //pluginChecker({ typescript: true })
});
