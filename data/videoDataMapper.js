import { websiteMap, leagueMap, categoryMap, usersMap } from './mappings.js'
import { cleanArticleBody } from '../utils/cleanArticleBody.js'

export async function mapVideo(oldVideo) {
  // Default “One Sports” user (same as article)
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

  const mappedVideo = {
    legacyId: oldVideo.id ? String(oldVideo.id) : null,
    title: oldVideo.title || '',
    lede: oldVideo.description || '',
    story: cleanArticleBody(oldVideo.body || ''),
    type: 'video', // Webiny expects “video”
    status: 'publish',
    slug: oldVideo.slug || '',
    addedById,
    categoryId: categoryMap[oldVideo.category] || null,
    leagueId: leagueMap[oldVideo.subverticalid] || null,
    websiteId: websiteMap[oldVideo.verticalid] || null,
    publishedAt: oldVideo.post || null,
    urls: [videoUrl], // <-- the only real difference
    author: {
      name: oldVideo.author || '',
    },
  }

  return mappedVideo
}

export default mapVideo
