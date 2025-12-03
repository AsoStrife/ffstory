<template>
    <div class="ff-app">
        <header class="ff-hero">
            <div class="container-xl">
                <div class="row justify-content-center">
                    <div class="col-12">
                        <div class="ff-hero__visual">
                            <img src="/img/header.jpg" alt="Panoramica Final Fantasy" loading="lazy" />
                        </div>
                        <nav class="ff-topnav ff-topnav--attached">
                            <div class="ff-topnav__inner">
                                <NuxtLink to="/" class="ff-topnav__link">Home</NuxtLink>
                                <NuxtLink to="/capitoli" class="ff-topnav__link">Tutti i capitoli</NuxtLink>
                                <NuxtLink to="/storia" class="ff-topnav__link">Storia di FFStory</NuxtLink>
                            </div>
                        </nav>
                    </div>
                </div>
            </div>
        </header>

        <button class="mobile-menu-toggle" :class="{ 'mobile-menu-toggle--active': sidebarOpen }" @click="toggleSidebar"
            aria-label="Apri il menu">
            <span></span>
            <span></span>
            <span></span>
        </button>

        <div class="container-xl">
            <div class="row gx-lg-5 gy-4 align-items-start">
                <div class="col-12 col-lg-8 col-xl-8 col-content">
                    <main>
                        <div class="homepage">
                            <section class="homepage-latest">
                                <div class="section-header">
                                    <div>
                                        <p class="section-eyebrow">Errore 404</p>
                                        <h2>Pagina non trovata</h2>
                                        <p class="section-description">
                                            La pagina che stai cercando non esiste o è stata spostata.
                                        </p>
                                    </div>
                                    <NuxtLink to="/" class="section-link">
                                        Torna alla home →
                                    </NuxtLink>
                                </div>

                                <div v-if="articlesPending" class="loading">
                                    Caricamento degli articoli...
                                </div>

                                <div v-else-if="articlesError" class="alert alert-danger">
                                    Si è verificato un problema nel recupero degli articoli.
                                </div>

                                <div v-else-if="latestArticlesList.length" class="mt-5">
                                    <h3 class="mb-4"
                                        style="font-size: 1.5rem; font-weight: 700; color: var(--ff-text);">
                                        Articoli che potrebbero interessarti
                                    </h3>
                                    <div class="row row-cols-1 row-cols-lg-2 g-4 ff-article-grid">
                                        <div v-for="article in latestArticlesList" :key="article.id" class="col">
                                            <NuxtLink :to="articleLink(article)" class="article-card h-100">
                                                <div class="article-card__media">
                                                    <img :src="coverFor(article)" :alt="article.attributes.title"
                                                        class="article-card__image" loading="lazy" />
                                                </div>
                                                <div class="article-card__body">
                                                    <time class="article-card__date"
                                                        :datetime="article.attributes.publishedAt">
                                                        {{ formatDate(article.attributes.publishedAt) }}
                                                    </time>
                                                    <span class="article-card__tag"
                                                        v-if="article.attributes.chapter?.data">
                                                        {{ article.attributes.chapter.data.attributes.title }}
                                                    </span>
                                                    <h3 class="article-card__title">{{ article.attributes.title }}</h3>
                                                    <p class="article-card__excerpt">{{ article.attributes.bodyShort }}
                                                    </p>
                                                </div>
                                            </NuxtLink>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </main>
                </div>

                <div class="col-12 col-lg-4 col-xl-4 col-sidebar">
                    <aside class="ff-sidebar" :class="{ 'ff-sidebar--open': sidebarOpen }">
                        <div class="ff-sidebar__inner">
                            <section class="ff-sidebar__section mobile-only">
                                <p class="ff-sidebar__label">Navigazione</p>
                                <nav class="ff-sidebar__nav">
                                    <NuxtLink to="/" class="ff-sidebar__link" @click="closeSidebarOnMobile">Home
                                    </NuxtLink>
                                    <NuxtLink to="/capitoli" class="ff-sidebar__link" @click="closeSidebarOnMobile">
                                        Tutti i capitoli</NuxtLink>
                                    <NuxtLink to="/storia" class="ff-sidebar__link" @click="closeSidebarOnMobile">Storia
                                        di FFStory</NuxtLink>
                                </nav>
                            </section>

                            <section class="ff-sidebar__section">
                                <p class="ff-sidebar__label">Capitoli</p>
                                <nav class="ff-sidebar__nav">
                                    <NuxtLink v-for="chapter in chapters" :key="chapter.id"
                                        :to="`/capitolo/${chapter.attributes.slug}`" class="ff-sidebar__link"
                                        @click="closeSidebarOnMobile">
                                        {{ chapter.attributes.title }}
                                    </NuxtLink>
                                </nav>
                            </section>
                        </div>
                    </aside>
                </div>
            </div>
        </div>

        <footer class="ff-footer">
            <div class="container-xl">
                <p class="ff-footer__text">FFStory 2009 - {{ currentYear }} - <a href="https://strifelab.com"
                        target="_blank" rel="noopener noreferrer">Made by Strifelab</a></p>
            </div>
        </footer>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useAsyncData, useHead } from 'nuxt/app'
import { useStrapi, type Article, type StrapiEntity } from './composables/useStrapi'

const props = defineProps<{
    error: {
        statusCode: number
        statusMessage?: string
        message?: string
    }
}>()

const { fetchArticles, getMediaUrl, fetchChapters } = useStrapi()
const chapters = ref<any[]>([])
const sidebarOpen = ref(false)
const currentYear = new Date().getFullYear()

// Carica gli ultimi 6 articoli
// @ts-ignore -- top-level await is allowed in Nuxt 3 setup scripts
const { data: latestArticles, pending: articlesPending, error: articlesError } = await useAsyncData<StrapiEntity<Article>[]>(
    'error-page-articles',
    () => fetchArticles(undefined, { limit: 6 }),
    {
        default: () => []
    }
)

const latestArticlesList = computed(() => latestArticles.value ?? [])

const articleLink = (article: StrapiEntity<Article>) => {
    const chapterSlug = article.attributes.chapter?.data?.attributes?.slug
    return chapterSlug ? `/capitolo/${chapterSlug}/${article.attributes.slug}` : `/capitolo/${article.attributes.slug}`
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

const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value
}

const closeSidebarOnMobile = () => {
    if (typeof window !== 'undefined' && window.innerWidth <= 1024) {
        sidebarOpen.value = false
    }
}

onMounted(async () => {
    chapters.value = await fetchChapters()
})

useHead({
    title: `Errore ${props.error.statusCode} - FFStory`,
    meta: [
        {
            name: 'description',
            content: 'Pagina non trovata. Scopri altri articoli che potrebbero interessarti.'
        }
    ],
    link: [
        { rel: 'stylesheet', href: '/css/main.css' }
    ]
})
</script>

<style scoped>
.section-description {
    margin-top: 0.5rem;
    font-size: 1rem;
    color: var(--ff-muted);
    font-weight: 400;
}
</style>
