import fs from 'fs'
import path from 'path'
import axios from 'axios'
import sql from 'msnodesqlv8'
import FormData from 'form-data'
import sizeOf from 'image-size'
import config from './config/index.js'
import { usersMap } from './data/mappings.js'

const MAPPING_FILE = 'media-mapping.json' // one file for images + videos

// ---------------------------------------------------------------------
//  LOAD / SAVE MAPPING (filename → mediaFileId)
// ---------------------------------------------------------------------
function loadMediaMapping() {
  try {
    if (fs.existsSync(MAPPING_FILE)) {
      const data = fs.readFileSync(MAPPING_FILE, 'utf8')
      console.log(`Loaded media mapping from ${MAPPING_FILE}`)
      return JSON.parse(data)
    }
  } catch (e) {
    console.error('Error loading media mapping:', e.message)
  }
  return {}
}
function saveMediaMapping(mapping) {
  try {
    fs.writeFileSync(MAPPING_FILE, JSON.stringify(mapping, null, 2))
    console.log(`Media mapping saved to ${MAPPING_FILE}`)
  } catch (e) {
    console.error('Error saving media mapping:', e.message)
  }
}

// ---------------------------------------------------------------------
//  PUBLIC: get mediaFileId by filename (used by article & video mappers)
// ---------------------------------------------------------------------
export function getMediaFileIdByFilename(filename) {
  const mapping = loadMediaMapping()
  const key = decodeURIComponent(filename).toLowerCase()
  const id = mapping[key] || null
  if (id) console.log(`Found mediaFileId ${id} for ${key}`)
  else console.log(`No mediaFileId for ${key}`)
  return id
}

// ---------------------------------------------------------------------
//  DOWNLOAD (image) OR READ LOCAL (video) → Buffer
// ---------------------------------------------------------------------
export async function downloadMediaBuffer(filePathOrUrl) {
  // If it looks like a local path (starts with ./ or /) read from disk
  if (filePathOrUrl.startsWith('./') || filePathOrUrl.startsWith('/')) {
    const buffer = fs.readFileSync(filePathOrUrl)
    return { buffer, contentType: 'video/mp4' } // assume mp4 for local videos
  }

  // Otherwise treat as remote URL
  const response = await axios({
    url: filePathOrUrl,
    method: 'GET',
    responseType: 'arraybuffer',
  })
  return {
    buffer: response.data,
    contentType: response.headers['content-type'],
  }
}

// ---------------------------------------------------------------------
//  UPLOAD TO WEBINY (image OR video)
// ---------------------------------------------------------------------
export async function uploadMedia(
  fileName, // original filename (or URL for video)
  caption = '',
  mediaType = 'photo' // 'photo' | 'video'
) {
  try {
    console.log(`Uploading ${mediaType}: ${fileName}`)

    const addedById = usersMap['One']
    if (!addedById) throw new Error('No "One" user in usersMap')

    const { buffer, contentType } = await downloadMediaBuffer(fileName)
    const dimensions =
      mediaType === 'photo' ? sizeOf(buffer) : { width: 0, height: 0 }

    const decodedFileName = decodeURIComponent(
      fileName.split('/').pop() || fileName
    )

    // Ensure caption is a string
    caption = caption && caption.trim() ? caption.trim() : ' '

    const formData = new FormData()
    formData.append('file', buffer, {
      filename: decodedFileName,
      contentType:
        contentType || (mediaType === 'photo' ? 'image/jpeg' : 'video/mp4'),
    })

    // ---- PHOTO ----
    if (mediaType === 'photo') {
      formData.append(
        'data[0]',
        JSON.stringify({
          type: 'photo',
          aliases: [`files/photo/${decodedFileName}`],
          caption,
          addedById,
          info: {
            name: decodedFileName,
            type: contentType || 'image/jpeg',
            size: buffer.length,
            height: dimensions.height,
            width: dimensions.width,
          },
        })
      )
    }

    // ---- VIDEO ----
    if (mediaType === 'video') {
      formData.append(
        'data[0]',
        JSON.stringify({
          type: 'video',
          aliases: [`files/video/${decodedFileName}`],
          caption,
          addedById,
          info: {
            name: decodedFileName,
            type: contentType || 'video/mp4',
            size: buffer.length,
            height: dimensions.height,
            width: dimensions.width,
          },
          urls: [], // will be filled later if needed
        })
      )
    }

    const columnsParam = 'image,fileName,caption,type,info,tags'
    const API_ENDPOINT = `${config.api.baseUrl}${config.api.endpoints.mediaFiles}?columns=${columnsParam}`

    const response = await axios.post(API_ENDPOINT, formData, {
      headers: {
        'x-migration-key': config.api.headers['x-migration-key'],
        ...formData.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    })

    const mediaFileId = response.data.mediaFile?.id
    console.log(`Uploaded ${mediaType} ${decodedFileName} → ${mediaFileId}`)

    // ---- SAVE MAPPING ----
    if (mediaFileId) {
      const mapping = loadMediaMapping()
      const key = decodedFileName.toLowerCase()
      if (!mapping[key]) {
        mapping[key] = mediaFileId
        saveMediaMapping(mapping)
        console.log(`Saved mapping ${key} → ${mediaFileId}`)
      }
    }

    return { mediaFileId, fileName: decodedFileName }
  } catch (error) {
    console.error(`Failed to upload ${mediaType} ${fileName}:`, error.message)
    throw error
  }
}
