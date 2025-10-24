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

  // Get the Contributor role ID from roleMap
  const contributorRoleId = roleMap['Contributor']

  if (!contributorRoleId) {
    console.warn(
      `⚠️ Warning: Contributor role not found in roleMap for user at index ${index}`
    )
  }

  // Get the website ID for One Sports (verticalid 7)
  const websiteId = websiteMap[7]

  if (!websiteId) {
    console.warn(
      `⚠️ Warning: Website ID for One Sports (verticalid 7) not found in websiteMap for user at index ${index}`
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
        // id: '68ecba72ffef4e0002407de1#0005', // Default to One Sports website

        // DEV ENVIRONMENT
        // id: '68dba1c6f258460002afd595#0006', // Default to One Sports website

        // TEST ENVIRONMENT
        // id: '689579a9720a4d0002a21f3a#0013', // Default to One Sports website

        id: websiteId,
        modelId: 'websites',
      },
      {
        model: 'role',
        // LOCAL ENVIRONMENT
        // id: contributorRoleId || '68ecba8effef4e0002407df0#0001', // Use roleMap or fallback ID

        // DEV ENVIRONMENT
        // id: contributorRoleId || '68dba20ef258460002afd598#0004', // Use roleMap or fallback ID

        // TEST ENVIRONMENT
        // id: contributorRoleId || '689c5e1423e9ae0002fabae3#0005', // Use roleMap or fallback ID

        id: contributorRoleId,
        modelId: 'role',
      },
    ],
    hasCmsAccess: true,
    systemStatus: 'active',
  }
}
