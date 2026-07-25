import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, 'index.html'),
        shop: resolve(import.meta.dirname, 'shop.html'),
        product: resolve(import.meta.dirname, 'product.html')
      }
    }
  }
});
