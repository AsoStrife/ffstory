import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
// @ts-ignore
import markdownItAttrs from 'markdown-it-attrs'

let mdInstance: MarkdownIt | null = null

export const useMarkdown = () => {
  if (!mdInstance) {
    mdInstance = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
      breaks: false,
      highlight(code: string, lang: string): string {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return `<pre class="hljs"><code>${hljs.highlight(code, { language: lang }).value}</code></pre>`
          } catch (_) {
            // Fallthrough
          }
        }
        return `<pre class="hljs"><code>${mdInstance!.utils.escapeHtml(code)}</code></pre>`
      }
    })

    // Aggiungi supporto per attributi personalizzati come {#id}
    mdInstance.use(markdownItAttrs, {
      leftDelimiter: '{',
      rightDelimiter: '}',
      allowedAttributes: ['id', 'class']
    })
  }

  const renderMarkdown = (raw: string): string => {
    if (!raw) return ''
    return mdInstance!.render(raw)
  }

  return {
    renderMarkdown
  }
}
