export const mapUser = (old) => {
  // CLEAN
  const cleanLastname = old.lastname.replace(/\s+/g, '').replace(/[^\w]/g, '')
  const cleanFirstname = old.firstname.replace(/\s+/g, '').replace(/[^\w]/g, '')

  // SINCE EMAIL DOESNT EXIST CREATE SAMPLE EMAIL TO MIGRATE THINGS
  const email =
    old.email ||
    `${cleanFirstname.toLowerCase()}.${cleanLastname.toLowerCase()}@onecms.com`

  return {
    firstName: old.firstname || 'N/A',
    lastName: old.lastname || 'N/A',
    email: email,
  }
}

// //=============================

// // firstname -> firstName
// // lastname -> lastName
// // title -> ---
// // worktitle -> ---
// // bio -> ---
// // verifiedexport -> ---
// // portrait -> ---
// // column -> ---
// // status -> status
// // dateupdated -> last activity
