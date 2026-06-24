const API_KEY = "fc80e885c36aa71bdb70d3c6f94c0339"; // API Key
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_PATH = "https://image.tmdb.org/t/p/w500";
const ORIGINAL_IMG = "https://image.tmdb.org/t/p/original";

const movieGrid = document.getElementById("movieGrid");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const ratingFilter = document.getElementById("ratingFilter");
const sectionTitle = document.getElementById("sectionTitle");
const loader = document.getElementById("loader");
const statusMessage = document.getElementById("statusMessage");
const modal = document.getElementById("modal");
const closeBtn = document.getElementById("closeBtn");
const movieDetails = document.getElementById("movieDetails");

const slidesContainer = document.getElementById("slidesContainer");
const carouselDots = document.getElementById("carouselDots");

let dynamicMoviesList = [];
let currentSlideIndex = 0;
let sliderTimerId = null;

window.addEventListener("DOMContentLoaded", () => {
  fetchMovies(`${BASE_URL}/trending/movie/day?api_key=${API_KEY}`, "Trending Now", true);
});

async function fetchMovies(url, title, initSlider = false) {
  showLoader(true);
  showStatus(null);
  movieGrid.innerHTML = "";
  sectionTitle.textContent = title;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Faulty response network state.");
    const data = await response.json();
    showLoader(false);

    if (!data.results || data.results.length === 0) {
      showStatus("No movies found.");
      return;
    }
    
    dynamicMoviesList = data.results;

    
    if (initSlider) {
      setupHeroSlider(dynamicMoviesList.slice(0, 5));
    }

    applyCurrentFilters();
  } catch (error) {
    showLoader(false);
    showStatus("network error.", true);
  }
}


function setupHeroSlider(movies) {
  clearInterval(sliderTimerId); 
  slidesContainer.innerHTML = "";
  carouselDots.innerHTML = "";
  currentSlideIndex = 0;

  movies.forEach((movie, idx) => {
    
    const slide = document.createElement("div");
    slide.className = `slide ${idx === 0 ? "active" : ""}`;
    const bkgUrl = movie.backdrop_path ? `${ORIGINAL_IMG}${movie.backdrop_path}` : '';
    slide.style.backgroundImage = `url('${bkgUrl}')`;

    const overlay = document.createElement("div");
    overlay.className = "hero-overlay";

    const content = document.createElement("div");
    content.className = "hero-content";

    const h1 = document.createElement("h1");
    h1.textContent = movie.title;

    const meta = document.createElement("div");
    meta.className = "hero-meta";

    const starsDiv = document.createElement("div");
    starsDiv.className = "stars";
    const starCount = Math.round((movie.vote_average || 0) / 2);
    starsDiv.textContent = "⭐".repeat(starCount) + "☆".repeat(5 - starCount);

    const spanGen = document.createElement("span");
    spanGen.textContent = "Featured Banner Presentation";

    const desc = document.createElement("p");
    desc.textContent = movie.overview || "No extended overview profile statement saved.";

    const btnCont = document.createElement("div");
    btnCont.className = "hero-buttons";
    const playBtn = document.createElement("button");
    playBtn.className = "btn btn-accent";
    playBtn.textContent = "▶ Watch Trailer";
    playBtn.addEventListener("click", () => openDetails(movie.id));

    // Connect node element structure trees safely
    meta.appendChild(starsDiv);
    meta.appendChild(spanGen);
    btnCont.appendChild(playBtn);
    content.appendChild(h1);
    content.appendChild(meta);
    content.appendChild(desc);
    content.appendChild(btnCont);
    slide.appendChild(overlay);
    slide.appendChild(content);
    slidesContainer.appendChild(slide);

    
    const dot = document.createElement("div");
    dot.className = `dot ${idx === 0 ? "active" : ""}`;
    dot.addEventListener("click", () => changeActiveSlide(idx));
    carouselDots.appendChild(dot);
  });

  sliderTimerId = setInterval(() => {
    let nextIdx = (currentSlideIndex + 1) % movies.length;
    changeActiveSlide(nextIdx);
  }, 4000);
}

function changeActiveSlide(targetIdx) {
  const allSlides = document.querySelectorAll(".slide");
  const allDots = document.querySelectorAll(".dot");

  if (!allSlides.length) return;

  allSlides[currentSlideIndex].classList.remove("active");
  allDots[currentSlideIndex].classList.remove("active");

  currentSlideIndex = targetIdx;

  allSlides[currentSlideIndex].classList.add("active");
  allDots[currentSlideIndex].classList.add("active");
}

function applyCurrentFilters() {
  movieGrid.innerHTML = "";
  const minRating = parseFloat(ratingFilter.value);
  const filtered = dynamicMoviesList.filter(m => (m.vote_average || 0) >= minRating);

  if (filtered.length === 0) {
    showStatus("No movies matches discovered for this rating score value filter threshold.");
    return;
  }
  showStatus(null);
  renderGrid(filtered);
}

