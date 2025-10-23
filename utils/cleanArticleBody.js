// cleanArticleBody.js
import * as cheerio from 'cheerio'
import { decode } from 'html-entities'

export const cleanArticleBody = (htmlContent) => {
  // Handle cases where htmlContent is not a string or is empty
  if (!htmlContent || typeof htmlContent !== 'string') {
    return '<p></p>'
  }

  const decoded = decode(htmlContent)

  // Load the decoded content into Cheerio
  const $ = cheerio.load(decoded, { decodeEntities: false })

  // Wrap the content in a <p> tag
  $('body').children().wrapAll('<p></p>')

  // Return the HTML content, ensuring it's wrapped in a single <p> tag
  return $('body').html() || '<p></p>'
}
