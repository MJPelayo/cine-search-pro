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

  console.log("CACHE MISS - Fetching from API");

  // Show loading spinner
  this.app.dataset.loading = "true";
  this.message.textContent = "";

  try{
    const res = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${this.apiKey}&query=${encodeURIComponent(query)}`
    );

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const data = await res.json();

    if(data.results.length === 0){
      this.showMessage("No movies found.");
      this.renderResults([], query);
    } else {
      // ========== STORE IN CACHE ==========
      this.cache.set(query, data.results);
      console.log(`Cached "${query}" - ${data.results.length} movies`);
      this.renderResults(data.results, query);
    }

  } catch(err){
    // Handle AbortError separately
    if (err.name === "AbortError") {
      console.log("Request cancelled");
      return;
    }
    
    this.showMessage("Error fetching data.");
    console.error(err);

  } finally{
    this.app.dataset.loading = "false";
  }
}

 renderResults(movies, query){
  // Clear previous results
  this.resultList.innerHTML = "";

  if (!movies || movies.length === 0) {
    return;
  }

  // ========== DOCUMENT FRAGMENT PATTERN ==========
  const frag = new DocumentFragment();

  movies.forEach(movie => {
    // Clone template content
    const clone = this.template.content.cloneNode(true);
    
    // Find title element and set text content
    const titleEl = clone.querySelector(".title");
    titleEl.textContent = movie.title;  // Plain text for now
    
    // Store movie ID on the li for later
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