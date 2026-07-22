// Kitschy early web JavaScript
// Welcome alert (classic 90s style)
window.addEventListener('load', function() {
    console.log('J.E.S.U.S. Music Records site loaded!');
});

// Add some retro interactivity
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scroll for navigation links
    const links = document.querySelectorAll('nav a');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('href').substring(1);
            const element = document.getElementById(target);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // Pop-up ads functionality - but not on mobile
const images = ['image1.png', 'image2.jpeg', 'image3.png', 'image4.jpeg', 'image5.jpg'];
let popupCount = 0;
const maxPopups = images.length;

// Skip pop-ups entirely on mobile
if (window.innerWidth > 768) {
    function makeDraggable(element) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        element.onmousedown = dragMouseDown;
        
        function dragMouseDown(e) {
            // Don't drag if clicking the close button
            if (e.target.classList.contains('close-btn')) {
                return;
            }
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
            element.style.cursor = 'grabbing';
        }
        
        function elementDrag(e) {
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.left = (element.offsetLeft - pos1) + "px";
        }
        
        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
            element.style.cursor = 'grab';
        }
    }
    
    function createPopup() {
        if (popupCount >= maxPopups) {
            return;
        }
        
        const popup = document.createElement('div');
        popup.className = 'popup-ad';
        
        // Random position
        const maxX = window.innerWidth - 350;
        const maxY = window.innerHeight - 300;
        const randomX = Math.max(50, Math.random() * maxX);
        const randomY = Math.max(100, Math.random() * maxY);
        
        popup.style.left = randomX + 'px';
        popup.style.top = randomY + 'px';
        
        // Get random image
        const randomImage = images[Math.floor(Math.random() * images.length)];
        
        popup.innerHTML = `
            <button class="close-btn">×</button>
            <img src="${randomImage}" alt="Pop-up ad">
        `;
        
        document.body.appendChild(popup);
        
        // Close button functionality
        popup.querySelector('.close-btn').addEventListener('click', function() {
            popup.remove();
        });
        
        // Make draggable
        makeDraggable(popup);
        
        // Animate in
        setTimeout(() => {
            popup.classList.add('show');
        }, 10);
        
        popupCount++;
    }
    
    // Show first popup after 10 seconds, then every 10 seconds
    let popupInterval;
    setTimeout(function() {
        createPopup();
        popupInterval = setInterval(function() {
            if (popupCount >= maxPopups) {
                clearInterval(popupInterval);
            } else {
                createPopup();
            }
        }, 10000);
    }, 10000);
}
});

// Music player setup
const audioPlayer = document.getElementById('audioPlayer');
const albumArt = document.getElementById('albumArt');
const trackTitle = document.getElementById('trackTitle');
const progressBar = document.getElementById('progressBar');
const progressContainer = document.querySelector('.progress-container');
const currentTimeDisplay = document.getElementById('currentTime');
const totalTimeDisplay = document.getElementById('totalTime');

