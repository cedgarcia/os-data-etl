const queries = {
  // USERS
  users: {
    test: 'SELECT * FROM contributor WHERE id = 3',
    batch: 'SELECT TOP 10 * FROM contributor',
    all: 'SELECT * FROM contributor',
  },

  // WEBSITES
  websites: {
    test: 'SELECT * FROM vertical WHERE id = 2',
  },

  // SPONSORS
  sponsors: {
    test: 'SELECT * FROM sponsor WHERE id = 20',
  },

  // CATEGORIES
  categories: {
    test: 'SELECT * FROM category WHERE id = 1',
    batch: 'SELECT TOP 10 * FROM category',
    all: 'SELECT * FROM category',
    custom: 'SELECT * FROM category WHERE id IN (2, 16, 17, 18, 19)', // NEWS, EDITORIAL, FEATURES, SPORTS LIFE/LIFESTYLE, VIDEOS
  },

  // MEDIA FILES
  images: {
    test: 'SELECT TOP 1 image, thumbnail, caption FROM contents', //FOR TESTING MEDIA FILE UPLOAD OF caption and image
  },

  // CONTENTS/ STORIES
  /**
   * TABLE RELATIONSHIPS:
   * - c (contents): Main table containing title, description, etc.
   * - cv (contents_vertical): Junction table with leagues (subVerticalId) and websites (verticalId)
   *
   * Content Type IDs:
   * - Draft: 28093 (PBA tag)
   * - Published: 27423 (More Sports tag)
   * - News: 26701, 26079
   * - Editorial: 27247, 27574, 27602, 27671
   * - Features: 22322, 26633, 26643
   * - Sports Life: 27000, 26894
   * - Videos: 26844, 26845
   */
  articles: {
    test: ` 
      SELECT c.*, cv.subverticalid, cv.verticalid
      FROM contents c
      LEFT JOIN contents_vertical cv ON c.id = cv.contentid
      WHERE c.id = 27423
    `,
    batch: `
      SELECT TOP 1 c.*, cv.subverticalid, cv.verticalid
      FROM contents c
      INNER JOIN contents_vertical cv ON c.id = cv.contentid
    `,
    all: `
      SELECT c.*, cv.subverticalid, cv.verticalid
      FROM contents c
      INNER JOIN contents_vertical cv ON c.id = cv.contentid
    `,
    custom: `
      SELECT c.*, cv.subverticalid, cv.verticalid
      FROM contents c
      INNER JOIN contents_vertical cv ON c.id = cv.contentid
      WHERE c.id IN (26701, 27247, 22322, 27000, 26844)
    `,
  },
}

export default queries
