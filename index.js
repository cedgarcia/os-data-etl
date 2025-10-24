/**
 * Migration Script
 *
 * This script migrates data from a legacy database to a new Webiny CMS instance.
 * It supports migrating articles, sponsors, leagues, categories, and users.
 *
 * The migration process includes:
 * 1. Fetching data from the legacy database in batches.
 * 2. Mapping the old data structure to the new Webiny CMS structure.
 * 3. Posting the mapped data to the Webiny CMS via its API.
 * 4. Logging successes and failures for each record.
 * 5. Handling duplicates and errors gracefully.
 *
 *
 * PRIORITY MIGRATION ORDER:
 * 1. Leagues ✅
 * 2. Categories ✅
 * 3. Users (contributors) ✅
 * 4. Sponsors (Cancelled)   ❌
 * 5. Articles (main content)  ✅
 * 6. Videos (Not finished yet)  ❌
 */

import sql from 'msnodesqlv8'
import axios from 'axios'
import pLimit from 'p-limit'
import config from './config/index.js'
import { getMappings } from './data/fetchMappings.js'
import {
  mapArticle,
  mapCategory,
  mapSponsor,
  mapUser,
  mapLeague,
} from './data/index.js'

import { CONTENT_CONFIGS } from './utils/constants.js'
import {
  logSuccessArticle,
  logFailure,
  logSuccessSponsor,
  logFailedSponsor,
  logSuccessLeague,
  logFailedLeague,
  logSuccessCategory,
  logFailedCategory,
  logSuccessUser,
  logFailedUser,
} from './utils/loggers.js'

// ============================================
// POST TO WEBINY API FUNCTIONS
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

export const postLeague = async (oldData, newData) => {
  return postToWebiny(oldData, newData, 'leagues')
}

export const postCategory = async (oldData, newData) => {
  return postToWebiny(oldData, newData, 'categories')
}

export const postUser = async (oldData, newData) => {
  return postToWebiny(oldData, newData, 'users')
}

export const postSponsor = async (oldData, newData) => {
  return postToWebiny(oldData, newData, 'sponsors')
}

export const postContent = async (oldData, newData) => {
  return postToWebiny(oldData, newData, 'contents')
}

// export const postVideo= async (oldData, newData) => {
//   return postToWebiny(oldData, newData, 'videos')
// }

