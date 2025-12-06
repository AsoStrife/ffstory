<template>
    <div v-if="pending" class="loading">
        Caricamento...
    </div>

    <div v-else-if="error || !history" class="alert alert-danger">
        Contenuto non trovato.
    </div>

    <div v-else class="article-detail">
        <div v-if="coverUrl" class="article-hero">
            <img :src="coverUrl" :alt="history.attributes.title" loading="lazy" />
        </div>

        <h1>{{ history.attributes.title }}</h1>

        <div class="article-meta">
            <span>Pubblicato: {{ formatDate(history.attributes.publishedAt) }}</span>
            <span v-if="history.attributes.updatedAt !== history.attributes.publishedAt">
                Aggiornato: {{ formatDate(history.attributes.updatedAt) }}
            </span>
        </div>

        <!-- Table of Contents -->
        <div v-if="hasTableOfContents" class="toc-inline" ref="tocInlineRef">
            <h2>Indice dei contenuti</h2>
            <div class="toc-content" v-html="renderedTableOfContents" @click="handleTocClick"></div>
        </div>

        <!-- Floating TOC Bubble - Teleported to body for proper fixed positioning -->
        <Teleport to="body">
            <div v-if="hasTableOfContents" class="toc-bubble" :class="{ 'toc-bubble--visible': showFloatingToc }">
                <button class="toc-bubble__toggle" @click="toggleFloatingToc" :aria-expanded="isFloatingTocOpen"
                    aria-label="Indice dei contenuti">
                    <img class="toc-bubble__icon" src="/img/moguri-book-reading.png" alt="Moguri" />
                </button>
                <div class="toc-bubble__content" v-show="isFloatingTocOpen">
                    <div class="toc-bubble__header">
                        <span>Indice dei contenuti</span>
                        <button class="toc-bubble__close" @click="isFloatingTocOpen = false">×</button>
                    </div>
                    <div class="toc-content" v-html="renderedTableOfContents" @click="handleTocClick"></div>
                </div>
            </div>
        </Teleport>

        <div class="article-body" v-html="renderedBody"></div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, nextTick, watch } from 'vue'
import { useHead, useRuntimeConfig } from 'nuxt/app'
import { useStrapi, type FFStoryHistory, type StrapiEntity } from '../composables/useStrapi'
import { useMarkdown } from '../composables/useMarkdown'

const runtimeConfig = useRuntimeConfig()
const { fetchFFStoryHistory, getMediaUrlFromArray } = useStrapi()
const { renderMarkdown } = useMarkdown()

const history = ref<StrapiEntity<FFStoryHistory> | null>(null)
const pending = ref(true)
const error = ref(false)

// Table of Contents state
const tocInlineRef = ref<HTMLElement | null>(null)
const showFloatingToc = ref(false)
const isFloatingTocOpen = ref(false)

const hasTableOfContents = computed(() => {
    const toc = history.value?.attributes.tableOfContents
    if (!toc) return false
    if (typeof toc === 'string') return toc.trim().length > 0
    return false
})

const renderedTableOfContents = computed(() => {
    const toc = history.value?.attributes.tableOfContents
    if (!toc || typeof toc !== 'string') return ''
    return renderMarkdown(toc)
})

const handleTocClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement
    if (target.tagName === 'A') {
        const href = target.getAttribute('href')
        if (href && href.startsWith('#')) {
            event.preventDefault()
            const anchor = href.substring(1)
            const element = document.getElementById(anchor)
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
            isFloatingTocOpen.value = false
        }
    }
}

const toggleFloatingToc = () => {
    isFloatingTocOpen.value = !isFloatingTocOpen.value
}

// Scroll listener to show floating TOC when inline TOC is out of view
const handleScroll = () => {
    if (!tocInlineRef.value) return

    const rect = tocInlineRef.value.getBoundingClientRect()
    // Show bubble when the bottom of the inline TOC is above the viewport
    showFloatingToc.value = rect.bottom < 0
}

const setupTocObserver = () => {
    if (typeof window === 'undefined') return
    window.addEventListener('scroll', handleScroll, { passive: true })
    // Check initial state
    handleScroll()
}

const cleanupTocObserver = () => {
    if (typeof window === 'undefined') return
    window.removeEventListener('scroll', handleScroll)
}

const renderedBody = computed(() => {
    if (!history.value) return ''
    return renderMarkdown(history.value.attributes.body || '')
})

const coverUrl = computed(() => {
    if (!history.value) {
        return ''
    }
    return getMediaUrlFromArray(history.value.attributes.cover, 'large') || ''
})

