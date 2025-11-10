import MarkdownIt from 'markdown-it'
import { defineNuxtPlugin } from 'nuxt/app'
import hljs from 'highlight.js'
import markdownItAnchor from 'markdown-it-anchor'
import markdownItEmoji from 'markdown-it-emoji'
import markdownItFootnote from 'markdown-it-footnote'
import markdownItTaskLists from 'markdown-it-task-lists'

export default defineNuxtPlugin(() => {
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: false,
    highlight(code: string, lang: string): string {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return `<pre class="hljs"><code>${hljs.highlight(code, { language: lang }).value}</code></pre>`
        } catch (_) { /* fallthrough */ }
      }
      return `<pre class="hljs"><code>${md.utils.escapeHtml(code)}</code></pre>`
    }
  })

  md
    .use(markdownItAnchor, { 
      permalink: markdownItAnchor.permalink.linkInsideHeader({
        symbol: '#',
        placement: 'before'
      }) 
    })
    .use(markdownItEmoji)
    .use(markdownItFootnote)
    .use(markdownItTaskLists, { enabled: true })

  return { 
    provide: { 
      md: (raw: string) => md.render(raw || '') 
    } 
  }
})
