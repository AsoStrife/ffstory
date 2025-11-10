import { defineContentConfig } from '@nuxt/content'

// Config minimale: presente il file di configurazione per evitare il warning
// "No content configuration found, falling back to default collection".
// Estendi questo file con collection/schema quando necessario.

// Cast a minimal empty config to any to satisfy the TypeScript type
// requirements of the current @nuxt/content types. Replace with a
// proper `collections` object when you want to define schemas.
export default defineContentConfig({} as any)
