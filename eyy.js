import * as cheerio from 'cheerio'
import { nanoid } from 'nanoid'
import { decode } from 'html-entities'

export default (html) => {
  // 1. DECODE INPUT FIRST
  const decodedHtml = decode(html)

  // 2. Load with Cheerio
  const $ = cheerio.load(decodedHtml, { decodeEntities: false })

  // 3. Remove style attributes from ALL tags
  $('*').removeAttr('style')

  const contentBlocks = []

  $('body')
    .children()
    .each((_, el) => {
      const $el = $(el)
      const tagName = el.tagName.toLowerCase()

      let key = ''
      let data = ''

      // Check the actual tag name of the element
      switch (tagName) {
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
          key = 'heading'
          data = $el.html()
          break

        case 'p':
          key = 'paragraph'
          data = $el.html()
          break

        case 'div':
          // Check if it contains iframe (embed)
          if ($el.find('iframe').length > 0) {
            key = 'embed_html'
            data = $el.html()
          } else {
            key = 'paragraph'
            data = $el.html()
          }
          break

        case 'blockquote':
          key = 'embed_html'
          data = $el.html()
          break

        case 'iframe':
        case 'img':
        case 'video':
          key = 'embed_html'
          data = $.html(el)
          break

        default:
          // Skip unknown tags
          return
      }

      if (data) {
        let finalData = data.trim()

        // Decode entities for paragraph and heading content only
        if (key === 'paragraph' || key === 'heading') {
          finalData = decode(finalData)
        }

        if (finalData) {
          contentBlocks.push({
            id: nanoid(),
            key,
            data: finalData,
          })
        }
      }
    })

  let body = ''
  if (contentBlocks.length) {
    const tagMapping = {
      paragraph: 'p',
      heading: 'h1',
      embed_html: 'div',
    }

    body = contentBlocks
      .map((block) => {
        const tag = tagMapping[block.key]
        return `<${tag}>${block.data}</${tag}>`
      })
      .join('')
  }

  return {
    body,
    contentBlocks,
  }
}
