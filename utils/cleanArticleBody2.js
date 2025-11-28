import * as cheerio from 'cheerio'
import { nanoid } from 'nanoid'
import { decode } from 'html-entities'

export default (html) => {
  // 1. DECODE INPUT FIRST
  const decodedHtml = decode(html)

  // 2. Load with Cheerio
  const $ = cheerio.load(decodedHtml, { decodeEntities: false })

  // 3. Remove style attributes EXCEPT from embeds, iframe containers, and their children
  $('div, span, p').each((_, el) => {
    const $el = $(el)
    // Don't remove styles if element is inside a blockquote, has iframe child, or has embed-related classes
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

  $('body')
    .children()
    .each((_, el) => {
      let key = ''
      let data = ''
      let element = el
      const $element = $(element)

      // Check if this is a script tag
      if ($element.is('script')) {
        key = 'embed_script'
        data = $element.prop('outerHTML') // Preserve entire script tag
        contentBlocks.push({
          id: nanoid(),
          key,
          data: data.trim(),
        })
        return // Skip to next element
      }

      // Check if this is a social media embed
      const isSocialEmbed =
        $element.is('blockquote') &&
        ($element.hasClass('instagram-media') ||
          $element.hasClass('twitter-tweet') ||
          $element.hasClass('tiktok-embed'))

      // Check if this is an iframe wrapper (preserve styles)
      const hasIframe = $element.find('iframe').length > 0

      if (isSocialEmbed) {
        // Preserve entire social media embed as-is
        key = 'embed_social'
        data = $element.prop('outerHTML') // Get entire blockquote including attributes
      } else if (hasIframe) {
        // Preserve iframe wrapper with styles
        key = 'embed_html'
        data = $element.prop('outerHTML') // Preserve container div with styles
      } else {
        // Original logic for regular content
        const children = $element.children()
        if (children.length) {
          element = children[0]
        }

        const tag = element.children[0]?.tagName ?? 'p'

        switch (tag.toLowerCase()) {
          case 'h1':
            key = 'heading'
            data = $(element).html()
            break
          case 'p':
          case 'div':
          case 'span':
          case 'video':
            key = 'paragraph'
            data = $(element).html()
            break
          case 'iframe':
          case 'img':
            key = 'embed_html'
            data = $(element).html()
            break
          default:
            return
        }
      }

      if (data) {
        // Decode entities for paragraph and heading content only
        let finalData = data

        if (key === 'paragraph' || key === 'heading') {
          finalData = decode(data).trim()
          // Remove styles from nested elements (but not for embeds)
          const $temp = cheerio.load(`<div>${finalData}</div>`, {
            decodeEntities: false,
          })
          $temp('div, span, p').removeAttr('style')
          finalData = $temp('div').html().trim()
        } else {
          // For embeds and scripts, keep as-is
          finalData = data.trim()
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
        // For social embeds, iframe containers, and scripts - data already contains full HTML
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
