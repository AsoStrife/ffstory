import { useRuntimeConfig } from '#imports'

interface SeoDefaults {
    defaultTitle: string
    defaultDescription: string
    titleSuffix: string
}

export const useSeoDefaults = (): SeoDefaults => {
    // Runtime config (public)
    // Fallback values are repeated here to keep a single source if env vars are missing.
    const config: any = useRuntimeConfig()
    const pub = config?.public || {}

    return {
        defaultTitle: pub.siteDefaultTitle || 'FFStory - Tutto sulla saga di Final Fantasy',
        defaultDescription: pub.siteDefaultDescription || 'Un hub moderno per guide, storie e curiosità dedicate alla saga di Final Fantasy.',
        titleSuffix: pub.siteTitleSuffix || '• FFStory'
    }
}
