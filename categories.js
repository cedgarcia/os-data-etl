import { migrateData } from './index.js'

const main = async () => {
  try {
    console.log('🏁 Starting category migration...')
    await migrateData('categories', 'all', { batchSize: 18, maxBatches: null })
  } catch (error) {
    console.error('💥 Category migration failed:', error)
    process.exit(1)
  }
}

main()
