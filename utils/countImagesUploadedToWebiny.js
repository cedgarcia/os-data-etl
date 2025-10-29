import fs from 'fs'

// Path to your JSON file
const filePath = './logs/dev-image-uploaded.json'

try {
  // Read the file contents
  const data = fs.readFileSync(filePath, 'utf8')

  // Parse the JSON
  const json = JSON.parse(data)

  // Count the keys (image names)
  const count = Object.keys(json).length

  console.log(` Total images uploaded to webiny: ✅ ${count}`)
} catch (err) {
  console.error('❌ Error reading or parsing file:', err)
}
