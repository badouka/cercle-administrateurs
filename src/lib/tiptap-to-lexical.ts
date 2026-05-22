// Converts TipTap (ProseMirror) JSON to Payload Lexical JSON

const IS_BOLD        = 1
const IS_ITALIC      = 2
const IS_STRIKE      = 4
const IS_UNDERLINE   = 8
const IS_CODE        = 16

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Node = any

function text(str: string, format = 0): Node {
  return { type: 'text', detail: 0, format, mode: 'normal', style: '', text: str, version: 1 }
}

function block(type: string, children: Node[], extra: Record<string, unknown> = {}): Node {
  return { type, format: '', indent: 0, version: 1, direction: 'ltr', children, ...extra }
}

function ensureChildren(nodes: Node[]): Node[] {
  return nodes.length > 0 ? nodes : [text('')]
}

function inlines(nodes: Node[]): Node[] {
  return (nodes ?? []).flatMap((n: Node) => {
    if (n.type === 'hardBreak') return [{ type: 'linebreak', version: 1 }]
    if (n.type === 'text')      return [convertText(n)]
    return []
  })
}

function convertText(n: Node): Node {
  const marks: Node[] = n.marks ?? []
  let fmt = 0
  let linkHref: string | null = null
  let linkNewTab = false

  for (const m of marks) {
    if (m.type === 'bold')      fmt |= IS_BOLD
    if (m.type === 'italic')    fmt |= IS_ITALIC
    if (m.type === 'strike')    fmt |= IS_STRIKE
    if (m.type === 'underline') fmt |= IS_UNDERLINE
    if (m.type === 'code')      fmt |= IS_CODE
    if (m.type === 'link') {
      linkHref   = m.attrs?.href ?? null
      linkNewTab = m.attrs?.target === '_blank'
    }
  }

  const textNode = text(n.text ?? '', fmt)
  if (!linkHref) return textNode

  return block('link', [textNode], {
    url:    linkHref,
    fields: { url: linkHref, newTab: linkNewTab },
    rel:    'noreferrer',
    target: linkNewTab ? '_blank' : null,
  })
}

function convertListItem(n: Node): Node {
  const children = (n.content ?? []).flatMap((child: Node) =>
    child.type === 'paragraph' ? inlines(child.content ?? []) : [convertNode(child)].filter(Boolean),
  )
  return {
    type:      'listitem',
    value:     1,
    format:    0,
    indent:    0,
    version:   1,
    direction: 'ltr',
    children:  ensureChildren(children),
  }
}

function convertNode(n: Node): Node | null {
  switch (n.type) {
    case 'paragraph':
      return block('paragraph', ensureChildren(inlines(n.content ?? [])))

    case 'heading':
      return block('heading', ensureChildren(inlines(n.content ?? [])), { tag: `h${n.attrs?.level ?? 2}` })

    case 'bulletList':
      return block('list', (n.content ?? []).map(convertListItem), { listType: 'bullet', start: 1, tag: 'ul' })

    case 'orderedList':
      return block('list', (n.content ?? []).map(convertListItem), { listType: 'number', start: 1, tag: 'ol' })

    case 'blockquote': {
      const children = (n.content ?? []).flatMap((p: Node) =>
        p.type === 'paragraph' ? inlines(p.content ?? []) : [convertNode(p)].filter(Boolean),
      )
      return block('quote', ensureChildren(children))
    }

    case 'codeBlock':
      return block('code', ensureChildren(inlines(n.content ?? [])), { language: n.attrs?.language ?? '' })

    case 'horizontalRule':
      return { type: 'horizontalrule', version: 1 }

    default:
      return null
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function tiptapToLexical(tiptapDoc: any): any {
  const children = (tiptapDoc?.content ?? [])
    .map(convertNode)
    .filter(Boolean)

  return {
    root: {
      type:      'root',
      format:    '',
      indent:    0,
      version:   1,
      direction: 'ltr',
      children:  children.length > 0 ? children : [block('paragraph', [text('')])],
    },
  }
}
