// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })


import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Exposes to external IPs
    port: 5173,       // Custom port
    strictPort: true, // Fails if port is already in use
    proxy: {
	 '/api': {
	      target: 'http://localhost:5001',
	      changeOrigin: true,
	      secure: false,
	   }
      }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    manifest: true,
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        }
      }
    }
  },
  base: './',
})