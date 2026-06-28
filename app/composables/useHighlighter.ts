import type { Highlighter } from 'shiki'

const LANG_MAP: Record<string, string> = {
  ts: 'typescript',
  typescript: 'typescript',
  js: 'javascript',
  javascript: 'javascript',
  vue: 'vue',
  bash: 'bash',
  sh: 'bash',
}

let highlighterPromise: Promise<Highlighter> | null = null

async function getHighlighter(): Promise<Highlighter> {
  if (import.meta.server) {
    throw new Error('Shiki runs on client only')
  }

  if (!highlighterPromise) {
    const shiki = await import('shiki')
    highlighterPromise = shiki.createHighlighter({
      themes: ['dark-plus'],
      langs: ['typescript', 'javascript', 'vue', 'bash'],
    })
  }
  return highlighterPromise
}

export function useHighlighter() {
  async function highlight(code: string, language = 'typescript'): Promise<string> {
    const lang = LANG_MAP[language.toLowerCase()] ?? 'typescript'
    const h = await getHighlighter()
    return h.codeToHtml(code, {
      lang,
      theme: 'dark-plus',
    })
  }

  return { highlight }
}
