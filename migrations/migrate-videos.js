import { migrateData } from '../index.js'
import { clearMappingsCache } from '../data/fetchMappings.js'
import { refreshMappings } from '../data/mappings.js'

const main = async () => {
  try {
    console.log('Starting VIDEO migration...')
    clearMappingsCache()
    await refreshMappings()

    await migrateData('videos', 'all', { batchSize: 5, maxBatches: 100 })
  } catch (error) {
    console.error('VIDEO migration failed:', error)
    process.exit(1)
  }
}

main()
