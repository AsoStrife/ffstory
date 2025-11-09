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

        <div class="article-body" v-html="article.attributes.body"></div>

        <div class="article-footer">
            <NuxtLink :to="`/capitolo/${chapterSlug}`" class="ff-button ff-button--ghost">
                ← Torna agli articoli
            </NuxtLink>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from 'nuxt/app'
import { useStrapi, type Article, type StrapiEntity } from '../../../composables/useStrapi'

const route = useRoute()
const { fetchArticleBySlug, getMediaUrl } = useStrapi()

const chapterSlug = route.params.slug as string
const articleSlug = route.params.article as string

const article = ref<StrapiEntity<Article> | null>(null)
const pending = ref(true)
const error = ref(false)

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
</style>
