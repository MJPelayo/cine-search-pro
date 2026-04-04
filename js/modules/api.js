// API Configuration and Calls
const API_KEY = "0f2ab52c5bbe9fff12bc8b2a15a116fd";
const BASE_URL = "https://api.themoviedb.org";

export const API = {
  // Search for movies
  searchMovies: async (query, signal) => {
    const response = await fetch(
      `${BASE_URL}/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`,
      { signal }
    );
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    return data.results;
  },

  // Get movie details
  getMovieDetails: async (movieId) => {
    const response = await fetch(`${BASE_URL}/3/movie/${movieId}?api_key=${API_KEY}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  // Get movie credits (cast & crew)
  getMovieCredits: async (movieId) => {
    const response = await fetch(`${BASE_URL}/3/movie/${movieId}/credits?api_key=${API_KEY}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  // Get movie videos (trailers)
  getMovieVideos: async (movieId) => {
    const response = await fetch(`${BASE_URL}/3/movie/${movieId}/videos?api_key=${API_KEY}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  // Get poster URL
  getPosterUrl: (posterPath, size = "w500") => {
    if (!posterPath) return "https://via.placeholder.com/500x750?text=No+Poster";
    return `https://image.tmdb.org/t/p/${size}${posterPath}`;
  }
};