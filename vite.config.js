import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // Exclude zip files and the dist folder from the file watcher.
      // This prevents EBUSY crashes when dist.zip is open in another program.
      ignored: ['**/dist/**', '**/*.zip'],
    },
  },
})
