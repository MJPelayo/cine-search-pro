import { API } from "./modules/api.js";
import { SearchCache } from "./modules/cache.js";
import { DOM } from "./modules/dom.js";
import { KeyboardNavigator } from "./modules/keyboard.js";
import { SearchResultsUI } from "./ui/searchResults.js";
import { DetailPanelUI } from "./ui/detailPanel.js";

export default class SearchComponent {
  constructor() {
    // DOM Elements
    this.app = document.getElementById("app");
    this.input = document.getElementById("searchBox");
    this.message = document.getElementById("message");
    this.resultCount = document.getElementById("resultCount");
    this.clearBtn = document.getElementById("clearSearchBtn");
    this.resultList = document.getElementById("results");
    this.template = document.getElementById("movie-template");
    this.detailPanel = document.getElementById("detailPanel");
    this.closeDetailBtn = document.getElementById("closeDetailBtn");
    
    // State
    this.debounceTimer = null;
    this.controller = null;
    
    // Modules
    this.cache = new SearchCache();
    this.keyboardNav = new KeyboardNavigator("#results", (movieId) => this.selectMovie(movieId));
    this.resultsUI = new SearchResultsUI(this.resultList, this.template, (movieId) => this.selectMovie(movieId));
    this.detailUI = new DetailPanelUI(this.detailPanel, this.closeDetailBtn);
  }
  
  init() {
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    // Search input with debounce
    this.input.addEventListener("input", (e) => this.handleInput(e));
    
    // Clear button
    if (this.clearBtn) {
      this.clearBtn.addEventListener("click", () => this.clearSearch());
    }
    
    // Keyboard navigation
    this.input.addEventListener("keydown", (e) => this.keyboardNav.handleKeydown(e));
  }
  
  handleInput(e) {
    const query = e.target.value.trim();
    
    // Show/hide clear button
    if (this.clearBtn) {
      this.clearBtn.style.display = query ? "flex" : "none";
    }
    
    clearTimeout(this.debounceTimer);
    
    if (!query) {
      this.clearResults();
      return;
    }
    
    this.debounceTimer = setTimeout(() => {
      this.search(query);
    }, 300);
  }
  
  async search(query) {
    // Check cache first
    if (this.cache.has(query)) {
      console.log("📦 CACHE HIT");
      this.renderResults(this.cache.get(query), query);
      DOM.setLoading(this.app, false);
      return;
    }
    
    // Cancel previous request
    if (this.controller) {
      this.controller.abort();
    }
    
    this.controller = new AbortController();
    DOM.setLoading(this.app, true);
    DOM.showMessage(this.message, "");
    
    try {
      const movies = await API.searchMovies(query, this.controller.signal);
      
      if (movies.length === 0) {
        DOM.showMessage(this.message, "No movies found. Try a different search term.");
        this.resultsUI.clear();
        DOM.updateResultCount(this.resultCount, 0);
      } else {
        this.cache.set(query, movies);
        this.renderResults(movies, query);
      }
    } catch (err) {
      if (err.name === "AbortError") {
        console.log("⛔ Request cancelled");
        return;
      }
      DOM.showMessage(this.message, "Error fetching movies. Please try again.");
      console.error(err);
    } finally {
      DOM.setLoading(this.app, false);
    }
  }
  
  renderResults(movies, query) {
    this.resultsUI.render(movies, query);
    DOM.updateResultCount(this.resultCount, movies.length);
    DOM.showMessage(this.message, "");
    this.keyboardNav.reset();
  }
  
  async selectMovie(movieId) {
    console.log(`🎬 Loading movie: ${movieId}`);
    
    this.detailUI.open();
    this.detailUI.setLoading();
    DOM.setLoading(this.app, true);
    
    // Concurrent fetching with Promise.allSettled
    const results = await Promise.allSettled([
      API.getMovieDetails(movieId),
      API.getMovieCredits(movieId),
      API.getMovieVideos(movieId)
    ]);
    
    const [detailsResult, creditsResult, videosResult] = results;
    
    // Handle details (required)
    if (detailsResult.status === "fulfilled") {
      this.detailUI.renderDetails(detailsResult.value);
    } else {
      console.error("Details failed:", detailsResult.reason);
      this.detailUI.showError("Failed to load movie details.");
    }
    
    // Handle credits (optional - won't break UI)
    if (creditsResult.status === "fulfilled") {
      this.detailUI.renderCredits(creditsResult.value);
    } else {
      console.error("Credits failed:", creditsResult.reason);
      const castEl = document.getElementById("detailCast");
      if (castEl) castEl.innerHTML = "<li>Cast information unavailable</li>";
    }
    
    // Handle videos (optional - won't break UI)
    if (videosResult.status === "fulfilled") {
      this.detailUI.renderVideos(videosResult.value);
    } else {
      console.error("Videos failed:", videosResult.reason);
      const trailerEl = document.getElementById("detailTrailer");
      if (trailerEl) trailerEl.innerHTML = "<p>Trailer not available</p>";
    }
    
    DOM.setLoading(this.app, false);
  }
  
  clearResults() {
    this.resultsUI.clear();
    DOM.showMessage(this.message, "");
    DOM.updateResultCount(this.resultCount, 0);
    this.keyboardNav.reset();
  }
  
  clearSearch() {
    DOM.clearInput(this.input);
    this.clearResults();
  }
}