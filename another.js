import fs from 'fs'
import path from 'path'
import axios from 'axios'
import sql from 'msnodesqlv8'
import config from './config/index.js'

const query = `SELECT DISTINCT c.thumbnail
  FROM contents c
  INNER JOIN contents_vertical cv ON c.id = cv.contentid
  WHERE cv.verticalid = 7
    AND c.thumbnail IS NOT NULL
    AND c.thumbnail <> ''
    AND c.thumbnail <> '/'
  ORDER BY c.thumbnail
  OFFSET [offsetValue] ROWS FETCH NEXT 100 ROWS ONLY;`

const folderPath = 'assets/thumbnails'
const baseImageUrl = 'https://1cms-img.imgix.net'
const errorLogPath = 'thumbnail_error.txt'
const downloadLogPath = 'thumbnail_download_log.txt'

// Decode URL encoding and remove query parameters
function cleanFileName(fileName) {
  if (!fileName) return null
  let cleaned = fileName.split('?')[0]
  cleaned = decodeURIComponent(cleaned)
  cleaned = path.basename(cleaned)
  const ext = path.extname(cleaned) || '.jpg'
  return cleaned.includes('.') ? cleaned : `${cleaned}${ext}`
}

// Append a message to a log file
function logToFile(message, logPath = errorLogPath) {
  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] ${message}\n`
  fs.appendFileSync(logPath, logMessage, 'utf8')
}

export async function downloadImage(fileName, retries = 3) {
  if (!fileName || fileName === '/') {
    console.warn(`Skipping invalid filename: ${fileName}`)
    logToFile(`Invalid filename skipped: ${fileName}`, errorLogPath)
    return Promise.resolve(null)
  }

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true })
  }

  const cleanedFileName = cleanFileName(fileName)
  if (!cleanedFileName) {
    console.warn(`Skipping invalid cleaned filename: ${cleanedFileName}`)
    logToFile(
      `Invalid cleaned filename skipped: ${cleanedFileName}`,
      errorLogPath
    )
    return Promise.resolve(null)
  }

  const fullPath = path.join(folderPath, cleanedFileName)
  if (fs.existsSync(fullPath) && fs.lstatSync(fullPath).isDirectory()) {
    console.warn(`Skipping directory path: ${fullPath}`)
    logToFile(`Directory path skipped: ${fullPath}`, errorLogPath)
    return Promise.resolve(null)
  }

  // Skip if file already exists
  if (fs.existsSync(fullPath)) {
    console.log(`File already exists: ${cleanedFileName}`)
    logToFile(`File already exists: ${cleanedFileName}`, downloadLogPath)
    return Promise.resolve(fullPath)
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios({
        url: `${baseImageUrl}/${fileName}?auto=compress`,
        method: 'GET',
        responseType: 'stream',
      })

      return new Promise((resolve, reject) => {
        response.data
          .pipe(fs.createWriteStream(fullPath))
          .on('finish', () => {
            logToFile(
              `Successfully downloaded: ${cleanedFileName}`,
              downloadLogPath
            )
            resolve(fullPath)
          })
          .on('error', (err) => reject(err))
      })
    } catch (err) {
      if (attempt === retries) {
        console.warn(
          `Failed to download ${fileName} after ${retries} attempts: ${err.message}`
        )
        logToFile(
          `Failed to download ${fileName}: ${err.message}`,
          errorLogPath
        )
        return Promise.resolve(null)
      }
      await new Promise((resolve) => setTimeout(resolve, 1000)) // 1s delay between retries
    }
  }
}

async function getImages(targetBatch = null, startBatch = 0, endBatch = 203) {
  try {
    const connectionString = config.database.connectionString

    if (targetBatch !== null) {
      startBatch = targetBatch
      endBatch = targetBatch
    }

    // Clear log files at the start
    if (fs.existsSync(errorLogPath)) {
      fs.unlinkSync(errorLogPath)
    }
    if (fs.existsSync(downloadLogPath)) {
      fs.unlinkSync(downloadLogPath)
    }

    // Track unique thumbnails
    const uniqueThumbnails = new Set()
    let totalValidThumbnails = 0
    let totalInvalidThumbnails = 0

    const queries = []

    // Process 204 batches (20,292 distinct thumbnails / 100 ≈ 203.92)
    for (let i = startBatch; i <= endBatch; i++) {
      const offset = i * 100
      const currentQuery = query.replace('[offsetValue]', offset)
      queries.push(
        new Promise((resolve, reject) => {
          sql.query(connectionString, currentQuery, (err, results) => {
            if (err) {
              logToFile(
                `Batch ${i} database query failed: ${err.message}`,
                errorLogPath
              )
              reject(err)
            } else if (!results.length) {
              logToFile(`Batch ${i} returned no results`, errorLogPath)
              resolve([])
            } else {
              let invalidCount = 0
              const validThumbnails = results
                .map((item, index) => {
                  if (
                    !item.thumbnail ||
                    item.thumbnail.trim() === '' ||
                    item.thumbnail === '/'
                  ) {
                    logToFile(
                      `Batch ${i}, row ${index}: Invalid thumbnail value: ${item.thumbnail}`,
                      errorLogPath
                    )
                    invalidCount++
                    return null
                  }
                  uniqueThumbnails.add(item.thumbnail) // No duplicate check needed with DISTINCT
                  return item.thumbnail
                })
                .filter((item) => item !== null)
              totalValidThumbnails += validThumbnails.length
              totalInvalidThumbnails += invalidCount
              logToFile(
                `Batch ${i} summary: ${validThumbnails.length} valid thumbnails, ${invalidCount} invalid thumbnails`,
                errorLogPath
              )
              console.log(`Batch ${i} thumbnails:`, validThumbnails)
              resolve(validThumbnails)
            }
          })
        })
      )
    }

    const res = await Promise.all(queries)
    console.log('Number of batches to process:', res.length)
    logToFile(
      `Total valid thumbnails: ${totalValidThumbnails}, Total invalid thumbnails: ${totalInvalidThumbnails}, Unique thumbnails: ${uniqueThumbnails.size}`,
      errorLogPath
    )

    let counter = startBatch
    for await (const batchThumbnails of res) {
      console.log('Downloading batch number:', counter)
      if (!batchThumbnails.length) {
        console.log(`Batch ${counter} has no thumbnails to download`)
      } else {
        const queries = batchThumbnails.map((thumbnail) =>
          downloadImage(thumbnail)
        )
        await Promise.all(queries)
          .then(() => console.log('Batch done number:', counter))
          .catch((err) => {
            console.log(`Batch ${counter} error:`, err.message)
            logToFile(
              `Batch ${counter} download error: ${err.message}`,
              errorLogPath
            )
          })
      }
      counter++
    }

    // Log final summary
    const downloadedFiles = fs.existsSync(folderPath)
      ? fs.readdirSync(folderPath).length
      : 0
    logToFile(
      `Final summary: ${totalValidThumbnails} valid thumbnails processed, ${uniqueThumbnails.size} unique thumbnails, ${downloadedFiles} files downloaded`,
      errorLogPath
    )

    // Check for missing downloads
    if (downloadedFiles < uniqueThumbnails.size) {
      console.warn(
        `Missing ${
          uniqueThumbnails.size - downloadedFiles
        } downloads. Check ${errorLogPath} for failures.`
      )
    }
  } catch (error) {
    console.error('Error in getImages:', error.message)
    logToFile(`General error in getImages: ${error.message}`, errorLogPath)
    throw error
  }
}

getImages()
