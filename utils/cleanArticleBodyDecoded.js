import * as cheerio from 'cheerio'
import { nanoid } from 'nanoid'
import { decode } from 'html-entities'

export default (html) => {
  // 1. DECODE INPUT FIRST
  const decodedHtml = decode(html)

  // 2. Wrap in body tag if not present (important for fragment HTML)
  const wrappedHtml = decodedHtml.includes('<body')
    ? decodedHtml
    : `<body>${decodedHtml}</body>`

  // 3. Load with Cheerio
  const $ = cheerio.load(wrappedHtml, { decodeEntities: false })

  // 4. Remove style attributes EXCEPT from embeds, iframe containers, and their children
  $('div, span, p').each((_, el) => {
    const $el = $(el)
    const isInsideEmbed =
      $el.closest('blockquote, .instagram-media, .twitter-tweet, .tiktok-embed')
        .length > 0
    const hasIframe = $el.find('iframe').length > 0
    const hasEmbedClass = $el
      .attr('class')
      ?.match(/instagram|twitter|tiktok|facebook|embed/i)

    if (!isInsideEmbed && !hasIframe && !hasEmbedClass) {
      $el.removeAttr('style')
    }
  })

  const contentBlocks = []

  // 5. Get all top-level nodes (including text nodes)
  $('body')
    .contents() // Use .contents() instead of .children() to get text nodes too
    .each((_, el) => {
      const $element = $(el)

      // Skip empty text nodes
      if (el.type === 'text' && !$(el).text().trim()) {
        return
      }

      // Handle text nodes
      if (el.type === 'text') {
        const textContent = $(el).text().trim()
        if (textContent) {
          contentBlocks.push({
            id: nanoid(),
            key: 'paragraph',
            data: textContent,
          })
        }
        return
      }

      let key = ''
      let data = ''

      // Check if this is a script tag
      if ($element.is('script')) {
        key = 'embed_script'
        data = $element.prop('outerHTML')
        contentBlocks.push({
          id: nanoid(),
          key,
          data: data.trim(),
        })
        return
      }

      // Check if this is an iframe (direct child)
      if ($element.is('iframe')) {
        key = 'embed_html'
        data = $element.prop('outerHTML')
        contentBlocks.push({
          id: nanoid(),
          key,
          data: data.trim(),
        })
        return
      }

      // Check if this is a social media embed
      const isSocialEmbed =
        $element.is('blockquote') &&
        ($element.hasClass('instagram-media') ||
          $element.hasClass('twitter-tweet') ||
          $element.hasClass('tiktok-embed'))

      // Check if this is an iframe wrapper
      const hasIframe = $element.find('iframe').length > 0

      if (isSocialEmbed) {
        key = 'embed_social'
        data = $element.prop('outerHTML')
      } else if (hasIframe) {
        key = 'embed_html'
        data = $element.prop('outerHTML')
      } else {
        // Handle p, span, div tags
        if ($element.is('p, span, div')) {
          const innerText = $element.text().trim()
          const hasChildren = $element.children().length > 0

          if (!innerText && !hasChildren) {
            return // Skip empty elements
          }

          if ($element.children().is('ol, ul')) {
            key = 'bulleted_list'
            const [list] = $element.find('ol, ul')

            if (list) {
              data = $(list)
                .children()
                .map((_, listEl) => $(listEl).html())
                .get()
            }
          } else {
            key = $element.is('h1, h2, h3, h4, h5, h6')
              ? 'heading'
              : 'paragraph'
            data = $element.html()
          }
        } else if ($element.is('h1, h2, h3, h4, h5, h6')) {
          key = 'heading'
          data = $element.html()
        } else if ($element.is('img')) {
          key = 'embed_html'
          data = $element.prop('outerHTML')
        } else {
          // Unknown element, skip
          return
        }
      }

      if (data) {
        let finalData = data

        if (key === 'paragraph' || key === 'heading') {
          finalData = decode(data).trim()
          const $temp = cheerio.load(`<div>${finalData}</div>`, {
            decodeEntities: false,
          })
          $temp('div, span, p').removeAttr('style')
          finalData = $temp('div').html().trim()
        } else {
          finalData = typeof data === 'string' ? data.trim() : data
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
      embed_social: 'div',
      embed_script: 'script',
    }

    body = contentBlocks
      .map((block) => {
        const tag = tagMapping[block.key]
        if (
          block.key === 'embed_social' ||
          block.key === 'embed_html' ||
          block.key === 'embed_script'
        ) {
          return block.data
        }
        return `<${tag}>${block.data}</${tag}>`
      })
      .join('')
  }

  return {
    body,
    contentBlocks,
  }
}
