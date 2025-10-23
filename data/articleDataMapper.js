import { websiteMap, leagueMap, categoryMap, statusMap } from './mappings.js'

import { usersMap } from './mappings.js'

import { cleanArticleBody } from '../utils/cleanArticleBody.js'
import { uploadToWebiny, getMediaFileIdByFilename } from '../imageDownloader.js'

export async function mapArticle(oldArticle) {
  const defaultUserId = '68ecba72ffef4e0002407de1#0005' // Fallback ID for "One Sports" user

  // Use creator/updater fields if available in MSSQL data, else default to 'One'
  const addedById =
    oldArticle.creator && usersMap[oldArticle.creator]
      ? usersMap[oldArticle.creator]
      : usersMap['One'] || defaultUserId

  if (!usersMap['One']) {
    console.warn(
      `⚠️ No usersMap entry for "One", using fallback ID: ${defaultUserId}`
    )
  }

  let mediaFileId = oldArticle.existingMediaFileId || null

  // Image upload logic remains unchanged
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
    addedById: addedById, // Keep this as is or map dynamically if authorsMap is populated
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
