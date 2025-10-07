import sql from 'msnodesqlv8'
import axios from 'axios'
import config from './config/index.js'
import { mapArticle, mapCategory, mapSponsor, mapUser } from './data/index.js'
import { CONTENT_CONFIGS } from './utils/constants.js'

// Base private function for API calls
const postToWebiny = async (oldData, newData, endpoint) => {
  if (!endpoint || !config.api.endpoints[endpoint]) {
    throw new Error(
      `Invalid endpoint: ${endpoint}. Available: ${Object.keys(
        config.api.endpoints
      ).join(', ')}`
    )
  }

  const API_ENDPOINT = `${config.api.baseUrl}${config.api.endpoints[endpoint]}`
  console.log('📤 Posting to:', endpoint, '->', API_ENDPOINT)

  try {
    const response = await axios.post(API_ENDPOINT, newData, {
      headers: config.api.headers,
    })
    console.log('✅ Success:', endpoint, response.status)
    return response.data
  } catch (error) {
    console.error(
      '❌ API Error:',
      endpoint,
      error.response?.data || error.message
    )
    throw error
  }
}

// Specific functions for each endpoint
export const postContent = async (oldData, newData) => {
  return postToWebiny(oldData, newData, 'contents')
}

export const postCategory = async (oldData, newData) => {
  return postToWebiny(oldData, newData, 'categories')
}

export const postSponsor = async (oldData, newData) => {
  return postToWebiny(oldData, newData, 'sponsors')
}

export const postUser = async (oldData, newData) => {
  return postToWebiny(oldData, newData, 'users')
}

