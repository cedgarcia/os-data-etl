import * as cheerio from 'cheerio'

export const cleanArticleBody = (htmlContent) => {
  const $ = cheerio.load(htmlContent, null, false)

  // REMOVE ALL INLINE STYLES
  $('div, span, p').removeAttr('style')

  //   // FIRST PASS: Handle content with trailing AND leading <br> in various elements
  //   $('div, span, p, strong, em, b, i').each((index, element) => {
  //     const $element = $(element)
  //     let html = $element.html()

  //     if (!html) return

  //     // Remove trailing <br> tags
  //     html = html.replace(/(<br\s*\/?>\s*)+$/gi, '')
  //     // Remove leading <br> tags
  //     html = html.replace(/^(<br\s*\/?>\s*)+/gi, '')

  //     $element.html(html)
  //   })

  //   // SPECIAL PASS: Extract images from paragraphs and make them separate elements
  //   $('p').each((index, element) => {
  //     const $element = $(element)
  //     const $images = $element.find('img')

  //     if ($images.length > 0) {
  //       const imagesHtml = $images
  //         .map((i, img) => $.html(img))
  //         .get()
  //         .join('')
  //       const textContent = $element.html().replace(imagesHtml, '').trim()

  //       // If there's text content after removing images, keep the paragraph with text
  //       if (textContent) {
  //         $element.html(textContent)
  //         // Insert images before the paragraph
  //         $element.before(imagesHtml)
  //       } else {
  //         // If no text content, replace the paragraph with just the images
  //         $element.replaceWith(imagesHtml)
  //       }
  //     }
  //   })

  //   // SECOND PASS: CONVERT DOUBLE <br><br> INTO PARAGRAPHS
  //   $('div, span, p').each((index, element) => {
  //     const $element = $(element)
  //     let html = $element.html()

  //     if (!html) return

  //     // Replace double <br><br> with a special marker
  //     html = html.replace(/<br\s*\/?>\s*<br\s*\/?>/gi, '<!--PARAGRAPH_BREAK-->')

  //     // If we have the marker, split the content and wrap in paragraphs
  //     if (html.includes('<!--PARAGRAPH_BREAK-->')) {
  //       const parts = html.split('<!--PARAGRAPH_BREAK-->')
  //       const newContent = parts
  //         .map((part) => {
  //           const trimmedPart = part.trim()
  //           return trimmedPart ? `<p>${trimmedPart}</p>` : ''
  //         })
  //         .join('')

  //       $element.replaceWith(newContent)
  //     } else {
  //       $element.html(html)
  //     }
  //   })

  //   // THIRD PASS: REMOVE EMPTY TAGS AND TAGS WITH ONLY &nbsp; OR <br>
  //   $('div, span, p').each((index, element) => {
  //     const $element = $(element)
  //     const html = $element.html()

  //     if (!html || html.trim() === '') {
  //       $element.remove()
  //       return
  //     }

  //     // Remove if contains only &nbsp;
  //     if (html.trim() === '&nbsp;') {
  //       $element.remove()
  //       return
  //     }

  //     // Remove if contains only <br> tags (single or multiple)
  //     const cleanHtml = html
  //       .replace(/&nbsp;/g, '')
  //       .replace(/<br\s*\/?>/gi, '')
  //       .trim()
  //     if (cleanHtml === '') {
  //       $element.remove()
  //       return
  //     }

  //     // Remove if contains only whitespace after removing &nbsp; and <br>
  //     if (
  //       html
  //         .replace(/&nbsp;/g, '')
  //         .replace(/<br\s*\/?>/gi, '')
  //         .trim() === ''
  //     ) {
  //       $element.remove()
  //     }
  //   })

  //   // REMOVE TAGS WITH ONLY ID ATTRIBUTES AND NO CONTENT
  //   $('div[id], span[id], p[id]').each((index, element) => {
  //     const $element = $(element)
  //     const html = $element.html()

  //     // Remove if the element has only an id attribute and no meaningful content
  //     if (
  //       (!html || html.trim() === '') &&
  //       Object.keys(element.attribs).length === 1 &&
  //       element.attribs.id
  //     ) {
  //       $element.remove()
  //       return
  //     }

  //     // Also check for elements with only <br> tags and id attribute
  //     if (
  //       html &&
  //       html.replace(/<br\s*\/?>/gi, '').trim() === '' &&
  //       Object.keys(element.attribs).length === 1 &&
  //       element.attribs.id
  //     ) {
  //       $element.remove()
  //     }
  //   })

  return $.html()
}
