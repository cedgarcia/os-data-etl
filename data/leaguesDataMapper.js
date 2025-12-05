import { usersMap } from './mappings.js'

export const mapLeague = (old) => {
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
    link: old.slug ? old.slug.toLowerCase() : '',
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
