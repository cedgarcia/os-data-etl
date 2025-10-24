import { usersMap } from './mappings.js'

export const mapCategory = (old) => {
  // LOCAL ENVIRONMENT
  // const defaultUserId = '68ecba72ffef4e0002407de1#0005' // Fallback ID for "One Sports" user

  // DEV ENVIRONMENT
  // const defaultUserId = '68dba1c6f258460002afd595#0006' // Fallback ID for "One Sports" user

  // TEST ENVIRONMENT
  // const defaultUserId = '689579a9720a4d0002a21f3a#0013' // Fallback ID for "One Sports" user

  // Use creator/updater fields if available in MSSQL data, else default to 'One'
  const addedById =
    old.creator && usersMap[old.creator]
      ? usersMap[old.creator]
      : usersMap['One']
  const updatedById =
    old.updater && usersMap[old.updater]
      ? usersMap[old.updater]
      : usersMap['One']

  if (!usersMap['One']) {
    console.warn(
      `⚠️ No usersMap entry for "One", skipping mapping for category ${
        old.name || 'Unnamed Category'
      }`
    )
  }

  // Handle name and link mapping
  const name = old.id === 18 ? 'Sports Life' : old.name || 'Unnamed Category'
  const link =
    old.id === 18
      ? 'sports-life'
      : old.name
      ? old.name.toLowerCase().replace(/\s+/g, '')
      : 'unnamed-category'

  if (!old.name && old.id !== 18) {
    console.warn(`⚠️ Category ID ${old.id} has no name, using default: ${name}`)
  }

  return {
    name,
    redirectUrl: 'Internal',
    link,
    refs: [
      {
        model: 'addedBy',
        id: addedById,
        modelId: 'users',
      },
      {
        model: 'updatedBy',
        id: updatedById,
        modelId: 'users',
      },
    ],
  }
}
