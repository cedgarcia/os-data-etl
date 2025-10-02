import fs from 'fs'
import path from 'path'
import axios from 'axios'
import sql from 'msnodesqlv8'
import config from './config/index.js'

// const query = "select  image from contents where status = 'published'"
const query = `select image from contents where status = 'published' order by id offset [offsetValue] rows fetch next 5 rows only`

const folderPath = 'assets/images'
const baseImageUrl = 'https://1cms-img.imgix.net'

export async function downloadImage(fileName) {
  // Ensure the folder exists
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true })
  }

  const response = await axios({
    url: `${baseImageUrl}/${fileName}?auto=compress`,
    method: 'GET',
    responseType: 'stream',
  })

  const fullPath = path.join(folderPath, fileName)

  return new Promise((resolve, reject) => {
    response.data
      .pipe(fs.createWriteStream(fullPath))
      .on('finish', () => resolve(fullPath))
      .on('error', (err) => reject(err))
  })
}

// funcion to get images from article
async function getImages() {
  try {
    const queries = []
    const connectionString = config.database.connectionString

    for (let i = 0; i < 2; i++) {
      const offset = i * 100
      const currentQuery = query.replace('[offsetValue]', offset)
      queries.push(
        new Promise((resolve, reject) => {
          sql.query(connectionString, currentQuery, (err, results) => {
            if (err) {
              reject(err)
            } else {
              resolve(results.map((item) => encodeURIComponent(item.image)))
            }
          })
        })
      )
    }

    const res = await Promise.all(queries)
    console.log('results: ', res)

    let counter = 1
    for await (const batchImages of res) {
      console.log('Downloading batch number:', counter)

      const queries = batchImages.map((image) => downloadImage(image))
      await Promise.all(queries)
        .then(() => console.log('Batch done number:', counter))
        .catch((err) => console.log(`Batch ${counter} error:`, err.message))

      counter++
    }
  } catch (error) {
    throw error
  }
}

getImages()

//   .then((file) => console.log(`Downloaded to: ${file}`))
//   .catch(console.error)
