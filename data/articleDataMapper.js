import {
  websiteMap,
  leagueMap,
  categoryMap,
  statusMap,
  usersMap,
} from './mappings.js'
import { cleanArticleBody } from '../utils/cleanArticleBody.js'
import { uploadToWebiny, getMediaFileIdByFilename } from '../imageDownloader.js'

export async function mapArticle(oldArticle) {
  // LOCAL ENVIRONMENT
  // const defaultUserId = '68ecba72ffef4e0002407de1#0005' // Fallback ID for "One Sports" user

  //DEV ENVIRONMENT
  // const defaultUserId = '68dba1c6f258460002afd595#0006' // Fallback ID for "One Sports" user

  //TEST ENVIRONMENT
  // const defaultUserId = '689579a9720a4d0002a21f3a#0012' // Fallback ID for "One Sports" user

  // Map the author field from the article to the corresponding migrated user
  let addedById = usersMap['One'] // Start with default

  if (!usersMap['One']) {
    console.warn(
      `⚠️ No usersMap entry for "One", skipping mapping for article ${oldArticle.id}`
    )
    return null
  }

  // if (oldArticle.author && typeof oldArticle.author === 'string') {
  //   const authorName = oldArticle.author.trim()

  //   // Look up the author in usersMap
  //   if (usersMap[authorName]) {
  //     addedById = usersMap[authorName]
  //     // console.log(
  //     //   `✅ Mapped author "${authorName}" to user ID: ${addedById} for article ${oldArticle.id}`
  //     // )
  //   } else if (authorName === '') {
  //     // Handle empty string authors
  //     if (usersMap['']) {
  //       addedById = usersMap['']
  //       // console.log(
  //       //   `✅ Mapped empty author to user ID: ${addedById} for article ${oldArticle.id}`
  //       // )
  //     } else {
  //       // console.warn(
  //       //   `⚠️ Empty author not found in usersMap for article ${oldArticle.id}, using default user`
  //       // )
  //     }
  //   } else {
  //     // console.warn(
  //     //   `⚠️ Author "${authorName}" not found in usersMap for article ${oldArticle.id}, using default user`
  //     // )
  //   }
  // } else {
  //   // console.warn(
  //   //   `⚠️ No author field for article ${oldArticle.id}, using default user`
  //   // )
  // }

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

        // ======================================
        //  CRITICAL CHANGE: Use image field for image upload / not thumbnail
        //  For articles, no videoUrl is passed (null by default)
        // ======================================
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

  // ⚠️ CRITICAL CHECK: Skip processing if no mediaFileId
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

  const mappedArticle = {
    legacyId: oldArticle.id ? String(oldArticle.id) : null,
    title: oldArticle.title || '',
    lede: oldArticle.description || '',
    story: cleanArticleBody(oldArticle.body),
    type: 'story',
    status: 'publish',
    slug: oldArticle.slug || '',
    mediaFileId: mediaFileId,
    addedById: addedById,
    categoryId: categoryMap[oldArticle.category],
    leagueId: leagueMap[oldArticle.subverticalid],
    websiteId: websiteMap[oldArticle.verticalid],
    contentBlock: oldArticle.contentBlock || null,
    body: ' ',
    settings: null,
    publishedAt: oldArticle.post || null,
    author: {
      name: oldArticle.author || '',
    },
  }

  return mappedArticle
}

export default mapArticle
