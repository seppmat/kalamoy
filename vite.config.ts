import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' membuat build bisa dipakai di Vercel, GitHub Pages (subfolder), maupun custom domain.
export default defineConfig({
  plugins: [react()],
  base: 'https://kalamoy.store/', // Ganti dengan URL publik situsmu (harus diakhiri /)
})
