import { mapCategory } from '../data/categoryDataMapper.js'
import { mapArticle } from '../data/articleDataMapper.js'
import { mapSponsor } from '../data/sponsorDataMapper.js'
import { mapUser } from '../data/userDataMapper.js'

export const CONTENT_CONFIGS = {
  websites: {},

  users: {
    mapper: mapUser,
    endpoint: 'users',
    queryKey: 'users',
    displayName: 'USERS',
  },

  categories: {
    mapper: mapCategory,
    endpoint: 'categories',
    queryKey: 'categories',
    displayName: 'CATEGORIES',
  },

  sponsors: {
    mapper: mapSponsor,
    endpoint: 'sponsors',
    queryKey: 'sponsors',
    displayName: 'SPONSORS',
  },

  articles: {
    mapper: mapArticle,
    endpoint: 'contents',
    queryKey: 'articles',
    displayName: 'ARTICLES/STORIES',
  },
}

// Migration status tracking
export const createMigrationSummary = () => ({
  total: 0,
  successful: 0,
  failed: 0,
  errors: [],
})

