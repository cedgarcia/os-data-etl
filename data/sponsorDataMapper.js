export const mapSponsor = (old) => {
  return {
    // NEW : OLD

    type: 'sponsor', //required
    name: old.name,
    description: old.description,
    link: old.link,
    refs: [
      {
        model: 'addedBy',
        id: '689d5cd6fc81210002e29e29#0005',
        modelId: 'users',
      },
      {
        model: 'updatedBy',
        id: '689d5cd6fc81210002e29e29#0005',
        modelId: 'users',
      },
    ],
  }
}

//=================================

//  Name                  sponsor name
//  logo                  sponsor logo
//  link                  link
//  description           description
//  status
//  created by
//  date updated          last modified
//  updated by            modified by

// type -> sponsor    = type
// sponsor name       = name
// description        = description
// link               = link
