/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // The Clerk Marketplace integration names its browser key NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.
  // Only that prefix is added: every other env var stays out of the browser bundle.
  envPrefix: ['VITE_', 'NEXT_PUBLIC_CLERK_'],
  test: {
    environment: 'jsdom',
  },
});
