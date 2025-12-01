import fs from 'fs'
import path from 'path'

const folderPath = 'assets/complete-images-nov1'

async function countFilesInFolder(folderPath) {
  return new Promise((resolve, reject) => {
    fs.readdir(folderPath, (err, files) => {
      if (err) return reject(err)

      let fileCount = 0
      files.forEach((file) => {
        const fullPath = path.join(folderPath, file)
        if (fs.statSync(fullPath).isFile()) {
          fileCount++
        }
      })

      resolve(fileCount)
    })
  })
}

countFilesInFolder(folderPath)
  .then((count) =>
    // Should be 20291 as of September
    // Should be 21936 as of November
    console.log(
      `COUNT OF IMAGES DOWNLOADED (in the "assets/complete-images-nov" folder): ✅ ${count}`
    )
  )
  .catch((err) => console.error('Error:', err))
