const queries = {
  // USERS
  users: {
    all: `SELECT DISTINCT c.author AS distinct_author_count 
        FROM contents c INNER JOIN contents_vertical cv ON c.id = cv.contentid 
        WHERE cv.verticalid = 7;`,
  },

  // WEBSITES
  websites: {
    test: 'SELECT * FROM vertical WHERE id = 2',
  },

  // SPONSORS
  sponsors: {
    test: 'SELECT * FROM sponsor WHERE id = 1',
    batch: `
      SELECT * FROM sponsor
      ORDER BY id
      OFFSET 0 ROWS FETCH NEXT 10 ROWS ONLY
    `,
    all: `
      SELECT * FROM sponsor
      ORDER BY id
      OFFSET 0 ROWS FETCH NEXT 10 ROWS ONLY
    `,
  },

  // LEAGUES
  leagues: {
    test: 'SELECT * FROM subvertical WHERE id = 6',
    batch: 'SELECT TOP 10 * FROM subvertical',
    all: 'SELECT * FROM vertical_subvertical where verticalid = 7',
  },

  // CATEGORIES
  categories: {
    test: 'SELECT * FROM category WHERE id = 1',
    batch: 'SELECT TOP 10 * FROM category',
    all: 'SELECT * FROM category', // NEWS, EDITORIAL, FEATURES, SPORTS LIFE/LIFESTYLE, VIDEOS
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

  /**
   * 
   * SELECT TOP 10 c.*, cv.subverticalid, cv.verticalid
FROM contents c
INNER JOIN contents_vertical cv ON c.id = cv.contentid
WHERE cv.verticalid = 7 
;
   */

  // 8158
  articles: {
    test: ` 
     SELECT c.*, cv.subverticalid, cv.verticalid
      FROM contents c
      LEFT JOIN contents_vertical cv ON c.id = cv.contentid
      WHERE c.id in (8156, 8171 ,8157,8159)

    `,
    batch: `
      SELECT DISTINCT c.*, cv.subverticalid, cv.verticalid
      FROM contents c
      INNER JOIN contents_vertical cv ON c.id = cv.contentid
      WHERE cv.verticalid = 7
      ORDER BY c.id
      OFFSET 0 ROWS FETCH NEXT 10 ROWS ONLY
    `,
    all: `
      SELECT c.*, cv.subverticalid, cv.verticalid
      FROM contents c
      INNER JOIN contents_vertical cv ON c.id = cv.contentid
      WHERE cv.verticalid = 7
      AND c.type = 4
      AND c.status = 'Published'
      ORDER BY c.id
      OFFSET 0 ROWS FETCH NEXT 100 ROWS ONLY;
    `,
    //     all: `SELECT  distinct c.*, cv.subverticalid, cv.verticalid FROM contents c INNER JOIN contents_vertical cv ON c.id = cv.contentid WHERE cv.verticalid = 7 and type = 4 and status = 'Published' ORDER BY c.id
    // `,
    custom: `
      SELECT c.*, cv.subverticalid, cv.verticalid
      FROM contents c
      INNER JOIN contents_vertical cv ON c.id = cv.contentid
      WHERE c.id IN (35695, 27247, 22322, 27000, 26844)
    `,
  },
}

export default queries
