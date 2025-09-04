export const websiteMap = {
  2: '', // ONE NEWS PH
  6: '', // ONE LIFE PH
  // 7: '67dcc35c93f3a200028c4db7#0007', // ONE SPORTS PH
  7: '67dcc35c93f3a200028c4db7#0007', // ONE SPORTS PH
}

// mapping old MSSQL category IDs to Webiny IDs
export const categoryMap = {
  /**
   *
   *
   *
   *
   */

  //old(from mssql) : new(webiny)
  // 2: '68b51b6592a5a100023bd2e9#0001', // NEWS
  2: '68b8f4f3181b87000233a03a#0001',
  16: '68b51b6692a5a100023bd2ea#0001', // EDITORIAL
  17: '68b51b6792a5a100023bd2eb#0001', // FEATURES
  18: '68b51b6892a5a100023bd2ec#0001', // SPORTS LIFE
  19: '68b51b6a92a5a100023bd2ed#0001', // VIDEOS
}
// mapping old MSSQL league IDs to Webiny IDs
export const leagueMap = {
  /**
   * subvertical id
   * 6 = GILAS
   * 7 = MORE SPORTS
   * 9 = PBA
   * 10 = PVL
   * 11 = UAAP
   * 16 = ESPORTS
   * 21 = PARIS 2024
   * 22 = ALAS
   */

  //old(from mssql) : new(webiny)
  6: '68aec36b2cc6f40002b2d3da#0001', // GILAS
  7: '68aec3cd416d28000299d874#0001', // MORE SPORTS
  9: '68a2aff069aa50000238448f#0025', // PBA
  10: '68b57f3eef3c3f0002bbf1d7#0001', // PVL
  11: '68ae992d3edb60000223cbd7#0001', // UAAP
  16: '68aeae329dc59d00020cffe6#0011', // ESPORTS
}

// mapping old MSSQL authors/contributors IDs to Webiny IDs
export const authorsMap = {}

// mapping old MSSQL authors/contributors IDs to Webiny IDs
export const statusMap = {
  published: 'publish',
  draft: 'draft',
}
