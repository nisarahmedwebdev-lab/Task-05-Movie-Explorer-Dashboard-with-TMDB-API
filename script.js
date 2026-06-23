// CONFIGURATION
const API_KEY = "fc80e885c36aa71bdb70d3c6f94c0339"; 
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_PATH = "https://image.tmdb.org/t/p/w500";

// DOM SELECTIONS
const movieGrid = document.getElementById("movieGrid");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const sectionTitle = document.getElementById("sectionTitle");
const loader = document.getElementById("loader");
const statusMessage = document.getElementById("statusMessage");
const modal = document.getElementById("modal");
const closeBtn = document.getElementById("closeBtn");
const movieDetails = document.getElementById("movieDetails");

// NAVIGATION INTERACTION DOM
const homeLink = document.getElementById("homeLink");
const popularLink = document.getElementById("popularLink");
const topRatedLink = document.getElementById("topRatedLink");

// INITIAL EVENT APPLICATION
window.addEventListener("DOMContentLoaded", () => {
  if (!API_KEY || API_KEY.trim() === "") {
    showStatus("API key not configured.", true);
    return;
  }
  fetchMovies(`${BASE_URL}/movie/popular?api_key=${API_KEY}`, "🔥 Popular Movies");
});

// GLOBAL DISPATCH FETCH FUNCTION
async function fetchMovies(url, title) {
  showLoader(true);
  showStatus(null);
  movieGrid.innerHTML = "";
  sectionTitle.textContent = title;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Network response encountered an error.");
    
    const data = await response.json();
    showLoader(false);

    if (!data.results || data.results.length === 0) {
      showStatus("No movies found.");
      return;
    }
    
    renderGrid(data.results);
  } catch (error) {
    console.error(error);
    showLoader(false);
    showStatus("API Error. Failed to fetch resources.", true);
  }
}

// SAFE SECURE DOM RENDERING FOR GRID LIST
function renderGrid(movies) {
  movies.forEach(movie => {
    const card = document.createElement("div");
    card.className = "card";
    card.addEventListener("click", () => openDetails(movie.id));

    const img = document.createElement("img");
    img.src = movie.poster_path ? `${IMG_PATH}${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster';
    img.alt = movie.title || "Movie Poster";

    const cardBody = document.createElement("div");
    cardBody.className = "card-body";

    const title = document.createElement("h3");
    title.textContent = movie.title;

    const cardMeta = document.createElement("div");
    cardMeta.className = "card-meta";

    const yearStr = movie.release_date ? movie.release_date.split("-")[0] : "N/A";
    const releaseYear = document.createElement("span");
    releaseYear.textContent = yearStr;

    const rating = document.createElement("span");
    rating.className = "rating";
    rating.textContent = `⭐ ${movie.vote_average ? movie.vote_average.toFixed(1) : "0.0"}`;

    const overview = document.createElement("p");
    overview.className = "overview-trunc";
    overview.textContent = movie.overview || "No review snippet text provided.";

    // Assemble Element Tree structure securely
    cardMeta.appendChild(releaseYear);
    cardMeta.appendChild(rating);
    cardBody.appendChild(title);
    cardBody.appendChild(cardMeta);
    cardBody.appendChild(overview);
    card.appendChild(img);
    card.appendChild(cardBody);
    
    movieGrid.appendChild(card);
  });
}

// SEARCH FUNCTIONALITY TRIGGER
async function handleSearch() {
  const query = searchInput.value.trim();
  if (!query) {
    alert("Please enter a movie name.");
    return;
  }
  const encodedQuery = encodeURIComponent(query);
  fetchMovies(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodedQuery}`, `🔍 Results for: "${query}"`);
}

searchBtn.addEventListener("click", handleSearch);
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleSearch();
});

