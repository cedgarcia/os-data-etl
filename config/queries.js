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
    // all: 'SELECT * FROM category', // NEWS, EDITORIAL, FEATURES, SPORTS LIFE/LIFESTYLE, VIDEOS
    all: 'SELECT * FROM category WHERE id IN (2, 16, 17, 18, 19)', // NEWS, EDITORIAL, FEATURES, SPORTS LIFE/LIFESTYLE, VIDEOS
  },

  // MEDIA FILES
  images: {
    test: 'SELECT TOP 1 image, thumbnail, caption FROM contents', //FOR TESTING MEDIA FILE UPLOAD OF caption and image
  },

  // ARTICLES
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
    custom: `
      SELECT c.*, cv.subverticalid, cv.verticalid
      FROM contents c
      INNER JOIN contents_vertical cv ON c.id = cv.contentid
      WHERE c.id IN (35695, 27247, 22322, 27000, 26844)
    `,
  },
}

export default queries
