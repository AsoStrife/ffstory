<template>
    <div class="homepage">


        <section class="homepage-latest">
            <div class="section-header">
                <div>
                    <p class="section-eyebrow">Final Fantasy Story</p>
                    <h2>Ultimi articoli pubblicati</h2>
                </div>
                <NuxtLink v-if="primaryChapterLink" :to="primaryChapterLink" class="section-link">
                    Tutti i capitoli →
                </NuxtLink>
            </div>

            <div v-if="articlesPending" class="loading">
                Caricamento degli articoli...
            </div>

            <div v-else-if="articlesError" class="alert alert-danger">
                Si è verificato un problema nel recupero degli articoli. Riprova tra qualche istante.
            </div>

            <div v-else-if="latestArticlesList.length" class="row row-cols-1 row-cols-lg-2 g-4 ff-article-grid">
                <div v-for="article in latestArticlesList" :key="article.id" class="col">
                    <NuxtLink :to="articleLink(article)" class="article-card h-100">
                        <div class="article-card__media">
                            <img :src="coverFor(article)" :alt="article.attributes.title" class="article-card__image"
                                loading="lazy" />
                        </div>
                        <div class="article-card__body">
                            <time class="article-card__date" :datetime="article.attributes.publishedAt">
                                {{ formatDate(article.attributes.publishedAt) }}
                            </time>
                            <span class="article-card__tag" v-if="article.attributes.chapter?.data">
                                {{ article.attributes.chapter.data.attributes.title }}
                            </span>
                            <h3 class="article-card__title">{{ article.attributes.title }}</h3>
                            <p class="article-card__excerpt">{{ article.attributes.bodyShort }}</p>
                        </div>
                    </NuxtLink>
                </div>
            </div>

            <div v-if="latestArticlesList.length" class="pagination-controls">
                <button class="ff-button ff-button--ghost pager-btn" :disabled="!canGoPrev" @click="goPrev">← Precedenti</button>
                <button class="ff-button btn-outline-primary pager-btn" :disabled="!canGoNext" @click="goNext">Prossimi →</button>
            </div>

            <div v-else class="alert alert-info">
                Non ci sono articoli pubblicati al momento. Torna presto per nuovi contenuti!
            </div>
        </section>

    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAsyncData, useHead, useRoute, useRouter } from 'nuxt/app'
import { useStrapi, type Article, type StrapiEntity } from '../composables/useStrapi'

const { fetchArticlesPaged, getMediaUrl } = useStrapi()

const route = useRoute()
const router = useRouter()
const LIMIT = 6
const page = ref(Number(route.query.page) > 0 ? Number(route.query.page) : 1)

// @ts-ignore -- top-level await is allowed in Nuxt 3 setup scripts
const { data: latestArticlesResponse, pending: articlesPending, error: articlesError } = await useAsyncData(
    () => `homepage-latest-articles-page-${page.value}`,
    () => fetchArticlesPaged(undefined, { limit: LIMIT, start: (page.value - 1) * LIMIT }),
    {
        default: () => ({ data: [], meta: { pagination: { start: 0, limit: LIMIT, total: 0 } } }),
        watch: [page]
    }
)

const latestArticlesList = computed<StrapiEntity<Article>[]>(() => latestArticlesResponse.value?.data ?? [])
const pagination = computed(() => (latestArticlesResponse.value as any)?.meta?.pagination || { start: 0, limit: LIMIT, total: 0 })

const canGoPrev = computed(() => page.value > 1)
const canGoNext = computed(() => (pagination.value.start + pagination.value.limit) < pagination.value.total)

const goPrev = () => {
    if (!canGoPrev.value) return
    const newPage = page.value - 1
    page.value = newPage
    router.push({ query: { ...route.query, page: newPage === 1 ? undefined : newPage } })
}

const goNext = () => {
    if (!canGoNext.value) return
    const newPage = page.value + 1
    page.value = newPage
    router.push({ query: { ...route.query, page: newPage } })
}

const primaryChapterLink = computed(() => {
    const first = latestArticlesList.value.find((article) =>
        Boolean(article.attributes.chapter?.data?.attributes?.titleUrl)
    )

    const chapterSlug = first?.attributes.chapter?.data?.attributes?.titleUrl

    return chapterSlug ? `/capitolo/${chapterSlug}` : null
})

const articleLink = (article: StrapiEntity<Article>) => {
    const chapterSlug = article.attributes.chapter?.data?.attributes?.titleUrl
    return chapterSlug ? `/capitolo/${chapterSlug}/${article.attributes.titleUrl}` : `/capitolo/${article.attributes.titleUrl}`
}

const coverFor = (article: StrapiEntity<Article>) => {
    return getMediaUrl(article.attributes.cover, 'medium') || '/img/header.jpg'
}

const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('it-IT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

useHead({
    title: 'FFStory - Final Fantasy in chiave moderna',
    meta: [
        {
            name: 'description',
            content: 'Un hub moderno per guide, storie e curiosità dedicate alla saga di Final Fantasy.'
        }
    ]
})
</script>

<style scoped>
.pagination-controls {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 2rem;
}
.pager-btn {
    font-size: 0.85rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
}
.pager-btn[disabled] {
    opacity: .45;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}
</style>
