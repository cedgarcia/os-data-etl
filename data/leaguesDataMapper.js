export const mapLeague = (old) => {
  return {
    name: old.name,
    link: old.slug.replace(/-/g, '').toLowerCase(),
    redirectUrl: 'Internal',
    refs: [
      {
        model: 'addedBy',
        // id: '68ecba72ffef4e0002407de1#0003', //LOCAL
        id: '68dba1c6f258460002afd595#0005', // DEV
        modelId: 'users',
      },
      {
        model: 'updatedBy',
        // id: '68ecba72ffef4e0002407de1#0003', //LOCAl
        id: '68dba1c6f258460002afd595#0005', // DEV
        modelId: 'users',
      },
    ],
    // order: old.sequence,
  }
}

// old

// id
// verticalid
// name
// slug
//active
// logo
// sequence
// creator
// created
// updater
// updated

// new

// name
// redirectUrl  -> internal
// link
// addedBy
// updatedBy
// order
