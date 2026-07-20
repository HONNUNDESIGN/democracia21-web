// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// Salida estática. El backend (usuarios/BD) lo lleva otra agencia:
// todo lo que necesite red va contra PUBLIC_* env vars con fallback demo.
export default defineConfig({
  site: 'https://democracia21.es',
  compressHTML: true,
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
