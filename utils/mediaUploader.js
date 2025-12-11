import fs from 'fs'
import path from 'path'
import axios from 'axios'
import sql from 'msnodesqlv8'
import FormData from 'form-data'
import sizeOf from 'image-size'
import config from '../config/index.js'
import { usersMap } from '../data/mappings.js'

const query = `
  SELECT c.image, c.caption
  FROM contents c
  INNER JOIN contents_vertical cv ON c.id = cv.contentid
  WHERE cv.verticalid = 7
`
// ==================================================
//  CRITICAL CONFIGURATION -> USE imagesFinale FOLDER
// ==================================================
// const folderPath = 'assets/images'
const baseImageUrl = './assets/complete-images-nov1' // this contains already downloaded images "20291 items"
const IMAGE_MAPPING_FILE = './logs/migrated_mediafiles_migration_env.json' // Store the mapping
// const IMAGE_MAPPING_FILE = './logs/dev-image-uploaded.json' // Store the mapping
// const IMAGE_MAPPING_FILE = './logs/test-image-uploaded.json' // Store the mapping

// Load existing mapping or create new one
function loadImageMapping() {
  try {
    if (fs.existsSync(IMAGE_MAPPING_FILE)) {
      const data = fs.readFileSync(IMAGE_MAPPING_FILE, 'utf8')
      console.log(`📂 Loaded image mapping from ${IMAGE_MAPPING_FILE}`)
      return JSON.parse(data)
    } else {
      console.log(`📂 No existing image mapping found, starting fresh`)
    }
  } catch (error) {
    console.error('❌ Error loading image mapping:', error.message)
  }
  return {}
}

// Save mapping to file
function saveImageMapping(mapping) {
  try {
    fs.writeFileSync(IMAGE_MAPPING_FILE, JSON.stringify(mapping, null, 2))
    console.log(`💾 Image mapping saved to ${IMAGE_MAPPING_FILE}`)
  } catch (error) {
    console.error('❌ Error saving image mapping:', error.message)
  }
}

// Export function to get media file ID by filename
export function getMediaFileIdByFilename(filename) {
  const mapping = loadImageMapping()
  const decodedFilename = decodeURIComponent(filename).toLowerCase()
  const mediaFileId = mapping[decodedFilename] || null
  if (mediaFileId) {
    console.log(
      `🔍 Found mediaFileId ${mediaFileId} for filename: ${decodedFilename}`
    )
  } else {
    console.log(`🔍 No mediaFileId found for filename: ${decodedFilename}`)
  }
  return mediaFileId
}

// Download image to buffer
export async function downloadImageBuffer(fileName) {
  // const response = await axios({
  //   url: `${baseImageUrl}/${fileName}`,
  //   method: 'GET',
  //   responseType: 'arraybuffer',
  // })
  // console.log('URL:', `${baseImageUrl}/${fileName}`)
  const buffer = await fs.readFileSync(`${baseImageUrl}/${fileName}`)
  // console.log('BUFFER', buffer)

  return {
    buffer,
    // contentType: response.headers['content-type'],
  }
}

// Upload image to Webiny API
export async function uploadToWebiny(
  fileName,
  caption = '',
  videoUrl = null // NEW: Optional video URL parameter
  // addedById = '68ecba72ffef4e0002407de1#0003' //LOCAL
  // addedById = '68dba1c6f258460002afd595#0005' //DEV
) {
  try {
    console.log(`📤 Uploading: ${fileName}`)

    // LOCAL ENVIRONMENT
    // const defaultUserId = '68ecba72ffef4e0002407de1#0005' // Fallback ID for "One Sports" user

    // DEV ENVIRONMENT
    // const defaultUserId = '68dba1c6f258460002afd595#0006' // Fallback ID for "One Sports" user

    // TEST ENVIRONMENT
    // const defaultUserId = '689579a9720a4d0002a21f3a#0013' // Fallback ID for "One Sports" user

    const addedById = usersMap['One']

    if (!usersMap['One']) {
      console.warn(
        `⚠️ No authorsMap entry for "One", skipping upload for image ${fileName}`
      )
      throw new Error(`No authorsMap entry for "One"`)
    }

    const { buffer, contentType } = await downloadImageBuffer(fileName)
    const dimensions = sizeOf(buffer)
    const decodedFileName = decodeURIComponent(fileName)

    // 🩹 Ensure caption is a string
    caption = caption && caption.trim() ? caption.trim() : ' '

    const formData = new FormData()
    formData.append('file', buffer, {
      filename: decodedFileName,
      contentType: contentType || 'image/jpeg',
    })

    // If videoUrl is provided, create as 'video' type with urls
    // Otherwise, create as 'photo' type
    if (videoUrl) {
      // For videos: only create video type with URL
      const videoData = {
        type: 'video',
        aliases: [`files/video/${decodedFileName}`],
        caption: caption,
        addedById,
        focusArea: {
          size: { height: 0, width: 0 },
          position: { vertical: 'top', horizontal: 'center' },
          zoom: 50,
        },
        info: {
          name: decodedFileName,
          type: contentType || 'image/jpeg',
          size: buffer.length,
          height: dimensions.height,
          width: dimensions.width,
        },
        urls: [videoUrl], // Video URL goes here
      }
      formData.append('data[0]', JSON.stringify(videoData))
      console.log(`📹 Creating media file as VIDEO type with URL: ${videoUrl}`)
    } else {
      // For articles: only create photo type
      const photoData = {
        type: 'photo',
        aliases: [`files/photo/${decodedFileName}`],
        caption: caption,
        addedById,
        focusArea: {
          size: { height: 0, width: 0 },
          position: { vertical: 'top', horizontal: 'center' },
          zoom: 50,
        },
        info: {
          name: decodedFileName,
          type: contentType || 'image/jpeg',
          size: buffer.length,
          height: dimensions.height,
          width: dimensions.width,
        },
      }
      formData.append('data[0]', JSON.stringify(photoData))
      console.log(`📷 Creating media file as PHOTO type`)
    }

    // Upload to API
    const columnsParam = 'image,fileName,caption,type,info,tags,urls'
    const API_ENDPOINT = `${config.api.baseUrl}${config.api.endpoints.mediaFiles}?columns=${columnsParam}`

    console.log(`🔗 Endpoint: ${API_ENDPOINT}`)

    const response = await axios.post(API_ENDPOINT, formData, {
      headers: {
        'x-migration-key': config.api.headers['x-migration-key'],
        ...formData.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    })

    console.log(`✅ Uploaded: ${fileName}`)

    // Extract the media file ID from response
    const mediaFileId = response.data.mediaFile?.id

    // NEW: Save the mapping after successful upload
    if (mediaFileId) {
      const mapping = loadImageMapping()
      const key = decodedFileName.toLowerCase()
      if (!mapping[key]) {
        // Only save if not already present (extra safety)
        mapping[key] = mediaFileId
        saveImageMapping(mapping)
        console.log(`💾 Saved new mapping for ${key}: ${mediaFileId}`)
      } else {
        console.log(`⏭️ Mapping for ${key} already exists, skipping save`)
      }
    } else {
      console.warn(`⚠️ No mediaFileId in response, skipping mapping save`)
    }

    // console.log('gere', response)
    return {
      data: response.data,
      mediaFileId,
      fileName: decodedFileName,
    }
  } catch (error) {
    console.error(`❌ Failed to upload ${fileName}:`, error.message)
    if (error.response) {
      console.error(`Response status: ${error.response.status}`)
      console.error(`Response data:`, error.response.data)
    }
    throw error
  }
}
