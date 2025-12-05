<template>
    <div class="mobile-menu" :class="{ 'mobile-menu--open': isOpen }">
        <!-- Hamburger button -->
        <button class="mobile-menu__toggle" :class="{ 'mobile-menu__toggle--active': isOpen }" @click="toggleMenu"
            aria-label="Apri il menu">
            <span></span>
            <span></span>
            <span></span>
        </button>

        <!-- Overlay backdrop -->
        <Transition name="fade">
            <div v-if="isOpen" class="mobile-menu__backdrop" @click="closeMenu"></div>
        </Transition>

        <!-- Menu panel -->
        <Transition name="slide">
            <div v-if="isOpen" class="mobile-menu__panel">
                <!-- Header del menu -->
                <div class="mobile-menu__header">
                    <span class="mobile-menu__brand">FFStory</span>
                    <button class="mobile-menu__close" @click="closeMenu" aria-label="Chiudi menu">
                        ✕
                    </button>
                </div>

                <!-- Navigazione principale -->
                <nav class="mobile-menu__nav">
                    <p class="mobile-menu__label">Navigazione</p>
                    <NuxtLink to="/" class="mobile-menu__link" :class="{ 'mobile-menu__link--active': isHome }"
                        @click="closeMenu">
                        Home
                    </NuxtLink>
                    <NuxtLink to="/final-fantasy" class="mobile-menu__link"
                        :class="{ 'mobile-menu__link--active': isCapitoli }" @click="closeMenu">
                        Tutti i Final Fantasy
                    </NuxtLink>
                    <NuxtLink to="/storia-ffstory" class="mobile-menu__link"
                        :class="{ 'mobile-menu__link--active': isStoria }" @click="closeMenu">
                        Storia di FFStory
                    </NuxtLink>
                    <NuxtLink to="/final-fantasy-x/traduttore-albhed" class="mobile-menu__link"
                        :class="{ 'mobile-menu__link--active': isTraduttore }" @click="closeMenu">
                        Traduttore Al Bhed
                    </NuxtLink>
                </nav>

                <!-- Articoli del capitolo corrente (se presente) -->
                <nav v-if="chapterArticles.length > 0" class="mobile-menu__nav">
                    <p class="mobile-menu__label mobile-menu__label--collapsible"
                        @click="articlesExpanded = !articlesExpanded">
                        <span>Articoli su {{ activeChapterTitle }}</span>
                        <span class="mobile-menu__chevron"
                            :class="{ 'mobile-menu__chevron--open': articlesExpanded }">▼</span>
                    </p>
                    <div v-show="articlesExpanded" class="mobile-menu__submenu">
                        <NuxtLink v-for="article in chapterArticles" :key="article.id"
                            :to="`/${activeChapterSlug}/${article.attributes.slug}`"
                            class="mobile-menu__link mobile-menu__link--sub"
                            :class="{ 'mobile-menu__link--active': isArticleActive(article.attributes.slug) }"
                            @click="closeMenu">
                            {{ article.attributes.menuTitle || article.attributes.title }}
                        </NuxtLink>
                    </div>
                </nav>

                <!-- Final Fantasy Saga -->
                <nav class="mobile-menu__nav">
                    <p class="mobile-menu__label mobile-menu__label--collapsible"
                        @click="chaptersExpanded = !chaptersExpanded">
                        <span>Final Fantasy Saga</span>
                        <span class="mobile-menu__chevron"
                            :class="{ 'mobile-menu__chevron--open': chaptersExpanded }">▼</span>
                    </p>
                    <div v-show="chaptersExpanded" class="mobile-menu__submenu">
                        <NuxtLink v-for="chapter in chapters" :key="chapter.id" :to="`/${chapter.attributes.slug}`"
                            class="mobile-menu__link"
                            :class="{ 'mobile-menu__link--active': isChapterActive(chapter.attributes.slug) }"
                            @click="closeMenu">
                            {{ chapter.attributes.title }}
                        </NuxtLink>
                    </div>
                </nav>
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import type { Article, StrapiEntity } from '../composables/useStrapi'

// Props
interface Props {
    chapters: any[]
    chapterArticles: StrapiEntity<Article>[]
    activeChapterSlug: string | null
    activeChapterTitle: string
    activeArticleSlug: string | null
}

const props = defineProps<Props>()

const route = useRoute()
const isOpen = ref(false)

// Stati per le sezioni collassabili
const articlesExpanded = ref(true)
const chaptersExpanded = ref(true)

// Computed per lo stato attivo dei link
const isHome = computed(() => route.path === '/')
const isCapitoli = computed(() => route.path === '/final-fantasy')
const isStoria = computed(() => route.path === '/storia-ffstory')
const isTraduttore = computed(() => route.path === '/final-fantasy-x/traduttore-albhed')

const isChapterActive = (slug: string) => {
    return props.activeChapterSlug === slug && !props.activeArticleSlug
}

const isArticleActive = (slug: string) => {
    return props.activeArticleSlug !== null && props.activeArticleSlug === slug
}

