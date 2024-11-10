let currentAudio = null;  // Track currently playing audio
const playlists = {};     // Store playlists and songs
let currentSong = null;

// API call for searching songs
async function searchSong() {
  const query = document.getElementById('song-input').value;
  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = "";  // Clear previous results

  if (!query) {
    resultDiv.innerHTML = "Please enter a song name or artist.";
    return;
  }

  try {
    const response = await fetch(`https://shazam.p.rapidapi.com/search?term=${query}&locale=en-US&offset=0&limit=5`, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": "d7205a78b7msh45f6e40ed61b467p1ffc53jsnab9d1e832184",  // Replace with your RapidAPI key
        "X-RapidAPI-Host": "shazam.p.rapidapi.com"
      }
    });

    const data = await response.json();
    if (data.tracks && data.tracks.hits.length > 0) {
      const songs = data.tracks.hits.map(hit => hit.track);  // Get top songs
      displaySongs(songs);  // Display the songs
    } else {
      resultDiv.innerHTML = "No results found.";
    }
  } catch (error) {
    console.error(error);
    resultDiv.innerHTML = "Error fetching song details.";
  }
}

// Display song results
function displaySongs(songs) {
  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = "";  // Clear current songs

  songs.forEach(song => {
    const songDetails = document.createElement('div');
    songDetails.classList.add('song-details');
    songDetails.innerHTML = `
      <strong>Song:</strong> ${song.title} <br>
      <strong>Artist:</strong> ${song.subtitle} <br>
      <img src="${song.images.coverart}" alt="Cover Art" width="100px" /> <br>
      <audio controls>
        <source src="${song.hub.actions[1]?.uri}" type="audio/mpeg">
        Your browser does not support the audio element.
      </audio>
      <button onclick="promptPlaylist('${song.title}', '${song.subtitle}', '${song.hub.actions[1]?.uri}', '${song.images.coverart}')">❤️ Add to Playlist</button>
    `;
    resultDiv.appendChild(songDetails);
  });
}

function promptPlaylist(title, artist, audioUrl, coverArt) {
  currentSong = { title, artist, audioUrl, coverArt };
  
  if (Object.keys(playlists).length === 0) {
    alert('Please create a playlist first.');
    return;
  }

  // Populate playlist dropdown
  const playlistSelect = document.getElementById('playlist-select');
  playlistSelect.innerHTML = Object.keys(playlists).map(playlistName => `<option value="${playlistName}">${playlistName}</option>`).join('');

  // Show popup
  document.getElementById('overlay').style.display = 'block';
  document.getElementById('playlist-add-popup').style.display = 'block';
}

function addToPlaylist() {
  const selectedPlaylistName = document.getElementById('playlist-select').value;
  const playlist = playlists[selectedPlaylistName];

  // Check if the song already exists in the selected playlist
  if (playlist.some(song => song.title === currentSong.title)) {
    alert('This song is already in the playlist.');
  } else {
    playlist.push(currentSong);
    alert(`Song "${currentSong.title}" added to playlist "${selectedPlaylistName}".`);
  }

  hideAddPlaylistPopup();
}

function createPlaylist() {
  const newPlaylistName = document.getElementById('new-playlist-name').value;
  if (!newPlaylistName) {
    alert('Please enter a playlist name.');
    return;
  }

  playlists[newPlaylistName] = [];
  updatePlaylistUI();
  hideCreatePlaylistPopup();
}

function showCreatePlaylistPopup() {
  document.getElementById('playlist-popup').style.display = 'block';
  document.getElementById('overlay').style.display = 'block';
}

function hideCreatePlaylistPopup() {
  document.getElementById('playlist-popup').style.display = 'none';
  document.getElementById('overlay').style.display = 'none';
}

function updatePlaylistUI() {
  const playlistList = document.getElementById('playlist-list');
  playlistList.innerHTML = Object.keys(playlists).map(name => `<div>${name}</div>`).join('');
}

function showSearch() {
  const searchInput = document.getElementById('song-input');
  searchInput.style.display = searchInput.style.display === 'block' ? 'none' : 'block';
}

document.getElementById('playlist-list').innerHTML = Object.keys(playlists).map(playlistName => `<div>${playlistName}</div>`).join('');
