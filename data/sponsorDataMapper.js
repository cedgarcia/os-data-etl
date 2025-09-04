export const mapSponsor = (old) => {
  return {
    // NEW : OLD

    type: 'sponsor', //required
    name: old.name,
    description: old.description,
    link: old.link,
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
