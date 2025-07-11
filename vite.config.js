import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    // Esto ya expone el servidor en tu red local
    host: true, 

    // Agregá esta sección para el proxy
    proxy: {
      // Cualquier petición que empiece con /api...
      '/api': {
        // ...será redirigida a tu backend de NestJS
        target: 'http://localhost:3001',
        
        // Necesario para que el backend acepte la petición
        changeOrigin: true,

        // Elimina /api de la ruta antes de enviarla al backend
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})