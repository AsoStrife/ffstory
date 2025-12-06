// https://nuxt.com/docs/api/configuration/nuxt-config
// Declare process to satisfy TS without explicit node types (Nuxt provides it at build time)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const process: any
export default defineNuxtConfig({
    compatibilityDate: '2024-11-01',
    devtools: {
        enabled: false
    },
    nitro: {
        preset: 'node-server'
    },
    runtimeConfig: {
        public: {
            strapiBaseUrl: process.env.NUXT_PUBLIC_STRAPI_BASE_URL,
            strapiAssetsBaseUrl: process.env.NUXT_PUBLIC_STRAPI_ASSETS_BASE_URL,
            siteDefaultTitle: process.env.NUXT_PUBLIC_SITE_DEFAULT_TITLE,
            siteDefaultDescription: process.env.NUXT_PUBLIC_SITE_DEFAULT_DESCRIPTION,
            siteTitleSuffix: process.env.NUXT_PUBLIC_SITE_TITLE_SUFFIX
        }
    },
    css: [
        'bootstrap/dist/css/bootstrap.min.css'
    ],

    modules: ['@nuxt/image'],

    app: {
        head: {
            link: [
                { rel: 'apple-touch-icon', sizes: '57x57', href: '/img/favicon/apple-icon-57x57.png' },
                { rel: 'apple-touch-icon', sizes: '60x60', href: '/img/favicon/apple-icon-60x60.png' },
                { rel: 'apple-touch-icon', sizes: '72x72', href: '/img/favicon/apple-icon-72x72.png' },
                { rel: 'apple-touch-icon', sizes: '76x76', href: '/img/favicon/apple-icon-76x76.png' },
                { rel: 'apple-touch-icon', sizes: '114x114', href: '/img/favicon/apple-icon-114x114.png' },
                { rel: 'apple-touch-icon', sizes: '120x120', href: '/img/favicon/apple-icon-120x120.png' },
                { rel: 'apple-touch-icon', sizes: '144x144', href: '/img/favicon/apple-icon-144x144.png' },
                { rel: 'apple-touch-icon', sizes: '152x152', href: '/img/favicon/apple-icon-152x152.png' },
                { rel: 'apple-touch-icon', sizes: '180x180', href: '/img/favicon/apple-icon-180x180.png' },
                { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/img/favicon/android-icon-192x192.png' },
                { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/img/favicon/favicon-32x32.png' },
                { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/img/favicon/favicon-96x96.png' },
                { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/img/favicon/favicon-16x16.png' },
                { rel: 'manifest', href: '/img/favicon/manifest.json' }
            ],
            meta: [
                { name: 'msapplication-TileColor', content: '#ffffff' },
                { name: 'msapplication-TileImage', content: '/img/favicon/ms-icon-144x144.png' },
                { name: 'theme-color', content: '#ffffff' }
            ]
        }
    }
})
