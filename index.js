import sql from 'msnodesqlv8'
import axios from 'axios'
import config from './config/index.js'
import {
  mapArticle,
  mapCategory,
  mapSponsor,
  mapUser,
  mapLeague,
} from './data/index.js'
import { CONTENT_CONFIGS } from './utils/constants.js'

// ============================================
// LOGGING FUNCTIONS FOR ARTICLES
// ============================================

// Log successful article migration
const logSuccessArticle = async (oldItem, webinyData) => {
  const connectionString = config.database.connectionString

  // DEBUG: Log the entire response to see its structure
  console.log('📋 Full Webiny Response:', JSON.stringify(webinyData, null, 2))

  const webinyId = webinyData?.story?.id || null

  console.log(`🔍 Extracted WebinyID: ${webinyId}`)

  if (!webinyId) {
    console.warn('⚠️ Warning: No webinyId found in response!')
  }

  const query = `
    INSERT INTO success_migration_articles 
    (id, title, description, intro, slug, webinyid)
    VALUES (?, ?, ?, ?, ?, ?)
  `

  const params = [
    oldItem.id,
    oldItem.title || null,
    oldItem.description || null,
    oldItem.intro || null,
    oldItem.slug || null,
    webinyId,
  ]

  return new Promise((resolve, reject) => {
    sql.query(connectionString, query, params, (err, results) => {
      if (err) {
        // Check if the error is due to an existing record (duplicate)
        if (
          err.message.includes('Violation of PRIMARY KEY') ||
          err.message.includes('duplicate')
        ) {
          console.warn(
            `⚠️ DUPLICATE RECORD: Article ${oldItem.id} already exists in success_migration_articles`
          )
          reject({ type: 'duplicate', message: err.message })
        } else {
          console.error(
            `❌ ERROR: Failed to log success for article ${oldItem.id}:`,
            err.message
          )
          reject({ type: 'error', message: err.message })
        }
      } else {
        console.log(
          `✅ Logged successful migration for article ${oldItem.id} (${oldItem.title}) - WebinyID: ${webinyId}`
        )
        resolve(results)
      }
    })
  })
}

// Log failed article migration
const logFailure = async (oldItem, errorMsg) => {
  const connectionString = config.database.connectionString

  const columns = [
    'id',
    'parent',
    'type',
    'title',
    'description',
    'intro',
    'blurb',
    'keywords',
    'redirect',
    'url',
    'body',
    'thumbnail',
    'image',
    'banner',
    'caption',
    'post',
    'expiry',
    'author',
    'sequence',
    'visible',
    'target',
    'status',
    'category',
    'static',
    'video',
    'permalink',
    'audiolink',
    'videolink',
    'icon',
    'active',
    'sponsorid',
    'contributor',
    'created',
    'creator',
    'uploaded',
    'uploader',
    'updated',
    'updater',
    'channelid',
    'sectionid',
    'videotype',
    'videoid',
    'planid',
    'allowsearch',
    'subscribertypeid',
    'autoplay',
    'showinpromo',
    'ogimage',
    'ogthumbnail',
    'slug',
    'displayonhomepage',
    'hideadvertisement',
    'carousel',
    'carouselsequence',
    'columnid',
    'error_message',
  ]

  const placeholders = columns.map(() => '?').join(', ')
  const query = `INSERT INTO failedarticles (${columns.join(
    ', '
  )}) VALUES (${placeholders})`

  const params = columns.slice(0, -1).map((col) => oldItem[col] ?? null)
  params.push(errorMsg)

  return new Promise((resolve, reject) => {
    sql.query(connectionString, query, params, (err, results) => {
      if (err) {
        console.error(
          `❌ Failed to log article ${oldItem.id} to failedarticles:`,
          err.message
        )
        reject(err)
      } else {
        console.log(
          `📝 Logged failed article ${oldItem.id} to failedarticles: ${errorMsg}`
        )
        resolve(results)
      }
    })
  })
}

// ============================================
// LOGGING FUNCTIONS FOR SPONSORS
// ============================================

