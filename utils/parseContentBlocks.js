// utils/parseContentBlocks.js
import * as cheerio from 'cheerio'
import { decode } from 'html-entities'
import { nanoid } from 'nanoid'

export const parseContentBlocks = (htmlContent) => {
  if (!htmlContent || typeof htmlContent !== 'string') {
    return {
      story: '',
      contentBlocks: [],
    }
  }

  const decoded = decode(htmlContent)
  const $ = cheerio.load(decoded, { xmlMode: false, decodeEntities: false })
  const contentBlocks = []

  $('body')
    .children()
    .each((_, el) => {
      let element = el
      const $el = $(element)
      const children = $el.children()

      // Use first child if nested
      if (children.length > 0) {
        element = children[0]
      }

      const tagName = (element.tagName || '').toLowerCase()
      let key = ''
      let data = ''

      switch (tagName) {
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
          key = 'heading'
          data = $el.text().trim()
          break

        case 'p':
        case 'div':
        case 'span':
        case 'blockquote':
        case 'ul':
        case 'ol':
        case 'li':
          key = 'paragraph'
          data = $.html(element).trim()
          break

        case 'iframe':
        case 'img':
        case 'video':
        case 'figure':
          key = 'embed_html'
          data = $.html(element).trim()
          break

        default:
          return // skip
      }

      if (data && !data.match(/^<br\s*\/?>$/i)) {
        contentBlocks.push({
          id: nanoid(),
          key,
          data,
        })
      }
    })

  // === Generate `story` from `contentBlocks` ===
  const tagMap = {
    heading: 'h2',
    paragraph: 'p',
    embed_html: 'div',
  }

  const story = contentBlocks
    .map((block) => {
      const tag = tagMap[block.key] || 'div'
      return `<${tag}>${block.data}</${tag}>`
    })
    .join('')

  return {
    story: story || ' ',
    contentBlocks: contentBlocks.length > 0 ? contentBlocks : null,
  }
}
