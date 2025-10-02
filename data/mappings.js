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
  2: '68dca41a929a4f000218a1a0#0004', // NEWS
  16: '68dccac3b59a9e0002210b56#0003', // EDITORIAL
  17: '68dcce2bd4caab0002be163c#0002', // FEATURES
  18: '68dccb31e7e1750002cec968#0003', // SPORTS LIFE
  19: '68dccb5cb59a9e0002210b57#0003', // VIDEOS
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
  6: '68dca4b464208e0002f181fb#0006', // GILAS
  7: '68dca4e8929a4f000218a1a6#0008', // MORE SPORTS
  9: '68dca2f49397b000020c1204#0010', // PBA
  10: '68dccd1be05b0600021fce34#0003', // PVL
  11: '68dccc13e7e1750002cec969#0004', // UAAP
  16: '68dccc3de7e1750002cec96a#0004', // ESPORTS
}

// mapping old MSSQL authors/contributors IDs to Webiny IDs
export const authorsMap = {}

// mapping old MSSQL authors/contributors IDs to Webiny IDs
export const statusMap = {
  published: 'publish',
  draft: 'draft',
}

export const roles = {
  1: '6853ba1e937f970002107660#0021', // EDITOR
  2: '6853b7789735240002083ef6#0022', // WRITER
  3: '6853b7649735240002083ef5#0018', // CONTRIBUTOR
  4: '6853b6b19735240002083ef4#0020', // MEDIA TEAM
}
