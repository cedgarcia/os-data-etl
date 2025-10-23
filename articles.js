import { migrateData } from './index.js'

const main = async () => {
  try {
    console.log('🏁 Starting articles migration...')
    await migrateData('articles', 'all', { batchSize: 20, maxBatches: 1 })
  } catch (error) {
    console.error('💥 Articles migration failed:', error)
    process.exit(1)
  }
}

main()
