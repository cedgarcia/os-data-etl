import { migrateData } from './index.js'

const main = async () => {
  try {
    console.log('🏁 Starting leagues migration...')
    await migrateData('leagues', 'all', { batchSize: 20, maxBatches: null })
  } catch (error) {
    console.error('💥 Leagues migration failed:', error)
    process.exit(1)
  }
}

main()
