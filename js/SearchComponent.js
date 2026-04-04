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

    // Detail panel elements (Phase 3)
    this.detailPanel = document.getElementById("detailPanel");
    this.detailTitle = document.getElementById("detailTitle");
    this.detailOverview = document.getElementById("detailOverview");
    this.detailGenres = document.getElementById("detailGenres");
    this.detailCast = document.getElementById("detailCast");
    this.detailTrailer = document.getElementById("detailTrailer");
    this.closeDetailBtn = document.getElementById("closeDetailBtn");

    // State variables
    this.debounceTimer = null;
    this.cache = new Map();
    this.controller = null;
    this.currentIndex = -1;
    this.escapeHandler = null;
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

    // Close detail panel when X is clicked (Phase 3)
    if (this.closeDetailBtn) {
      this.closeDetailBtn.addEventListener("click", () => {
        this.closeDetailPanel();
      });
    }
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
      
      // ADD CLICK HANDLER
      li.addEventListener("click", (e) => {
        e.stopPropagation();
        this.selectMovie(movie.id);
      });

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

  async selectMovie(movieId) {
    console.log(`🎬 Selected movie ID: ${movieId}`);
    
    // Open the detail panel
    this.openDetailPanel();
    
    // Show loading state
    this.detailTitle.textContent = "Loading movie...";
    this.detailOverview.textContent = "Fetching data...";
    this.detailGenres.innerHTML = "Loading genres...";
    this.detailCast.innerHTML = "<li>Loading cast...</li>";
    this.detailTrailer.innerHTML = "<p>Loading trailer...</p>";
    
    // Show loading spinner on app
    this.app.dataset.loading = "true";
    
    // CONCURRENT FETCHING WITH PROMISE.ALLSETTLED
    const detailsUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${this.apiKey}`;
    const creditsUrl = `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${this.apiKey}`;
    const videosUrl = `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${this.apiKey}`;
    
    try {
      const results = await Promise.allSettled([
        fetch(detailsUrl).then(res => res.ok ? res.json() : Promise.reject(`HTTP ${res.status}`)),
        fetch(creditsUrl).then(res => res.ok ? res.json() : Promise.reject(`HTTP ${res.status}`)),
        fetch(videosUrl).then(res => res.ok ? res.json() : Promise.reject(`HTTP ${res.status}`))
      ]);
      
      const [detailsResult, creditsResult, videosResult] = results;
      
      // Handle Details
      if (detailsResult.status === "fulfilled") {
        this.renderMovieDetails(detailsResult.value);
      } else {
        console.error("Details failed:", detailsResult.reason);
        this.detailTitle.textContent = "Error loading movie";
        this.detailOverview.textContent = "Failed to load movie details. Please try again.";
      }
      
      // Handle Credits
      if (creditsResult.status === "fulfilled") {
        this.renderCredits(creditsResult.value);
      } else {
        console.error("Credits failed:", creditsResult.reason);
        this.detailCast.innerHTML = "<li>Cast information unavailable</li>";
      }
      
      // Handle Videos
      if (videosResult.status === "fulfilled") {
        this.renderVideos(videosResult.value);
      } else {
        console.error("Videos failed:", videosResult.reason);
        this.detailTrailer.innerHTML = "<p>Trailer not available</p>";
      }
      
    } catch (error) {
      console.error("Unexpected error:", error);
      this.detailTitle.textContent = "Error";
      this.detailOverview.textContent = "Something went wrong. Please try selecting the movie again.";
    } finally {
      this.app.dataset.loading = "false";
    }
  }

  renderMovieDetails(details) {
    this.detailTitle.textContent = details.title || "Unknown Title";
    this.detailOverview.textContent = details.overview || "No overview available.";
    
    this.detailGenres.innerHTML = "";
    if (details.genres && details.genres.length > 0) {
      details.genres.forEach(genre => {
        const badge = document.createElement("span");
        badge.className = "genre-badge";
        badge.textContent = genre.name;
        this.detailGenres.appendChild(badge);
      });
    } else {
      this.detailGenres.innerHTML = "No genre information";
    }
  }
  
  renderCredits(credits) {
    this.detailCast.innerHTML = "";
    
    const castMembers = credits.cast || [];
    const topCast = castMembers.slice(0, 5);
    
    if (topCast.length > 0) {
      topCast.forEach(actor => {
        const li = document.createElement("li");
        li.textContent = `${actor.name} as ${actor.character || "Unknown character"}`;
        this.detailCast.appendChild(li);
      });
    } else {
      this.detailCast.innerHTML = "<li>No cast information available</li>";
    }
  }
  
  renderVideos(videos) {
    this.detailTrailer.innerHTML = "";
    
    const trailer = videos.results?.find(
      video => video.type === "Trailer" && video.site === "YouTube"
    );
    
    if (trailer) {
      const iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube.com/embed/${trailer.key}`;
      iframe.title = "Movie Trailer";
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;
      this.detailTrailer.appendChild(iframe);
    } else {
      this.detailTrailer.innerHTML = "<p>No trailer available</p>";
    }
  }

  openDetailPanel() {
    this.detailPanel.style.display = "block";
    document.body.classList.add("detail-open");
    
    // Close panel when pressing Escape key
    this.escapeHandler = (e) => {
      if (e.key === "Escape") {
        this.closeDetailPanel();
      }
    };
    document.addEventListener("keydown", this.escapeHandler);
  }

  closeDetailPanel() {
    this.detailPanel.style.display = "none";
    document.body.classList.remove("detail-open");
    
    // Remove Escape key listener
    if (this.escapeHandler) {
      document.removeEventListener("keydown", this.escapeHandler);
      this.escapeHandler = null;
    }
    
    // Clear previous data
    this.detailTitle.textContent = "Movie Title";
    this.detailOverview.textContent = "";
    this.detailGenres.innerHTML = "";
    this.detailCast.innerHTML = "";
    this.detailTrailer.innerHTML = "";
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