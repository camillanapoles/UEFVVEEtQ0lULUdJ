import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Define base dinamicamente via VITE_BASE (setado pelo Actions com nome do repo)
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE || '/',
})
