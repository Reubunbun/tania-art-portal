import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {
      TOKEN: process.env.TOKEN,
      JWT_SECRET: process.env.JWT_SECRET,
      DB_USER: process.env.DB_USER,
      DB_HOST: process.env.DB_HOST,
      DB_NAME: process.env.DB_NAME,
      DB_PASS: process.env.DB_PASS,
      DB_PORT: process.env.DB_PORT,
      VITE_BUCKET_NAME: process.env.VITE_BUCKET_NAME,
      VITE_UPLOAD_URL: process.env.VITE_UPLOAD_URL,
      VITE_S3_BASE: process.env.VITE_S3_BASE,
    },
  },
})