// ============================================
// DATABASE QUERY FUNCTIONS
// ============================================
const getTotalCount = async (contentType) => {
  try {
    const connectionString = config.database.connectionString
    let countQuery

    switch (contentType) {
      case 'leagues':
        countQuery = `SELECT COUNT(*) as total FROM vertical_subvertical`
        break

      case 'categories':
        countQuery = `SELECT COUNT(*) as total FROM category`
        break

      case 'users':
        countQuery = `
          SELECT COUNT(DISTINCT c.author) as total
          FROM contents c
          INNER JOIN contents_vertical cv ON c.id = cv.contentid
          WHERE cv.verticalid = 7
        `
        break

      case 'sponsors':
        countQuery = `SELECT COUNT(*) as total FROM sponsor`
        break

      case 'articles':
        countQuery = `
          SELECT COUNT(DISTINCT c.id) as total
          FROM contents c
          INNER JOIN contents_vertical cv ON c.id = cv.contentid
          WHERE cv.verticalid = 7 and type = 4 and status = 'Published'
        `
        break

      // case 'videos':
      //   countQuery = `
      //     SELECT COUNT(DISTINCT c.id) as total
      //     FROM contents c
      //     INNER JOIN contents_vertical cv ON c.id = cv.contentid
      //     WHERE cv.verticalid = 7 and type = 5 and status = 'Published'
      //   `
      //   break

      default:
        countQuery = `SELECT COUNT(*) as total FROM ${contentType}`
        break
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

// ============================================
// READ FROM DATABASE QUERY
// ============================================
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
// CHECK EXISTING IN WEBINY (NEW FUNCTION FOR ARTICLES)
// ============================================
const checkContentExists = async (legacyId) => {
  try {
    const query = {
      where: {
        _and: [
          { field: 'deletedOn', value: null },
          { field: 'legacyId', value: String(legacyId) },
        ],
      },
      columns: ['id'],
      limit: 1,
    }
    const encodedQ = encodeURIComponent(JSON.stringify(query))
    const endpoint = `${config.api.baseUrl}/api/contents?q=${encodedQ}`
    const response = await axios.get(endpoint, {
      headers: config.api.headers,
    })

    let dataArray = []
    if (Array.isArray(response.data.list)) {
      dataArray = response.data.list
    } else if (Array.isArray(response.data.data)) {
      dataArray = response.data.data
    } else if (Array.isArray(response.data.items)) {
      dataArray = response.data.items
    } else if (Array.isArray(response.data)) {
      dataArray = response.data
    }

    return dataArray.length > 0
  } catch (error) {
    console.error(
      `❌ Error checking content existence for legacyId ${legacyId}:`,
      error.message
    )
    // Assume it does not exist if check fails, to avoid skipping due to error
    return false
  }
}

// ============================================
// DATA MAPPING AND POSTING
// ============================================

const mapData = async (contentType, data) => {
  switch (contentType) {
    case 'leagues':
      return await Promise.all(data.map(async (item) => mapLeague(item)))
    case 'categories':
      return await Promise.all(data.map(async (item) => mapCategory(item)))
    case 'users':
      return await Promise.all(
        data.map(async (item, index) => mapUser(item, index))
      )
    case 'sponsors':
      return await Promise.all(data.map(async (item) => mapSponsor(item)))
    case 'articles':
      return await Promise.all(data.map(async (item) => mapArticle(item)))
    // case 'videos':
    //   return await Promise.all(data.map(async (item) => mapVideo(item)))
    case 'websites':
      return data
    default:
      throw new Error(`No mapper found for ${contentType}`)
  }
}
const postData = async (contentType, oldItem, newItem) => {
  switch (contentType) {
    case 'leagues':
      return await postLeague(oldItem, newItem)
    case 'categories':
      return await postCategory(oldItem, newItem)
    case 'users':
      return await postUser(oldItem, newItem)
    case 'sponsors':
      return await postSponsor(oldItem, newItem)
    case 'articles':
      return await postContent(oldItem, newItem)
    case 'videos':
      return await postContent(oldItem, newItem)
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

  // Limit concurrency for API posts and database queries
  const limit = pLimit(10)

  // Check for already migrated records
  const connectionString = config.database.connectionString
  let checkExistingQuery

  switch (contentType) {
    case 'leagues':
      checkExistingQuery = `
        SELECT id FROM success_migration_leagues 
        WHERE id IN (${oldData.map(() => '?').join(', ')})
      `
      break
    case 'categories':
      checkExistingQuery = `
        SELECT id FROM success_migration_categories 
        WHERE id IN (${oldData.map(() => '?').join(', ')})
      `
      break
    case 'users':
      checkExistingQuery = `
          SELECT author FROM success_migration_users 
          WHERE author IN (${oldData.map(() => '?').join(', ')})
        `
      break
    case 'sponsors':
      checkExistingQuery = `
          SELECT id FROM success_migration_sponsors 
          WHERE id IN (${oldData.map(() => '?').join(', ')})
        `
      break
    case 'articles':
      checkExistingQuery = `
        SELECT id FROM success_migration_articles 
        WHERE id IN (${oldData.map(() => '?').join(', ')})
      `
    // case 'videos':
    //   checkExistingQuery = `
    //     SELECT id FROM success_migration_videos
    //     WHERE id IN (${oldData.map(() => '?').join(', ')})
    //   `
    //   break
    default:
      checkExistingQuery = `
        SELECT id FROM success_migration_${contentType} 
        WHERE id IN (${oldData.map(() => '?').join(', ')})
      `
      break
  }

  const existingIds = await new Promise((resolve, reject) => {
    sql.query(
      connectionString,
      checkExistingQuery,
      oldData.map((item) =>
        contentType === 'users' ? item.distinct_author_count : item.id
      ),
      (err, results) => {
        if (err) {
          console.error(
            `❌ Error checking existing ${contentType}:`,
            err.message
          )
          reject(err)
        } else {
          resolve(
            results.map((row) =>
              contentType === 'users' ? row.author : row.id
            )
          )
        }
      }
    )
  })

  const dataToProcess = oldData.filter(
    (item) =>
      !existingIds.includes(
        contentType === 'users' ? item.distinct_author_count : item.id
      )
  )
  console.log(
    `📊 Processing ${dataToProcess.length} of ${
      oldData.length
    } ${contentType} records (skipped ${
      oldData.length - dataToProcess.length
    } already migrated)`
  )

  // Map data concurrently
  const mappedDataPromises = dataToProcess.map((oldItem, index) =>
    limit(async () => {
      try {
        const newItem = await mapData(contentType, [oldItem])
        return { oldItem, newItem: newItem[0] }
      } catch (error) {
        console.error(
          `❌ Failed to map ${contentType} item ${index + 1}:`,
          error.message
        )
        switch (contentType) {
          case 'leagues':
            await logFailedLeague(oldItem, `Mapping error: ${error.message}`)
            break
          case 'categories':
            await logFailedCategory(oldItem, `Mapping error: ${error.message}`)
            break
          case 'users':
            await logFailedUser(
              oldItem,
              `Mapping error: ${error.message}`,
              index
            )
            break
          case 'sponsors':
            await logFailedSponsor(oldItem, `Mapping error: ${error.message}`)
            break
          case 'articles':
            await logFailure(oldItem, `Mapping error: ${error.message}`)
            break
          case 'videos':
            await logFailure(oldItem, `Mapping error: ${error.message}`)
            break

          default:
            console.warn(
              `No mapping error logger defined for contentType: ${contentType}`
            )
            break
        }
        return { oldItem, error: error.message }
      }
    })
  )

  const mappedResults = await Promise.all(mappedDataPromises)

  // Post and log data concurrently
  const postPromises = mappedResults.map((result, index) =>
    limit(async () => {
      const { oldItem, newItem, error } = result
      if (error) {
        console.error(
          `❌ Skipping ${contentType} item ${
            index + 1
          } due to mapping error: ${error}`
        )
        return { success: false, error }
      }

      // NEW: Check if legacyId already exists in Webiny for articles
      let isExisting = false
      if (contentType === 'articles' && newItem.legacyId) {
        const exists = await checkContentExists(newItem.legacyId)
        if (exists) {
          console.warn(
            `⚠️ Article ${oldItem.id} already exists in Webiny (legacyId: ${newItem.legacyId})`
          )
          isExisting = true
          return {
            success: false,
            existing: true,
            error: 'Already exists in Webiny',
          }
        }
      }

      try {
        const postResult = await postData(contentType, oldItem, newItem)
        if (postResult) {
          console.log(
            `✅ Successfully migrated ${contentType} item ${index + 1}`
          )
          try {
            // Refactor if-else to switch for success logging
            switch (contentType) {
              case 'articles':
                await logSuccessArticle(oldItem, postResult.data)
                break
              case 'sponsors':
                await logSuccessSponsor(oldItem, postResult.data)
                break
              case 'leagues':
                await logSuccessLeague(oldItem, postResult.data)
                break
              case 'categories':
                await logSuccessCategory(oldItem, postResult.data)
                break
              case 'users':
                await logSuccessUser(oldItem, postResult.data, index)
                break
              default:
                console.warn(
                  `No success logger defined for contentType: ${contentType}`
                )
                break
            }
            return { success: true }
          } catch (logError) {
            if (logError.type === 'duplicate') {
              console.warn(
                `⚠️ ${contentType} item ${index + 1} already exists in Webiny`
              )
              return {
                success: false,
                existing: true,
                error: logError.message,
              }
            } else {
              console.error(
                `❌ Failed to log success for ${contentType} item ${
                  index + 1
                }:`,
                logError.message
              )
              return { success: false, error: logError.message }
            }
          }
        }
      } catch (error) {
        let errorMessage = error.message
        isExisting = error.type === 'duplicate'
        if (
          !isExisting &&
          error.response?.data?.message?.includes('already exists')
        ) {
          isExisting = true
          errorMessage = `Duplicate record: ${error.response.data.message}`
        }
        console.error(
          `❌ Failed to migrate ${contentType} item ${index + 1}:`,
          errorMessage
        )
        // Refactor if-else to switch for posting error logging
        switch (contentType) {
          case 'articles':
            await logFailure(oldItem, `Posting error: ${errorMessage}`)
            break
          case 'sponsors':
            await logFailedSponsor(oldItem, `Posting error: ${errorMessage}`)
            break
          case 'leagues':
            await logFailedLeague(oldItem, `Posting error: ${errorMessage}`)
            break
          case 'categories':
            await logFailedCategory(oldItem, `Posting error: ${errorMessage}`)
            break
          case 'users':
            await logFailedUser(
              oldItem,
              `Posting error: ${errorMessage}`,
              index
            )
            break
          default:
            console.warn(
              `No posting error logger defined for contentType: ${contentType}`
            )
            break
        }
        return { success: false, existing: isExisting, error: errorMessage }
      }
    })
  )

  const results = await Promise.all(postPromises)
  successCount += results.filter((r) => r.success).length
  errorCount += results.filter((r) => !r.success && !r.existing).length
  existingCount += results.filter((r) => r.existing).length
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
    await getMappings()
    const { batchSize = 10, maxBatches = null, startOffset = 0 } = options
    const limit = pLimit(2) // Process up to 2 batches concurrently

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
    let overallExistingCount = 0
    let currentOffset = startOffset

    const batchPromises = []
    for (let batchNum = 1; batchNum <= batchesToProcess; batchNum++) {
      batchPromises.push(
        limit(async () => {
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
              return { successCount: 0, errorCount: 0, existingCount: 0 }
            }

            console.log(`📥 Fetched ${oldData.length} records`)

            const { successCount, errorCount, existingCount } =
              await processBatch(contentType, oldData)

            console.log(`\n✅ Batch ${batchNum} completed!`)
            console.log(`  Success: ${successCount}/${oldData.length}`)
            console.log(
              `  Existing in Webiny: ${existingCount}/${oldData.length}`
            )
            console.log(`  Mapping failed: ${errorCount}/${oldData.length}`)
            console.log(
              `  Overall Progress: ${
                overallSuccessCount +
                successCount +
                overallErrorCount +
                errorCount +
                overallExistingCount +
                existingCount
              }/${totalRecords}`
            )

            return { successCount, errorCount, existingCount }
          } catch (error) {
            console.error(`❌ Batch ${batchNum} failed:`, error.message)
            return { successCount: 0, errorCount: batchSize, existingCount: 0 }
          } finally {
            currentOffset += batchSize
          }
        })
      )
    }

    const batchResults = await Promise.all(batchPromises)
    overallSuccessCount = batchResults.reduce(
      (sum, r) => sum + r.successCount,
      0
    )
    overallErrorCount = batchResults.reduce((sum, r) => sum + r.errorCount, 0)
    overallExistingCount = batchResults.reduce(
      (sum, r) => sum + r.existingCount,
      0
    )

    console.log(`\n${'='.repeat(60)}`)
    console.log('🎉 MIGRATION COMPLETED!')
    console.log('='.repeat(60))
    console.log(`✅ TOTAL SUCCESSFUL MIGRATIONS: ${overallSuccessCount}`)
    console.log(`⚠️ TOTAL EXISTING IN WEBINY: ${overallExistingCount}`)
    console.log(`❌ TOTAL FAILED MIGRATIONS: ${overallErrorCount}`)
    console.log(
      `📊 TOTAL PROCESSED: ${
        overallSuccessCount + overallErrorCount + overallExistingCount
      }`
    )
    console.log(`📊 TOTAL AVAILABLE MIGRATIONS: ${totalRecords}`)
    console.log(
      `📋 ITEMS NEEDING PROCESSING: ${
        totalRecords -
        (overallSuccessCount + overallErrorCount + overallExistingCount)
      }`
    )
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

const main = async () => {
  try {
    console.log('🏁 Starting migration process...')
    console.log(
      '📋 Available content types:',
      Object.keys(CONTENT_CONFIGS)
        .filter((key) => CONTENT_CONFIGS[key].queryKey)
        .join(', ')
    )

    const migrationPlan = [
      {
        contentType: 'sponsors',
        queryType: 'all',
        options: {
          batchSize: 10,
          maxBatches: null,
          startOffset: 0,
        },
      },
    ]

    const results = await migrateBatch(migrationPlan)

    console.log('\n🎊 All migrations completed!')
    console.log('📊 Results:', JSON.stringify(results, null, 2))
  } catch (error) {
    console.error('💥 Main execution failed:', error)
    process.exit(1)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
