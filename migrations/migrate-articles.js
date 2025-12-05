import { migrateData } from '../index.js'
import { clearMappingsCache } from '../data/fetchMappings.js'
import { refreshMappings } from '../data/mappings.js'

const main = async () => {
  try {
    console.log('Starting articles migration...')
    clearMappingsCache()
    await refreshMappings()
    console.log('Mappings refreshed.')

    await migrateData('articles', 'all', { batchSize: 100, maxBatches: null })
    // await migrateData('articles', 'all', { batchSize: 1, maxBatches: 1 })
  } catch (error) {
    console.error('Articles migration failed:', error)
    process.exit(1)
  }
}

main()
