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
    // 8269, 8751, 11705,30339, 10830, 12840

    // 8615 - maraming twitter
    // 8565 - maraming images
    //13837 - mga br

    // MGA MAY SIRA
    //     8388
    // 8404
    // 8407
    // 8966
    // 15490
    // 17174
    // 17250
    // 17251
    // 17253
    // 17282
    // 17286
    // 17355
    // 17357
    // 17378
    // 17465
    // 17545
    // 17546
    // 17547
    // 17573
    // 17713
    // 17715
    // 17718
    // 17793
    // 17821
    // 17887
    // 17911
    // 18035
    // 18039
    // 18084
    // 19667
    // 20037
    // 22691
    // 31143
    // 36040
    // 37775
    // 37888
    // all: `
    //      SELECT c.*, cv.subverticalid, cv.verticalid
    // FROM contents c
    // INNER JOIN contents_vertical cv ON c.id = cv.contentid
    // WHERE c.id = 9435 ;

    //  `,
    // all: `
    //      SELECT c.*, cv.subverticalid, cv.verticalid
    //   FROM contents c
    //   INNER JOIN contents_vertical cv ON c.id = cv.contentid
    //   WHERE c.id IN (35695, 27247, 22322, 27000, 26844)
    // `,
    // all: `
    //      SELECT c.*, cv.subverticalid, cv.verticalid
    //   FROM contents c
    //   INNER JOIN contents_vertical cv ON c.id = cv.contentid
    //   WHERE c.id IN (35696, 27248, 22323, 27001, 26845)
    // `,
    all: `
        SELECT
        c.*,
        cv.subverticalid,
        cv.verticalid
    FROM contents c
    INNER JOIN contents_vertical cv
        ON c.id = cv.contentid
    WHERE cv.verticalid = 7
      AND c.type = 4
      AND c.status = 'Published'
      AND c.id NOT IN (
            8388, 8404, 8407, 8966, 15490, 17174, 17250, 17251, 17253,
            17282, 17286, 17355, 17357, 17378, 17465, 17545, 17546, 17547,
            17573, 17713, 17715, 17718, 17793, 17821, 17887, 17911, 18035,
            18039, 18084, 19667, 20037, 22691, 31143, 36040, 37775, 37888, 
            38244, 38746, 38749, 38777
      )
    ORDER BY c.post
    OFFSET 0 ROWS FETCH NEXT 100 ROWS ONLY;
        `,
    custom: `
      SELECT c.*, cv.subverticalid, cv.verticalid
      FROM contents c
      INNER JOIN contents_vertical cv ON c.id = cv.contentid
      WHERE c.id IN (35695, 27247, 22322, 27000, 26844)
    `,
  },

  // VIDEOS
  videos: {
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
      AND c.type = 5
      AND c.status = 'Published'
      ORDER BY c.post
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
