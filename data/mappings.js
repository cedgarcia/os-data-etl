import { getMappings } from './fetchMappings.js'

let websiteMap = {}
let categoryMap = {}
let leagueMap = {}
let usersMap = {}
let roleMap = {}

const initializeMappings = async () => {
  const mappings = await getMappings()
  websiteMap = mappings.websiteMap
  categoryMap = mappings.categoryMap
  leagueMap = mappings.leagueMap
  usersMap = mappings.usersMap
  roleMap = mappings.roleMap
}

// Function to refresh mappings (useful between user and article migrations)
export const refreshMappings = async () => {
  console.log('🔄 Refreshing all mappings...')
  const mappings = await getMappings()
  websiteMap = mappings.websiteMap
  categoryMap = mappings.categoryMap
  leagueMap = mappings.leagueMap
  usersMap = mappings.usersMap
  roleMap = mappings.roleMap
  // console.log('✅ Mappings refreshed successfully')
  // console.log(`📊 Users in map: ${Object.keys(usersMap).length}`)
}

// Initialize mappings on module load
initializeMappings().catch((error) => {
  // console.error('❌ Failed to initialize mappings:', error)
  process.exit(1)
})

export { websiteMap, categoryMap, leagueMap, usersMap, roleMap }

export const statusMap = {
  published: 'publish',
  draft: 'draft',
}
