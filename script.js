"use strict";

// Sélection des éléments du DOM
document.addEventListener("DOMContentLoaded", () => {
  const containerMovies = document.querySelector(".container-movies");
  const btnSeeMore = document.querySelector(".btn-seemore");
  const searchBtn = document.querySelector(".search-btn");
  const searchInput = document.querySelector(".search-input");
  const btnNowPlaying = document.querySelector(".btn-newmovie");

  const keyApi = "cc21ebb0db4ce9af88a32340aab320b7";
  let currentPage = 1;
  let totalPages = 1;
  let moviesCache = [];

  // Fonction générique pour appeler l'API TMDB
  async function fetchMovies(endpoint, page = 4) {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${endpoint}?api_key=${keyApi}&page=${page}`
      );
      if (!response.ok) throw new Error("Erreur réseau");

      const data = await response.json();
      totalPages = data.total_pages;
      moviesCache.push(...data.results);
      displayMovies();

      if (currentPage >= totalPages) btnSeeMore.style.display = "none";
    } catch (error) {
      console.error("Erreur de récupération des films : ", error);
    }
  }

  // Affichage des films
  function displayMovies() {
    const moviesToDisplay = moviesCache.slice(
      (currentPage - 1) * 10,
      currentPage * 10
    );

    const html = moviesToDisplay
      .map(
        (movie) => `
        <div class="movie-card" data-id="${movie.id}">
          <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
        </div>`
      )
      .join("");

    containerMovies.insertAdjacentHTML("beforeend", html);
    attachMovieClickEvents();
  }

  // Ajouter les événements de clic aux films
  function attachMovieClickEvents() {
    document.querySelectorAll(".movie-card").forEach((card) => {
      card.addEventListener("click", (e) => {
        const movieId = e.currentTarget.getAttribute("data-id");
        window.location.href = `movie.html?id=${movieId}`;
      });
    });
  }

  // Recherche de films par titre
  async function searchMovieByTitle() {
    const searchMovie = searchInput.value.trim();
    if (!searchMovie) return alert("Veuillez entrer un titre de film.");

    moviesCache = []; // Réinitialiser le cache
    containerMovies.innerHTML = ""; // Vider le conteneur

    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${keyApi}&query=${searchMovie}`
      );
      if (!response.ok) throw new Error("Erreur réseau");

      const data = await response.json();
      moviesCache = data.results;
      displayMovies();
      searchInput.value = "";
    } catch (error) {
      console.error("Erreur lors de la recherche de film : ", error);
    }
  }

  // Gestion des événements
  searchBtn.addEventListener("click", searchMovieByTitle);
  searchInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") searchMovieByTitle();
  });

  btnSeeMore.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      fetchMovies("popular", currentPage);
    } else {
      btnSeeMore.style.display = "none";
    }
  });

  btnNowPlaying.addEventListener("click", () => {
    moviesCache = []; // Réinitialiser le cache des films
    currentPage = 1;
    containerMovies.innerHTML = ""; // Vider le conteneur
    fetchMovies("now_playing"); // Charger les films "now playing"
  });

  // Chargement initial des films populaires
  fetchMovies("popular");
});
