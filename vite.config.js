import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        clients: resolve(__dirname, 'clients.html'),
        commercial: resolve(__dirname, 'commercial.html'),
        contact: resolve(__dirname, 'contact.html'),
        industrial: resolve(__dirname, 'industrial.html'),
        residential: resolve(__dirname, 'residential.html'),
        services: resolve(__dirname, 'services.html'),
      },
    },
  },
});
