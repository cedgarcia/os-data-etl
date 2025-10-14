export const websiteMap = {
  2: '', // ONE NEWS PH
  6: '', // ONE LIFE PH
  // 7: '67dcc35c93f3a200028c4db7#0007', // ONE SPORTS PH
  7: '68ecba79ffef4e0002407de3#0001', // ONE SPORTS PH
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
  // 68ecc79a09c7f100022f6b5f#0001 // PHOTOS
  // 2: '68b51b6592a5a100023bd2e9#0001', // NEWS
  2: '68ecc802f7ad160002f0fafa#0001', // NEWS

  16: '68dccac3b59a9e0002210b56#0017', // EDITORIAL
  17: '68ecc7e659b6ba000244c0c3#0001', // FEATURES
  18: '68ecc7c309c7f100022f6b60#0001', // SPORTS LIFE
  19: '68ecc77d09c7f100022f6b5e#0001', // VIDEOS
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
  6: '68ecc928aa1fd0000294934e#0001', // GILAS
  7: '68ecc834d079bb0002731b3a#0002', // MORE SPORTS
  9: '68ecc947aa1fd0000294934f#0001 ', // PBA
  10: '68ecc906aa1fd0000294934d#0001', // PVL
  11: '68ecc89ad079bb0002731b3b#0002', // UAAP
  16: '68dccc3de7e1750002cec96a#0023', // ESPORTS
  21: '68e778d30b95de0002ec1c8d#0004', // PARIS 2024
  22: '68ec8f774d569300022ee5e5#0002', // ALAS


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
