import * as cheerio from 'cheerio'
import { decode } from 'html-entities'

export const cleanArticleBody = (htmlContent) => {
  const decoded = decode(htmlContent)

  // const $ = cheerio.load(decoded)
  const $ = cheerio.load(decoded, null, false)

  return $.html()
}
