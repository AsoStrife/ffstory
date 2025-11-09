<template>
    <div class="ff-app">
        <header class="ff-hero">
            <div class="container-xl">
                <div class="row justify-content-center">
                    <div class="col-12">
                        <div class="ff-hero__visual">
                            <img src="/img/header.jpg" alt="Panoramica Final Fantasy" loading="lazy" />

                        </div>
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
                    <main class="ff-main">
                        <slot />
                    </main>
                </div>

                <div class="col-12 col-lg-4 col-xl-4 col-sidebar">
                    <aside class="ff-sidebar" :class="{ 'ff-sidebar--open': sidebarOpen }">
                        <div class="ff-sidebar__inner">
                            <section v-if="isChapterRoute && chapterArticles.length" class="ff-sidebar__section">
                                <p class="ff-sidebar__label">Articoli del capitolo</p>
                                <nav class="ff-sidebar__nav ff-sidebar__nav--sub">
                                    <NuxtLink v-for="article in chapterArticles" :key="article.id"
                                        :to="`/capitolo/${activeChapterSlug}/${article.attributes.titleUrl}`"
                                        class="ff-sidebar__link ff-sidebar__link--sub"
                                        :class="{ 'ff-sidebar__link--active': isArticleActive(article.attributes.titleUrl) }"
                                        @click="closeSidebarOnMobile">
                                        {{ article.attributes.title }}
                                    </NuxtLink>
                                </nav>
                            </section>

                            <section class="ff-sidebar__section">
                                <p class="ff-sidebar__label">Capitoli</p>
                                <nav class="ff-sidebar__nav">
                                    <NuxtLink to="/" class="ff-sidebar__link"
                                        :class="{ 'ff-sidebar__link--active': isHome }" @click="closeSidebarOnMobile">
                                        Home
                                    </NuxtLink>
                                    <NuxtLink v-for="chapter in chapters" :key="chapter.id"
                                        :to="`/capitolo/${chapter.attributes.titleUrl}`" class="ff-sidebar__link"
                                        :class="{ 'ff-sidebar__link--active': isChapterActive(chapter.attributes.titleUrl) }"
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
    return typeof rawSlug === 'string' ? rawSlug : null
})

const isChapterRoute = computed(() => !!activeChapterSlug.value)

const isChapterActive = (slug: string) => activeChapterSlug.value === slug

const isArticleActive = (slug: string) => activeArticleSlug.value === slug

watch(
    activeChapterSlug,
    async (slug) => {
        if (!slug) {
            chapterArticles.value = []
            return
        }

        try {
            chapterArticles.value = await fetchArticles(slug, { limit: 50 })
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
</script>
