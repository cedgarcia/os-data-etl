import {
  websiteMap,
  leagueMap,
  categoryMap,
  statusMap,
  usersMap,
} from './mappings.js'

import {
  uploadToWebiny,
  getMediaFileIdByFilename,
} from '../utils/mediaUploader.js'

// ✅ Import your cleanArticleBody function
import cleanArticleBodyDecoded from '../utils/cleanArticleBodyDecoded.js'

export async function mapArticle(oldArticle) {
  // ... (all your existing code for user mapping and image upload)

  let addedById = usersMap['One']

  let defaultCategoryId = categoryMap[2]

  if (!usersMap['One']) {
    console.warn(
      `⚠️ No usersMap entry for "One", skipping mapping for article ${oldArticle.id}`
    )
    return null
  }

  let mediaFileId = oldArticle.existingMediaFileId

  // Image upload logic
  if (
    !mediaFileId &&
    oldArticle.image &&
    typeof oldArticle.image === 'string' &&
    oldArticle.image.trim()
  ) {
    const decodedFileName = decodeURIComponent(oldArticle.image.trim())

    mediaFileId = getMediaFileIdByFilename(decodedFileName)

    if (mediaFileId) {
      console.log(
        `⏭️ Skipping upload for image: ${decodedFileName} (already uploaded, mediaFileId: ${mediaFileId})`
      )
    } else {
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
  }

  if (!mediaFileId) {
    console.log(
      `⚠️ Skipping article ${oldArticle.id} (${
        oldArticle.title || 'Untitled'
      }) - No valid mediaFileId`
    )
    return null
  }

  console.log(
    `🔗 Assigned mediaFileId ${mediaFileId} to article ${oldArticle.id} (${
      oldArticle.title || 'Untitled'
    })`
  )

  // ✅ Process the body using cleanArticleBody
  const cleanedContent = cleanArticleBodyDecoded(oldArticle.body || '')

  const mappedArticle = {
    legacyId: oldArticle.id ? String(oldArticle.id) : null,
    title: oldArticle.title || '',
    lede: oldArticle.description || '',
    body: cleanedContent.body,
    contentBlock: JSON.stringify(cleanedContent.contentBlocks),
    type: 'story',
    status: 'publish',
    slug: oldArticle.slug || '',
    mediaFileId: mediaFileId,
    addedById: addedById,
    authorId: addedById,
    categoryId: categoryMap[oldArticle.category] || defaultCategoryId,
    leagueId: leagueMap[oldArticle.subverticalid],
    websiteId: websiteMap[oldArticle.verticalid],
    settings: null,
    publishedAt: oldArticle.post || null,
  }

  return mappedArticle
}

export default mapArticle
