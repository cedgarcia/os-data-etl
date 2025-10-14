import axios from 'axios'
import FormData from 'form-data'
import config from '../config/index.js'

const baseImageUrl = 'https://1cms-img.imgix.net'

// Download image to buffer
async function downloadImageBuffer(fileName) {
  const response = await axios({
    url: `${baseImageUrl}/${fileName}?auto=compress`,
    method: 'GET',
    responseType: 'arraybuffer',
  })

  return {
    buffer: Buffer.from(response.data),
    contentType: response.headers['content-type'],
  }
}

// Upload sponsor logo to Webiny using /media-files/upload endpoint
async function uploadSponsorLogo(fileName) {
  try {
    console.log(`📤 Uploading sponsor logo: ${fileName}`)

    const { buffer, contentType } = await downloadImageBuffer(fileName)
    const decodedFileName = decodeURIComponent(fileName)

    const formData = new FormData()
    formData.append('file', buffer, {
      filename: decodedFileName,
      contentType: contentType || 'image/jpeg',
    })

    formData.append(
      'data',
      JSON.stringify({
        tags: ['sponsor'],
        aliases: [`files/sponsor/${decodedFileName}`],
      })
    )

    // Use the /upload endpoint
    const API_ENDPOINT = `${config.api.baseUrl}${config.api.endpoints.mediaFiles}upload`

    console.log(`🔗 Uploading to: ${API_ENDPOINT}`)

    const response = await axios.post(API_ENDPOINT, formData, {
      headers: {
        'x-migration-key': config.api.headers['x-migration-key'],
        ...formData.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    })

    console.log(`✅ Uploaded sponsor logo: ${fileName}`)

    // Extract the src from response
    const src = response.data.src

    if (!src) {
      throw new Error('No src returned from upload API')
    }

    console.log(`📸 Image src: ${src}`)

    return {
      src,
      fileName: decodedFileName,
    }
  } catch (error) {
    console.error(`❌ Failed to upload sponsor logo ${fileName}:`, error.message)
    if (error.response) {
      console.error(`Response status: ${error.response.status}`)
      console.error(`Response data:`, error.response.data)
    }
    throw error
  }
}

export const mapSponsor = async (old) => {
  let photoDarkUrl = null

  // Upload logo if it exists
  if (old.logo && old.logo.trim()) {
    try {
      const uploadResult = await uploadSponsorLogo(old.logo)
      // The src is already in the format: sourcelink/webinyid/nameofimage
      // Example: https://d19wabo2tnjdcs.cloudfront.net/files/68ecc814aa1fd0000294934b/testtest.jpg
      photoDarkUrl = uploadResult.src
      console.log(`✅ Sponsor logo uploaded: ${old.logo} -> ${photoDarkUrl}`)
    } catch (error) {
      console.error(`⚠️  Failed to upload sponsor logo for ${old.name}:`, error.message)
      // Continue without the logo rather than failing the entire sponsor migration
    }
  }

  return {
    // NEW : OLD
    type: 'sponsor', 
    name: old.name,
    description: old.description,
    link: old.link,
    photoDark: photoDarkUrl || 'https://d19wabo2tnjdcs.cloudfront.net/files/68ecc814aa1fd0000294934b/testtest.jpg',
    photoLight: photoDarkUrl || "https://d19wabo2tnjdcs.cloudfront.net/files/68ecc814aa1fd0000294934b/testtest.jpg", 
    refs: [
      {
        model: 'addedBy',
        id: '68ecba72ffef4e0002407de1#0002',
        modelId: 'users',
      },
      {
        model: 'updatedBy',
        id: '68ecba72ffef4e0002407de1#0002',
        modelId: 'users',
      },
    ],
  }
}