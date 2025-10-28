import { migrateData } from './index.js'
import { clearMappingsCache } from './data/fetchMappings.js'
import { refreshMappings } from './data/mappings.js'

const main = async () => {
  try {
    console.log('🏁 Starting leagues migration...')
    clearMappingsCache()
    await refreshMappings()
    await migrateData('leagues', 'all', { batchSize: 20, maxBatches: null })
  } catch (error) {
    console.error('💥 Leagues migration failed:', error)
    process.exit(1)
  }
}

main()
