import { migrateData } from './index.js'
import { clearMappingsCache } from './data/fetchMappings.js'
import { refreshMappings } from './data/mappings.js'

const main = async () => {
  try {
    // console.log('🏁 Starting articles migration...')

    // Force refresh mappings to get all migrated users
    // console.log('📋 Refreshing mappings to include all migrated users...')
    clearMappingsCache() // Clear the cache first
    await refreshMappings() // Then refresh all mappings including usersMap

    console.log('✅ Mappings refreshed, starting article migration...')

    await migrateData('articles', 'all', { batchSize: 10, maxBatches: 10 })
  } catch (error) {
    console.error('💥 Articles migration failed:', error)
    process.exit(1)
  }
}

main()
