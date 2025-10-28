import dotenv from 'dotenv'
dotenv.config()

import apiConfig from './api.js'
import queries from './queries.js'

// =============================================
// 1. BUILD CONNECTION STRINGS FROM ENV
// =============================================
const {
  DB_SERVER,
  DB_NAME,
  DB_DRIVER,
  DB_TRUSTED,
  LOG_DB_SERVER = DB_SERVER,
} = process.env

// SOURCE DB – used to READ data from ONECMS
const sourceConnectionString = `server=${DB_SERVER};Database=${DB_NAME};Trusted_Connection=${DB_TRUSTED};Driver=${DB_DRIVER}`

// LOG DB – ALL success/failure tables go here
const logConnectionString = `server=${LOG_DB_SERVER};Database=ONECMS-MIGRATION-LOGS;Trusted_Connection=${DB_TRUSTED};Driver=${DB_DRIVER}`

// =============================================
// 2. EXPORT CONFIG
// =============================================
const config = {
  database: {
    connectionString: sourceConnectionString, // used in index.js for reading
    logConnectionString: logConnectionString, // used in loggers.js
  },
  api: apiConfig,
  queries,
}

export default config
