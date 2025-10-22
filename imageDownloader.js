import fs from 'fs'
import path from 'path'
import axios from 'axios'
import sql from 'msnodesqlv8'
import FormData from 'form-data'
import sizeOf from 'image-size'
import config from './config/index.js'

// const query = `select image, caption from contents where status = 'published' order by id offset [offsetValue] rows fetch next 1 rows only`

const query = `
  SELECT c.image, c.caption
  FROM contents c
  INNER JOIN contents_vertical cv ON c.id = cv.contentid
  WHERE cv.verticalid = 7
`
// const folderPath = 'assets/images'
const baseImageUrl = './assets/images2'
const IMAGE_MAPPING_FILE = 'image-mapping.json' // Store the mapping

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
  // addedById = '68ecba72ffef4e0002407de1#0003' //LOCAL
  addedById = '68dba1c6f258460002afd595#0005' //DEV
) {
  try {
    console.log(`📤 Uploading: ${fileName}`)

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

    formData.append(
      'data[0]',
      JSON.stringify({
        type: 'story',
        aliases: [`files/story/${decodedFileName}`],
        caption: caption,
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

    formData.append(
      'data[1]',
      JSON.stringify({
        type: 'video',
        aliases: [`files/video/${decodedFileName}`],
        caption: caption,
        addedById,
        info: {
          name: decodedFileName,
          type: contentType || 'image/jpeg',
          size: buffer.length,
          height: dimensions.height,
          width: dimensions.width,
        },
        urls: [''],
      })
    )

    // Upload to API
    const columnsParam = 'image,fileName,caption,type,info,tags'
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

// Function to get images from database and upload them
// async function migrateImages() {
//   try {
//     const queries = []
//     const connectionString = config.database.connectionString

//     // Load existing mapping
//     const imageMapping = loadImageMapping()

//     // Process 2 batches of 5 images each
//     for (let i = 0; i < 2; i++) {
//       const offset = i * 100
//       const currentQuery = query.replace('[offsetValue]', offset)

//       queries.push(
//         new Promise((resolve, reject) => {
//           sql.query(connectionString, currentQuery, (err, results) => {
//             if (err) {
//               reject(err)
//             } else {
//               resolve(
//                 results.map((item) => ({
//                   fileName: encodeURIComponent(item.image),
//                   caption:
//                     item.caption && item.caption.trim()
//                       ? item.caption.trim()
//                       : ' ',
//                 }))
//               )
//             }
//           })
//         })
//       )
//     }

//     const res = await Promise.all(queries)
//     console.log(`📊 Total batches: ${res.length}`)

//     let counter = 1
//     let totalSuccess = 0
//     let totalErrors = 0

//     for await (const batchImages of res) {
//       console.log(`\n🔄 Processing batch ${counter}/${res.length}`)
//       console.log(`📦 Images in batch: ${batchImages.length}`)

//       for (const { fileName, caption } of batchImages) {
//         try {
//           const decodedFileName = decodeURIComponent(fileName)

//           // Skip if already uploaded
//           // if (imageMapping[decodedFileName]) {
//           //   console.log(`⏭️  Skipping (already uploaded): ${decodedFileName}`)
//           //   totalSuccess++
//           //   continue
//           // }

//           const result = await uploadToWebiny(fileName, caption)
//           console.log('result:', result)

//           // Store the mapping: original filename -> Webiny media file ID
//           if (result.mediaFileId) {
//             imageMapping[result.fileName] = result.mediaFileId
//             console.log(
//               `💾 Mapped: ${result.fileName} -> ${result.mediaFileId}`
//             )
//           }

//           totalSuccess++

//           // Small delay to avoid overwhelming the API
//           await new Promise((resolve) => setTimeout(resolve, 500))
//         } catch (error) {
//           totalErrors++
//           console.error(`Error uploading ${fileName}:`, error.message)
//         }
//       }

//       console.log(`✅ Batch ${counter} completed`)
//       counter++
//     }

//     // Save the mapping after all uploads
//     saveImageMapping(imageMapping)

//     console.log('\n🎉 Migration completed!')
//     console.log(`✅ Success: ${totalSuccess}`)
//     console.log(`❌ Errors: ${totalErrors}`)
//     console.log(`📊 Total: ${totalSuccess + totalErrors}`)
//   } catch (error) {
//     console.error('💥 Migration failed:', error)
//     throw error
//   }
// }

// // Export function to get media file ID by filename
// export function getMediaFileIdByFilename(filename) {
//   const mapping = loadImageMapping()
//   return mapping[filename] || null
// }

// Run the migration
// migrateImages()