// Log successful sponsor migration
const logSuccessSponsor = async (oldItem, webinyData) => {
  const connectionString = config.database.connectionString

  // DEBUG: Log the entire response
  console.log('📋 Full Sponsor Response:', JSON.stringify(webinyData, null, 2))

  const webinyId = webinyData?.id || null

  console.log(`🔍 Extracted Sponsor WebinyID: ${webinyId}`)

  const query = `
    INSERT INTO success_migration_sponsors 
    (id, name, logo, link, description, status, webinyid, photodark, photolight)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `

  const params = [
    oldItem.id,
    oldItem.name,
    oldItem.logo,
    oldItem.link,
    oldItem.description,
    oldItem.status,
    webinyId,
    null, // photoDark
    null, // photoLight
  ]

  return new Promise((resolve, reject) => {
    sql.query(connectionString, query, params, (err, results) => {
      if (err) {
        // Check if the error is due to an existing record (duplicate)
        if (
          err.message.includes('Violation of PRIMARY KEY') ||
          err.message.includes('duplicate')
        ) {
          console.warn(
            `⚠️ DUPLICATE RECORD: Sponsor ${oldItem.id} already exists in success_migration_sponsors`
          )
          reject({ type: 'duplicate', message: err.message })
        } else {
          console.error(
            `❌ ERROR: Failed to log success for sponsor ${oldItem.id}:`,
            err.message
          )
          reject({ type: 'error', message: err.message })
        }
      } else {
        console.log(
          `✅ Logged successful migration for sponsor ${oldItem.id} (${oldItem.name}) - WebinyID: ${webinyId}`
        )
        resolve(results)
      }
    })
  })
}

// Log failed sponsor migration
const logFailedSponsor = async (oldItem, errorMsg) => {
  const connectionString = config.database.connectionString

  const query = `
    INSERT INTO failed_migration_sponsors 
    (id, name, logo, link, description, status, updater, updated, creator, created, error)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `

  const params = [
    oldItem.id,
    oldItem.name,
    oldItem.logo,
    oldItem.link,
    oldItem.description,
    oldItem.status,
    oldItem.updater || null,
    oldItem.updated || null,
    oldItem.creator || null,
    oldItem.created || null,
    errorMsg,
  ]

  return new Promise((resolve, reject) => {
    sql.query(connectionString, query, params, (err, results) => {
      if (err) {
        console.error(
          `❌ Failed to log error for sponsor ${oldItem.id}:`,
          err.message
        )
        reject(err)
      } else {
        console.log(
          `📝 Logged failed migration for sponsor ${oldItem.id}: ${errorMsg}`
        )
        resolve(results)
      }
    })
  })
}

// ============================================
// BASE API FUNCTIONS
// ============================================

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
    return response
  } catch (error) {
    console.error(
      '❌ API Error:',
      endpoint,
      error.response?.data || error.message
    )
    // Check if the API error indicates a duplicate
    if (error.response?.data?.message?.includes('already exists')) {
      throw {
        type: 'duplicate',
        message: error.response?.data?.message || error.message,
      }
    }
    throw {
      type: 'error',
      message: error.response?.data?.message || error.message,
    }
  }
}

export const postContent = async (oldData, newData) => {
  return postToWebiny(oldData, newData, 'contents')
}

