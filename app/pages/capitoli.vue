<template>
    <div class="chapters-page">
        <header class="chapter-header mb-5">
            <p class="section-eyebrow">Esplora</p>
            <h1>Tutti i Capitoli</h1>
            <p class="chapter-subtitle">
                Scopri le guide, gli approfondimenti e le curiosità dedicate a ogni capitolo della saga di Final
                Fantasy.
            </p>
        </header>

        <div v-if="pending" class="loading">
            Caricamento dei capitoli...
        </div>

        <div v-else-if="error" class="alert alert-danger">
            Errore nel caricamento dei capitoli. Riprova più tardi.
        </div>

        <template v-else-if="chapters.length">
            <div class="row row-cols-1 row-cols-lg-2 g-4 ff-article-grid">
                <div v-for="chapter in chapters" :key="chapter.id" class="col">
                    <NuxtLink class="article-card h-100" :to="`/capitolo/${chapter.attributes.slug}`">
                        <div class="article-card__media">
                            <img :src="coverFor(chapter)" :alt="chapter.attributes.title" class="article-card__image"
                                loading="lazy" />
                        </div>
                        <div class="article-card__body">
                            <span class="article-card__tag">Capitolo</span>
                            <h3 class="article-card__title">{{ chapter.attributes.title }}</h3>
                            <p class="article-card__excerpt">
                                {{ descriptionFor(chapter) }}
                            </p>
                            <div class="article-card__meta">
                                <span>{{ articleCountFor(chapter) }}</span>
                                <span>Esplora →</span>
                            </div>
                        </div>
                    </NuxtLink>
                </div>
            </div>
        </template>

        <div v-else class="alert alert-info">
            Nessun capitolo disponibile al momento. Torna presto per nuovi contenuti!
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useHead } from 'nuxt/app'
import { useStrapi, type Chapter, type StrapiEntity } from '../composables/useStrapi'

const { fetchChaptersWithDetails, getMediaUrl } = useStrapi()

const chapters = ref<StrapiEntity<Chapter>[]>([])
const pending = ref(true)
const error = ref(false)

const coverFor = (chapter: StrapiEntity<Chapter>) => {
    return getMediaUrl(chapter.attributes.logo, 'medium') || '/img/header.jpg'
}

const descriptionFor = (chapter: StrapiEntity<Chapter>) => {
    return chapter.attributes.description || `Approfondimenti, curiosità e guide dedicate a ${chapter.attributes.title}.`
}

const articleCountFor = (chapter: StrapiEntity<Chapter>) => {
    const count = chapter.attributes.articles?.data?.length || 0
    if (count === 0) return 'Nessun articolo'
    if (count === 1) return '1 articolo'
    return `${count} articoli`
}

onMounted(async () => {
    try {
        pending.value = true
        chapters.value = await fetchChaptersWithDetails()
    } catch (e) {
        console.error('Error loading chapters:', e)
        error.value = true
    } finally {
        pending.value = false
    }
})

useHead({
    title: 'Tutti i Capitoli - FFStory',
    meta: [
        {
            name: 'description',
            content: 'Esplora tutti i capitoli della saga di Final Fantasy: guide, approfondimenti e curiosità per ogni titolo.'
        }
    ]
})
</script>
