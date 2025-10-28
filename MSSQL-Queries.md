-- =============================================
-- 1. CREATE LOG DATABASE
-- =============================================
IF DB_ID('ONECMS-MIGRATION-LOGS') IS NULL
BEGIN
CREATE DATABASE [ONECMS-MIGRATION-LOGS];
PRINT 'Created database ONECMS-MIGRATION-LOGS';
END
GO

USE [ONECMS-MIGRATION-LOGS];
GO

-- =============================================
-- 2. SUCCESS TABLES
-- =============================================
IF OBJECT_ID('success_migration_articles') IS NULL
CREATE TABLE success_migration_articles (
id INT PRIMARY KEY,
title VARCHAR(255),
description VARCHAR(MAX),
intro VARCHAR(MAX),
slug VARCHAR(255),
webinyid VARCHAR(255)
);
GO

IF OBJECT_ID('success_migration_sponsors') IS NULL
CREATE TABLE success_migration_sponsors (
id INT PRIMARY KEY,
name VARCHAR(255),
logo VARCHAR(255),
link VARCHAR(255),
description VARCHAR(MAX),
status VARCHAR(50),
webinyid VARCHAR(255),
photodark VARCHAR(255),
photolight VARCHAR(255)
);
GO

IF OBJECT_ID('success_migration_leagues') IS NULL
CREATE TABLE success_migration_leagues (
id INT PRIMARY KEY,
name VARCHAR(255),
slug VARCHAR(255),
webinyid VARCHAR(255)
);
GO

IF OBJECT_ID('success_migration_categories') IS NULL
CREATE TABLE success_migration_categories (
id INT PRIMARY KEY,
name VARCHAR(255),
slug VARCHAR(255),
webinyid VARCHAR(255)
);
GO

IF OBJECT_ID('success_migration_users') IS NULL
CREATE TABLE success_migration_users (
author VARCHAR(255) PRIMARY KEY,
webinyid VARCHAR(255)
);
GO

IF OBJECT_ID('success_migration_videos') IS NULL
CREATE TABLE success_migration_videos (
id INT PRIMARY KEY,
title VARCHAR(255),
description VARCHAR(MAX),
intro VARCHAR(MAX),
slug VARCHAR(255),
webinyid VARCHAR(255)
);
GO

-- =============================================
-- 3. FAILURE TABLES
-- =============================================
IF OBJECT_ID('failed_migration_articles') IS NULL
CREATE TABLE failed_migration_articles (
id INT,
parent INT,
type VARCHAR(50),
title VARCHAR(255),
description VARCHAR(MAX),
intro VARCHAR(MAX),
blurb VARCHAR(MAX),
keywords VARCHAR(MAX),
redirect VARCHAR(255),
url VARCHAR(255),
body VARCHAR(MAX),
thumbnail VARCHAR(255),
image VARCHAR(255),
banner VARCHAR(255),
caption VARCHAR(MAX),
post DATETIME,
expiry DATETIME,
author VARCHAR(255),
sequence INT,
visible BIT,
target VARCHAR(50),
status VARCHAR(50),
category INT,
static BIT,
video BIT,
permalink VARCHAR(255),
audiolink VARCHAR(255),
videolink VARCHAR(255),
icon VARCHAR(255),
active BIT,
sponsorid INT,
contributor VARCHAR(255),
created DATETIME,
creator VARCHAR(255),
uploaded DATETIME,
uploader VARCHAR(255),
updated DATETIME,
updater VARCHAR(255),
channelid INT,
sectionid INT,
videotype VARCHAR(50),
videoid VARCHAR(255),
planid INT,
allowsearch BIT,
subscribertypeid INT,
autoplay BIT,
showinpromo BIT,
ogimage VARCHAR(255),
ogthumbnail VARCHAR(255),
slug VARCHAR(255),
displayonhomepage BIT,
hideadvertisement BIT,
carousel BIT,
carouselsequence INT,
columnid INT,
error_message VARCHAR(MAX)
);
GO

-- Same schema for videos
IF OBJECT_ID('failed_migration_videos') IS NULL
CREATE TABLE failed_migration_videos (
id INT,
parent INT,
type VARCHAR(50),
title VARCHAR(255),
description VARCHAR(MAX),
intro VARCHAR(MAX),
blurb VARCHAR(MAX),
keywords VARCHAR(MAX),
redirect VARCHAR(255),
url VARCHAR(255),
body VARCHAR(MAX),
thumbnail VARCHAR(255),
image VARCHAR(255),
banner VARCHAR(255),
caption VARCHAR(MAX),
post DATETIME,
expiry DATETIME,
author VARCHAR(255),
sequence INT,
visible BIT,
target VARCHAR(50),
status VARCHAR(50),
category INT,
static BIT,
video BIT,
permalink VARCHAR(255),
audiolink VARCHAR(255),
videolink VARCHAR(255),
icon VARCHAR(255),
active BIT,
sponsorid INT,
contributor VARCHAR(255),
created DATETIME,
creator VARCHAR(255),
uploaded DATETIME,
uploader VARCHAR(255),
updated DATETIME,
updater VARCHAR(255),
channelid INT,
sectionid INT,
videotype VARCHAR(50),
videoid VARCHAR(255),
planid INT,
allowsearch BIT,
subscribertypeid INT,
autoplay BIT,
showinpromo BIT,
ogimage VARCHAR(255),
ogthumbnail VARCHAR(255),
slug VARCHAR(255),
displayonhomepage BIT,
hideadvertisement BIT,
carousel BIT,
carouselsequence INT,
columnid INT,
error_message VARCHAR(MAX)
);
GO

IF OBJECT_ID('failed_migration_sponsors') IS NULL
CREATE TABLE failed_migration_sponsors (
id INT,
name VARCHAR(255),
logo VARCHAR(255),
link VARCHAR(255),
description VARCHAR(MAX),
status VARCHAR(50),
updater VARCHAR(255),
updated DATETIME,
creator VARCHAR(255),
created DATETIME,
error VARCHAR(MAX)
);
GO

IF OBJECT_ID('failed_migration_leagues') IS NULL
CREATE TABLE failed_migration_leagues (
id INT,
name VARCHAR(255),
slug VARCHAR(255),
error VARCHAR(MAX)
);
GO

IF OBJECT_ID('failed_migration_categories') IS NULL
CREATE TABLE failed_migration_categories (
id INT,
name VARCHAR(255),
slug VARCHAR(255),
error VARCHAR(MAX)
);
GO

IF OBJECT_ID('failed_migration_users') IS NULL
CREATE TABLE failed_migration_users (
author VARCHAR(255),
error VARCHAR(MAX)
);
GO

PRINT 'All log tables created in ONECMS-MIGRATION-LOGS';
