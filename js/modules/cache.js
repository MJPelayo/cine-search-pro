// Search result caching using Map
export class SearchCache {
  constructor() {
    this.cache = new Map();
  }

  has(query) {
    return this.cache.has(query.toLowerCase());
  }

  get(query) {
    return this.cache.get(query.toLowerCase());
  }

  set(query, results) {
    this.cache.set(query.toLowerCase(), results);
    console.log(`💾 Cached "${query}" - ${results.length} movies`);
  }

  clear() {
    this.cache.clear();
    console.log("🗑️ Cache cleared");
  }

  size() {
    return this.cache.size;
  }
}