const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('it-IT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

onMounted(async () => {
    try {
        pending.value = true
        history.value = await fetchFFStoryHistory()

        if (!history.value) {
            error.value = true
        }

        pending.value = false

        // Setup TOC observer after content is loaded
        await nextTick()
        if (hasTableOfContents.value && tocInlineRef.value) {
            setupTocObserver()
        }
    } catch (e) {
        console.error('Error loading FFStory history:', e)
        error.value = true
        pending.value = false
    }
})

onUnmounted(() => {
    cleanupTocObserver()
})

// When the rendered HTML changes, ensure tables get Bootstrap-like markup
const processTables = () => {
    const container = document.querySelector('.article-body')
    if (!container) return

    const tables = Array.from(container.querySelectorAll('table'))
    tables.forEach((table) => {
        // Skip if already processed
        if (table.classList.contains('table')) return

        // Add Bootstrap table classes
        table.classList.add('table', 'table-striped', 'table-hover')

        // If already wrapped, skip wrapping
        const parent = table.parentElement
        if (parent && parent.classList.contains('table-responsive')) return

        // Wrap the table in a div.table-responsive
        const wrapper = document.createElement('div')
        wrapper.className = 'table-responsive'
        parent?.insertBefore(wrapper, table)
        wrapper.appendChild(table)
    })
}

// Watch for changes to the rendered HTML and run processing after DOM update
watch(renderedBody, async () => {
    await nextTick()
    try {
        processTables()
    } catch (e) {
        // non-blocking
        console.error('Error processing tables:', e)
    }
})

const assetsBase = runtimeConfig.public.strapiAssetsBaseUrl as string || 'https://strapi.andreacorriga.com'
const titleSuffix = runtimeConfig.public.siteTitleSuffix as string || '• FFStory'

useHead(() => {
    const seo = history.value?.attributes.seo?.[0]

    const rawTitle = seo?.metaTitle
        ? seo.metaTitle
        : history.value
            ? history.value.attributes.title
            : 'La Storia di FFStory'
    const needsSuffix = titleSuffix && !rawTitle.endsWith(titleSuffix)
    const title = needsSuffix ? `${rawTitle} ${titleSuffix}` : rawTitle

    const description = seo?.metaDescription
        || history.value?.attributes.bodyShort
        || 'La storia di FFStory, il fan site dedicato a Final Fantasy'

    const keywords = seo?.keywords
    const robots = seo?.metaRobots
    const canonical = seo?.canonicalURL

    // Cover (original size preferred)
    const coverData = history.value?.attributes.cover?.data?.[0]?.attributes
    const coverAbsoluteUrl = coverData?.url
        ? coverData.url.startsWith('http')
            ? coverData.url
            : `${assetsBase}${coverData.url}`
        : ''
    const coverAlt = coverData?.alternativeText || coverData?.caption || title
    const coverWidth = coverData?.width
    const coverHeight = coverData?.height

    const metaTags: any[] = [
        { name: 'description', content: description }
    ]
    if (keywords) metaTags.push({ name: 'keywords', content: keywords })
    if (robots) metaTags.push({ name: 'robots', content: robots })

    // Open Graph
    metaTags.push({ property: 'og:type', content: 'article' })
    metaTags.push({ property: 'og:title', content: title })
    metaTags.push({ property: 'og:description', content: description })
    if (coverAbsoluteUrl) {
        metaTags.push({ property: 'og:image', content: coverAbsoluteUrl })
        if (coverAlt) metaTags.push({ property: 'og:image:alt', content: coverAlt })
        if (coverWidth) metaTags.push({ property: 'og:image:width', content: String(coverWidth) })
        if (coverHeight) metaTags.push({ property: 'og:image:height', content: String(coverHeight) })
    }

    // Twitter Card
    metaTags.push({ name: 'twitter:card', content: coverAbsoluteUrl ? 'summary_large_image' : 'summary' })
    metaTags.push({ name: 'twitter:title', content: title })
    metaTags.push({ name: 'twitter:description', content: description })
    if (coverAbsoluteUrl) {
        metaTags.push({ name: 'twitter:image', content: coverAbsoluteUrl })
        if (coverAlt) metaTags.push({ name: 'twitter:image:alt', content: coverAlt })
    }

    return {
        title,
        meta: metaTags,
        link: [
            canonical ? { rel: 'canonical', href: canonical } : undefined
        ].filter(Boolean) as any
    }
})
</script>

<style scoped>
.article-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    font-size: 0.9rem;
    color: var(--ff-muted);
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--ff-border);
}

/* Fallback table styles to mimic Bootstrap's table look when Bootstrap isn't loaded.
   Use deep selector so styles apply to HTML inserted via v-html even with scoped styles. */
:deep(.table-responsive) {
    width: 100%;
    overflow-x: auto;
}

:deep(table.table) {
    width: 100%;
    margin-bottom: 1rem;
    color: inherit;
    border-collapse: collapse;
}

:deep(table.table th),
:deep(table.table td) {
    padding: 0.75rem;
    vertical-align: top;
    border: 1px solid var(--ff-border);
}

