import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Custom domain → base cukup '/' (bukan URL lengkap)
export default defineConfig({
  plugins: [react()],
  base: '/',
})
