import config from '../config/index.js'
import sql from 'msnodesqlv8'
// ============================================
// LOGGING FUNCTIONS FOR ARTICLES
// ============================================

export const logSuccessArticle = async (oldItem, webinyData) => {
  const connectionString = config.database.connectionString
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

export const logFailure = async (oldItem, errorMsg) => {
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

export const logSuccessSponsor = async (oldItem, webinyData) => {
  const connectionString = config.database.connectionString
  const webinyId = webinyData?.id || null

  console.log(`🔍 Extracted Sponsor WebinyID: ${webinyId}`)

  if (!webinyId) {
    console.warn('⚠️ Warning: No webinyId found in response!')
  }

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

export const logFailedSponsor = async (oldItem, errorMsg) => {
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
// LOGGING FUNCTIONS FOR LEAGUES
// ============================================

export const logSuccessLeague = async (oldItem, webinyData) => {
  const connectionString = config.database.connectionString
  const webinyId = webinyData?.id || null

  console.log(`🔍 Extracted League WebinyID: ${webinyId}`)

  if (!webinyId) {
    console.warn('⚠️ Warning: No webinyId found in response!')
  }

  const query = `
    INSERT INTO success_migration_leagues 
    (id, name, slug, webinyid)
    VALUES (?, ?, ?, ?)
  `

  const params = [
    oldItem.id,
    oldItem.name || null,
    oldItem.slug || null,
    webinyId,
  ]

  return new Promise((resolve, reject) => {
    sql.query(connectionString, query, params, (err, results) => {
      if (err) {
        if (
          err.message.includes('Violation of PRIMARY KEY') ||
          err.message.includes('duplicate')
        ) {
          console.warn(
            `⚠️ DUPLICATE RECORD: League ${oldItem.id} already exists in success_migration_leagues`
          )
          reject({ type: 'duplicate', message: err.message })
        } else {
          console.error(
            `❌ ERROR: Failed to log success for league ${oldItem.id}:`,
            err.message
          )
          reject({ type: 'error', message: err.message })
        }
      } else {
        console.log(
          `✅ Logged successful migration for league ${oldItem.id} (${oldItem.name}) - WebinyID: ${webinyId}`
        )
        resolve(results)
      }
    })
  })
}

export const logFailedLeague = async (oldItem, errorMsg) => {
  const connectionString = config.database.connectionString

  const query = `
    INSERT INTO failed_migration_leagues 
    (id, name, slug, error)
    VALUES (?, ?, ?, ?)
  `

  const params = [
    oldItem.id,
    oldItem.name || null,
    oldItem.slug || null,
    errorMsg,
  ]

  return new Promise((resolve, reject) => {
    sql.query(connectionString, query, params, (err, results) => {
      if (err) {
        console.error(
          `❌ Failed to log error for league ${oldItem.id}:`,
          err.message
        )
        reject(err)
      } else {
        console.log(
          `📝 Logged failed migration for league ${oldItem.id}: ${errorMsg}`
        )
        resolve(results)
      }
    })
  })
}

// ============================================
// LOGGING FUNCTIONS FOR CATEGORIES
// ============================================

export const logSuccessCategory = async (oldItem, webinyData) => {
  const connectionString = config.database.connectionString
  const webinyId = webinyData?.id || null

  console.log(`🔍 Extracted Category WebinyID: ${webinyId}`)

  if (!webinyId) {
    console.warn('⚠️ Warning: No webinyId found in response!')
  }

  const query = `
    INSERT INTO success_migration_categories 
    (id, name, slug, webinyid)
    VALUES (?, ?, ?, ?)
  `

  const params = [
    oldItem.id,
    oldItem.name || null,
    oldItem.slug || null,
    webinyId,
  ]

  return new Promise((resolve, reject) => {
    sql.query(connectionString, query, params, (err, results) => {
      if (err) {
        if (
          err.message.includes('Violation of PRIMARY KEY') ||
          err.message.includes('duplicate')
        ) {
          console.warn(
            `⚠️ DUPLICATE RECORD: Category ${oldItem.id} already exists in success_migration_categories`
          )
          reject({ type: 'duplicate', message: err.message })
        } else {
          console.error(
            `❌ ERROR: Failed to log success for category ${oldItem.id}:`,
            err.message
          )
          reject({ type: 'error', message: err.message })
        }
      } else {
        console.log(
          `✅ Logged successful migration for category ${oldItem.id} (${oldItem.name}) - WebinyID: ${webinyId}`
        )
        resolve(results)
      }
    })
  })
}

export const logFailedCategory = async (oldItem, errorMsg) => {
  const connectionString = config.database.connectionString

  const query = `
    INSERT INTO failed_migration_categories 
    (id, name, slug, error)
    VALUES (?, ?, ?, ?)
  `

  const params = [
    oldItem.id,
    oldItem.name || null,
    oldItem.slug || null,
    errorMsg,
  ]

  return new Promise((resolve, reject) => {
    sql.query(connectionString, query, params, (err, results) => {
      if (err) {
        console.error(
          `❌ Failed to log error for category ${oldItem.id}:`,
          err.message
        )
        reject(err)
      } else {
        console.log(
          `📝 Logged failed migration for category ${oldItem.id}: ${errorMsg}`
        )
        resolve(results)
      }
    })
  })
}

// ============================================
// LOGGING FUNCTIONS FOR USERS
// ============================================

export const logSuccessUser = async (oldItem, webinyData, index) => {
  const connectionString = config.database.connectionString
  const webinyId = webinyData?.id || null
  const authorIdentifier =
    oldItem.distinct_author_count || `Contributor${index + 1}`

  console.log(`🔍 Extracted User WebinyID: ${webinyId} for ${authorIdentifier}`)

  if (!webinyId) {
    console.warn('⚠️ Warning: No webinyId found in response!')
  }

  const query = `
    INSERT INTO success_migration_users 
    (author, webinyid)
    VALUES (?, ?)
  `

  const params = [
    oldItem.distinct_author_count, // Preserve empty string
    webinyId,
  ]

  return new Promise((resolve, reject) => {
    sql.query(connectionString, query, params, (err, results) => {
      if (err) {
        if (
          err.message.includes('Violation of PRIMARY KEY') ||
          err.message.includes('duplicate')
        ) {
          console.warn(
            `⚠️ DUPLICATE RECORD: User ${authorIdentifier} already exists in success_migration_users`
          )
          reject({ type: 'duplicate', message: err.message })
        } else {
          console.error(
            `❌ ERROR: Failed to log success for user ${authorIdentifier}:`,
            err.message
          )
          reject({ type: 'error', message: err.message })
        }
      } else {
        console.log(
          `✅ Logged successful migration for user ${authorIdentifier}`
        )
        resolve(results)
      }
    })
  })
}

export const logFailedUser = async (oldItem, errorMsg, index) => {
  const connectionString = config.database.connectionString
  const authorIdentifier =
    oldItem.distinct_author_count || `Contributor${index + 1}`

  const query = `
    INSERT INTO failed_migration_users 
    (author, error)
    VALUES (?, ?)
  `

  const params = [
    oldItem.distinct_author_count, // Preserve empty string
    errorMsg,
  ]

  return new Promise((resolve, reject) => {
    sql.query(connectionString, query, params, (err, results) => {
      if (err) {
        console.error(
          `❌ Failed to log error for user ${authorIdentifier}:`,
          err.message
        )
        reject(err)
      } else {
        console.log(
          `📝 Logged failed migration for user ${authorIdentifier}: ${errorMsg}`
        )
        resolve(results)
      }
    })
  })
}

// ============================================
// LOGGING FUNCTIONS FOR VIDEOS
// ============================================

export const logSuccessVideo = async (oldItem, webinyData) => {
  const connectionString = config.database.connectionString
  const webinyId = webinyData?.story?.id || null

  const query = `
    INSERT INTO success_migration_videos 
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
        if (
          err.message.includes('Violation of PRIMARY KEY') ||
          err.message.includes('duplicate')
        ) {
          console.warn(`DUPLICATE RECORD: Video ${oldItem.id} already logged`)
          reject({ type: 'duplicate', message: err.message })
        } else {
          console.error(
            `Failed to log success for video ${oldItem.id}:`,
            err.message
          )
          reject({ type: 'error', message: err.message })
        }
      } else {
        console.log(
          `Logged successful video ${oldItem.id} – WebinyID: ${webinyId}`
        )
        resolve(results)
      }
    })
  })
}

export const logFailedVideo = async (oldItem, errorMsg) => {
  const connectionString = config.database.connectionString

  const columns = [
    'id',
    'title',
    'description',
    'intro',
    'slug',
    'videolink',
    'error_message',
  ]
  const placeholders = columns.map(() => '?').join(', ')
  const query = `INSERT INTO failed_migration_videos (${columns.join(
    ', '
  )}) VALUES (${placeholders})`

  const params = [
    oldItem.id,
    oldItem.title ?? null,
    oldItem.description ?? null,
    oldItem.intro ?? null,
    oldItem.slug ?? null,
    oldItem.videolink ?? null,
    errorMsg,
  ]

  return new Promise((resolve, reject) => {
    sql.query(connectionString, query, params, (err, results) => {
      if (err) {
        console.error(`Failed to log failed video ${oldItem.id}:`, err.message)
        reject(err)
      } else {
        console.log(`Logged failed video ${oldItem.id}: ${errorMsg}`)
        resolve(results)
      }
    })
  })
}
