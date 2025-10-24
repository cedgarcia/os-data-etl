import fs from 'fs'
import path from 'path'
import axios from 'axios'
import sql from 'msnodesqlv8'
import config from '../config/index.js'

// const query = `SELECT c.image
//   FROM contents c
//   INNER JOIN contents_vertical cv ON c.id = cv.contentid
//   WHERE cv.verticalid = 7
//     AND c.type = 4
//     AND c.status = 'Published'
//   ORDER BY c.id
//   OFFSET [offsetValue] ROWS FETCH NEXT 100 ROWS ONLY;`

const query = `SELECT c.image
FROM contents c
INNER JOIN contents_vertical cv ON c.id = cv.contentid
WHERE cv.verticalid = 7
ORDER BY c.id
OFFSET [offsetValue] ROWS FETCH NEXT 100 ROWS ONLY;`

const folderPath = 'assets/complete'
const baseImageUrl = 'https://1cms-img.imgix.net'

// Decode URL encoding and remove query parameters
function cleanFileName(fileName) {
  if (!fileName) return null
  let cleaned = fileName.split('?')[0]
  cleaned = decodeURIComponent(cleaned)
  cleaned = path.basename(cleaned) // Ensure we get only the filename
  return cleaned
}

export async function downloadImage(fileName) {
  if (!fileName || fileName === '/' || !fileName.includes('.')) {
    console.warn(`Skipping invalid filename: ${fileName}`)
    return Promise.resolve(null) // Skip invalid files
  }

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true })
  }

  const cleanedFileName = cleanFileName(fileName)
  if (
    !cleanedFileName ||
    cleanedFileName === '/' ||
    !cleanedFileName.includes('.')
  ) {
    console.warn(`Skipping invalid cleaned filename: ${cleanedFileName}`)
    return Promise.resolve(null)
  }

  const fullPath = path.join(folderPath, cleanedFileName)
  if (fs.existsSync(fullPath) && fs.lstatSync(fullPath).isDirectory()) {
    console.warn(`Skipping directory path: ${fullPath}`)
    return Promise.resolve(null)
  }

  try {
    const response = await axios({
      url: `${baseImageUrl}/${fileName}?auto=compress`,
      method: 'GET',
      responseType: 'stream',
    })

    return new Promise((resolve, reject) => {
      response.data
        .pipe(fs.createWriteStream(fullPath))
        .on('finish', () => resolve(fullPath))
        .on('error', (err) => reject(err))
    })
  } catch (err) {
    console.warn(`Failed to download ${fileName}: ${err.message}`)
    return Promise.resolve(null)
  }
}

async function getImages(targetBatch = null, startBatch = 0, endBatch = 299) {
  try {
    const connectionString = config.database.connectionString

    if (targetBatch !== null) {
      startBatch = targetBatch
      endBatch = targetBatch
    }

    const queries = []

    for (let i = startBatch; i <= endBatch; i++) {
      const offset = i * 100
      const currentQuery = query.replace('[offsetValue]', offset)
      queries.push(
        new Promise((resolve, reject) => {
          sql.query(connectionString, currentQuery, (err, results) => {
            if (err) {
              reject(err)
            } else if (!results.length) {
              resolve([])
            } else {
              const validImages = results
                .map((item) => item.image)
                .filter(
                  (image) =>
                    image &&
                    image.trim() !== '' &&
                    image !== '/' &&
                    image.includes('.')
                )
                .map((image) => encodeURIComponent(image))
              console.log(`Batch ${i} images:`, validImages) // Log for debugging
              resolve(validImages)
            }
          })
        })
      )
    }

    const res = await Promise.all(queries)
    console.log('Number of batches to process:', res.length)

    let counter = startBatch
    for await (const batchImages of res) {
      console.log('Downloading batch number:', counter)
      const queries = batchImages.map((image) => downloadImage(image))
      await Promise.all(queries)
        .then(() => console.log('Batch done number:', counter))
        .catch((err) => console.log(`Batch ${counter} error:`, err.message))
      counter++
    }
  } catch (error) {
    console.error('Error in getImages:', error.message)
    throw error
  }
}

getImages()
