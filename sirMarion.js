const cheerio = require('cheerio')
const { nanoid } = require('nanoid')

module.exports = (html) => {
  const $ = cheerio.load(html)
  const contentBlocks = []

  $('body')
    .children()
    .each((_, el) => {
      let key = ''
      let data = ''
      let element = el

      const children = $(element).children()
      if (children.length) {
        element = children[0]
      }

      const tag = element.children[0]?.tagName ?? 'p'

      switch (tag.toLowerCase()) {
        case 'h1':
          key = 'heading'
          data = $(element).html().trim()
          break

        case 'p':
        case 'div':
        case 'span':
          key = 'paragraph'
          data = $(element).html().trim()
          break

        case 'iframe':
        case 'img':
        case 'video':
          key = 'embed_html'
          data = $.html(element).trim()
          break

        default:
          return
      }

      if (data && data.trim()) {
        contentBlocks.push({
          id: nanoid(),
          key,
          data,
        })
      }
    })

  if (contentBlocks.length) {
    const tagMapping = {
      paragraph: 'p',
      heading: 'h1',
      embed_html: 'div',
    }

    var body = contentBlocks
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
