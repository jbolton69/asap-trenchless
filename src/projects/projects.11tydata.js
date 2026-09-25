// Breadcrumbs are built in JS so each paginated project gets its own trail
// (templated strings inside a front-matter array resolve once, for page 1 only).
export default {
  eleventyComputed: {
    // Short H1 (the part before the colon); the full story headline stays in data for schema/llms.
    h1: (data) => (data.project ? `${data.project.title.split(":")[0]}, ${data.project.footage.replace(" ft", " Feet")}` : data.h1),
    breadcrumbs: (data) =>
      data.project
        ? [
            { name: "Home", url: "/" },
            { name: "Recent Projects", url: "/projects/" },
            { name: `${data.project.place} ${data.project.footage}`, url: data.project.url },
          ]
        : undefined,
  },
};
