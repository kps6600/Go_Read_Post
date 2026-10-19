export const SearchService = {
  async search(query) {
    if (!query) return { articles: [], authors: [], topics: [], categories: [], tags: [] };
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const json = await res.json();
      return json.success ? json.data : { articles: [], authors: [], topics: [], categories: [], tags: [] };
    } catch (e) {
      return { articles: [], authors: [], topics: [], categories: [], tags: [] };
    }
  }
};
