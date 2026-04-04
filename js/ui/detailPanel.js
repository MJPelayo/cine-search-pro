import { API } from "../modules/api.js";

export class DetailPanelUI {
  constructor(panelElement, closeButton) {
    this.panel = panelElement;
    this.closeBtn = closeButton;
    this.escapeHandler = null;
    
    // DOM elements inside panel
    this.title = document.getElementById("detailTitle");
    this.overview = document.getElementById("detailOverview");
    this.genres = document.getElementById("detailGenres");
    this.cast = document.getElementById("detailCast");
    this.trailer = document.getElementById("detailTrailer");
    this.poster = document.getElementById("detailPoster");
    
    // Bind close events
    if (this.closeBtn) {
      this.closeBtn.addEventListener("click", () => this.close());
    }
  }
  
  open() {
    this.panel.style.display = "flex";
    document.body.style.overflow = "hidden";
    
    // Close on Escape key
    this.escapeHandler = (e) => {
      if (e.key === "Escape") this.close();
    };
    document.addEventListener("keydown", this.escapeHandler);
  }
  
  close() {
    this.panel.style.display = "none";
    document.body.style.overflow = "";
    
    if (this.escapeHandler) {
      document.removeEventListener("keydown", this.escapeHandler);
      this.escapeHandler = null;
    }
    
    this.clear();
  }
  
  clear() {
    if (this.title) this.title.textContent = "Movie Title";
    if (this.overview) this.overview.textContent = "";
    if (this.genres) this.genres.innerHTML = "";
    if (this.cast) this.cast.innerHTML = "";
    if (this.trailer) this.trailer.innerHTML = "";
    if (this.poster) this.poster.src = "";
  }
  
  setLoading() {
    if (this.title) this.title.textContent = "Loading...";
    if (this.overview) this.overview.textContent = "Fetching movie data...";
    if (this.genres) this.genres.innerHTML = '<span class="genre-badge">Loading...</span>';
    if (this.cast) this.cast.innerHTML = "<li>Loading cast...</li>";
    if (this.trailer) this.trailer.innerHTML = "<p>Loading trailer...</p>";
  }
  
  renderDetails(details) {
    if (this.title) this.title.textContent = details.title || "Unknown Title";
    if (this.overview) this.overview.textContent = details.overview || "No overview available.";
    
    // Render genres as badges
    if (this.genres) {
      this.genres.innerHTML = "";
      if (details.genres && details.genres.length > 0) {
        details.genres.forEach(genre => {
          const badge = document.createElement("span");
          badge.className = "genre-badge";
          badge.textContent = genre.name;
          this.genres.appendChild(badge);
        });
      } else {
        this.genres.innerHTML = "<span class='genre-badge'>No genres listed</span>";
      }
    }
    
    // Render poster
    if (this.poster && details.poster_path) {
      this.poster.src = API.getPosterUrl(details.poster_path, "w500");
      this.poster.alt = details.title;
    }
  }
  
  renderCredits(credits) {
    if (!this.cast) return;
    
    this.cast.innerHTML = "";
    const castMembers = credits.cast || [];
    const topCast = castMembers.slice(0, 8); // Show top 8 cast members
    
    if (topCast.length > 0) {
      topCast.forEach(actor => {
        const li = document.createElement("li");
        li.innerHTML = `<i class="fas fa-user"></i> ${actor.name} <span style="color:#888">as ${actor.character || "?"}</span>`;
        this.cast.appendChild(li);
      });
    } else {
      this.cast.innerHTML = "<li>No cast information available</li>";
    }
  }
  
  renderVideos(videos) {
    if (!this.trailer) return;
    
    this.trailer.innerHTML = "";
    const trailer = videos.results?.find(
      video => video.type === "Trailer" && video.site === "YouTube"
    );
    
    if (trailer) {
      const iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube.com/embed/${trailer.key}`;
      iframe.title = "Movie Trailer";
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;
      this.trailer.appendChild(iframe);
    } else {
      this.trailer.innerHTML = '<div class="no-trailer"><i class="fas fa-video-slash"></i><p>No trailer available</p></div>';
    }
  }
  
  showError(message) {
    if (this.overview) this.overview.textContent = message;
  }
}