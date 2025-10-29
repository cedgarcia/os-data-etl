import { migrateData } from '../index.js'
import { clearMappingsCache } from '../data/fetchMappings.js'
import { refreshMappings } from '../data/mappings.js'

const main = async () => {
  try {
    console.log('🏁 Starting category migration...')
    clearMappingsCache()
    await refreshMappings()
    await migrateData('categories', 'all', { batchSize: 18, maxBatches: null })
  } catch (error) {
    console.error('💥 Category migration failed:', error)
    process.exit(1)
  }
}

main()
