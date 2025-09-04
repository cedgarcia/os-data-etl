import dotenv from 'dotenv'

dotenv.config()

const databaseConfig = {
  server: process.env.DB_SERVER,
  name: process.env.DB_NAME,
  trustedConnection: process.env.DB_TRUSTED,
  driver: process.env.DB_DRIVER,
  connectionString: `server=${process.env.DB_SERVER};Database=${process.env.DB_NAME};Trusted_Connection=${process.env.DB_TRUSTED};Driver=${process.env.DB_DRIVER}`,
}

export default databaseConfig
