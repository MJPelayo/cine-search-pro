import { buildHighlightedTitle } from "../modules/highlight.js";
import { API } from "../modules/api.js";

export class SearchResultsUI {
  constructor(resultList, template, onMovieSelect) {
    this.resultList = resultList;
    this.template = template;
    this.onMovieSelect = onMovieSelect;
  }
  
  render(movies, searchQuery) {
    // Clear previous results
    this.resultList.innerHTML = "";
    
    if (!movies || movies.length === 0) {
      return;
    }
    
    // Use DocumentFragment for performance (ONE DOM write!)
    const fragment = new DocumentFragment();
    
    movies.forEach(movie => {
      const clone = this.template.content.cloneNode(true);
      const card = clone.querySelector(".movie-card");
      const titleSpan = clone.querySelector(".title");
      const posterImg = clone.querySelector(".poster-img");
      const yearSpan = clone.querySelector(".year-value");
      const ratingSpan = clone.querySelector(".rating-value");
      const detailsBtn = clone.querySelector(".view-details-btn");
      
      // Set movie ID
      card.dataset.id = movie.id;
      
      // XSS-safe highlighted title
      const highlightedTitle = buildHighlightedTitle(movie.title, searchQuery);
      titleSpan.appendChild(highlightedTitle);
      
      // Set poster
      posterImg.src = API.getPosterUrl(movie.poster_path, "w342");
      posterImg.alt = movie.title;
      
      // Set year
      const year = movie.release_date ? movie.release_date.split("-")[0] : "N/A";
      yearSpan.textContent = year;
      
      // Set rating
      const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";
      ratingSpan.textContent = rating;
      
      // Add click handler to the whole card
      card.addEventListener("click", (e) => {
        // Don't trigger if clicking the details button (handled separately)
        if (e.target.closest(".view-details-btn")) return;
        if (this.onMovieSelect) this.onMovieSelect(movie.id);
      });
      
      // Add click handler to details button
      detailsBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (this.onMovieSelect) this.onMovieSelect(movie.id);
      });
      
      fragment.appendChild(clone);
    });
    
    // ONE DOM write operation
    this.resultList.appendChild(fragment);
  }
  
  clear() {
    this.resultList.innerHTML = "";
  }
}