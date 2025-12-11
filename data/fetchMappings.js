import axios from 'axios'
import config from '../config/index.js'
import pLimit from 'p-limit'

export const fetchMappings = async () => {
  const mappings = {
    websiteMap: {},
    categoryMap: {},
    leagueMap: {},
    usersMap: {},
    roleMap: {},
  }

  const apiEndpoints = {
    websites: `${config.api.baseUrl}/api/websites?q=%7B%22where%22%3A%7B%22_and%22%3A%5B%7B%22field%22%3A%22deletedOn%22%2C%22value%22%3Anull%7D%5D%7D%2C%22columns%22%3A%5B%22name%22%5D%7D`,
    categories: `${config.api.baseUrl}/api/categories?q=%7B%22where%22%3A%7B%22_and%22%3A%5B%7B%22field%22%3A%22deletedOn%22%2C%22value%22%3Anull%7D%5D%7D%2C%22columns%22%3A%5B%22name%22%5D%7D`,
    leagues: `${config.api.baseUrl}/api/leagues?q=%7B%22where%22%3A%7B%22_and%22%3A%5B%7B%22field%22%3A%22deletedOn%22%2C%22value%22%3Anull%7D%5D%7D%2C%22columns%22%3A%5B%22name%22%5D%7D`,
    roles: `${config.api.baseUrl}/api/roles?q=%7B%22where%22:%7B%22_and%22:%5B%7B%22field%22:%22deletedOn%22,%22value%22:null%7D%5D%7D,%22columns%22:%5B%22id%22,%22name%22,%22permissions%22,%22website+%7B%5Cn++++++++++++id,%5Cn++++++++++++name%5Cn++++++++++%7D%22%5D,%22sort%22:%7B%22field%22:%22createdOn%22,%22value%22:%22desc%22%7D%7D`,
    users: `${config.api.baseUrl}/api/users?q=%7B%22where%22%3A%7B%22_and%22%3A%5B%7B%22field%22%3A%22deletedOn%22%2C%22value%22%3Anull%7D%5D%7D%2C%22columns%22%3A%5B%22firstName%22%5D%7D`,
  }

  const limit = pLimit(4)

  const fetchAndProcess = async (endpoint, type, processFn) => {
    try {
      const response = await axios.get(endpoint, {
        headers: config.api.headers,
      })

      if (!response.data) {
        throw new Error(`No data in ${type} response`)
      }

      let dataArray = null
      if (Array.isArray(response.data.list)) {
        dataArray = response.data.list
      } else if (Array.isArray(response.data.data)) {
        dataArray = response.data.data
      } else if (Array.isArray(response.data)) {
        dataArray = response.data
      } else if (Array.isArray(response.data.items)) {
        dataArray = response.data.items
      } else {
        throw new Error(`Invalid ${type} response structure`)
      }

      dataArray.forEach(processFn)
      return dataArray
    } catch (error) {
      console.error(`❌ Error fetching ${type}:`, error.message)
      throw error
    }
  }

  try {
    await Promise.all([
      limit(() =>
        fetchAndProcess(apiEndpoints.websites, 'websites', (item) => {
          if (!item.id || !item.name) {
            console.warn(`⚠️ Skipping website with missing id or name:`, item)
            return
          }
          if (item.name === 'One Sports') {
            mappings.websiteMap[7] = item.id
          } else {
            console.warn(`⚠️ Unmapped website: ${item.name}`)
          }
        })
      ),
      limit(() =>
        fetchAndProcess(apiEndpoints.categories, 'categories', (item) => {
          if (!item.id || !item.name) {
            console.warn(`⚠️ Skipping category with missing id or name:`, item)
            return
          }
          const categoryIdMap = {
            NEWS: 2,
            EDITORIAL: 16,
            FEATURES: 17,
            'SPORTS LIFE': 18,
            VIDEOS: 19,
          }
          const mssqlId = categoryIdMap[item.name.toUpperCase()]
          if (mssqlId) {
            mappings.categoryMap[mssqlId] = item.id
          }
        })
      ),
      limit(() =>
        fetchAndProcess(apiEndpoints.leagues, 'leagues', (item) => {
          if (!item.id || !item.name) {
            console.warn(`⚠️ Skipping league with missing id or name:`, item)
            return
          }
          const leagueIdMap = {
            GILAS: 6,
            'MORE SPORTS': 7,
            PBA: 9,
            PVL: 10,
            UAAP: 11,
            ESPORTS: 16,
            'PARIS 2024': 21,
            ALAS: 22,
          }
          const mssqlId = leagueIdMap[item.name.toUpperCase()]
          if (mssqlId) {
            mappings.leagueMap[mssqlId] = item.id
          }
        })
      ),
      limit(() =>
        fetchAndProcess(apiEndpoints.roles, 'roles', (item) => {
          if (!item.id || !item.name) {
            return
          }
          mappings.roleMap[item.name] = item.id
        })
      ),
      limit(() =>
        fetchAndProcess(apiEndpoints.users, 'users', (item) => {
          if (!item.id) {
            console.warn(`⚠️ Skipping user with missing id:`, item)
            return
          }
          const authorName = item.firstName || ''
          mappings.usersMap[authorName] = item.id
        })
      ),
    ])
    console.log(
      '✅ Mappings fetched successfully:',
      JSON.stringify(mappings, null, 2)
    )

    // ✅ VALIDATE CRITICAL MAPPINGS
    if (Object.keys(mappings.websiteMap).length === 0) {
      throw new Error(
        '❌ CRITICAL: No websites mapped! Migration cannot proceed.'
      )
    }

    if (Object.keys(mappings.categoryMap).length === 0) {
      throw new Error(
        '❌ CRITICAL: No categories mapped! Migration cannot proceed.'
      )
    }

    if (Object.keys(mappings.leagueMap).length === 0) {
      throw new Error(
        '❌ CRITICAL: No leagues mapped! Migration cannot proceed.'
      )
    }

    console.log('✅ Mappings fetched and validated successfully')
    return mappings
  } catch (error) {
    console.error('❌ Fatal error in fetchMappings:')
    throw error
  }
}

let cachedMappings = null

export const getMappings = async () => {
  if (cachedMappings) {
    console.log('⏭️ Using cached mappings')
    return cachedMappings
  }

  cachedMappings = await fetchMappings()
  return cachedMappings
}

export const clearMappingsCache = () => {
  console.log('🔄 Clearing mappings cache...')
  cachedMappings = null
}
