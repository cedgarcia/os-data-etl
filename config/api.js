import dotenv from 'dotenv'

dotenv.config()

const apiConfig = {
  baseUrl: process.env.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-migration-key': process.env.MIGRATION_KEY,
  },

  endpoints: {
    // users - contributors
    users: '/api/users/',
    // contents
    contents: '/api/contents/',
    // categories
    categories: '/api/categories/',
    // sponsors
    sponsors: '/api/management-items/',
    // media files
    mediaFiles: '/api/media-files/',
    // websites
    websites: '/api/websites/',
    // leagues
    leagues: '/api/leagues/',
    // roles
    roles: '/api/roles/',
  },
}

export default apiConfig
