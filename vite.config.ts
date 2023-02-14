import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import path from 'path'
import react from '@vitejs/plugin-react'
import { name } from './package.json'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    copyPublicDir: false,
    sourcemap: true,
    lib: {
      entry: path.resolve(__dirname, `src/lib/${name}.tsx`),
      name: name,
      fileName: (format) => `${name}.${format}.js`
    },
    rollupOptions: {
      external: ['react', 'react-dom',],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },

    }
  },
  plugins: [react({
    jsxRuntime: 'classic',
  }), dts({ insertTypesEntry: true })],
})
