"use strict";

// Clé API et conteneur principal
const keyApi = import.meta.env.VITE_API_KEY;

const container = document.querySelector(".movie-container");

// Récupérer l'ID du film depuis l'URL
const getMovieIdFromURL = () =>
  new URLSearchParams(window.location.search).get("id");

// Formater la date de sortie
const formatDate = (date) => {
  return new Date(date).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Fonction générique pour effectuer des requêtes API
const fetchData = async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Erreur de requête: ${response.status}`);
  return response.json();
};

// Fonction pour afficher les détails du film
const displayMovieDetails = async (movieId) => {
  try {
    // Récupération des détails du film et des vidéos associées (bande-annonces)
    const [movie, videos] = await Promise.all([
      fetchData(
        `https://api.themoviedb.org/3/movie/${movieId}?&language=fr-FR&api_key=${keyApi}`
      ),
      fetchData(
        `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${keyApi}&language=fr-FR`
      ),
    ]);

    // Trouver la bande-annonce
    const trailer = videos.results.find(
      (video) => video.type === "Trailer" && video.site === "YouTube"
    );

    // Construction du contenu HTML pour l'affichage des détails du film
    const html = `
      <article class="movie-details">
        ${
          trailer
            ? `<iframe class="video-movie" src="https://www.youtube.com/embed/${trailer.key}" frameborder="0" allowfullscreen></iframe>`
            : `<p>Aucune bande-annonce disponible.</p>`
        }
        <h2 class="movie-title">${movie.title}</h2>
        <p class="movie-description">${movie.overview}</p>
        <p class="movie-release-date"><strong>Date de sortie :</strong> ${formatDate(
          movie.release_date
        )}</p>
        <p class="movie-genres"><strong>Genres :</strong> ${movie.genres
          .map((genre) => genre.name)
          .join(", ")}</p>
        <p><strong>Note :</strong> ${movie.vote_average}</p>
      </article>
    `;

    // Insertion du HTML dans le conteneur
    container.insertAdjacentHTML("beforeend", html);
  } catch (error) {
    console.error("Erreur lors du chargement des détails du film :", error);
    container.innerHTML =
      "<p>Erreur lors du chargement des détails du film.</p>";
  }
};

// Récupérer l'ID du film et afficher ses détails
const movieId = getMovieIdFromURL();
if (movieId) {
  displayMovieDetails(movieId);
} else {
  console.error("Aucun ID de film trouvé dans l'URL.");
}
