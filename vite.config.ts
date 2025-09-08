import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite'

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/js/main.tsx'],
            refresh: true,
            detectTls: false,
        }),
        tanstackRouter({
            target: 'react',
            autoCodeSplitting: true,
            routesDirectory: './resources/js/routes',
            generatedRouteTree: './resources/js/routeTree.gen.ts',
        }),
        react(),
        tailwindcss(),
    ],
    esbuild: {
        jsx: 'automatic',
    },
    build: {
        target: 'esnext',
        minify: 'esbuild',
        sourcemap: false,
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom'],
                    router: ['@tanstack/react-router'],
                    query: ['@tanstack/react-query'],
                    ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
                },
                chunkFileNames: 'assets/[name]-[hash].js',
                entryFileNames: 'assets/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash].[ext]',
            },
        },
        chunkSizeWarningLimit: 1000,
    },
    optimizeDeps: {
        include: [
            'react',
            'react-dom',
            '@tanstack/react-router',
            '@tanstack/react-query',
            'axios',
            'zustand',
        ],
    },
    server: {
        host: '127.0.0.1',
        port: 5173,
        hmr: {
            overlay: false,
        },
    },
});
