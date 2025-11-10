<template>
    <div class="chapter-header">
        <h1>Storia di FFStory</h1>
    </div>

    <article class="content">
        <div class="article-body">
            <p>
                Mi chiamo <strong>Andrea Corriga</strong> (conosciuto online come <strong>@AsoStrife</strong>) e nel
                2009,
                all'età di sedici anni, ho creato <strong>FFStory</strong>.
                Il progetto nasceva da una doppia passione: l'informatica e la saga di <em>Final Fantasy</em>. Volevo
                imparare a costruire siti web e il modo più naturale per farlo fu creare qualcosa che unisse le mie
                passioni.
            </p>

            <p>
                La prima versione del sito era rudimentale: la realizzai con <strong>Microsoft FrontPage 2003</strong>,
                perché non avevo altri strumenti o competenze. Col tempo però imparai, sperimentai e il sito crebbe
                diventando più strutturato e ricco di contenuti.
            </p>

            <p>
                FFStory divenne più visibile grazie alla pagina Facebook <a href="http://facebook.com/ffwords"
                    target="_blank" rel="noopener noreferrer">ffwords</a>, dove la community interagiva e condivideva
                materiale sulla saga.
                Quella visibilità portò anche alla nascita di un forum e di una chat board sul sito, ambienti in cui gli
                utenti potevano scambiarsi messaggi e discutere dei loro giochi preferiti.
                In quel periodo sono diventato amministratore della pagina Facebook e ho conosciuto altri admin, tra cui
                Stefania Leo, che contribuì alla crescita della community.
            </p>

            <p>
                I primi contenuti pubblicati su FFStory furono guide dedicate a <em>Final Fantasy VII</em>. Le
                trascrissi a
                mano dalla guida ufficiale del 1997: a sedici anni
                non conoscevo ancora i rischi legati al copyright e Internet era un'altra cosa rispetto a oggi. Col
                tempo
                altri utenti caricarono loro guide e materiale; molte di
                queste risorse provenivano da altre fonti, cosa comprensibile visti l'entusiasmo e la giovane età dei
                contributori. Tra queste comunità c'era anche <a href="https://www.omniacrystallis.com/">Omnia
                    Crystallis</a>
                (all'epoca chiamato Zell Fantasy), con cui ho mantenuto un buon rapporto con il fondatore Stefano
                Gennari.
            </p>

            <p>
                Sono passati più di sedici anni dalla pubblicazione della prima versione del sito. In questo arco di
                tempo
                ho messo in pausa e riavviato il progetto più volte.
                Oggi ho deciso di rimettere online FFStory per conservare e riaccendere il ricordo del mio primo sito
                pubblico: non tanto per tornare alla gloria, ma per onorare
                la storia personale dietro quel piccolo esperimento adolescenziale.
            </p>

            <p>
                Questo sito è quindi un archivio di ricordi e di passi di crescita: mette insieme l'entusiasmo di un
                <strong>giovane sviluppatore</strong>, la passione per una saga che
                ha segnato la mia adolescenza, e le tracce di una community di appassionati. Se trovi qualcosa che
                riconosci
                o vuoi contribuire, i riferimenti personali sono ancora disponibili
                su <a href="https://andreacorriga.com" target="_blank" rel="noopener noreferrer">andreacorriga.com</a>,
                <a href="http://strifelab.com" target="_blank" rel="noopener noreferrer">strifelab.com</a> e il profilo
                GitHub <a href="https://github.com/AsoStrife" target="_blank" rel="noopener noreferrer">AsoStrife</a>.
            </p>

            <p>
                Grazie a chi ha partecipato a questo viaggio: il sito è una piccola capsula del tempo che racconta come
                una
                curiosità possa trasformarsi in pratica, comunità e, a modo suo,
                in storia.
            </p>
        </div>
    </article>
</template>

<script setup lang="ts">
import { useHead, useRuntimeConfig } from 'nuxt/app'

const config = useRuntimeConfig()
const canonical = (config?.public?.baseURL)
    ? String(config.public.baseURL).replace(/\/$/, '') + '/storia'
    : '/storia'

useHead({
    title: 'Storia di FFStory — Andrea Corriga (AsoStrife)',
    meta: [
        {
            name: 'description',
            content:
                'FFStory è un progetto nato nel 2009 da Andrea Corriga (AsoStrife). Questo articolo racconta le origini, la crescita e la scelta di riportare online il sito per preservarne la memoria.'
        },
        { name: 'keywords', content: 'FFStory, Final Fantasy, Andrea Corriga, AsoStrife, guide FF7, community, storia del sito' }
    ],
    link: [{ rel: 'canonical', href: canonical }]
})
</script>
