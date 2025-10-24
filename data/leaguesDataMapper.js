import { usersMap } from './mappings.js'

export const mapLeague = (old) => {
  // LOCAL ENVIRONMENT
  // const defaultUserId = '68ecba72ffef4e0002407de1#0005' // Fallback ID for "One Sports" user

  // DEV ENVIRONMENT
  // const defaultUserId = '68dba1c6f258460002afd595#0006' // Fallback ID for "One Sports" user

  // TEST ENVIRONMENT
  // const defaultUserId = '689579a9720a4d0002a21f3a#0013' // Fallback ID for "One Sports" user

  // Use creator/updater fields if available in the MSSQL data, else default to 'One'
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
      `⚠️ No usersMap entry for "One", skipping mapping for league ${old.name}`
    )
  }

  return {
    name: old.name,
    link: old.slug ? old.slug.replace(/-/g, '').toLowerCase() : '',
    redirectUrl: 'Internal',
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