function renderGrid(movies) {
  movies.forEach(movie => {
    const card = document.createElement("div");
    card.className = "card";
    card.addEventListener("click", () => openDetails(movie.id));

    const img = document.createElement("img");
    img.src = movie.poster_path ? `${IMG_PATH}${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster';
    img.alt = movie.title;

    const cardBody = document.createElement("div");
    cardBody.className = "card-body";

    const title = document.createElement("h3");
    title.textContent = movie.title;

    const cardMeta = document.createElement("div");
    cardMeta.className = "card-meta";

    const releaseYear = document.createElement("span");
    releaseYear.textContent = movie.release_date ? movie.release_date.split("-")[0] : "N/A";

    const rating = document.createElement("span");
    rating.className = "rating";
    rating.textContent = `⭐ ${movie.vote_average ? movie.vote_average.toFixed(1) : "0.0"}`;

    cardMeta.appendChild(releaseYear);
    cardMeta.appendChild(rating);
    cardBody.appendChild(title);
    cardBody.appendChild(cardMeta);
    card.appendChild(img);
    card.appendChild(cardBody);
    
    movieGrid.appendChild(card);
  });
}


async function handleSearch() {
  const query = searchInput.value.trim();
  if (!query) return alert("Please enter a movie name.");
  fetchMovies(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`, `Search Results: "${query}"`, false);
}

searchBtn.addEventListener("click", handleSearch);
searchInput.addEventListener("keypress", (e) => { if (e.key === "Enter") handleSearch(); });
ratingFilter.addEventListener("change", applyCurrentFilters);

async function openDetails(id) {
  movieDetails.innerHTML = "<div class='loader'></div>";
  modal.classList.add("active");
  document.body.classList.add("modal-open");

  try {
    const [movieRes, videoRes] = await Promise.all([
      fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}`),
      fetch(`${BASE_URL}/movie/${id}/videos?api_key=${API_KEY}`)
    ]);
    
    const movie = await movieRes.json();
    const videoData = await videoRes.json();
    movieDetails.innerHTML = "";

    const trailer = videoData.results.find(vid => vid.site === "YouTube" && (vid.type === "Trailer" || vid.type === "Teaser"));
    const layoutDiv = document.createElement("div");
    layoutDiv.className = "details-layout";

    if (trailer && trailer.key) {
      const videoCont = document.createElement("div");
      videoCont.className = "video-container";
      
      const iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube.com/embed/${trailer.key}?autoplay=1&modestbranding=1`;
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;
      
      videoCont.appendChild(iframe);
      layoutDiv.appendChild(videoCont);
    } else {
      const fallbackMsg = document.createElement("div");
      fallbackMsg.className = "status-message";
      fallbackMsg.textContent = "No official video trailer clip configuration data filed.";
      layoutDiv.appendChild(fallbackMsg);
    }

    const infoDiv = document.createElement("div");
    infoDiv.className = "details-info";

    const h1 = document.createElement("h1");
    h1.textContent = movie.title;
    infoDiv.appendChild(h1);

    if (movie.tagline) {
      const tagline = document.createElement("div");
      tagline.className = "tagline";
      tagline.textContent = `"${movie.tagline}"`;
      infoDiv.appendChild(tagline);
    }

    const pillBox = document.createElement("div");
    pillBox.className = "meta-pill-box";

    const ratePill = document.createElement("span");
    ratePill.className = "pill accent";
    ratePill.textContent = `⭐ ${movie.vote_average ? movie.vote_average.toFixed(1) : "0.0"}`;
    pillBox.appendChild(ratePill);

    if (movie.release_date) {
      const datePill = document.createElement("span");
      datePill.className = "pill";
      datePill.textContent = `Released: ${movie.release_date}`;
      pillBox.appendChild(datePill);
    }

    if (movie.runtime) {
      const timePill = document.createElement("span");
      timePill.className = "pill";
      timePill.textContent = `${movie.runtime} min`;
      pillBox.appendChild(timePill);
    }
    infoDiv.appendChild(pillBox);

    const desc = document.createElement("p");
    desc.textContent = movie.overview || "No deep description file configured.";
    infoDiv.appendChild(desc);

    layoutDiv.appendChild(infoDiv);
    movieDetails.appendChild(layoutDiv);

  } catch {
    movieDetails.innerHTML = `<div class="status-message">Error processing views.</div>`;
  }
}

function closeModal() {
  movieDetails.innerHTML = ""; 
  modal.classList.remove("active");
  document.body.classList.remove("modal-open");
}
closeBtn.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

homeLink.addEventListener("click", (e) => { e.preventDefault(); ratingFilter.value = "0"; fetchMovies(`${BASE_URL}/trending/movie/day?api_key=${API_KEY}`, "Trending Now", true); });
popularLink.addEventListener("click", (e) => { e.preventDefault(); ratingFilter.value = "0"; fetchMovies(`${BASE_URL}/movie/popular?api_key=${API_KEY}`, "Popular Movies", true); });
topRatedLink.addEventListener("click", (e) => { e.preventDefault(); ratingFilter.value = "0"; fetchMovies(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}`, "Top Rated Movies", true); });

function showLoader(visible) { visible ? loader.classList.remove("hidden") : loader.classList.add("hidden"); }
function showStatus(msg, isError = false) {
  if (!msg) { statusMessage.classList.add("hidden"); return; }
  statusMessage.textContent = msg;
  statusMessage.style.color = isError ? "#00ff66" : "#777";
  statusMessage.classList.remove("hidden");
}