export const postLeague = async (oldData, newData) => {
  return postToWebiny(oldData, newData, 'leagues')
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

// ============================================
// DATABASE QUERY FUNCTIONS
// ============================================

const getTotalCount = async (contentType) => {
  try {
    const connectionString = config.database.connectionString

    let countQuery
    if (contentType === 'articles') {
      countQuery = `
           SELECT COUNT(DISTINCT c.id) as total
        FROM contents c
        INNER JOIN contents_vertical cv ON c.id = cv.contentid
        WHERE cv.verticalid = 7 and type = 4 and status = 'Published'
      `
    } else if (contentType === 'sponsors') {
      countQuery = `SELECT COUNT(*) as total FROM sponsor`
    } else if (contentType === 'leagues') {
      countQuery = `SELECT COUNT(*) as total FROM vertical_subvertical`
    } else if (contentType === 'categories') {
      countQuery = `SELECT COUNT(*) as total FROM category`
    } else {
      countQuery = `SELECT COUNT(*) as total FROM ${contentType}`
    }

    return new Promise((resolve, reject) => {
      sql.query(connectionString, countQuery, (err, results) => {
        if (err) {
          reject(err)
        } else {
          resolve(results[0].total)
        }
      })
    })
  } catch (error) {
    console.error('Count query error:', error)
    throw error
  }
}

const readDatabaseQuery = async (
  contentType,
  queryType = 'test',
  offset = 0,
  limit = 10
) => {
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

    let query = queryConfig[queryType]

    if (queryType === 'batch' || queryType === 'all') {
      query = query
        .replace(/OFFSET\s+\d+\s+ROWS/i, `OFFSET ${offset} ROWS`)
        .replace(
          /FETCH\s+NEXT\s+\d+\s+ROWS\s+ONLY/i,
          `FETCH NEXT ${limit} ROWS ONLY`
        )
    }

    console.log(
      `📊 Executing query: ${contentType} ${queryType} (offset: ${offset}, limit: ${limit})`
    )

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

// ============================================
// DATA MAPPING AND POSTING
// ============================================

const mapData = async (contentType, data) => {
  switch (contentType) {
    case 'articles':
      const list = await Promise.all(data.map(async (item) => mapArticle(item)))
      // console.log('list:', list);
      return list
    case 'categories':
      return await Promise.all(data.map(async (item) => mapCategory(item)))
    case 'leagues':
      return await Promise.all(data.map(async (item) => mapLeague(item)))
    case 'sponsors':
      return await Promise.all(data.map(async (item) => mapSponsor(item)))
    case 'users':
      return await Promise.all(data.map(async (item) => mapUser(item)))
    case 'websites':
      return data
    default:
      throw new Error(`No mapper found for ${contentType}`)
  }
}

const postData = async (contentType, oldItem, newItem) => {
  switch (contentType) {
    case 'articles':
      return await postContent(oldItem, newItem)
    case 'categories':
      return await postCategory(oldItem, newItem)
    case 'leagues':
      return await postLeague(oldItem, newItem)
    case 'sponsors':
      return await postSponsor(oldItem, newItem)
    case 'users':
      return await postUser(oldItem, newItem)
    case 'websites':
      console.log('⚠️ Website migration not implemented yet')
      return null
    default:
      throw new Error(`No post function for ${contentType}`)
  }
}

// ============================================
// PROCESS BATCH WITH LOGGING
// ============================================

const processBatch = async (contentType, oldData) => {
  let successCount = 0
  let errorCount = 0
  let existingCount = 0

  // Check for already migrated articles
  const connectionString = config.database.connectionString
  const checkExistingQuery = `
    SELECT id FROM success_migration_articles 
    WHERE id IN (${oldData.map(() => '?').join(', ')})
  `

  // Get list of already migrated IDs
  const existingIds = await new Promise((resolve, reject) => {
    sql.query(
      connectionString,
      checkExistingQuery,
      oldData.map((item) => item.id),
      (err, results) => {
        if (err) {
          console.error('❌ Error checking existing articles:', err.message)
          reject(err)
        } else {
          resolve(results.map((row) => row.id))
        }
      }
    )
  })

  // Filter out already migrated articles
  const dataToProcess = oldData.filter((item) => !existingIds.includes(item.id))

  console.log(
    `📊 Processing ${dataToProcess.length} of ${
      oldData.length
    } records (skipped ${
      oldData.length - dataToProcess.length
    } already migrated)`
  )

  // Map data
  const mappedDataPromises = dataToProcess.map(async (oldItem, index) => {
    try {
      const newItem = await mapData(contentType, [oldItem])
      return { oldItem, newItem: newItem[0] }
    } catch (error) {
      console.error(
        `❌ Failed to map ${contentType} item ${index + 1}:`,
        error.message
      )
      if (contentType === 'articles') {
        await logFailure(oldItem, `Mapping error: ${error.message}`)
      } else if (contentType === 'sponsors') {
        await logFailedSponsor(oldItem, `Mapping error: ${error.message}`)
      }
      return { oldItem, error: error.message }
    }
  })

  const mappedResults = await Promise.all(mappedDataPromises)

  // Post data with controlled concurrency
  const postBatchSize = 5
  for (let i = 0; i < mappedResults.length; i += postBatchSize) {
    const batch = mappedResults.slice(i, i + postBatchSize)

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
            try {
              if (contentType === 'articles') {
                await logSuccessArticle(oldItem, result.data)
              } else if (contentType === 'sponsors') {
                await logSuccessSponsor(oldItem, result.data)
              }
              return { success: true }
            } catch (logError) {
              if (logError.type === 'duplicate') {
                console.warn(
                  `⚠️ Item ${i + index + 1} already exists in Webiny`
                )
                return {
                  success: false,
                  existing: true,
                  error: logError.message,
                }
              } else {
                console.error(
                  `❌ Failed to log success for ${contentType} item ${
                    i + index + 1
                  }`
                )
                return { success: false, error: logError.message }
              }
            }
          }
        } catch (error) {
          let errorMessage = error.message
          let isExisting = error.type === 'duplicate'
          if (!isExisting) {
            if (error.response?.data?.message?.includes('already exists')) {
              isExisting = true
              errorMessage = `Duplicate record: ${error.response.data.message}`
            }
          }
          console.error(
            `❌ Failed to migrate ${contentType} item ${i + index + 1}:`,
            errorMessage
          )
          if (contentType === 'articles') {
            await logFailure(oldItem, `Posting error: ${errorMessage}`)
          } else if (contentType === 'sponsors') {
            await logFailedSponsor(oldItem, `Posting error: ${errorMessage}`)
          }
          return { success: false, existing: isExisting, error: errorMessage }
        }
      }
    )

    const results = await Promise.all(postPromises)
    successCount += results.filter((r) => r.success).length
    errorCount += results.filter((r) => !r.success && !r.existing).length
    existingCount += results.filter((r) => r.existing).length

    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  // Add skipped (already migrated) records to existingCount
  existingCount += oldData.length - dataToProcess.length

  return { successCount, errorCount, existingCount }
}

