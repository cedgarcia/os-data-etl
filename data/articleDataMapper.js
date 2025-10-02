// import { getMediaFileId } from '../utils/imageMappingHelper.js'
import { websiteMap, leagueMap, categoryMap, statusMap } from './mappings.js'
import { cleanArticleBody } from '../utils/cleanArticleBody.js'

import { uploadToWebiny } from '../imageDownloader.js'
export async function mapArticle(oldArticle) {
  // Get the media file ID from the mapping
  // const mediaFileId = oldArticle.image ? getMediaFileId(oldArticle.image) : null

  // if (oldArticle.image && !mediaFileId) {
  //   console.warn(
  //     `⚠️  Article ${oldArticle.id}: Image "${oldArticle.image}" not found in mapping`
  //   )
  // } else if (mediaFileId) {
  //   console.log(`✅ Article ${oldArticle.id}: Mapped image to ${mediaFileId}`)
  // }

  const res = await uploadToWebiny(oldArticle.image, oldArticle.caption)
  return {
    title: oldArticle.title || '',
    lede: oldArticle.description || '',
    story: cleanArticleBody(oldArticle.body),
    type: 'story',
    status: 'publish',
    slug: oldArticle.slug || '',

    // Map the media file ID
    mediaFileId: res.mediaFileId,

    // Map other relationships
    addedById: '689d5cd6fc81210002e29e29#0005',
    categoryId: categoryMap[oldArticle.category],
    leagueId: leagueMap[oldArticle.subverticalid],
    websiteId: websiteMap[oldArticle.verticalid],

    // Additional fields
    contentBlock: oldArticle.contentBlock || null,
    body: oldArticle.body || null,
    settings: oldArticle.settings || null,

    // Timestamps
    publishedAt: oldArticle.published_at || null,
    author: {
      name: oldArticle.author,
    },
  }
}

export default mapArticle
