import axios from 'axios'
import { useRuntimeConfig } from '#imports'

interface StrapiResponse<T> {
    data: T
    meta: {
        pagination: {
            page: number
            pageSize: number
            pageCount: number
            total: number
        }
    }
}

export interface StrapiEntity<T> {
    id: number
    attributes: T
}

export interface UploadFormat {
    url: string
    width: number
    height: number
    size: number
    ext: string
    mime: string
}

export interface UploadFile {
    url: string
    alternativeText?: string
    caption?: string
    width?: number
    height?: number
    formats?: Record<string, UploadFormat>
}

export interface MediaRelation {
    data: {
        id: number
        attributes: UploadFile
    } | null
}

export interface Chapter {
    title: string
    titleUrl: string
    description?: string
    createdAt: string
    updatedAt: string
    publishedAt: string
    cover?: MediaRelation
    articles?: {
        data: StrapiEntity<Article>[] | null
    }
}

export interface Article {
    title: string
    titleUrl: string
    bodyShort: string
    body: string
    createdAt: string
    updatedAt: string
    publishedAt: string
    cover?: MediaRelation
    chapter?: {
        data: StrapiEntity<Chapter> | null
    }
    // SEO component populated when requesting a single article
    seo?: {
        id?: number
        metaTitle?: string
        metaDescription?: string
        keywords?: string
        metaRobots?: string
        structuredData?: any
        metaViewport?: string | null
        canonicalURL?: string | null
    }
}

interface FetchArticlesOptions {
    limit?: number
}

interface FetchArticlesPagedOptions extends FetchArticlesOptions {
    start?: number
}

const buildAbsoluteUrlFactory = (assetsBase: string) => (path?: string | null) => {
    if (!path) return ''
    if (/^https?:/i.test(path)) return path
    return `${assetsBase}${path}`
}

export const useStrapi = () => {
    const config = useRuntimeConfig()
    const API_BASE = config.public.strapiBaseUrl || 'https://strapi.andreacorriga.com/api'
    const ASSETS_BASE = config.public.strapiAssetsBaseUrl || 'https://strapi.andreacorriga.com'

    const http = axios.create({
        baseURL: API_BASE,
        timeout: 10000,
        headers: { Accept: 'application/json' }
    })

    const buildAbsoluteUrl = buildAbsoluteUrlFactory(ASSETS_BASE)
    const CACHE_KEY = 'ffstory_chapters_cache'
    const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 giorni in millisecondi

    const fetchChapters = async () => {
        // Verifica se siamo nel browser
        if (typeof window === 'undefined') {
            // Server-side: nessun caching, fetch diretto
            try {
                const { data } = await http.get<StrapiResponse<StrapiEntity<Chapter>[]>>('/chapters', {
                    params: {
                        sort: 'sort'
                    }
                })
                return data.data
            } catch (error) {
                console.error('Error fetching chapters:', error)
                return []
            }
        }

        // Client-side: usa cache localStorage
        try {
            const cached = localStorage.getItem(CACHE_KEY)
            if (cached) {
                const { data, timestamp } = JSON.parse(cached)
                const now = Date.now()

                // Se la cache è ancora valida (meno di 7 giorni), ritornala
                if (now - timestamp < CACHE_DURATION) {
                    // console.log('Using cached chapters data')
                    return data
                }
            }

            // Cache non trovata o scaduta: fetch da API
            const { data } = await http.get<StrapiResponse<StrapiEntity<Chapter>[]>>('/chapters', {
                params: {
                    sort: 'sort'
                }
            })

            // Salva in cache
            localStorage.setItem(CACHE_KEY, JSON.stringify({
                data: data.data,
                timestamp: Date.now()
            }))

            console.log('Chapters data fetched and cached')
            return data.data
        } catch (error) {
            console.error('Error fetching chapters:', error)
            return []
        }
    }

    // Versione che carica i capitoli con cover e conteggio articoli (senza cache)
    const fetchChaptersWithDetails = async () => {
        try {
            const { data } = await http.get<StrapiResponse<StrapiEntity<Chapter>[]>>('/chapters', {
                params: {
                    sort: 'sort',
                    populate: 'cover,articles'
                }
            })
            return data.data
        } catch (error) {
            console.error('Error fetching chapters with details:', error)
            return []
        }
    }

    const fetchArticles = async (chapterTitleUrl?: string, options: FetchArticlesOptions = {}) => {
        try {
            const params: Record<string, string | number | undefined> = {
                populate: 'cover,chapter',
                sort: 'publishedAt:desc',
                'pagination[limit]': options.limit
            }

            if (chapterTitleUrl) {
                params['filters[chapter][titleUrl][$eq]'] = chapterTitleUrl
            }

            const { data } = await http.get<StrapiResponse<StrapiEntity<Article>[]>>('/articles', {
                params
            })

            return data.data ?? []
        } catch (error) {
            console.error('Error fetching articles:', error)
            return []
        }
    }

    // Variante che ritorna anche la meta di paginazione senza alterare la funzione esistente
    const fetchArticlesPaged = async (chapterTitleUrl?: string, options: FetchArticlesPagedOptions = {}) => {
        try {
            const params: Record<string, string | number | undefined> = {
                populate: 'cover,chapter',
                sort: 'publishedAt:desc',
                'pagination[limit]': options.limit,
                'pagination[start]': options.start
            }

            if (chapterTitleUrl) {
                params['filters[chapter][titleUrl][$eq]'] = chapterTitleUrl
            }

            const { data } = await http.get<StrapiResponse<StrapiEntity<Article>[]>>('/articles', {
                params
            })
            // Ritorniamo l'intero payload così da poter usare meta.pagination
            return data
        } catch (error) {
            console.error('Error fetching paged articles:', error)
            return { data: [], meta: { pagination: { start: 0, limit: options.limit || 0, total: 0 } } } as any
        }
    }

    const fetchArticleBySlug = async (slug: string) => {
        try {
            const { data } = await http.get<StrapiResponse<StrapiEntity<Article>[]>>('/articles', {
                params: {
                    'filters[titleUrl][$eq]': slug,
                    // Include seo component for detailed page meta population
                    populate: 'cover,chapter,seo'
                }
            })
            return data.data?.[0] ?? null
        } catch (error) {
            console.error('Error fetching article:', error)
            return null
        }
    }

    const getMediaUrl = (media?: MediaRelation | null, preferredFormat?: string) => {
        const data = media?.data

        if (!data?.attributes) {
            return ''
        }

        const formats = data.attributes.formats
        if (preferredFormat && formats?.[preferredFormat]?.url) {
            return buildAbsoluteUrl(formats[preferredFormat].url)
        }

        return buildAbsoluteUrl(data.attributes.url)
    }

    return {
        fetchChapters,
        fetchChaptersWithDetails,
        fetchArticles,
        fetchArticlesPaged,
        fetchArticleBySlug,
        getMediaUrl
    }
}
