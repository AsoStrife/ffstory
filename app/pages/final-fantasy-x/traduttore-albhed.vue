<template>
    <div class="albhed-translator">
        <div class="translator-header">
            <h1 class="translator-title">Traduttore Al Bhed</h1>
            <p class="translator-subtitle">Traduci tra Italiano e la lingua Al Bhed di Spira</p>
        </div>

        <div class="translator-container">
            <!-- Left Panel -->
            <div class="translator-panel">
                <div class="panel-header">
                    <button class="language-btn" :class="{ 'active': !isReversed }" @click="setDirection(false)">
                        Italiano
                    </button>
                </div>
                <textarea v-model="inputText" @input="onInputChange" class="translator-textarea"
                    :placeholder="isReversed ? 'Inserisci testo in Al Bhed...' : 'Inserisci testo in Italiano...'"
                    :aria-label="isReversed ? 'Testo in Al Bhed' : 'Testo in Italiano'"></textarea>
                <div class="panel-footer">
                    <span class="char-count">{{ inputText.length }} / 5000</span>
                </div>
            </div>

            <!-- Switch Button -->
            <div class="translator-switch">
                <button class="switch-btn" @click="switchLanguages" aria-label="Inverti lingue">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round" />
                        <path d="M17 14L12 9L7 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round" />
                    </svg>
                </button>
            </div>

            <!-- Right Panel -->
            <div class="translator-panel">
                <div class="panel-header">
                    <button class="language-btn" :class="{ 'active': isReversed }" @click="setDirection(true)">
                        Al Bhed
                    </button>
                </div>
                <textarea v-model="outputText" class="translator-textarea" readonly
                    :placeholder="isReversed ? 'Traduzione in Italiano...' : 'Traduzione in Al Bhed...'"
                    :aria-label="isReversed ? 'Traduzione in Italiano' : 'Traduzione in Al Bhed'"></textarea>
                <div class="panel-footer">
                    <button v-if="outputText" class="copy-btn" @click="copyToClipboard" :class="{ 'copied': isCopied }">
                        <svg v-if="!isCopied" width="20" height="20" viewBox="0 0 24 24" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" stroke-width="2" />
                            <path
                                d="M5 15H4C2.89543 15 2 14.1046 2 13V4C2 2.89543 2.89543 2 4 2H13C14.1046 2 15 2.89543 15 4V5"
                                stroke="currentColor" stroke-width="2" />
                        </svg>
                        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 13L9 17L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" />
                        </svg>
                        {{ isCopied ? 'Copiato!' : 'Copia' }}
                    </button>
                </div>
            </div>
        </div>

        <div class="translator-info">
            <h3 class="info-title">Informazioni sulla lingua Al Bhed</h3>
            <p class="info-text">
                La lingua Al Bhed è utilizzata dal popolo Al Bhed in Final Fantasy X. Si tratta di un cifrario a
                sostituzione dove ogni lettera dell'alfabeto italiano viene sostituita con un'altra lettera specifica.
                Numeri, spazi e punteggiatura rimangono invariati.
            </p>
            <div class="alphabet-reference">
                <h4 class="alphabet-title">Tabella di conversione:</h4>
                <div class="alphabet-grid">
                    <div v-for="(letter, index) in alphabetPairs" :key="index" class="alphabet-pair">
                        <span class="letter-from">{{ letter.from }}</span>
                        <span class="letter-arrow">→</span>
                        <span class="letter-to">{{ letter.to }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

// SEO metadata
useHead({
    title: 'Traduttore AlBhed - FFStory',
    meta: [
        {
            name: 'description',
            content: 'Traduci tra Italiano e la lingua Al Bhed di Final Fantasy X. Scopri i segreti della lingua del popolo Al Bhed di Spira.'
        }
    ]
});

// Mappa di conversione Italiano → Al Bhed (basata su Inglese → Al Bhed)
const itaToAlBhed: Record<string, string> = {
    A: "Y", B: "P", C: "L", D: "T", E: "A", F: "V",
    G: "K", H: "R", I: "E", J: "Z", K: "G", L: "M",
    M: "S", N: "F", O: "O", P: "H", Q: "J", R: "C",
    S: "X", T: "D", U: "U", V: "W", W: "N", X: "B",
    Y: "I", Z: "Q",
};

// Costruisci automaticamente la mappa inversa Al Bhed → Italiano
const alBhedToIta = Object.fromEntries(
    Object.entries(itaToAlBhed).map(([k, v]) => [v, k])
);

// State
const inputText = ref('');
const outputText = ref('');
const isReversed = ref(false);
const isCopied = ref(false);

// Computed per la tabella alfabeto
const alphabetPairs = computed(() => {
    const letters = Object.entries(itaToAlBhed);
    return letters.map(([from, to]) => ({ from, to }));
});

// Funzione generale di conversione
function convert(text: string, map: Record<string, string>): string {
    return text
        .split("")
        .map((char) => {
            const isLower = char >= "a" && char <= "z";
            const upper = char.toUpperCase();

            if (map[upper]) {
                const converted = map[upper];
                return isLower ? converted.toLowerCase() : converted;
            }
            return char; // Mantieni simboli, numeri, spazi...
        })
        .join("");
}

// Funzioni comodità
function toAlBhed(text: string): string {
    return convert(text, itaToAlBhed);
}

function fromAlBhed(text: string): string {
    return convert(text, alBhedToIta);
}

// Gestione input
function onInputChange() {
    if (inputText.value.length > 5000) {
        inputText.value = inputText.value.slice(0, 5000);
    }

    if (isReversed.value) {
        // Da Al Bhed a Italiano
        outputText.value = fromAlBhed(inputText.value);
    } else {
        // Da Italiano a Al Bhed
        outputText.value = toAlBhed(inputText.value);
    }
}

// Inverti direzione
function switchLanguages() {
    isReversed.value = !isReversed.value;
    // Scambia i testi
    const temp = inputText.value;
    inputText.value = outputText.value;
    outputText.value = temp;
}

// Imposta direzione
function setDirection(reversed: boolean) {
    if (isReversed.value !== reversed) {
        switchLanguages();
    }
}

// Copia negli appunti
async function copyToClipboard() {
    try {
        await navigator.clipboard.writeText(outputText.value);
        isCopied.value = true;
        setTimeout(() => {
            isCopied.value = false;
        }, 2000);
    } catch (err) {
        console.error('Errore durante la copia:', err);
    }
}
</script>

<style scoped>
.albhed-translator {
    padding: 2rem 0;
}

/* .translator-header {
    text-align: center;
    margin-bottom: 2.5rem;
}

.translator-title {
    font-size: clamp(2rem, 4vw, 2.75rem);
    font-weight: 600;
    color: var(--ff-text);
    margin-bottom: 0.5rem;
    line-height: 1.08;
}

.translator-subtitle {
    font-size: 1.1rem;
    color: var(--ff-muted);
    font-weight: 500;
} */

.translator-container {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 1rem;
    margin-bottom: 3rem;
    align-items: stretch;
}

.translator-panel {
    background: var(--ff-surface);
    border: 2px solid var(--ff-border);
    border-radius: var(--ff-radius-lg);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: var(--ff-shadow-soft);
    transition: var(--ff-transition);
}

.translator-panel:hover {
    box-shadow: var(--ff-shadow-hover);
    border-color: var(--ff-primary);
}

.panel-header {
    padding: 1rem 1.5rem;
    border-bottom: 2px solid var(--ff-border);
    background: var(--ff-surface-muted);
}

.language-btn {
    background: transparent;
    border: none;
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--ff-muted);
    cursor: pointer;
    transition: var(--ff-transition);
    padding: 0.5rem 1rem;
    border-radius: var(--ff-radius-sm);
}

