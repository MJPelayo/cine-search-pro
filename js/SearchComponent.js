export default class SearchComponent {

constructor(){
  this.apiKey = "YOUR_API_KEY";

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

    this.app.dataset.loading = "true";
    this.message.textContent = "";

    try{

      const res = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${this.apiKey}&query=${query}`
      );

      const data = await res.json();

      if(data.results.length === 0){
        this.showMessage("No movies found.");
      }

      this.renderResults(data.results);

    }catch(err){

      this.showMessage("Error fetching data.");
      console.error(err);

    }finally{

      this.app.dataset.loading = "false";

    }

  }

  renderResults(results){

    this.resultList.innerHTML = "";

    results.forEach(movie => {
      const li = document.createElement("li");
      li.textContent = movie.title;
      this.resultList.appendChild(li);
    });

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