:deep(table.table thead th) {
    vertical-align: bottom;
    background-color: rgba(0, 0, 0, 0.03);
    font-weight: 600;
}

:deep(table.table.table-striped tbody tr:nth-of-type(odd)) {
    background-color: rgba(0, 0, 0, 0.02);
}

:deep(table.table.table-hover tbody tr:hover) {
    background-color: rgba(0, 0, 0, 0.04);
}

/* Table of Contents - Inline */
.toc-inline {
    margin-bottom: 2rem;
}

.toc-inline h2 {
    font-size: 1.4rem;
    margin-bottom: 1rem;
    color: var(--ff-text);
}

.toc-content {
    color: var(--ff-muted);
    font-weight: 400;
}

:deep(.toc-content a) {
    color: var(--ff-muted);
    text-decoration: underline;
    text-decoration-color: rgba(95, 107, 138, 0.4);
    transition: var(--ff-transition);
}

:deep(.toc-content a:hover) {
    color: var(--ff-primary);
    text-decoration-color: var(--ff-primary);
}

:deep(.toc-content ol) {
    list-style: decimal;
    padding-left: 1.5rem;
    margin: 0;
}

:deep(.toc-content ul) {
    list-style: disc;
    padding-left: 1.5rem;
    margin: 0;
}

:deep(.toc-content li) {
    margin-bottom: 0.25rem;
    line-height: 1.4;
}

:deep(.toc-content p) {
    margin: 0;
}

/* Floating TOC Bubble - using :global because it's teleported to body */
:global(.toc-bubble) {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    z-index: 1000;
    opacity: 0;
    transform: translateY(20px);
    pointer-events: none;
    transition: opacity 0.3s ease, transform 0.3s ease;
}

:global(.toc-bubble--visible) {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
}

:global(.toc-bubble__toggle) {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: var(--ff-primary);
    color: white;
    border: none;
    border-radius: 999px;
    padding: 0.75rem 1.25rem;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(52, 81, 178, 0.3);
    transition: var(--ff-transition);
}

:global(.toc-bubble__toggle:hover) {
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba(52, 81, 178, 0.4);
}

:global(.toc-bubble__icon) {
    font-size: 1rem;
}

:global(.toc-bubble__content) {
    position: absolute;
    bottom: 100%;
    right: 0;
    margin-bottom: 0.75rem;
    background: var(--ff-surface, #fff);
    border: 1px solid var(--ff-border, #dfe3f4);
    border-radius: var(--ff-radius-md, 18px);
    box-shadow: var(--ff-shadow-hover, 0 24px 56px rgba(32, 41, 77, 0.12));
    min-width: 280px;
    max-width: 360px;
    max-height: 60vh;
    overflow-y: auto;
}

:global(.toc-bubble__header) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--ff-border, #dfe3f4);
    font-weight: 600;
    color: var(--ff-text, #1f2a44);
    position: sticky;
    top: 0;
    background: var(--ff-surface, #fff);
}

:global(.toc-bubble__close) {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: var(--ff-muted, #5f6b8a);
    cursor: pointer;
    padding: 0;
    line-height: 1;
    transition: var(--ff-transition);
}

:global(.toc-bubble__close:hover) {
    color: var(--ff-primary, #3451b2);
}

:global(.toc-bubble__content .toc-content) {
    padding: 1rem 1.25rem;
    color: var(--ff-muted, #5f6b8a);
    font-weight: 400;
}

:global(.toc-bubble__content .toc-content a) {
    color: var(--ff-muted, #5f6b8a);
    text-decoration: underline;
    text-decoration-color: rgba(95, 107, 138, 0.4);
    transition: var(--ff-transition);
    font-size: 0.9rem;
}

:global(.toc-bubble__content .toc-content a:hover) {
    color: var(--ff-primary, #3451b2);
    text-decoration-color: var(--ff-primary, #3451b2);
}

:global(.toc-bubble__content .toc-content ol) {
    list-style: decimal;
    padding-left: 1.5rem;
    margin: 0;
}

:global(.toc-bubble__content .toc-content ul) {
    list-style: disc;
    padding-left: 1.5rem;
    margin: 0;
}

:global(.toc-bubble__content .toc-content li) {
    margin-bottom: 0.5rem;
    line-height: 1.4;
}

:global(.toc-bubble__content .toc-content p) {
    margin: 0;
}

@media (max-width: 600px) {
    :global(.toc-bubble) {
        bottom: 1rem;
        right: 1rem;
    }

    :global(.toc-bubble__content) {
        min-width: 260px;
        max-width: calc(100vw - 2rem);
        right: 0;
    }

    :global(.toc-bubble__label) {
        display: none;
    }

    :global(.toc-bubble__toggle) {
        padding: 0.75rem;
    }
}
</style>
