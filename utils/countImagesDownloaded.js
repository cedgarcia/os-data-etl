import fs from 'fs'
import path from 'path'

const folderPath = 'assets/complete-images'

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
    console.log(
      `COUNT OF IMAGES DOWNLOADED (in the "assets/complete-images" folder): ✅ ${count}`
    )
  )
  .catch((err) => console.error('Error:', err))
