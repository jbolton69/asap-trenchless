export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/static": "/" });

  eleventyConfig.addFilter("slug", (str) =>
    String(str)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
  );

  eleventyConfig.addFilter("phoneDigits", (str) => String(str).replace(/\D/g, ""));

  eleventyConfig.addFilter("where", (arr, key, value) =>
    (arr || []).filter((item) => item[key] === value)
  );

  eleventyConfig.addFilter("limit", (arr, n) => (arr || []).slice(0, n));

  eleventyConfig.addFilter("dateISO", () => new Date().toISOString().split("T")[0]);

  eleventyConfig.addFilter("jsonld", (obj) =>
    JSON.stringify(obj, null, 2).replace(/</g, "\\u003c")
  );

  eleventyConfig.addFilter("readableDate", (d) =>
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })
  );

  eleventyConfig.addFilter("isoDate", (d) => new Date(d).toISOString());

  eleventyConfig.addFilter("readingTime", (content) => {
    const words = String(content).replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 225));
  });

  eleventyConfig.addFilter("excerpt", (content, n) => {
    const text = String(content).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    return text.length > n ? text.slice(0, text.lastIndexOf(" ", n)) + "\u2026" : text;
  });

  // Posts sharing the most tags with this one, newest first.
  eleventyConfig.addFilter("related", (posts, currentUrl, topics, limit) => {
    const tags = topics || [];
    return (posts || [])
      .filter((p) => p.url !== currentUrl)
      .map((p) => ({ p, score: (p.data.topics || []).filter((t) => tags.includes(t)).length }))
      .sort((a, b) => b.score - a.score || new Date(b.p.date) - new Date(a.p.date))
      .slice(0, limit || 3)
      .map((x) => x.p);
  });

  eleventyConfig.addCollection("posts", (api) =>
    api.getFilteredByTag("posts").filter((p) => !p.data.draft).reverse()
  );

  eleventyConfig.addCollection("topicList", (api) => {
    const set = new Set();
    api.getFilteredByTag("posts").forEach((p) => (p.data.topics || []).forEach((t) => set.add(t)));
    return [...set].sort();
  });

  eleventyConfig.addFilter("urlDepth", (url) =>
    String(url).split("/").filter(Boolean).length
  );

  eleventyConfig.addShortcode("year", () => String(new Date().getFullYear()));

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"],
  };
}
