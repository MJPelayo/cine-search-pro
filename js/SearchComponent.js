export default class SearchComponent {

  constructor() {
    // Replace with your TMDB API key
    this.apiKey = "fe875da85ffa0a6908e4d6fcbf897c80";

    // DOM Elements
    this.input = document.getElementById("searchBox");
    this.resultList = document.getElementById("results");
    this.message = document.getElementById("message");
    this.app = document.getElementById("app");
    this.template = document.getElementById("movie-template");

    // State variables
    this.debounceTimer = null;
    this.cache = new Map();
    this.controller = null;
    this.currentIndex = -1;
  }

  init() {
    // Input event with debounce
    this.input.addEventListener("input", (e) => {
      const query = e.target.value.trim();

      clearTimeout(this.debounceTimer);

      if (!query) {
        this.clearResults();
        return;
      }

      this.debounceTimer = setTimeout(() => {
        this.search(query);
      }, 300);
    });

    // Keyboard navigation
    this.input.addEventListener("keydown", (e) => this.handleKeydown(e));
  }

  async search(query) {
    // Cache check
    if (this.cache.has(query)) {
      console.log("📦 CACHE HIT - No network request");
      this.renderResults(this.cache.get(query), query);
      this.app.dataset.loading = "false";
      return;
    }

    // Abort previous request
    if (this.controller) {
      console.log("🛑 Cancelling previous request");
      this.controller.abort();
    }

    // Create new controller
    this.controller = new AbortController();
    const signal = this.controller.signal;

    console.log("🌐 CACHE MISS - Fetching from API");

    this.app.dataset.loading = "true";
    this.message.textContent = "";

    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${this.apiKey}&query=${encodeURIComponent(query)}`,
        { signal }
      );

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();

      if (data.results.length === 0) {
        this.showMessage("No movies found.");
        this.renderResults([], query);
      } else {
        this.cache.set(query, data.results);
        console.log(`💾 Cached "${query}" - ${data.results.length} movies`);
        this.renderResults(data.results, query);
      }

    } catch (err) {
      if (err.name === "AbortError") {
        console.log("⛔ Request was cancelled - this is expected during fast typing");
        return;
      }
      this.showMessage("Error fetching data.");
      console.error(err);
    } finally {
      this.app.dataset.loading = "false";
    }
  }

  renderResults(movies, query) {
    this.resultList.innerHTML = "";
    this.currentIndex = -1;

    if (!movies || movies.length === 0) {
      return;
    }

    const frag = new DocumentFragment();

    movies.forEach(movie => {
      const clone = this.template.content.cloneNode(true);
      const titleEl = clone.querySelector(".title");

      // XSS-safe highlight
      const highlightedTitle = this.buildHighlight(movie.title, query);
      titleEl.appendChild(highlightedTitle);

      const li = clone.querySelector(".movie-item");
      li.dataset.id = movie.id;

      frag.appendChild(clone);
    });

    this.resultList.appendChild(frag);
  }

  buildHighlight(title, query) {
    const container = document.createElement("span");

    const lowerTitle = title.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const idx = lowerTitle.indexOf(lowerQuery);

    if (idx === -1) {
      container.textContent = title;
      return container;
    }

    const before = document.createTextNode(title.slice(0, idx));

    const match = document.createElement("span");
    match.className = "highlight";
    match.textContent = title.slice(idx, idx + query.length);

    const after = document.createTextNode(title.slice(idx + query.length));

    container.appendChild(before);
    container.appendChild(match);
    container.appendChild(after);

    return container;
  }

  handleKeydown(e) {
    const items = this.resultList.querySelectorAll(".movie-item");

    if (!items.length) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        this.currentIndex = (this.currentIndex + 1) % items.length;
        this.updateActiveItem(items);
        break;

      case "ArrowUp":
        e.preventDefault();
        this.currentIndex = (this.currentIndex - 1 + items.length) % items.length;
        this.updateActiveItem(items);
        break;

      case "Enter":
        e.preventDefault();
        if (this.currentIndex >= 0 && items[this.currentIndex]) {
          const movieId = items[this.currentIndex].dataset.id;
          this.selectMovie(movieId);
        }
        break;

      default:
        break;
    }
  }

  updateActiveItem(items) {
    items.forEach(item => item.classList.remove("active"));

    if (this.currentIndex >= 0 && items[this.currentIndex]) {
      items[this.currentIndex].classList.add("active");
      items[this.currentIndex].scrollIntoView({ block: "nearest" });
    }
  }

  selectMovie(movieId) {
    console.log(`🎬 Selected movie ID: ${movieId}`);
    // Phase 3 will implement concurrent fetching here
    alert(`Movie ID ${movieId} selected - Phase 3 coming soon!`);
  }

  clearResults() {
    this.resultList.innerHTML = "";
    this.message.textContent = "";
  }

  showMessage(msg) {
    this.resultList.innerHTML = "";
    this.message.textContent = msg;
  }
}