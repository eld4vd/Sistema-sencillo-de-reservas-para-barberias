import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  
  // ✅ Optimizaciones de build para producción
  build: {
    // Code splitting optimizado
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar vendors grandes para mejor caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', 'react-icons'],
          'pdf-vendor': ['jspdf', 'qrcode'],
          // Separar rutas de admin del resto
          'admin': [
            './src/pages/Dashboard/Reservas.tsx',
            './src/pages/Dashboard/ReservasCompletadas.tsx',
            './src/pages/Dashboard/Peluqueros.tsx',
            './src/pages/Dashboard/Servicios.tsx',
            './src/pages/Dashboard/Productos.tsx',
            './src/pages/Dashboard/Pagos.tsx',
          ],
        },
      },
    },
    // Aumentar límite de advertencia de chunk size
    chunkSizeWarningLimit: 1000,
    // Minificación optimizada (Vite usa esbuild por defecto, más rápido que terser)
    minify: 'esbuild',
    // Source maps solo en desarrollo
    sourcemap: false,
  },
});
