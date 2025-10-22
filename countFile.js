// countFiles.mjs
import fs from 'fs'
import path from 'path'

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

// Example usage:
const folderPath = 'assets/thumbnails' // Change this to your folder

countFilesInFolder(folderPath)
  .then((count) => console.log(`Number of files: ${count}`))
  .catch((err) => console.error('Error:', err))
