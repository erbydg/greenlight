'use client'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

export default function DocContent({ content }: { content: string }) {
  const rawHtml = marked.parse(content, { async: false, gfm: true, breaks: true })
  const html = DOMPurify.sanitize(rawHtml)
  return <div className="gl-doc" dangerouslySetInnerHTML={{ __html: html }}/>
}
