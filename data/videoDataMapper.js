import { websiteMap, leagueMap, categoryMap, usersMap } from './mappings.js'
import { cleanArticleBody } from '../utils/cleanArticleBody.js'
import { uploadToWebiny, getMediaFileIdByFilename } from '../imageDownloader.js'

export async function mapVideo(oldVideo) {
  // Default "One Sports" user (same as article)
  const addedById = usersMap['One']
  if (!addedById) {
    console.warn(`No usersMap entry for "One" – skipping video ${oldVideo.id}`)
    return null
  }

  // ---- VIDEO URL -------------------------------------------------
  // Legacy column is `videolink` (or `url` – adjust if different)
  const videoUrl = (oldVideo.videolink || oldVideo.url || '').trim()
  if (!videoUrl) {
    console.warn(`Video ${oldVideo.id} has no URL – skipping`)
    return null
  }

  // ---- IMAGE/THUMBNAIL UPLOAD ------------------------------------
  let mediaFileId = oldVideo.existingMediaFileId

  // Image upload logic (same as articles, but WITH video URL)
  if (
    !mediaFileId &&
    oldVideo.image &&
    typeof oldVideo.image === 'string' &&
    oldVideo.image.trim()
  ) {
    const decodedFileName = decodeURIComponent(oldVideo.image.trim())

    mediaFileId = getMediaFileIdByFilename(decodedFileName)

    if (mediaFileId) {
      console.log(
        `⏭️ Skipping upload for image: ${decodedFileName} (already uploaded, mediaFileId: ${mediaFileId})`
      )
    } else {
      let caption = oldVideo.caption
      if (!caption || typeof caption !== 'string' || caption.trim() === '') {
        caption = oldVideo.title || ''
      } else {
        caption = caption.trim()
      }

      try {
        console.log(`📤 Uploading image for video: ${decodedFileName}`)

        // Upload image (not thumbnail) WITH video URL
        const res = await uploadToWebiny(oldVideo.image, caption, videoUrl)
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

  // ⚠️ CRITICAL CHECK: Skip processing if no mediaFileId
  if (!mediaFileId) {
    console.log(
      `⚠️ Skipping video ${oldVideo.id} (${
        oldVideo.title || 'Untitled'
      }) - No valid mediaFileId`
    )
    return null
  }

  console.log(
    `🔗 Assigned mediaFileId ${mediaFileId} to video ${oldVideo.id} (${
      oldVideo.title || 'Untitled'
    })`
  )

  const mappedVideo = {
    legacyId: oldVideo.id ? String(oldVideo.id) : null,
    title: oldVideo.title || '',
    lede: oldVideo.description || '',
    story: cleanArticleBody(oldVideo.body || ''),
    type: 'video',
    status: 'publish',
    slug: oldVideo.slug || '',
    addedById,
    categoryId: categoryMap[oldVideo.category] || null,
    leagueId: leagueMap[oldVideo.subverticalid] || null,
    websiteId: websiteMap[oldVideo.verticalid] || null,
    publishedAt: oldVideo.post || null,
    // For videos: mediaFileId and mainVideoId are the same (the photo/thumbnail)
    mediaFileId: mediaFileId,
    mainVideoId: mediaFileId, // Same as mediaFileId for videos
    contentBlock: oldVideo.contentBlock || null,
    body: ' ',
    settings: null,
    author: {
      name: oldVideo.author || '',
    },
  }

  return mappedVideo
}

export default mapVideo
