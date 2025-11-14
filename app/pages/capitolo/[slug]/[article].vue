<template>
    <div v-if="pending" class="loading">
        Caricamento articolo...
    </div>

    <div v-else-if="error || !article" class="alert alert-danger">
        Articolo non trovato.
    </div>

    <div v-else class="article-detail">
        <div class="article-breadcrumb">
            <NuxtLink :to="`/capitolo/${chapterSlug}`" class="article-breadcrumb__link">← Torna al capitolo</NuxtLink>
        </div>

        <div v-if="coverUrl" class="article-hero">
            <img :src="coverUrl" :alt="article.attributes.title" loading="lazy" />
        </div>

        <h1>{{ article.attributes.title }}</h1>

        <div class="article-meta">
            <span>Pubblicato: {{ formatDate(article.attributes.publishedAt) }}</span>
            <span v-if="article.attributes.updatedAt !== article.attributes.publishedAt">
                Aggiornato: {{ formatDate(article.attributes.updatedAt) }}
            </span>
            <span v-if="article.attributes.chapter?.data">
                Capitolo: {{ article.attributes.chapter.data.attributes.title }}
            </span>
        </div>

        <div class="article-body" v-html="renderedBody"></div>

        <div class="article-footer">
            <NuxtLink :to="`/capitolo/${chapterSlug}`" class="ff-button ff-button--ghost">
                ← Torna agli articoli
            </NuxtLink>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from 'nuxt/app'
import { useStrapi, type Article, type StrapiEntity } from '../../../composables/useStrapi'
import { useMarkdown } from '../../../composables/useMarkdown'

const route = useRoute()
const { fetchArticleBySlug, getMediaUrl } = useStrapi()
const { renderMarkdown } = useMarkdown()

const chapterSlug = route.params.slug as string
const articleSlug = route.params.article as string

const article = ref<StrapiEntity<Article> | null>(null)
const pending = ref(true)
const error = ref(false)

const renderedBody = computed(() => {
    if (!article.value) return ''
    return renderMarkdown(article.value.attributes.body || '')
})

const coverUrl = computed(() => {
    if (!article.value) {
        return ''
    }

    return getMediaUrl(article.value.attributes.cover, 'large') || ''
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
        article.value = await fetchArticleBySlug(articleSlug)

        if (!article.value) {
            error.value = true
        }

        pending.value = false
    } catch (e) {
        console.error('Error loading article:', e)
        error.value = true
        pending.value = false
    }
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

useHead(() => ({
    title: article.value ? `${article.value.attributes.title} - FFStory` : 'Articolo - FFStory',
    meta: [
        {
            name: 'description',
            content: article.value?.attributes.bodyShort || 'Articolo su Final Fantasy'
        }
    ]
}))
</script>

<style scoped>
.article-breadcrumb {
    margin-bottom: 1.5rem;
}

.article-breadcrumb__link {
    color: var(--ff-primary);
    text-decoration: none;
    font-weight: 600;
}

.article-breadcrumb__link:hover {
    text-decoration: underline;
}

.article-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    font-size: 0.9rem;
    color: var(--ff-muted);
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--ff-border);
}

.article-footer {
    margin-top: 2.5rem;
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
</style>