const playlist = [
    { 
        audio: 'WWJS - KLEZTRONICA TUNNEL VERSION 1 copy.mp3', 
        cover: 'wwjs kleztronica full blue solid cd 2.png',
        title: 'WWJS - KLEZTRONICA TUNNEL 770 VERSION',
        artists: ['Diva Nigun', 'Mikhl Yashinsky'],  // Array of artists
        lyricsFile: 'wwjs-lyrics.txt',
        lyricsDisplay: 'scrolling',
        lyricsStartTime: 50,
        lyricsEndTime: 180,
        lyricsPauses: [
            { startTime: 136, duration: 33 }
        ],
        danceModes: [
            { startTime: 168, endTime: 200 }
        ],
        danceBackground: 'jesusflashing.gif'
    },
    { 
        audio: 'ana bchoakh remix ! - ana bchoke me march 2025 1.mp3',
        cover: 'placeholder-cover-art.png',
        title: 'Ana B\'choke Me',
        artists: ['Diva Nigun'],  // Array with single artist
        lyricsFile: 'ana-lyrics.txt',
        lyricsDisplay: 'scrolling',
        lyricsStartTime: 0,
        lyricsEndTime: 150,
        danceModes: [
            { startTime: 55.5, endTime: 83}
        ],
        danceBackground: 'jesusgif2.gif'
    },
    {
        audio: 'roses are red 2 louder.mp3',
        cover: 'placeholder-cover-art.png',
        title: 'Shoutout to Mr. Cohen',
        artists: ['Diva Nigun'],
        lyricsFile: '',
        lyricsDisplay: 'scrolling',
        lyricsStartTime: 0,
        lyricsEndTime: 150,
        danceModes: [
            { startTime: 18, endTime: 47.75}
        ],
        danceBackground: 'jesusgif4.gif'
    },
    {
        audio: 'marni great grandparent melody instagram mastered 2 clipped.mp3',
        cover: 'placeholder-cover-art.png',
        title: 'My Great Grandfather’s Kedusha',
        artists: ['Diva Nigun', 'Marni Loffman'],
        lyricsFile: '',
        lyricsDisplay: 'scrolling',
        lyricsStartTime: 0,
        lyricsEndTime: 150,
        danceModes: [],
        danceBackground: 'jesusgif5.gif'
    }
];

let currentTrack = 0;

// Format time in minutes:seconds
function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Load lyrics from file
async function loadLyrics(track) {
    const lyricsDisplay = document.getElementById('lyricsDisplay');
    const lyricsContent = document.getElementById('lyricsContent');
    
    // Handle no lyrics
    if (!track.lyricsFile || track.lyricsDisplay === 'none') {
        lyricsDisplay.classList.add('no-lyrics');
        lyricsDisplay.classList.remove('static-lyrics');
        return;
    }
    
    // Remove no-lyrics class
    lyricsDisplay.classList.remove('no-lyrics');
    
    // Set static or scrolling mode
    if (track.lyricsDisplay === 'static') {
        lyricsDisplay.classList.add('static-lyrics');
    } else {
        lyricsDisplay.classList.remove('static-lyrics');
    }
    
    try {
        const response = await fetch(track.lyricsFile);
        const lyrics = await response.text();
        
        lyricsContent.textContent = lyrics;
        lyricsContent.style.top = track.lyricsDisplay === 'static' ? '0' : '100%'; // Reset position
    } catch (error) {
        console.error('Error loading lyrics:', error);
    }
}

// Check if we're in a dance mode section
function checkDanceMode() {
    const track = playlist[currentTrack];
    if (!track.danceModes) return;
    
    const currentTime = audioPlayer.currentTime;
    let inDanceMode = false;
    
    for (const danceSection of track.danceModes) {
        if (currentTime >= danceSection.startTime && currentTime <= danceSection.endTime) {
            inDanceMode = true;
            break;
        }
    }
    
    // Toggle dance mode class and set background
    if (inDanceMode) {
        if (!document.body.classList.contains('dance-mode')) {
            document.body.classList.add('dance-mode');
            
            // Set the specific dance mode background
            // Remove any existing dance mode class
            document.body.classList.remove('dance-mode-1', 'dance-mode-2', 'dance-mode-3', 'dance-mode-4', 'dance-mode-5');
            
            // Add the class for this track's dance background
            const danceIndex = currentTrack + 1;
            document.body.classList.add(`dance-mode-${danceIndex}`);
        }
    } else {
        document.body.classList.remove('dance-mode', 'dance-mode-1', 'dance-mode-2', 'dance-mode-3', 'dance-mode-4', 'dance-mode-5');
    }
}