.language-btn:hover {
    color: var(--ff-primary);
    background: rgba(52, 81, 178, 0.1);
}

.language-btn.active {
    color: var(--ff-primary);
    background: var(--ff-primary-soft);
}

.translator-textarea {
    flex: 1;
    padding: 1.5rem;
    border: none;
    outline: none;
    font-family: 'Inter', sans-serif;
    font-size: 1rem;
    line-height: 1.6;
    color: var(--ff-text);
    background: transparent;
    resize: none;
    min-height: 250px;
    font-weight: 500;
}

.translator-textarea::placeholder {
    color: var(--ff-muted);
    opacity: 0.6;
}

.translator-textarea:read-only {
    cursor: default;
}

.panel-footer {
    padding: 0.75rem 1.5rem;
    border-top: 2px solid var(--ff-border);
    background: var(--ff-surface-muted);
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: 52px;
}

.char-count {
    font-size: 0.85rem;
    color: var(--ff-muted);
    font-weight: 600;
}

.copy-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: var(--ff-primary);
    color: white;
    border: none;
    border-radius: var(--ff-radius-sm);
    font-size: 0.9rem;
    font-weight: 700;
    cursor: pointer;
    transition: var(--ff-transition);
}

.copy-btn:hover {
    background: #2a3d8f;
    transform: translateY(-1px);
}

