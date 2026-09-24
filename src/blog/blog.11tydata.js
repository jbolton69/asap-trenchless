export default {
  layout: "layouts/post.njk",
  tags: ["posts"],
  postSchema: true,
  author: "All Sewer and Plumbing Services",
  eleventyComputed: {
    // A draft must not build at all — not just drop out of listings. Without the
    // false permalink the page is still reachable at its URL, which defeats the
    // point of holding an unreviewed post back.
    permalink: (data) => (data.draft ? false : `/blog/${data.page.fileSlug}/`),
    eleventyExcludeFromCollections: (data) => Boolean(data.draft),
  },
};
