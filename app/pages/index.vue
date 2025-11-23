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
                <button class="ff-button ff-button--ghost pager-btn" :disabled="!canGoPrev" @click="goPrev">←
                    Precedenti</button>
                <button class="ff-button btn-outline-primary pager-btn" :disabled="!canGoNext" @click="goNext">Prossimi
                    →</button>
            </div>

            <div v-else class="alert alert-info">
                Non ci sono articoli pubblicati al momento. Torna presto per nuovi contenuti!
            </div>
        </section>

    </div>
</template>

<script lang="ts">
// Abbiamo sostituito useAsyncData con un fetch manuale per semplificare l'integrazione nell'Options API.

import { defineComponent } from 'vue'
import { useRoute, useRouter, useHead } from 'nuxt/app'
import { useStrapi, type Article, type StrapiEntity } from '../composables/useStrapi'

// Tipi di supporto per chiarezza
interface PaginationMeta {
    start: number
    limit: number
    total: number
}
interface ArticlesResponse {
    data: StrapiEntity<Article>[]
    meta: { pagination: PaginationMeta }
}

export default defineComponent({
    name: 'HomePage',

    // HEAD: definiamo i metadati usando useHead nel lifecycle setup
    setup() {
        useHead({
            title: 'FFStory - Tutto sulla saga di Final Fantasy',
            meta: [
                {
                    name: 'description',
                    content: 'Un hub moderno per guide, storie e curiosità dedicate alla saga di Final Fantasy.'
                }
            ]
        })
        // restituiamo nulla dallo setup perché il componente usa ancora Options API per dati/metodi
        return {}
    },

    // DATA: stato reattivo di base della pagina
    data() {
        const route = useRoute() // Recupero query param per pagina corrente
        return {
            LIMIT: 6, // Numero articoli per pagina
            page: Number(route.query.page) > 0 ? Number(route.query.page) : 1, // Pagina attuale (fallback a 1)
            latestArticlesResponse: {
                data: [],
                meta: { pagination: { start: 0, limit: 6, total: 0 } }
            } as ArticlesResponse, // Struttura risposta articoli
            articlesPending: true, // Stato di caricamento
            articlesError: null as Error | null, // Eventuale errore nel fetch
            route // Mantengo riferimento alla route per aggiornare i query params
        }
    },

    // COMPUTED: derivazioni dello stato principale
    computed: {
        // Lista degli articoli più recenti
        latestArticlesList(): StrapiEntity<Article>[] {
            return this.latestArticlesResponse?.data || []
        },
        // Dati di paginazione
        pagination(): PaginationMeta {
            return (this.latestArticlesResponse?.meta?.pagination) || { start: 0, limit: this.LIMIT, total: 0 }
        },
        // Se posso andare alla pagina precedente
        canGoPrev(): boolean {
            return this.page > 1
        },
        // Se posso andare alla pagina successiva
        canGoNext(): boolean {
            return (this.pagination.start + this.pagination.limit) < this.pagination.total
        },
        // Link al capitolo primario (primo articolo con capitolo associato)
        primaryChapterLink(): string | null {
            const first = this.latestArticlesList.find(article => Boolean(article.attributes.chapter?.data?.attributes?.titleUrl))
            const chapterSlug = first?.attributes.chapter?.data?.attributes?.titleUrl
            return chapterSlug ? `/capitolo/${chapterSlug}` : null
        }
    },

    // WATCH: quando cambia la pagina rifaccio il fetch
    watch: {
        page() {
            this.fetchArticles()
        }
    },

    // METODI: azioni della pagina
    methods: {
        // Recupera funzioni Strapi (richiede composable, chiamato una volta)
        getStrapiHelpers() {
            // Commento: centralizziamo l'accesso per eventuale estensione futura
            return useStrapi()
        },
        // Esegue il fetch degli articoli con paginazione
        async fetchArticles() {
            const { fetchArticlesPaged } = this.getStrapiHelpers()
            this.articlesPending = true
            this.articlesError = null
            try {
                // Calcolo offset di partenza
                const start = (this.page - 1) * this.LIMIT
                // Chiamata API
                const response = await fetchArticlesPaged(undefined, { limit: this.LIMIT, start })
                // Normalizzo risposta
                this.latestArticlesResponse = (response as ArticlesResponse) || {
                    data: [],
                    meta: { pagination: { start, limit: this.LIMIT, total: 0 } }
                }
            } catch (err: any) {
                this.articlesError = err
                // Fallback struttura vuota
                this.latestArticlesResponse = {
                    data: [],
                    meta: { pagination: { start: 0, limit: this.LIMIT, total: 0 } }
                }
            } finally {
                this.articlesPending = false
            }
        },
        // Vai alla pagina precedente
        goPrev() {
            if (!this.canGoPrev) return
            const newPage = this.page - 1
            this.page = newPage
            const router = useRouter()
            // Se torno a pagina 1 rimuovo il parametro per URL pulito
            router.push({ query: { ...this.route.query, page: newPage === 1 ? undefined : newPage } })
        },
        // Vai alla pagina successiva
        goNext() {
            if (!this.canGoNext) return
            const newPage = this.page + 1
            this.page = newPage
            const router = useRouter()
            router.push({ query: { ...this.route.query, page: newPage } })
        },
        // Costruisce il link dell'articolo (dipende dal capitolo associato)
        articleLink(article: StrapiEntity<Article>) {
            const chapterSlug = article.attributes.chapter?.data?.attributes?.titleUrl
            return chapterSlug ? `/capitolo/${chapterSlug}/${article.attributes.titleUrl}` : `/capitolo/${article.attributes.titleUrl}`
        },
        // Recupera la cover dell'articolo (fallback immagine di default)
        coverFor(article: StrapiEntity<Article>) {
            const { getMediaUrl } = this.getStrapiHelpers()
            return getMediaUrl(article.attributes.cover, 'medium') || '/img/header.jpg'
        },
        // Format della data in italiano esteso
        formatDate(dateString: string) {
            const date = new Date(dateString)
            return date.toLocaleDateString('it-IT', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        }
    },

    // LIFECYCLE: al montaggio recupero gli articoli iniziali
    mounted() {
        // Commento: eseguiamo subito il primo fetch quando il componente viene renderizzato
        this.fetchArticles()
    }
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
