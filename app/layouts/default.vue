<template>
    <div class="ff-app">
        <header class="ff-hero">
            <div class="container-xl">
                <div class="row justify-content-center">
                    <div class="col-12">
                        <div class="ff-hero__visual">
                            <img src="/img/header.jpg" alt="Panoramica Final Fantasy" loading="lazy" />

                        </div>
                        <!-- Attached topnav: appears as continuation of the hero image -->
                        <nav class="ff-topnav ff-topnav--attached">
                            <div class="ff-topnav__inner">
                                <NuxtLink to="/" class="ff-topnav__link" :class="{ 'ff-topnav__link--active': isHome }">
                                    Home</NuxtLink>
                                <NuxtLink to="/capitoli" class="ff-topnav__link"
                                    :class="{ 'ff-topnav__link--active': isCapitoli }">Tutti i capitoli</NuxtLink>
                                <NuxtLink to="/storia" class="ff-topnav__link"
                                    :class="{ 'ff-topnav__link--active': isStoria }">Storia di FFStory</NuxtLink>
                                <NuxtLink to="/capitolo/final-fantasy-x/traduttore-albhed" class="ff-topnav__link"
                                    :class="{ 'ff-topnav__link--active': isTraduttore }">
                                    Traduttore Albhed</NuxtLink>
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

        <!-- Top horizontal navigation moved into header to visually connect with hero -->

        <div class="container-xl">
            <div class="row gx-lg-5 gy-4 align-items-start">
                <div class="col-12 col-lg-8 col-xl-8 col-content">
                    <!-- Condizionale: rimuove la macroscheda bianca su homepage e lista capitolo -->
                    <main :class="mainClass">
                        <slot />
                    </main>
                </div>

                <div class="col-12 col-lg-4 col-xl-4 col-sidebar">
                    <aside class="ff-sidebar" :class="{ 'ff-sidebar--open': sidebarOpen }">
                        <div class="ff-sidebar__inner">
                            <!-- Navigazione primaria (solo mobile) -->
                            <section class="ff-sidebar__section mobile-only">
                                <p class="ff-sidebar__label">Navigazione</p>
                                <nav class="ff-sidebar__nav">
                                    <NuxtLink to="/" class="ff-sidebar__link" @click="closeSidebarOnMobile">Home
                                    </NuxtLink>
                                    <NuxtLink to="/capitoli" class="ff-sidebar__link" @click="closeSidebarOnMobile">
                                        Tutti
                                        i capitoli</NuxtLink>
                                    <NuxtLink to="/storia" class="ff-sidebar__link" @click="closeSidebarOnMobile">Storia
                                        di FFStory</NuxtLink>
                                    <NuxtLink to="/capitolo/final-fantasy-x/traduttore-albhed" class="ff-sidebar__link"
                                        @click="closeSidebarOnMobile">Traduttore Al Bhed</NuxtLink>
                                </nav>
                            </section>
                            <section v-if="isChapterRoute && chapterArticles.length" class="ff-sidebar__section">
                                <p class="ff-sidebar__label">Articoli del capitolo</p>
                                <nav class="ff-sidebar__nav ff-sidebar__nav--sub">
                                    <NuxtLink v-for="article in chapterArticles" :key="article.id"
                                        :to="`/capitolo/${activeChapterSlug}/${article.attributes.slug}`"
                                        class="ff-sidebar__link ff-sidebar__link--sub"
                                        :class="{ 'ff-sidebar__link--active': isArticleActive(article.attributes.slug) }"
                                        @click="closeSidebarOnMobile">
                                        {{ article.attributes.menuTitle || article.attributes.title }}
                                    </NuxtLink>
                                </nav>
                            </section>

                            <section class="ff-sidebar__section">
                                <p class="ff-sidebar__label">Capitoli</p>
                                <nav class="ff-sidebar__nav">
                                    <!-- Home link removed as requested -->
                                    <NuxtLink v-for="chapter in chapters" :key="chapter.id"
                                        :to="`/capitolo/${chapter.attributes.slug}`" class="ff-sidebar__link"
                                        :class="{ 'ff-sidebar__link--active': isChapterActive(chapter.attributes.slug) }"
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
        <!-- small site footer -->
        <footer class="ff-footer">
            <div class="container-xl">
                <p class="ff-footer__text">FFStory 2009 - {{ currentYear }} - <a href="https://strifelab.com"
                        target="_blank" rel="noopener noreferrer">Made by Strifelab</a></p>
            </div>
        </footer>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useStrapi, type Article, type StrapiEntity } from '../composables/useStrapi'

const { fetchChapters, fetchArticles } = useStrapi()
const chapters = ref<any[]>([])
const sidebarOpen = ref(false)
const route = useRoute()

const chapterArticles = ref<StrapiEntity<Article>[]>([])

const isHome = computed(() => route.path === '/')
const isCapitoli = computed(() => route.path === '/capitoli')
const isStoria = computed(() => route.path === '/storia')
const isTraduttore = computed(() => route.path === '/capitolo/final-fantasy-x/traduttore-albhed')

const activeChapterSlug = computed(() => {
    const rawSlug = route.params.slug
    if (Array.isArray(rawSlug)) {
        return rawSlug[0] || null
    }
    return typeof rawSlug === 'string' ? rawSlug : null
})

const activeArticleSlug = computed(() => {
    const rawSlug = route.params.article
    if (Array.isArray(rawSlug)) {
        return rawSlug[0] || null
    }
    return typeof rawSlug === 'string' && rawSlug.length > 0 ? rawSlug : null
})

const isChapterRoute = computed(() => !!activeChapterSlug.value)

const isChapterActive = (slug: string) => {
    // Un capitolo è attivo solo se siamo sulla sua pagina indice (senza articolo)
    return activeChapterSlug.value === slug && !activeArticleSlug.value
}

const isArticleActive = (slug: string) => {
    // Un articolo è attivo solo se abbiamo effettivamente un articolo selezionato
    return activeArticleSlug.value !== null && activeArticleSlug.value === slug
}

watch(
    activeChapterSlug,
    async (slug) => {
        if (!slug) {
            chapterArticles.value = []
            return
        }

        try {
            const articles = await fetchArticles(slug, { limit: 50 })
            // Ordina gli articoli alfabeticamente per titolo
            chapterArticles.value = articles.sort((a, b) =>
                a.attributes.title.localeCompare(b.attributes.title, 'it')
            )
        } catch (error) {
            console.error('Error loading chapter articles:', error)
            chapterArticles.value = []
        }
    },
    { immediate: true }
)

onMounted(async () => {
    chapters.value = await fetchChapters()
})

const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value
}

const closeSidebarOnMobile = () => {
    if (typeof window !== 'undefined' && window.innerWidth <= 1024) {
        sidebarOpen.value = false
    }
}

const currentYear = new Date().getFullYear()

// Rimuove il background bianco (ff-main) per homepage e pagina indice capitolo
const mainClass = computed(() => {
    // homepage
    if (route.path === '/') return ''
    // pagina tutti i capitoli
    if (route.path === '/capitoli') return ''
    // pagina lista articoli capitolo (/capitolo/:slug)
    if (isChapterRoute.value && !activeArticleSlug.value) return ''
    // pagina traduttore albhed
    if (route.path === '/capitolo/final-fantasy-x/traduttore-albhed') return ''
    return 'ff-main'
})
</script>
