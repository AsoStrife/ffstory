import axios from 'axios'

const STRAPI_BASE_URL = 'https://strapi.andreacorriga.com/api'
const STRAPI_ASSETS_BASE_URL = 'https://strapi.andreacorriga.com'

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
    createdAt: string
    updatedAt: string
    publishedAt: string
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
}

interface FetchArticlesOptions {
    limit?: number
}

const http = axios.create({
    baseURL: STRAPI_BASE_URL,
    timeout: 10000,
    headers: {
        Accept: 'application/json'
    }
})

const buildAbsoluteUrl = (path?: string | null) => {
    if (!path) {
        return ''
    }

    if (/^https?:/i.test(path)) {
        return path
    }

    return `${STRAPI_ASSETS_BASE_URL}${path}`
}

export const useStrapi = () => {
    const fetchChapters = async () => {
        try {
            const { data } = await http.get<StrapiResponse<StrapiEntity<Chapter>[]>>('/chapters', {
                params: {
                    sort: 'publishedAt:desc'
                }
            })
            return data.data ?? []
        } catch (error) {
            console.error('Error fetching chapters:', error)
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

    const fetchArticleBySlug = async (slug: string) => {
        try {
            const { data } = await http.get<StrapiResponse<StrapiEntity<Article>[]>>('/articles', {
                params: {
                    'filters[titleUrl][$eq]': slug,
                    populate: 'cover,chapter'
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
        fetchArticles,
        fetchArticleBySlug,
        getMediaUrl
    }
}
