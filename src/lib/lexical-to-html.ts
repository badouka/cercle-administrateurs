// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LexicalDoc = { root?: { children?: any[] } } | null | undefined

export function escHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function renderNode(node: any): string {
  if (!node || typeof node !== 'object') return ''

  switch (node.type) {
    case 'root':
      return renderChildren(node.children)

    case 'paragraph': {
      const inner = renderChildren(node.children)
      return inner ? `<p>${inner}</p>` : '<p>&nbsp;</p>'
    }

    case 'heading': {
      const tag = /^h[1-6]$/.test(node.tag ?? '') ? node.tag : 'h2'
      return `<${tag}>${renderChildren(node.children)}</${tag}>`
    }

    case 'text': {
      const fmt  = node.format ?? 0
      let   text = escHtml(node.text ?? '')
      text = text.replace(/\n/g, '<br />')
      if (fmt & 16) return `<code>${text}</code>`
      if (fmt & 1)  text = `<strong>${text}</strong>`
      if (fmt & 2)  text = `<em>${text}</em>`
      if (fmt & 8)  text = `<u>${text}</u>`
      if (fmt & 4)  text = `<s>${text}</s>`
      if (fmt & 32) text = `<sub>${text}</sub>`
      if (fmt & 64) text = `<sup>${text}</sup>`
      return text
    }

    case 'linebreak':
      return '<br />'

    case 'horizontalrule':
      return '<hr />'

    case 'link':
    case 'autolink': {
      const url  = escHtml(node.url ?? node.fields?.url ?? '#')
      const attr = node.newTab || node.fields?.newTab ? ' target="_blank" rel="noopener noreferrer"' : ''
      return `<a href="${url}"${attr}>${renderChildren(node.children)}</a>`
    }

    case 'list': {
      const tag = node.listType === 'number' ? 'ol' : 'ul'
      return `<${tag}>${renderChildren(node.children)}</${tag}>`
    }

    case 'listitem':
      return `<li>${renderChildren(node.children)}</li>`

    case 'quote':
      return `<blockquote>${renderChildren(node.children)}</blockquote>`

    case 'code': {
      const lang = node.language ? ` class="language-${escHtml(node.language)}"` : ''
      return `<pre><code${lang}>${renderChildren(node.children)}</code></pre>`
    }

    case 'table':
      return `<table>${renderChildren(node.children)}</table>`

    case 'tablerow':
      return `<tr>${renderChildren(node.children)}</tr>`

    case 'tablecell': {
      const tag     = node.headerState ? 'th' : 'td'
      const colSpan = node.colSpan > 1 ? ` colspan="${node.colSpan}"` : ''
      const rowSpan = node.rowSpan > 1 ? ` rowspan="${node.rowSpan}"` : ''
      return `<${tag}${colSpan}${rowSpan}>${renderChildren(node.children)}</${tag}>`
    }

    case 'upload': {
      const media = node.value
      if (!media || typeof media !== 'object' || !media.url) return ''
      const alt = escHtml(media.alt ?? '')
      const src = escHtml(media.url)
      return `<figure><img src="${src}" alt="${alt}" loading="lazy" />${alt ? `<figcaption>${alt}</figcaption>` : ''}</figure>`
    }

    default:
      if (Array.isArray(node.children)) return renderChildren(node.children)
      if (typeof node.text === 'string')  return escHtml(node.text)
      return ''
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function renderChildren(children: any[] | undefined): string {
  if (!Array.isArray(children)) return ''
  return children.map(renderNode).join('')
}

export function lexicalToHtml(doc: LexicalDoc): string {
  try {
    return renderChildren(doc?.root?.children ?? [])
  } catch {
    return ''
  }
}
