import { migrateData } from '../index.js'
import { setEmailCounter } from '../data/userDataMapper.js'
import sql from 'msnodesqlv8'
import config from '../config/index.js'

const getExistingUserCount = async () => {
  const connectionString = config.database.connectionString
  const query = `SELECT COUNT(*) as count FROM success_migration_users`

  return new Promise((resolve, reject) => {
    sql.query(connectionString, query, (err, results) => {
      if (err) {
        console.warn(
          '⚠️ Could not fetch existing user count, starting from 0:',
          err.message
        )
        resolve(0)
      } else {
        resolve(results[0].count)
      }
    })
  })
}

const main = async () => {
  try {
    console.log('🏁 Starting users migration...')

    // Get the count of already migrated users to set the email counter correctly
    const existingCount = await getExistingUserCount()
    console.log(`📊 Found ${existingCount} existing migrated users`)
    console.log(
      `📧 Email counter will start from: contributor${
        existingCount + 1
      }@onecms.com`
    )

    // Set the counter to continue from where we left off
    setEmailCounter(existingCount)

    await migrateData('users', 'all', { batchSize: 55, maxBatches: 1 })
  } catch (error) {
    console.error('💥 Users migration failed:', error)
    process.exit(1)
  }
}

main()
