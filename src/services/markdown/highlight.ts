import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import c from 'highlight.js/lib/languages/c'
import cpp from 'highlight.js/lib/languages/cpp'
import csharp from 'highlight.js/lib/languages/csharp'
import css from 'highlight.js/lib/languages/css'
import diff from 'highlight.js/lib/languages/diff'
import go from 'highlight.js/lib/languages/go'
import ini from 'highlight.js/lib/languages/ini'
import java from 'highlight.js/lib/languages/java'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import kotlin from 'highlight.js/lib/languages/kotlin'
import markdown from 'highlight.js/lib/languages/markdown'
import php from 'highlight.js/lib/languages/php'
import plaintext from 'highlight.js/lib/languages/plaintext'
import python from 'highlight.js/lib/languages/python'
import ruby from 'highlight.js/lib/languages/ruby'
import rust from 'highlight.js/lib/languages/rust'
import shell from 'highlight.js/lib/languages/shell'
import sql from 'highlight.js/lib/languages/sql'
import swift from 'highlight.js/lib/languages/swift'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'
import yaml from 'highlight.js/lib/languages/yaml'

import { escapeHtml } from '@/utils/text'

let registered = false

function registerLanguages(): void {
  if (registered) return
  registered = true
  hljs.registerLanguage('bash', bash)
  hljs.registerLanguage('shell', shell)
  hljs.registerLanguage('c', c)
  hljs.registerLanguage('cpp', cpp)
  hljs.registerLanguage('csharp', csharp)
  hljs.registerLanguage('css', css)
  hljs.registerLanguage('diff', diff)
  hljs.registerLanguage('go', go)
  hljs.registerLanguage('ini', ini)
  hljs.registerLanguage('java', java)
  hljs.registerLanguage('javascript', javascript)
  hljs.registerLanguage('json', json)
  hljs.registerLanguage('kotlin', kotlin)
  hljs.registerLanguage('markdown', markdown)
  hljs.registerLanguage('php', php)
  hljs.registerLanguage('plaintext', plaintext)
  hljs.registerLanguage('python', python)
  hljs.registerLanguage('ruby', ruby)
  hljs.registerLanguage('rust', rust)
  hljs.registerLanguage('sql', sql)
  hljs.registerLanguage('swift', swift)
  hljs.registerLanguage('typescript', typescript)
  hljs.registerLanguage('xml', xml)
  hljs.registerLanguage('html', xml)
  hljs.registerLanguage('yaml', yaml)
  hljs.registerLanguage('yml', yaml)
  hljs.registerLanguage('sh', shell)
  hljs.registerLanguage('js', javascript)
  hljs.registerLanguage('ts', typescript)
  hljs.registerLanguage('py', python)
  hljs.registerLanguage('rb', ruby)
}

export interface HighlightResult {
  html: string
  language: string
}

export function highlightCode(code: string, lang?: string): HighlightResult {
  registerLanguages()
  const normalizedLang = lang?.trim().toLowerCase()

  try {
    if (normalizedLang && hljs.getLanguage(normalizedLang)) {
      const result = hljs.highlight(code, { language: normalizedLang, ignoreIllegals: true })
      return { html: result.value, language: normalizedLang }
    }
    const auto = hljs.highlightAuto(code)
    return { html: auto.value, language: auto.language ?? 'plaintext' }
  } catch {
    return { html: escapeHtml(code), language: 'plaintext' }
  }
}
