import axios from 'axios'

interface StrapiPagination {
    page: number
    pageSize: number
    pageCount: number
    total: number
}

interface StrapiResponse<T> {
    data: T
    meta: {
        pagination: StrapiPagination
    }
}

interface ChapterAttributes {
    title: string
    slug: string
    updatedAt: string
}

interface ArticleAttributes {
    title: string
    slug: string
    updatedAt: string
    chapter?: {
        data: {
            id: number
            attributes: ChapterAttributes
        } | null
    }
}

interface StrapiEntity<T> {
    id: number
    attributes: T
}

interface SitemapUrl {
    loc: string
    lastmod?: string
    changefreq?: string
    priority?: string
}

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const API_BASE = config.public.strapiBaseUrl || 'https://strapi.andreacorriga.com/api'
    const SITE_URL = 'https://www.ffstory.it'

    const http = axios.create({
        baseURL: API_BASE,
        timeout: 15000,
        headers: { Accept: 'application/json' }
    })

    const urls: SitemapUrl[] = []

    // 1. Pagine statiche
    const staticPages: SitemapUrl[] = [
        { loc: '/', changefreq: 'daily', priority: '1.0' },
        { loc: '/final-fantasy', changefreq: 'weekly', priority: '0.9' },
        { loc: '/storia-ffstory', changefreq: 'monthly', priority: '0.7' },
        { loc: '/final-fantasy-x/traduttore-albhed', changefreq: 'monthly', priority: '0.6' }
    ]
    urls.push(...staticPages)

    try {
        // 2. Recupera tutti i capitoli per le pagine /{chapter-slug}
        const chaptersResponse = await http.get<StrapiResponse<StrapiEntity<ChapterAttributes>[]>>('/chapters', {
            params: {
                sort: 'sort',
                'pagination[limit]': 100 // Assumiamo non ci siano più di 100 capitoli
            }
        })

        const chapters = chaptersResponse.data.data || []
        for (const chapter of chapters) {
            urls.push({
                loc: `/${chapter.attributes.slug}`,
                lastmod: chapter.attributes.updatedAt?.split('T')[0],
                changefreq: 'weekly',
                priority: '0.8'
            })
        }

        // 3. Recupera tutti gli articoli con paginazione
        const PAGE_SIZE = 100
        let start = 0
        let hasMore = true

        while (hasMore) {
            const articlesResponse = await http.get<StrapiResponse<StrapiEntity<ArticleAttributes>[]>>('/articles', {
                params: {
                    'fields[0]': 'slug',
                    'fields[1]': 'title',
                    'fields[2]': 'updatedAt',
                    'populate[chapter][fields][0]': 'slug',
                    'pagination[start]': start,
                    'pagination[limit]': PAGE_SIZE
                }
            })

            const articles = articlesResponse.data.data || []
            const pagination = articlesResponse.data.meta.pagination

            for (const article of articles) {
                const chapterSlug = article.attributes.chapter?.data?.attributes?.slug
                if (chapterSlug && article.attributes.slug) {
                    urls.push({
                        loc: `/${chapterSlug}/${article.attributes.slug}`,
                        lastmod: article.attributes.updatedAt?.split('T')[0],
                        changefreq: 'monthly',
                        priority: '0.7'
                    })
                }
            }

            // Controlla se ci sono altre pagine
            start += PAGE_SIZE
            hasMore = start < pagination.total
        }

    } catch (error) {
        console.error('Error fetching data for sitemap:', error)
    }

    // Genera XML
    const xml = generateSitemapXml(SITE_URL, urls)

    // Imposta headers per XML
    setHeader(event, 'Content-Type', 'application/xml')
    setHeader(event, 'Cache-Control', 'public, max-age=3600, s-maxage=3600') // Cache 1 ora

    return xml
})

function generateSitemapXml(siteUrl: string, urls: SitemapUrl[]): string {
    const urlEntries = urls.map(url => {
        const loc = `${siteUrl}${url.loc}`
        let entry = `  <url>\n    <loc>${escapeXml(loc)}</loc>`

        if (url.lastmod) {
            entry += `\n    <lastmod>${url.lastmod}</lastmod>`
        }
        if (url.changefreq) {
            entry += `\n    <changefreq>${url.changefreq}</changefreq>`
        }
        if (url.priority) {
            entry += `\n    <priority>${url.priority}</priority>`
        }

        entry += '\n  </url>'
        return entry
    }).join('\n')

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`
}

function escapeXml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
}
