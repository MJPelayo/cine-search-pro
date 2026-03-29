export default class SearchComponent {

constructor(){
  this.apiKey = "fe875da85ffa0a6908e4d6fcbf897c80"; // Replace with your TMDb API key

  this.input = document.getElementById("searchBox");
  this.resultList = document.getElementById("results");
  this.message = document.getElementById("message");
  this.app = document.getElementById("app");
  this.template = document.getElementById("movie-template");

  // State variables
  this.debounceTimer = null;      
  this.cache = new Map();         
  this.controller = null;         
  
  // For keyboard navigation 
  this.currentIndex = -1;
}

buildHighlight(title, query) {
  const container = document.createElement("span");
  
  // Case-insensitive search
  const lowerTitle = title.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const idx = lowerTitle.indexOf(lowerQuery);
  
  // If no match, return plain text
  if (idx === -1) {
    container.textContent = title;
    return container;
  }
  
  // Create text before match
  const before = document.createTextNode(title.slice(0, idx));
  
  // Create highlighted span
  const match = document.createElement("span");
  match.className = "highlight";
  match.textContent = title.slice(idx, idx + query.length);
  
  // Create text after match
  const after = document.createTextNode(title.slice(idx + query.length));
  
  // Assemble
  container.appendChild(before);
  container.appendChild(match);
  container.appendChild(after);
  
  return container;
}

 init(){
  this.input.addEventListener("input", (e) => {
    const query = e.target.value.trim();

    // Clear previous timer
    clearTimeout(this.debounceTimer);

    // If empty query, clear results immediately
    if (!query) {
      this.clearResults();
      return;
    }

    // Set new timer
    this.debounceTimer = setTimeout(() => {
      this.search(query);
    }, 300);
  });
}

async search(query){
  // ========== CACHE CHECK FIRST ==========
  if (this.cache.has(query)) {
    console.log("CACHE HIT - No network request");
    this.renderResults(this.cache.get(query), query);
    this.app.dataset.loading = "false";
    return;
  }

  // ========== ABORT CONTROLLER ==========
  // Cancel any in-flight request
  if (this.controller) {
    console.log("Cancelling previous request");
    this.controller.abort();
  }

  // Create new controller for this request
  this.controller = new AbortController();
  const signal = this.controller.signal;

  console.log("CACHE MISS - Fetching from API");

  // Show loading spinner
  this.app.dataset.loading = "true";
  this.message.textContent = "";

  try{
    const res = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${this.apiKey}&query=${encodeURIComponent(query)}`,
      { signal }  // ← PASS THE SIGNAL FOR CANCELLATION
    );

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const data = await res.json();

    if(data.results.length === 0){
      this.showMessage("No movies found.");
      this.renderResults([], query);
    } else {
      // Store in cache
      this.cache.set(query, data.results);
      console.log(`Cached "${query}" - ${data.results.length} movies`);
      this.renderResults(data.results, query);
    }

  } catch(err){
    // ========== HANDLE ABORT ERROR ==========
    if (err.name === "AbortError") {
      console.log("Request was cancelled - this is expected during fast typing");
      return;  // Don't show error message for cancellations
    }
    
    this.showMessage("Error fetching data.");
    console.error(err);

  } finally{
    this.app.dataset.loading = "false";
    // Don't clear controller here - it might be needed for next request
  }
}

 renderResults(movies, query){
  // Clear previous results
  this.resultList.innerHTML = "";

  if (!movies || movies.length === 0) {
    return;
  }

  // Document Fragment Pattern
  const frag = new DocumentFragment();

  movies.forEach(movie => {
    // Clone template content
    const clone = this.template.content.cloneNode(true);
    
    // Find title element
    const titleEl = clone.querySelector(".title");
    
    // SAFE HIGHLIGHT - using DOM API, NOT innerHTML
    const highlightedTitle = this.buildHighlight(movie.title, query);
    titleEl.appendChild(highlightedTitle);
    
    // Store movie ID for later use
    const li = clone.querySelector(".movie-item");
    li.dataset.id = movie.id;
    
    frag.appendChild(clone);
  });

  // ONE DOM WRITE
  this.resultList.appendChild(frag);
}

  clearResults(){
  this.resultList.innerHTML = "";
  this.message.textContent = "";
}

  showMessage(msg){
    this.resultList.innerHTML = "";
    this.message.textContent = msg;
  }

}