// DETAIL DIALOG MODAL DYNAMICS
async function openDetails(id) {
  movieDetails.innerHTML = ""; 
  modal.classList.add("active");
  document.body.classList.add("modal-open");
  
  const internalLoader = document.createElement("div");
  internalLoader.className = "loader";
  movieDetails.appendChild(internalLoader);

  try {
    const res = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}`);
    if (!res.ok) throw new Error("Could not extract individual movie metadata");
    const movie = await res.json();
    
    movieDetails.innerHTML = ""; // Clear loader thread safely

    // Left Column Image layout element structure
    const img = document.createElement("img");
    img.src = movie.poster_path ? `${IMG_PATH}${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster';
    img.alt = movie.title;

    // Right Content Info block element tree build
    const infoDiv = document.createElement("div");
    infoDiv.className = "details-info";

    const h1 = document.createElement("h1");
    h1.textContent = movie.title;
    infoDiv.appendChild(h1);

    if (movie.tagline) {
      const tagline = document.createElement("div");
      tagline.className = "tagline";
      tagline.textContent = movie.tagline;
      infoDiv.appendChild(tagline);
    }

    // Interactive Badges (Pills Container)
    const pillBox = document.createElement("div");
    pillBox.className = "meta-pill-box";

    const ratePill = document.createElement("span");
    ratePill.className = "pill accent";
    ratePill.textContent = `⭐ ${movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"} (${movie.vote_count || 0} votes)`;
    pillBox.appendChild(ratePill);

    if (movie.release_date) {
      const datePill = document.createElement("span");
      datePill.className = "pill";
      datePill.textContent = `Release: ${movie.release_date}`;
      pillBox.appendChild(datePill);
    }

    if (movie.runtime) {
      const timePill = document.createElement("span");
      timePill.className = "pill";
      timePill.textContent = `${movie.runtime} min`;
      pillBox.appendChild(timePill);
    }

    infoDiv.appendChild(pillBox);

    // Genres setup logic securely
    if (movie.genres && movie.genres.length > 0) {
      const genreHeader = document.createElement("h3");
      genreHeader.style.marginBottom = "5px";
      genreHeader.textContent = "Genres";
      infoDiv.appendChild(genreHeader);

      const genreBox = document.createElement("div");
      genreBox.className = "meta-pill-box";
      movie.genres.forEach(g => {
        const span = document.createElement("span");
        span.className = "pill";
        span.textContent = g.name;
        genreBox.appendChild(span);
      });
      infoDiv.appendChild(genreBox);
    }

    const overviewHeader = document.createElement("h3");
    overviewHeader.style.marginBottom = "5px";
    overviewHeader.textContent = "Overview";
    infoDiv.appendChild(overviewHeader);

    const desc = document.createElement("p");
    desc.textContent = movie.overview || "No deep context overview description structured summary file found.";
    infoDiv.appendChild(desc);

    // Structural Assembly onto Viewport Frame Container
    movieDetails.appendChild(img);
    movieDetails.appendChild(infoDiv);

  } catch (err) {
    movieDetails.innerHTML = `<div class="status-message">Failed loading extended details profile.</div>`;
  }
}

// CLOSING LOGIC UTILITIES
function closeModal() {
  modal.classList.remove("active");
  document.body.classList.remove("modal-open");
}

closeBtn.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

// APP SHELL NAVIGATION SIMULATION HANDLERS
homeLink.addEventListener("click", (e) => { e.preventDefault(); fetchMovies(`${BASE_URL}/movie/popular?api_key=${API_KEY}`, "🔥 Popular Movies"); });
popularLink.addEventListener("click", (e) => { e.preventDefault(); fetchMovies(`${BASE_URL}/movie/popular?api_key=${API_KEY}`, "🌟 Popular Movies"); });
topRatedLink.addEventListener("click", (e) => { e.preventDefault(); fetchMovies(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}`, "🎯 Top Rated Movies"); });

// UI HANDLER SYSTEM PROCESS FUNCTIONS
function showLoader(visible) {
  if (visible) loader.classList.remove("hidden");
  else loader.classList.add("hidden");
}

function showStatus(msg, isError = false) {
  if (!msg) {
    statusMessage.classList.add("hidden");
    return;
  }
  statusMessage.textContent = msg;
  statusMessage.style.color = isError ? "#ff003c" : "#aaa";
  statusMessage.classList.remove("hidden");
}