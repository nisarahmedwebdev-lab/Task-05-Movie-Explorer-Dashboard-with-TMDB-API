const API_KEY = "https://www.themoviedb.org/";

const BASE_URL =
"https://api.themoviedb.org/3";

const IMG =
"https://image.tmdb.org/t/p/w500";

const grid =
document.getElementById("movieGrid");

const searchInput =
document.getElementById("searchInput");

const searchBtn =
document.getElementById("searchBtn");

const modal =
document.getElementById("modal");

const closeBtn =
document.getElementById("closeBtn");

// Start

window.onload = ()=>{

if(API_KEY===""){

grid.innerHTML =
`<p class="error">
API key not configured.
</p>`;

return;

}

loadMovies();

};

async function loadMovies(){
showLoading();

try{
let res =
await fetch(
`${BASE_URL}/movie/popular?api_key=${API_KEY}`
);


let data =
await res.json();

displayMovies(data.results);

}catch(error){

showError();

}

}

function displayMovies(movies){


grid.innerHTML="";


movies.forEach(movie=>{


const card =
document.createElement("div");


card.className="card";


card.onclick =
()=>openDetails(movie.id);



card.innerHTML = `

<img src="${IMG+movie.poster_path}">


<div class="card-body">


<h3>${movie.title}</h3>


<div class="rating">
⭐ ${movie.vote_average}
</div>


<p class="overview">
${movie.overview}
</p>


</div>

`;



grid.appendChild(card);



});


}


searchBtn.onclick=async()=>{

let query =
searchInput.value.trim();

if(query===""){

alert("Please enter a movie name.");

return;

}

showLoading();

try{
let res =
await fetch(
`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}`
);

let data =
await res.json();

if(data.results.length===0){

grid.innerHTML=
"<p>No movies found.</p>";

return;

}

displayMovies(data.results);

}catch(e){

showError();

}
};







async function openDetails(id){


modal.classList.add("active");


document.body.style.overflow="hidden";


document.getElementById("movieDetails").innerHTML=
"<div class='loader'></div>";



let res =
await fetch(
`${BASE_URL}/movie/${id}?api_key=${API_KEY}`
);


let movie =
await res.json();



document.getElementById("movieDetails").innerHTML=

`

<div class="details">


<img src="${IMG+movie.poster_path}">


<div>

<h1>${movie.title}</h1>


<h3>${movie.tagline || ""}</h3>


<p>
Genres:
${movie.genres.map(g=>g.name).join(", ")}
</p>


<p>
Release:
${movie.release_date}
</p>


<p>
Runtime:
${movie.runtime} min
</p>


<p>
Votes:
${movie.vote_count}
</p>


<p>
${movie.overview}
</p>


</div>


</div>

`;

}




closeBtn.onclick=closeModal;


modal.onclick=(e)=>{


if(e.target===modal){

closeModal();

}

};



function closeModal(){

modal.classList.remove("active");

document.body.style.overflow="auto";

}





function showLoading(){

grid.innerHTML =
`
<div class="loader"></div>
`;

}



function showError(){

grid.innerHTML =
`
<p class="error">
Something went wrong. Check API key or connection.
</p>
`;

}