import sql from 'msnodesqlv8'
import databaseConfig from './database.js'

console.log('Testing connection...')

sql.open(databaseConfig.connectionString, (err, connection) => {
  if (err) {
    console.error('❌ Failed:', err.message)
    return
  }

  console.log('✅ Connected successfully!')
  connection.close()
})
