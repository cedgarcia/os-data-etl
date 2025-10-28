### STEPS

1. run node utils/imageDownloader.js(for downloading images to local) -> images will be downloaded on 'assets/complete-images' folder
2. run node utils/countImages.js(to check if you downloaded all images) -> this should output "20291"

### running migration scripts step by step

1. run node leagues (to migrate leagues)
2. run node categories (to migrate categories)
3. run node users (to migrate users) ----------------------- to be discussed
4. run node sponsors (to migrate sponsors) ---------------- to be discussed
5. run node articles (to migrate articles)
6. run node videos (to migrate videos)
