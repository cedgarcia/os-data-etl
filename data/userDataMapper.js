import { websiteMap, roleMap } from './mappings.js'

// Global counter for unique email generation
let emailCounter = 0

// Function to reset counter if needed (useful for fresh migrations)
export const resetEmailCounter = () => {
  emailCounter = 0
}

// Function to set counter to a specific value (useful for resuming migrations)
export const setEmailCounter = (value) => {
  emailCounter = value
}

// Function to get current counter value
export const getEmailCounter = () => emailCounter

export const mapUser = (old, index) => {
  // Increment the global counter for each user
  emailCounter++

  // Get the Contributor role ID from roleMap with a fallback
  const contributorRoleId = roleMap['Contributor'] || null

  if (!contributorRoleId) {
    console.warn(
      `⚠️ Warning: Contributor role not found in roleMap for user at index ${index}`
    )
  }

  // Handle missing or null author
  const authorName =
    old.distinct_author_count && old.distinct_author_count.trim()
      ? old.distinct_author_count
      : `Dev Temp OneSports ${emailCounter}`

  return {
    firstName: authorName,
    lastName: ' ', // Since we only have author, set lastName to a space
    email: `contributor${emailCounter}@onecms.com`, // Unique email using global counter
    systemAccess: 'member',
    refs: [
      {
        model: 'website',
        // LOCAL ENVIRONMENT
        // id: '68ecba79ffef4e0002407de3#0001', // Default to One Sports website

        // DEV ENVIRONMENT
        id: '689977d848c8fa0002aa8cc5#0001', // Default to One Sports website
        modelId: 'websites',
      },
      {
        model: 'role',
        // LOCAL ENVIRONMENT
        // id: contributorRoleId || '68ecba8effef4e0002407df0#0001', // Use roleMap or fallback ID

        // DEV ENVIRONMENT
        id: contributorRoleId || '68dba20ef258460002afd598#0004', // Use roleMap or fallback ID

        modelId: 'role',
      },
    ],
    hasCmsAccess: true,
    systemStatus: 'active',
  }
}
