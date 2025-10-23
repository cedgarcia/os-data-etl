import { usersMap } from './mappings.js'

export const mapCategory = (old) => {
  const defaultUserId = '68ecba72ffef4e0002407de1#0005' // Fallback ID for "One Sports" user

  // Use creator/updater fields if available in MSSQL data, else default to 'One'
  const addedById =
    old.creator && usersMap[old.creator]
      ? usersMap[old.creator]
      : usersMap['One'] || defaultUserId
  const updatedById =
    old.updater && usersMap[old.updater]
      ? usersMap[old.updater]
      : usersMap['One'] || defaultUserId

  if (!usersMap['One']) {
    console.warn(
      `⚠️ No usersMap entry for "One", using fallback ID: ${defaultUserId}`
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
