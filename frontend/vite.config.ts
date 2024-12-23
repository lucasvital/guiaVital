import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  envDir: './',
  envPrefix: 'VITE_',
  server: {
    port: 5180,
    strictPort: true,
    historyApiFallback: true
  },
  preview: {
    port: 5180,
    strictPort: true
  }
})
