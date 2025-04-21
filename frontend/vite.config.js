import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // Redirige las peticiones que empiezan con /api al backend en localhost:5000
      '/api': {
        target: 'http://localhost:5000', // La URL de tu backend
        changeOrigin: true, // Necesario para virtual hosted sites
        // Opcional: secure: false, // si tu backend no usa https
        // Opcional: reescribir la ruta si es necesario, pero aquí no lo es
        // rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})