// Update lyrics scroll position with pauses
function updateLyricsScroll() {
    const track = playlist[currentTrack];
    
    // Don't scroll if static or no lyrics
    if (!track.lyricsFile || track.lyricsDisplay !== 'scrolling') return;
    
    const currentTime = audioPlayer.currentTime;
    const lyricsContent = document.getElementById('lyricsContent');
    
    // Only scroll during the lyrics timeframe
    if (currentTime < track.lyricsStartTime || currentTime > track.lyricsEndTime) {
        return;
    }
    
    // Calculate adjusted time accounting for pauses
    let adjustedTime = currentTime - track.lyricsStartTime;
    let totalPauseDuration = 0;
    
    if (track.lyricsPauses) {
        for (const pause of track.lyricsPauses) {
            const pauseStart = pause.startTime - track.lyricsStartTime;
            const pauseEnd = pauseStart + pause.duration;
            
            // If we're currently in a pause, freeze the lyrics
            if (adjustedTime >= pauseStart && adjustedTime < pauseEnd) {
                adjustedTime = pauseStart;
                break;
            }
            
            // If we've passed this pause, subtract its duration from our position
            if (adjustedTime >= pauseEnd) {
                totalPauseDuration += pause.duration;
            }
        }
    }
    
    // Subtract total pause time
    adjustedTime -= totalPauseDuration;
    
    const lyricsDuration = track.lyricsEndTime - track.lyricsStartTime;
    const progress = adjustedTime / lyricsDuration;
    
    // Calculate how far to scroll
    const scrollDistance = 100 + (lyricsContent.offsetHeight / 4);
    const currentPosition = 100 - (progress * scrollDistance);
    
    lyricsContent.style.top = currentPosition + '%';
}

function loadTrack(index) {
    audioPlayer.src = playlist[index].audio;
    albumArt.src = playlist[index].cover;
    trackTitle.textContent = playlist[index].title;
    
    // Format artists with commas
    const artistText = playlist[index].artists.join(', ');
    document.getElementById('trackArtist').textContent = artistText;
    
    currentTrack = index;
    loadLyrics(playlist[index]);
}

document.getElementById('playBtn').addEventListener('click', () => {
    audioPlayer.play();
    albumArt.classList.add('rotating');
});

document.getElementById('pauseBtn').addEventListener('click', () => {
    audioPlayer.pause();
    albumArt.classList.remove('rotating');
});

document.getElementById('prevBtn').addEventListener('click', () => {
    // If more than 3 seconds into the song, restart it
    // Otherwise, go to previous track
    if (audioPlayer.currentTime > 3) {
        audioPlayer.currentTime = 0;
    } else {
        currentTrack = (currentTrack - 1 + playlist.length) % playlist.length;
        loadTrack(currentTrack);
    }
    audioPlayer.play();
    albumArt.classList.add('rotating');
});

document.getElementById('nextBtn').addEventListener('click', () => {
    currentTrack = (currentTrack + 1) % playlist.length;
    loadTrack(currentTrack);
    audioPlayer.play();
    albumArt.classList.add('rotating');
});

// Auto-advance to next track when song ends
audioPlayer.addEventListener('ended', () => {
    document.getElementById('nextBtn').click();
});

// Stop rotation when paused
audioPlayer.addEventListener('pause', () => {
    albumArt.classList.remove('rotating');
    document.body.classList.remove('dance-mode', 'dance-mode-1', 'dance-mode-2', 'dance-mode-3', 'dance-mode-4', 'dance-mode-5');
});

audioPlayer.addEventListener('play', () => {
    albumArt.classList.add('rotating');
    checkDanceMode();
});

// Update progress bar, times, and lyrics as song plays
audioPlayer.addEventListener('timeupdate', () => {
    const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progressBar.style.width = progress + '%';
    currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
    totalTimeDisplay.textContent = formatTime(audioPlayer.duration);
    updateLyricsScroll();

    // Only check dance mode if playing
    if (!audioPlayer.paused) {
        checkDanceMode();
    }
});

// Update total time when metadata loads
audioPlayer.addEventListener('loadedmetadata', () => {
    totalTimeDisplay.textContent = formatTime(audioPlayer.duration);
});

// Click on progress bar to seek
progressContainer.addEventListener('click', (e) => {
    const rect = progressContainer.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = clickX / width;
    audioPlayer.currentTime = percentage * audioPlayer.duration;
});

// Load first track on page load
loadTrack(0);