.copy-btn.copied {
    background: #28a745;
}

.translator-switch {
    display: flex;
    align-items: center;
    justify-content: center;
}

.switch-btn {
    width: 48px;
    height: 48px;
    background: var(--ff-primary);
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: var(--ff-transition);
    box-shadow: var(--ff-shadow-soft);
}

.switch-btn:hover {
    background: #2a3d8f;
    transform: rotate(180deg) scale(1.1);
    box-shadow: var(--ff-shadow-hover);
}

.translator-info {
    background: var(--ff-surface);
    border: 2px solid var(--ff-border);
    border-radius: var(--ff-radius-lg);
    padding: 2rem;
    box-shadow: var(--ff-shadow-soft);
}

.info-title {
    font-size: 1.5rem;
    font-weight: 800;
    /* color: var(--ff-primary); */
    margin-bottom: 1rem;
}

.info-text {
    font-size: 1rem;
    /* color: var(--ff-text);
    line-height: 1.7; */
    margin-bottom: 2rem;
    font-weight: 500;
}

.alphabet-reference {
    margin-top: 2rem;
}

.alphabet-title {
    font-size: 1.2rem;
    font-weight: 700;
    /* color: var(--ff-primary); */
    margin-bottom: 1rem;
}

.alphabet-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 0.75rem;
}

.alphabet-pair {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: var(--ff-primary-soft);
    border-radius: var(--ff-radius-sm);
    font-weight: 700;
    font-size: 0.95rem;
}

.letter-from {
    color: var(--ff-primary);
}

.letter-arrow {
    color: var(--ff-muted);
    font-size: 0.8rem;
}

.letter-to {
    color: var(--ff-accent);
}

/* Responsive */
@media (max-width: 992px) {
    .translator-container {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }

    .translator-switch {
        order: 2;
    }

    .translator-panel:first-child {
        order: 1;
    }

    .translator-panel:last-child {
        order: 3;
    }

    .switch-btn {
        transform: rotate(90deg);
    }

    .switch-btn:hover {
        transform: rotate(270deg) scale(1.1);
    }

    .alphabet-grid {
        grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
    }

    .translator-title {
        font-size: 2rem;
    }
}

@media (max-width: 576px) {
    .translator-header {
        margin-bottom: 1.5rem;
    }

    .translator-title {
        font-size: 1.75rem;
    }

    .translator-subtitle {
        font-size: 0.95rem;
    }

    .translator-info {
        padding: 1.5rem;
    }

    .alphabet-grid {
        grid-template-columns: repeat(auto-fill, minmax(65px, 1fr));
        gap: 0.5rem;
    }

    .alphabet-pair {
        padding: 0.5rem;
        font-size: 0.85rem;
    }
}
</style>
