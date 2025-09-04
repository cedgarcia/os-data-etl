import { cleanArticleBody } from '../utils/cleanArticleBody.js'
import { websiteMap, leagueMap, categoryMap, statusMap } from './mappings.js'

export const mapArticle = (old) => {
  const webinyStatus = statusMap[old.status?.toLowerCase()]

  // const refs = [
  //   // {addedBy: authorsMap[]}//for author
  //   // { model: 'mediaFile', id: body.mediaFileId },// for media files
  //   { categoryId: categoryMap[old.category] },
  //   { leagueId: leagueMap[old.subverticalid] },
  //   { websiteId: websiteMap[old.verticalid] },
  // ]
  return {
    title: old.title,
    lede: old.description,
    story: cleanArticleBody(old.body),
    // story: old.body,

    //type

    // ref
    categoryId: categoryMap[old.category],
    leagueId: leagueMap[old.subverticalid],
    websiteId: websiteMap[old.verticalid],
    //end of ref

    slug: old.slug,

    status: webinyStatus,
    publishedAt: old.post,
    author: {
      name: old.author,
    },
    mediaFile: {
      image: old.image,
      caption: old.caption,
      description: old.description,
      tags: old.keywords,
    },
  }
}

//===========================================

// id    ->  ---
// parent -> ---
// type  -> type
// title -> title
// description -> lede
// intro -> ---
// blurb -> ---
// keywords -> ---
// redirect -> ---
// url -> ---
// body -> story
// thumbnail ->
// image ->  ---
// banner -> ---
// caption -> ---
// post -> publishedAt
// expiry ->
// author -> ---
// sequence -> ---
// visible -> ---
// target -> ---
// status -> contentStatus
// category -> category
// static -> ---
// video -> ---
// permalink -> ---
// audiolink -> ---
// videolink -> ---
// icon -> ---
// active -> ---
// sponsored -> ---
// contributor -> ---
// created -> ---
// creator -> ---
// uploaded -> ---
// uploader -> ---
// updated -> ---
// updater -> ---
// channeled -> ---
// sectioned -> ---
// videotype -> ---
// videoed -> ---
// planid -> ---
// allowsearch -> ---
// subscribertypeid-> ---
// autoplay -> ---
// showinpromo -> ---
// ogimage -> ---
// ogthumbnail -> ---
// slug ->slug
// displayonhomepage -> ---
// hideadvertisement -> ---
// carousel -> ---
// carouselsequence -> ---
// columnid -> ---

//===================================
// title
// type
// lede
// story
// mediaFile (reference....) -> media files
// mainVideo (reference....) -> media files
// category (reference...) -> category
// league (reference...) -> leagues
// website (reference...) -> websites
// addedBy (reference...) ->users
// contentBlock
// settings
// contentStatus
// slug
// previousSlug
// nextSlug
// publishedAt
// unpublishedAt
// hash
