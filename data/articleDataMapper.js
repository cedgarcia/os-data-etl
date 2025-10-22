import { websiteMap, leagueMap, categoryMap, statusMap } from './mappings.js'
import { cleanArticleBody } from '../utils/cleanArticleBody.js'
import { uploadToWebiny, getMediaFileIdByFilename } from '../imageDownloader.js'

export async function mapArticle(oldArticle) {
  let mediaFileId = oldArticle.existingMediaFileId || null

  // Check if image exists and is valid, and no existing mediaFileId is provided
  if (
    !mediaFileId &&
    oldArticle.image &&
    typeof oldArticle.image === 'string' &&
    oldArticle.image.trim()
  ) {
    const decodedFileName = decodeURIComponent(oldArticle.image.trim())

    // Check if image is already uploaded
    mediaFileId = getMediaFileIdByFilename(decodedFileName)

    if (mediaFileId) {
      console.log(
        `⏭️ Skipping upload for image: ${decodedFileName} (already uploaded, mediaFileId: ${mediaFileId})`
      )
    } else {
      // Prepare caption for upload
      let caption = oldArticle.caption
      if (!caption || typeof caption !== 'string' || caption.trim() === '') {
        caption = oldArticle.title || ''
      } else {
        caption = caption.trim()
      }

      try {
        console.log(`📤 Uploading image: ${decodedFileName}`)
        const res = await uploadToWebiny(oldArticle.image, caption)
        mediaFileId = res.mediaFileId
        console.log(
          `✅ Image uploaded: ${decodedFileName} -> mediaFileId: ${mediaFileId}`
        )
      } catch (error) {
        console.error(
          `❌ Failed to upload image: ${decodedFileName}`,
          error.message
        )
        mediaFileId = null
      }
    }
  } else if (!mediaFileId) {
    console.log(
      `⚠️ No valid image for article: ${oldArticle.id} (${
        oldArticle.title || 'Untitled'
      })`
    )
  }

  if (mediaFileId) {
    console.log(
      `🔗 Assigned mediaFileId ${mediaFileId} to article ${oldArticle.id} (${
        oldArticle.title || 'Untitled'
      })`
    )
  }

  const mappedArticle = {
    legacyId: oldArticle.id ? String(oldArticle.id) : null,
    title: oldArticle.title || '',
    lede: oldArticle.description || '',
    story: cleanArticleBody(oldArticle.body),
    type: 'story',
    status: 'publish',
    slug: oldArticle.slug || '',
    mediaFileId: mediaFileId || null,
    // addedById: '68ecba72ffef4e0002407de1#0003', //LOCAL
    addedById: '68dba1c6f258460002afd595#0006', // DEV
    categoryId: categoryMap[oldArticle.category] || null,
    leagueId: leagueMap[oldArticle.subverticalid] || null,
    websiteId: websiteMap[oldArticle.verticalid] || null,
    contentBlock: oldArticle.contentBlock || null,
    body: oldArticle.body || null,
    settings: null,
    publishedAt: oldArticle.post || null,
    author: {
      name: oldArticle.author || '',
    },
  }

  return mappedArticle
}

export default mapArticle