// Database query function
const readDatabaseQuery = async (contentType, queryType = 'test') => {
  try {
    const connectionString = config.database.connectionString
    const queryConfig = config.queries[contentType]

    if (!queryConfig) {
      throw new Error(`NO QUERIES CONFIGURE FOR : ${contentType} TYPE`)
    }

    if (!queryConfig[queryType]) {
      throw new Error(
        `No ${queryType} query found for ${contentType}. Available: ${Object.keys(
          queryConfig
        ).join(', ')}`
      )
    }

    const query = queryConfig[queryType]
    console.log('📊 Executing query:', contentType, queryType)

    return new Promise((resolve, reject) => {
      sql.query(connectionString, query, (err, results) => {
        if (err) {
          reject(err)
        } else {
          resolve(results)
        }
      })
    })
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

// Data mapping function
const mapData = async (contentType, data) => {
  switch (contentType) {
    case 'articles':
      const list = await Promise.all(data.map(async (item) => mapArticle(item)))

      console.log('list:', list)
      return list
    case 'categories':
      return await data.map((item) => mapCategory(item))
    case 'sponsors':
      return await data.map((item) => mapSponsor(item))
    case 'users':
      return await data.map((item) => mapUser(item))
    case 'websites':
      // Add website mapping if needed
      return data
    default:
      throw new Error(`No mapper found for ${contentType}`)
  }
}

// Post data based on content type
const postData = async (contentType, oldItem, newItem) => {
  switch (contentType) {
    case 'articles':
      return await postContent(oldItem, newItem)
    case 'categories':
      return await postCategory(oldItem, newItem)
    case 'sponsors':
      return await postSponsor(oldItem, newItem)
    case 'users':
      return await postUser(oldItem, newItem)
    case 'websites':
      console.log('⚠️  Website migration not implemented yet')
      return null
    default:
      throw new Error(`No post function for ${contentType}`)
  }
}

// Main migration function
// Main migration function
export const migrateData = async (contentType, queryType = 'test') => {
  try {
    console.log(`\n🚀 Starting migration for ${contentType} (${queryType})`)

    // Read data from database
    const oldData = await readDatabaseQuery(contentType, queryType)

    if (oldData.length === 0) {
      console.log('⚠️  No data found, skipping...')
      return
    }

    // Map data to new format and upload images in parallel
    const mappedDataPromises = oldData.map(async (oldItem, index) => {
      try {
        const newItem = await mapData(contentType, [oldItem])
        return { oldItem, newItem: newItem[0] } // Return both old and new data
      } catch (error) {
        console.error(
          `❌ Failed to map ${contentType} item ${index + 1}:`,
          error.message
        )
        return { oldItem, error: error.message }
      }
    })

    const mappedResults = await Promise.all(mappedDataPromises)
    console.log(`🔄 Mapped ${mappedResults.length} items`)

    // Post data to Webiny in parallel with controlled concurrency
    let successCount = 0
    let errorCount = 0

    // Process in batches to avoid overwhelming the API
    const batchSize = 5 // Adjust based on API rate limits
    for (let i = 0; i < mappedResults.length; i += batchSize) {
      const batch = mappedResults.slice(i, i + batchSize)
      console.log(`\n📤 Processing ${contentType} batch ${i / batchSize + 1}`)

      const postPromises = batch.map(
        async ({ oldItem, newItem, error }, index) => {
          if (error) {
            console.error(
              `❌ Skipping item ${i + index + 1} due to mapping error: ${error}`
            )
            return { success: false, error }
          }

          try {
            const result = await postData(contentType, oldItem, newItem)
            if (result) {
              console.log(
                `✅ Successfully migrated ${contentType} item ${i + index + 1}`
              )
              return { success: true }
            }
          } catch (error) {
            console.error(
              `❌ Failed to migrate ${contentType} item ${i + index + 1}:`,
              error.message
            )
            return { success: false, error: error.message }
          }
        }
      )

      const results = await Promise.all(postPromises)
      successCount += results.filter((r) => r.success).length
      errorCount += results.filter((r) => !r.success).length

      // Delay between batches to respect API rate limits
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    console.log(`\n🎉 ${contentType} migration completed!`)
    console.log(`✅ Success: ${successCount}`)
    console.log(`❌ Errors: ${errorCount}`)
    console.log(`📊 Total: ${mappedResults.length}`)

    return { successCount, errorCount, total: mappedResults.length }
  } catch (error) {
    console.error(`💥 Migration failed for ${contentType}:`, error)
    throw error
  }
}

// Batch migration function for multiple content types
export const migrateBatch = async (migrations = []) => {
  const results = {}

  for (const migration of migrations) {
    const { contentType, queryType } = migration
    try {
      results[contentType] = await migrateData(contentType, queryType)
    } catch (error) {
      results[contentType] = { error: error.message }
      console.error(`Failed to migrate ${contentType}:`, error)
    }

    // Delay between different content types
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  return results
}

// Main execution function
const main = async () => {
  try {
    console.log('🏁 Starting migration process...')
    console.log(
      '📋 Available content types:',
      Object.keys(CONTENT_CONFIGS)
        .filter((key) => CONTENT_CONFIGS[key].queryKey)
        .join(', ')
    )

    // Pre-upload images for articles
    console.log('📸 Pre-uploading images...')
    await migrateImages()

    // Define your migration sequence here
    const migrationPlan = [
      { contentType: 'categories', queryType: 'test' },
      { contentType: 'users', queryType: 'test' },
      { contentType: 'sponsors', queryType: 'test' },
      { contentType: 'articles', queryType: 'test' },
    ]

    const results = await migrateBatch(migrationPlan)

    console.log('\n🎊 All migrations completed!')
    console.log('📊 Results:', JSON.stringify(results, null, 2))
  } catch (error) {
    console.error('💥 Main execution failed:', error)
    process.exit(1)
  }
}
// Run main function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

// export default {
//   postContent,
//   postCategory,
//   postSponsor,
//   postUser,
//   migrateData,
//   migrateBatch,
// }

// await migrateData('categories', 'test')
// await migrateData('categories', 'batch')
// await migrateData('categories', 'all')
// await migrateData('categories', 'custom')

// await migrateData('users', 'test')
// await migrateData('users', 'batch')
// await migrateData('users', 'all')
// await migrateData('users', 'custom')

// await migrateData('articles', 'test')
await migrateData('articles', 'batch')
// await migrateData('articles', 'all')
// await migrateData('articles', 'custom')

// await migrateData('sponsors', 'test')
// await migrateData('articles', 'test')
