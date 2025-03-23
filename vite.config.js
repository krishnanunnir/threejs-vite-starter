// vite.config.js
export default {
  // Base path for assets in production build
  base: './',
  
  // Development server configuration
  server: {
    // Enable hot module replacement
    hmr: true,
    // Open browser automatically when starting dev server
    open: true
  },
  
  // Build configuration
  build: {
    // Output directory for production build
    outDir: 'dist',
    // Enable source maps for debugging
    sourcemap: true,
    // Optimize dependencies during build
    optimizeDeps: {
      include: ['three']
    }
  }
} 