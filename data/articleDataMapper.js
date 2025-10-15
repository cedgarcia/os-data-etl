import { websiteMap, leagueMap, categoryMap, statusMap } from './mappings.js'
import { cleanArticleBody } from '../utils/cleanArticleBody.js'
import { uploadToWebiny, getMediaFileIdByFilename } from '../imageDownloader.js'

export async function mapArticle(oldArticle) {
  let mediaFileId = null

  // Check if image is already uploaded
  if (oldArticle.image) {
    const decodedFileName = decodeURIComponent(oldArticle.image)
    mediaFileId = getMediaFileIdByFilename(decodedFileName)

    if (!mediaFileId) {
      // Upload image if not already uploaded
      let caption = oldArticle.caption

      if (!caption || typeof caption !== 'string' || caption.trim() === ' ') {
        caption = '' // or use oldArticle.title as fallback
      } else {
        caption = caption.trim()
      }

      const res = await uploadToWebiny(oldArticle.image, caption)
      mediaFileId = res.mediaFileId
    }
  }

  return {
    legacyId: oldArticle.id ? String(oldArticle.id) : null, 
    title: oldArticle.title || '',
    lede: oldArticle.description || '',
    story: cleanArticleBody(oldArticle.body),
    type: 'story',
    status: 'publish',
    slug: oldArticle.slug || '',
    mediaFileId: mediaFileId || null,
    addedById: '68ecba72ffef4e0002407de1#0002',
    categoryId: categoryMap[oldArticle.category] || null,
    leagueId: leagueMap[oldArticle.subverticalid] || null,
    websiteId: websiteMap[oldArticle.verticalid] || null,
    contentBlock: oldArticle.contentBlock || null,
    body: oldArticle.body || null,
    settings: oldArticle.settings || null,
    publishedAt: oldArticle.published_at || null,
    author: {
      name: oldArticle.author || '',
    },
  }
}

export default mapArticle