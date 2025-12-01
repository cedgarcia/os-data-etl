import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs')
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
}

/**
 * Writes a log entry to a text file
 * @param {string} filename - Name of the log file
 * @param {string} content - Content to write
 * @param {boolean} append - Whether to append or overwrite
 */
export const writeToLogFile = (filename, content, append = true) => {
  try {
    const filePath = path.join(logsDir, filename)
    const logEntry = `${content}\n`

    if (append) {
      fs.appendFileSync(filePath, logEntry, 'utf8')
    } else {
      fs.writeFileSync(filePath, logEntry, 'utf8')
    }
  } catch (error) {
    console.error(`Error writing to log file ${filename}:`, error.message)
  }
}

/**
 * Initializes a log file with a header
 * @param {string} filename - Name of the log file
 * @param {string} contentType - Type of content being migrated
 * @param {string} status - 'success' or 'failed'
 */
export const initializeLogFile = (filename, contentType, status) => {
  const filePath = path.join(logsDir, filename)
  const header = `
${'='.repeat(80)}
${status.toUpperCase()} ${contentType.toUpperCase()} MIGRATION LOG
${'='.repeat(80)}
Migration Started: ${new Date().toISOString()}
${'='.repeat(80)}

`
  fs.writeFileSync(filePath, header, 'utf8')
}

/**
 * Writes a summary to the log file
 * @param {string} filename - Name of the log file
 * @param {object} summary - Summary object with counts and duration
 */
export const writeLogSummary = (filename, summary) => {
  const summaryText = `
${'='.repeat(80)}
MIGRATION SUMMARY
${'='.repeat(80)}
Total Successful: ${summary.successCount || 0}
Total Failed: ${summary.errorCount || 0}
Total Existing: ${summary.existingCount || 0}
Total Processed: ${summary.total || 0}
Duration: ${summary.duration || 'N/A'}
Completed: ${new Date().toISOString()}
${'='.repeat(80)}
`
  writeToLogFile(filename, summaryText, true)
}

/**
 * Logs a successful migration
 * @param {string} contentType - Type of content
 * @param {object} item - The migrated item
 * @param {string} webinyId - The Webiny ID
 */
export const logSuccessToFile = (contentType, item, webinyId) => {
  const filename = `success-${contentType}-migration-logs-migration-env.txt`
  const logEntry = `ID: ${item.id} | Title: ${item.title || 'N/A'} | Slug: ${
    item.slug || 'N/A'
  } | WebinyID: ${webinyId || 'N/A'}`
  writeToLogFile(filename, logEntry, true)
}

/**
 * Logs a failed migration
 * @param {string} contentType - Type of content
 * @param {object} item - The failed item
 * @param {string} error - Error message
 */
export const logFailureToFile = (contentType, item, error) => {
  const filename = `failed-${contentType}-migration-logs-migration-env.txt`
  const logEntry = `ID: ${item.id} | Title: ${item.title || 'N/A'} | Slug: ${
    item.slug || 'N/A'
  } | Error: ${error}`
  writeToLogFile(filename, logEntry, true)
}
