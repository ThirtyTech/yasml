import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import path from "path";
import react from "@vitejs/plugin-react";
import { name as packageName } from "./package.json";
import { codeGeneratorYasmlPlugin } from "@thirtytech/vite-plugin-yasml";

const name = packageName.substring(packageName.lastIndexOf("/") + 1);

// https://vitejs.dev/config/
export default defineConfig({
  esbuild: {
    supported: {
      "top-level-await": true, //browsers can handle top-level-await features
    },
  },
  build: {
    copyPublicDir: false,
    sourcemap: true,
    target: "esnext",
    minify: false,
    lib: {
      entry: path.resolve(__dirname, `src/lib/${name}.tsx`),
      name: name,
      fileName: (format) => `${name}.${format}.js`,
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
  plugins: [
    codeGeneratorYasmlPlugin(),
    // codeGeneratorYasmlPlugin({
    //   patterns: [/State\"\;/, /\.state/, /\.hooks/],
    // }),
    react(),
    dts({ insertTypesEntry: true }),
  ],
});
