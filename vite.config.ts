import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        VitePWA({
            registerType: 'autoUpdate', // Service worker auto update
            workbox: {
                maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10 MB
                runtimeCaching: [
                    {
                        urlPattern: ({ request }) =>
                            request.destination === 'document' ||
                            request.destination === 'script' ||
                            request.destination === 'style' ||
                            request.destination === 'font' ||
                            request.destination === 'image',
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'asset-cache',
                            expiration: {
                                maxEntries: 200,
                                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 day
                            },
                        },
                    },
                ],
            },
        }),
    ],
})
