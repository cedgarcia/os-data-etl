import dotenv from 'dotenv'

dotenv.config()

const apiConfig = {
  baseUrl: process.env.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-migration-key': process.env.MIGRATION_KEY,
  },

  endpoints: {
    //users - contributors
    users: '/api/users/',
    //contents
    contents: '/api/contents/',
    //categories
    categories: '/api/categories/',
    //sponsors
    sponsors: '/api/management-items/',
    //media files
    mediaFiles: '/api/media-files/',
  },
}

export default apiConfig
