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

    // ****FOR FUTURE******
    // //media files
    // images: '/api/media-files/'
    // //main tags/leagues
    // tags: '/api/leagues'
  },
}

export default apiConfig
