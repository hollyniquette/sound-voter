/* selectors */
var genreInput = document.getElementById("genre-dropdown");
var tempoInput = document.getElementById("tempo-dropdown");
var songBtn = document.getElementById("get-song-btn");
var player = document.getElementById("player");
var recommendedTrackName = document.getElementById("track-name");
var recommendedTrackArtist = document.getElementById("track-artist");
var recommendedTrackImage = document.getElementById("track-image");
var saveBtn = document.getElementById("save-button");
var skipBtn = document.getElementById("skip-button");
var savedTracksList = document.getElementById("saved-tracks-list");

// local variables
var savedTracks = [];

/* event listeners */
genreInput.addEventListener("change", checkDropdowns);
tempoInput.addEventListener("change", checkDropdowns);
songBtn.addEventListener("click", fetchRecommendedTrack);
saveBtn.addEventListener("click", function () {
  saveTrack(
    recommendedTrackName.innerText,
    recommendedTrackArtist.innerText,
    recommendedTrackImage.src
  );
});
skipBtn.addEventListener("click", function () {
  fetchRecommendedTrack();
});

/* functions */

// Checks to see if both genre and mood dropdowns are populated

function checkDropdowns() {
  if (genreInput.value !== "" && tempoInput.value !== "") {
    songBtn.disabled = false;
    songBtn.classList.remove("disabled");
  } else {
    songBtn.disabled = true;
    songBtn.classList.add("disabled");
  }
}

/**
 * Get valid access token for Spotify API and save to localStorage
 * https://developer.spotify.com/dashboard/1de952fb45424bf386fb86f7f614b07b/settings
 */
function getSpotifyToken() {
  var tokenEndpoint = "https://accounts.spotify.com/api/token";
  var clientID = "1de952fb45424bf386fb86f7f614b07b";
  var clientSecret = "dbef79c4c9194664b0e02648ff826b4d";
  var options = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + btoa(clientID + ":" + clientSecret),
    },
    body: "grant_type=client_credentials",
    json: true,
  };

  fetch(tokenEndpoint, options)
    .then((response) => response.json())
    .then((data) => {
      // saving to localStorage
      localStorage.setItem("spotifyToken", data.access_token);
    })
    .catch((error) => console.error(error));
}

/**
 * Generates recommendation API query based on params
 */
function generateRecommendationUrl(genre, liveness) {
  var baseUrl = "https://api.spotify.com/v1/recommendations?";
  var finalUrl = baseUrl + "seed_genres=" + genre;
  var livenessString = "";

  // assign livenessString based on liveness input param
  switch (liveness) {
    case "party":
      livenessString = "min_liveness=.8&max_liveness=1";
      break;
    case "upbeat":
      livenessString = "min_liveness=.5&max_liveness=.7";
      break;
    case "chill":
      livenessString = "min_liveness=.1&max_liveness=.4";
      break;
  }

  // assemble finalUrl
  finalUrl = finalUrl + "&" + livenessString;

  return finalUrl;
  console.log(finalUrl);
}

/**
 * Fetch recommended track based on user input
 */
function fetchRecommendedTrack() {
  // only run if both dropdowns are selected
  if (genreInput.value && tempoInput.value) {
    player.classList.remove("hidden");
    var url = generateRecommendationUrl(genreInput.value, tempoInput.value);
    //console.log(url);
    var options = {
      method: "GET",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Bearer " + localStorage.getItem("spotifyToken"),
      },
    };
    fetch(url, options)
      .then((response) => response.json())
      .then((data) => {
        // Randomize recommended track from array
        var randomize = Math.floor(Math.random() * data.tracks.length);
        // display recommended track elements on page
        recommendedTrackName.innerText = data.tracks[randomize].name;
        recommendedTrackArtist.innerText =
          data.tracks[randomize].artists[0].name;
        recommendedTrackImage.src = data.tracks[randomize].album.images[0].url;
        // TO DO: player functionality
      });
  }
}

/**
 * Add track to playlist and save to local storage
 */
function saveTrack(trackName, trackArtist, trackImage) {
  savedTracks.push({
    trackName: trackName,
    trackArtist: trackArtist,
    trackImage: trackImage,
  });
  localStorage.setItem("savedTracksList", savedTracks);
  console.log(savedTracks);
  // get new track recommendation on click
  fetchRecommendedTrack();
  // dynamically populate saved tracks list
  savedTracksList.innerHTML = "";
  savedTracks.forEach(function (track) {
    var listItem = document.createElement("li");
    var trackCard =
      "" +
      '<div class="bg-white rounded-lg shadow-md p-4 flex">' +
      '<img src="' +
      track.trackImage +
      '" alt="' +
      track.trackName +
      ' Album Art" class="w-24 h-24 object-cover rounded-md">' +
      '<div class="ml-4">' +
      '<h3 class="text-xl font-semibold">' +
      track.trackName +
      "</h3>" +
      '<p class="text-gray-600">' +
      track.trackArtist +
      "</p>" +
      "</div>" +
      "</div>";
    savedTracksList.innerHTML += trackCard;
    savedTracksList.appendChild(listItem);
  });
}

// check if token exists in localStorage, if not, fetch valid token
// if (localStorage.getItem("spotifyToken") === null || undefined) {
getSpotifyToken();
// }