// Metodi per aprire/chiudere il menu
const toggleMenu = () => {
    isOpen.value = !isOpen.value
}

const closeMenu = () => {
    isOpen.value = false
}

// Blocca lo scroll del body quando il menu è aperto
watch(isOpen, (open) => {
    if (typeof document !== 'undefined') {
        document.body.style.overflow = open ? 'hidden' : ''
    }
})

// Chiudi il menu al cambio di route
watch(() => route.path, () => {
    closeMenu()
})

// Chiudi con ESC
const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen.value) {
        closeMenu()
    }
}

onMounted(() => {
    if (typeof window !== 'undefined') {
        window.addEventListener('keydown', handleKeydown)
    }
})

onUnmounted(() => {
    if (typeof window !== 'undefined') {
        window.removeEventListener('keydown', handleKeydown)
        document.body.style.overflow = ''
    }
})
</script>

<style scoped>
/* Mobile Menu - Visibile solo su mobile */
.mobile-menu {
    display: none;
}

@media (max-width: 1024px) {
    .mobile-menu {
        display: block;
    }
}

/* Toggle button */
.mobile-menu__toggle {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 1001;
    background: var(--ff-primary);
    color: var(--ff-surface);
    border: none;
    border-radius: var(--ff-radius-sm);
    padding: 0.85rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    box-shadow: var(--ff-shadow-soft);
    transition: var(--ff-transition);
    cursor: pointer;
}

.mobile-menu__toggle span {
    width: 24px;
    height: 2.5px;
    border-radius: 999px;
    background: currentColor;
    transition: var(--ff-transition);
    transform-origin: center;
}

.mobile-menu__toggle--active span:nth-child(1) {
    transform: translateY(7px) rotate(45deg);
}

.mobile-menu__toggle--active span:nth-child(2) {
    opacity: 0;
    transform: scaleX(0);
}

.mobile-menu__toggle--active span:nth-child(3) {
    transform: translateY(-7px) rotate(-45deg);
}

/* Backdrop */
.mobile-menu__backdrop {
    position: fixed;
    inset: 0;
    background: rgba(31, 42, 68, 0.5);
    backdrop-filter: blur(4px);
    z-index: 999;
}

/* Panel */
.mobile-menu__panel {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: min(85vw, 360px);
    background: var(--ff-surface);
    z-index: 1000;
    overflow-y: auto;
    box-shadow: -10px 0 40px rgba(31, 42, 68, 0.15);
    display: flex;
    flex-direction: column;
    padding: 0;
}

/* Header */
.mobile-menu__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid var(--ff-border);
    background: var(--ff-surface-gradient);
}

.mobile-menu__brand {
    font-weight: 700;
    font-size: 1.2rem;
    color: var(--ff-primary);
}

.mobile-menu__close {
    background: rgba(52, 81, 178, 0.1);
    border: none;
    border-radius: var(--ff-radius-sm);
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--ff-primary);
    font-size: 1.1rem;
    cursor: pointer;
    transition: var(--ff-transition);
}

.mobile-menu__close:hover {
    background: rgba(52, 81, 178, 0.2);
}

/* Navigation sections */
.mobile-menu__nav {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--ff-border);
}

.mobile-menu__nav:last-child {
    border-bottom: none;
}

.mobile-menu__label {
    text-transform: uppercase;
    letter-spacing: 0.15em;
    font-size: 0.7rem;
    color: var(--ff-muted);
    font-weight: 600;
    margin-bottom: 0.75rem;
}

.mobile-menu__label--collapsible {
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    text-transform: none;
    letter-spacing: 0.02em;
    font-size: 0.85rem;
    color: var(--ff-text);
    padding: 0.5rem 0;
    margin-bottom: 0.5rem;
}

.mobile-menu__chevron {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    font-size: 0.7rem;
    color: var(--ff-primary);
    background: rgba(52, 81, 178, 0.1);
    transition: var(--ff-transition);
}

.mobile-menu__chevron--open {
    transform: rotate(180deg);
}

.mobile-menu__submenu {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.mobile-menu__link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.85rem 1rem;
    border-radius: var(--ff-radius-sm);
    color: var(--ff-muted);
    text-decoration: none;
    font-weight: 500;
    font-size: 0.95rem;
    transition: var(--ff-transition);
    border: 1px solid transparent;
}

.mobile-menu__link::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: transparent;
    transition: var(--ff-transition);
    flex-shrink: 0;
}

.mobile-menu__link:hover,
.mobile-menu__link:active {
    background: var(--ff-primary-soft);
    color: var(--ff-primary);
}

.mobile-menu__link:hover::before,
.mobile-menu__link:active::before {
    background: var(--ff-primary);
}

.mobile-menu__link--active {
    background: var(--ff-primary);
    color: white;
    box-shadow: 0 8px 20px rgba(52, 81, 178, 0.2);
}

.mobile-menu__link--active::before {
    background: var(--ff-accent);
}

.mobile-menu__link--sub {
    font-size: 0.88rem;
    padding: 0.7rem 0.9rem;
    padding-left: 1.5rem;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
    transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
    transform: translateX(100%);
}
</style>
