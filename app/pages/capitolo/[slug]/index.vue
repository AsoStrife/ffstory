<template>
    <div class="chapter-page">
        <div v-if="pending" class="loading">
            Caricamento degli articoli...
        </div>

        <div v-else-if="error" class="alert alert-danger">
            Errore nel caricamento degli articoli. Riprova più tardi.
        </div>

        <div v-else>
            <header class="chapter-header mb-5">
                <p class="section-eyebrow">Capitolo</p>
                <h1>{{ chapterTitle || 'Articoli' }}</h1>
                <p v-if="chapterDescription" class="chapter-subtitle">
                    {{ chapterDescription }}
                </p>
            </header>

            <template v-if="articles.length">
                <div class="row row-cols-1 row-cols-lg-2 g-4 ff-article-grid">
                    <div v-for="article in articles" :key="article.id" class="col">
                        <NuxtLink class="article-card h-100" :to="articleLink(article)">
                            <div class="article-card__media">
                                <img :src="coverFor(article)" :alt="article.attributes.title"
                                    class="article-card__image" loading="lazy" />
                            </div>
                            <div class="article-card__body">
                                <span class="article-card__tag">{{ chapterTitle || 'Capitolo' }}</span>
                                <h3 class="article-card__title">{{ article.attributes.title }}</h3>
                                <p class="article-card__excerpt">
                                    {{ article.attributes.bodyShort }}
                                </p>
                                <div class="article-card__meta">
                                    <span>{{ formatDate(article.attributes.publishedAt) }}</span>
                                    <span>Leggi →</span>
                                </div>
                            </div>
                        </NuxtLink>
                    </div>
                </div>
            </template>

            <div v-else class="alert alert-info">
                Nessun articolo disponibile per questo capitolo. Torna presto per nuove storie!
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from 'nuxt/app'
import { useStrapi, type Article, type Chapter, type StrapiEntity } from '../../../composables/useStrapi'

const route = useRoute()
const { fetchArticles, fetchChapters, getMediaUrl } = useStrapi()

const chapterSlug = route.params.slug as string
const articles = ref<StrapiEntity<Article>[]>([])
const chapterTitle = ref('')
const chapterDescription = ref('')
const pending = ref(true)
const error = ref(false)

const coverFor = (article: StrapiEntity<Article>) => {
    return getMediaUrl(article.attributes.cover, 'medium') || '/img/header.jpg'
}

const articleLink = (article: StrapiEntity<Article>) => {
    return `/capitolo/${chapterSlug}/${article.attributes.slug}`
}

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

        const chapters = await fetchChapters()
        const chapter = chapters.find((ch: StrapiEntity<Chapter>) => ch.attributes.slug === chapterSlug)

        if (chapter) {
            chapterTitle.value = chapter.attributes.title
            chapterDescription.value = `Approfondimenti, curiosità e guide dedicate a ${chapter.attributes.title}.`
        }

        articles.value = await fetchArticles(chapterSlug)
    } catch (e) {
        console.error('Error loading chapter:', e)
        error.value = true
    } finally {
        pending.value = false
    }
})

useHead(() => ({
    title: chapterTitle.value ? `${chapterTitle.value} - FFStory` : 'Capitolo - FFStory',
    meta: [
        {
            name: 'description',
            content: chapterDescription.value || "Articoli e guide dedicate all'universo di Final Fantasy."
        }
    ]
}))
</script>