// ============================================
// MAIN MIGRATION FUNCTION
// ============================================

export const migrateData = async (
  contentType,
  queryType = 'test',
  options = {}
) => {
  try {
    const { batchSize = 10, maxBatches = null, startOffset = 0 } = options

    console.log(`\n🚀 Starting migration for ${contentType} (${queryType})`)

    if (queryType === 'test' || queryType === 'custom') {
      const oldData = await readDatabaseQuery(contentType, queryType)

      if (oldData.length === 0) {
        console.log('⚠️ No data found, skipping...')
        return { successCount: 0, errorCount: 0, existingCount: 0, total: 0 }
      }

      const { successCount, errorCount, existingCount } = await processBatch(
        contentType,
        oldData
      )

      console.log(`\n🎉 ${contentType} migration completed!`)
      console.log(`✅ Success: ${successCount}`)
      console.log(`⚠️ Existing in Webiny: ${existingCount}`)
      console.log(`❌ Errors: ${errorCount}`)
      console.log(`📊 Total: ${oldData.length}`)

      return { successCount, errorCount, existingCount, total: oldData.length }
    }

    console.log(`📊 Fetching total count...`)
    const totalRecords = await getTotalCount(contentType)
    console.log(`📊 Total records to migrate: ${totalRecords}`)

    const totalBatches = Math.ceil(totalRecords / batchSize)
    const batchesToProcess = maxBatches
      ? Math.min(maxBatches, totalBatches)
      : totalBatches

    console.log(
      `📦 Will process ${batchesToProcess} batches of ${batchSize} records each`
    )

    let overallSuccessCount = 0
    let overallErrorCount = 0
    let overallExistingCount = 0 // New counter for existing records
    let currentOffset = startOffset

    for (let batchNum = 1; batchNum <= batchesToProcess; batchNum++) {
      console.log(`\n${'='.repeat(60)}`)
      console.log(
        `📦 BATCH ${batchNum}/${batchesToProcess} (offset: ${currentOffset})`
      )
      console.log('='.repeat(60))

      try {
        const oldData = await readDatabaseQuery(
          contentType,
          queryType,
          currentOffset,
          batchSize
        )

        if (oldData.length === 0) {
          console.log('⚠️ No more data, stopping...')
          break
        }

        console.log(`📥 Fetched ${oldData.length} records`)

        const { successCount, errorCount, existingCount } = await processBatch(
          contentType,
          oldData
        )

        overallSuccessCount += successCount
        overallErrorCount += errorCount
        overallExistingCount += existingCount

        console.log(`\n✅ Batch ${batchNum} completed!`)
        console.log(`  Success: ${successCount}/${oldData.length}`)
        console.log(`  Existing in Webiny: ${existingCount}/${oldData.length}`)
        console.log(`  Mapping failed: ${errorCount}/${oldData.length}`)
        console.log(
          `  Overall Progress: ${
            overallSuccessCount + overallErrorCount + overallExistingCount
          }/${totalRecords}`
        )

        currentOffset += batchSize

        if (batchNum < batchesToProcess) {
          console.log('⏳ Waiting 2 seconds before next batch...')
          await new Promise((resolve) => setTimeout(resolve, 2000))
        }
      } catch (error) {
        console.error(`❌ Batch ${batchNum} failed:`, error.message)
        overallErrorCount += batchSize
        currentOffset += batchSize

        console.log('⚠️ Continuing to next batch...')
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    }

    console.log(`\n${'='.repeat(60)}`)
    console.log('🎉 MIGRATION COMPLETED!')
    console.log('='.repeat(60))
    console.log(`✅ Total Successful Migrations: ${overallSuccessCount}`)
    console.log(`⚠️ Total Existing in Webiny: ${overallExistingCount}`)
    console.log(`❌ Total Failed Migrations: ${overallErrorCount}`)
    console.log(
      `📊 Total Processed: ${
        overallSuccessCount + overallErrorCount + overallExistingCount
      }`
    )
    console.log(`📊 Total Existing Migrations: ${totalRecords}`)

    return {
      successCount: overallSuccessCount,
      errorCount: overallErrorCount,
      existingCount: overallExistingCount,
      total: overallSuccessCount + overallErrorCount + overallExistingCount,
      totalAvailable: totalRecords,
    }
  } catch (error) {
    console.error(`💥 Migration failed for ${contentType}:`, error)
    throw error
  }
}

export const migrateBatch = async (migrations = []) => {
  const results = {}

  for (const migration of migrations) {
    const { contentType, queryType, options } = migration
    try {
      results[contentType] = await migrateData(contentType, queryType, options)
    } catch (error) {
      results[contentType] = { error: error.message }
      console.error(`Failed to migrate ${contentType}:`, error)
    }

    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  return results
}

// ============================================
// MAIN EXECUTION
// ============================================

// const main = async () => {
//   try {
//     console.log('🏁 Starting migration process...');
//     console.log(
//       '📋 Available content types:',
//       Object.keys(CONTENT_CONFIGS)
//         .filter((key) => CONTENT_CONFIGS[key].queryKey)
//         .join(', ')
//     );

//     const migrationPlan = [
//       {
//         contentType: 'sponsors',
//         queryType: 'all',
//         options: {
//           batchSize: 10,
//           maxBatches: null,
//           startOffset: 0,
//         },
//       },
//     ];

//     const results = await migrateBatch(migrationPlan);

//     console.log('\n🎊 All migrations completed!');
//     console.log('📊 Results:', JSON.stringify(results, null, 2));
//   } catch (error) {
//     console.error('💥 Main execution failed:', error);
//     process.exit(1);
//   }
// };

if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

// Examples
// await migrateData('articles', 'all', { batchSize: 10, maxBatches: 10 })

//  await migrateData('sponsors', 'all', { batchSize: 2, maxBatches: 2 })

// Test with first 50 records (5 batches of 10):
// await migrateData('articles', 'batch', { batchSize: 10, maxBatches: 5 })
//
// Resume from record 100:
// await migrateData('articles', 'all', { batchSize: 10, startOffset: 100 })
//
// Process single test record (no batching):
// await migrateData('articles', 'test')

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
// await migrateData('articles', 'batch')
// await migrateData('articles', 'all')
// await migrateData('articles', 'custom')

// await migrateData('sponsors', 'test')
// await migrateData('users', 'batch')
// await migrateData('users', 'all')
// await migrateData('users', 'custom')

// await migrateData('sponsors', 'test')
