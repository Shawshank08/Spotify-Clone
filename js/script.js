let currentSong = new Audio();
let songs;
let currFolder;
function secondsToMinuteSeconds(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    // Pad the seconds with a leading zero if needed
    const formattedSeconds = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds;

    return `${minutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`https://spotify-backend-0het.onrender.com/${folder}`);
    let response = await a.json(); 

    if (!Array.isArray(response)) {
        console.error("Invalid song list response:", response);
        return [];
    }

    songs = response.filter(song => song.endsWith(".mp3"));
    
    console.log("Songs loaded:", songs); 
    
    let songUL = document.querySelector(".song-list ul");
    songUL.innerHTML = "";

    for (const song of songs) {
        songUL.innerHTML += `
        <li data-song="${song}">
            <img width="20" src="icons/music.svg" class="invert">
            <div class="info">
                <div class="f12">${decodeURIComponent(song)}</div>
            </div>
            <div class="playnow items-center">
                <span class="f12">Play Now</span>
                <img width="20" class="invert" src="icons/play.svg">
            </div>
        </li>`;
    }

    // Attach event listeners to songs
    document.querySelectorAll(".song-list li").forEach(li => {
        li.addEventListener("click", () => {
            let songName = li.dataset.song;
            console.log("Playing:", songName);
            playMusic(songName);
        });
    });

    return songs;
}

const playMusic = (track, pause = false) => {
    if (!currFolder || !track) {
        console.error("currFolder or track is undefined", currFolder, track);
        return;
    }

    // Construct the correct song URL
    let songURL = `https://spotify-backend-0het.onrender.com/${currFolder}/${track}`;

    // Remove any double slashes (except the `https://` part)
    songURL = songURL.replace(/([^:]\/)\/+/g, "$1");

    console.log("Playing song:", songURL);

    // Set and load the song
    currentSong.src = songURL;
    currentSong.load();

    // Play the song unless paused
    if (!pause) {
        currentSong.play().catch(error => {
            console.error("Playback failed:", error);
        });
        play.src = "icons/pause.svg";
    }

    // Update UI
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".song-time").innerHTML = "00:00 / 00:00";
};


async function displayAlbums() {
    try {
        let a = await fetch(`https://spotify-backend-0het.onrender.com/songs`);
        let folders = await a.json();  // ✅ Expect JSON response

        if (!Array.isArray(folders)) {
            console.error("Invalid response from server:", folders);
            return;
        }

        let albumContainer = document.querySelector('.playlist-cards');
        albumContainer.innerHTML = "";  // Clear existing content

        for (let folder of folders) {
            try {
                let infoResponse = await fetch(`https://spotify-backend-0het.onrender.com/songs/${folder}/info.json`);
                if (!infoResponse.ok) {
                    console.warn(`Missing info.json for ${folder}`);
                    continue;  // Skip if info.json is missing
                }

                let response = await infoResponse.json();
                albumContainer.innerHTML += `
                    <div class="card" data-folder="${folder}">
                        <img class="m0" src="https://spotify-backend-0het.onrender.com/songs/${folder}/cover.png" onerror="this.src='default-cover.png'">
                        <img class="play-button" width="45" src="icons/play-button.svg">
                        <h3>${response.name}</h3>
                        <p class="color-secondary">${response.description}</p>
                    </div>`;
            } catch (error) {
                console.error(`Error loading album ${folder}:`, error);
            }
        }

        // Add event listeners to play albums
        document.querySelectorAll(".card").forEach(e => {
            e.addEventListener("click", async (item) => {
                let folder = item.currentTarget.dataset.folder;
                let songs = await getSongs(`songs/${folder}/`);
                if (songs.length > 0) playMusic(songs[0]);
            });
        });
    } catch (error) {
        console.error("Error fetching albums:", error);
    }
}

async function main() {
    // Get the list of one album song
    await getSongs("songs/Arijit singh/")
    playMusic(songs[0], true)

    // Display Albums
    displayAlbums()
    
    //Play the first song
    // var audio = new Audio(songs[0])
    // audio.play()
    // Attach an event listener  to play, next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "icons/pause.svg"
        } else {
            currentSong.pause()
            play.src = "icons/play.svg"
        }
    })

    //Listener for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".song-time").innerHTML = `${secondsToMinuteSeconds(currentSong.currentTime)}/${secondsToMinuteSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // Add an event listener to seekbar    
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%"
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    document.querySelector(".hamburgerContainer").addEventListener("click", function () {
        const leftElement = document.querySelector(".left");
        if (leftElement.style.left === "0px" || leftElement.style.left === "") {
            leftElement.style.left = "-150%";
        } else {
            leftElement.style.left = "0px";
        }
    });

    previous.addEventListener("click", () => {
        if (!songs || songs.length === 0) {
            console.error("No songs available.");
            return;
        }
    
        // Extract song file name from full URL
        let songName = decodeURIComponent(currentSong.src.split("/").pop());
    
        let index = songs.findIndex(song => decodeURIComponent(song) === songName);
        
        if (index === -1) {
            console.error("Current song not found in list.");
            return;
        }
    
        if (index - 1 >= 0) {
            playMusic(songs[index - 1]);  // Play previous song
        } else {
            console.log("Already at the first song. Continuing playback.");
            currentSong.play(); // Keep playing current song instead of stopping
        }
    });
    
    next.addEventListener("click", () => {
        if (!songs || songs.length === 0) {
            console.error("No songs available.");
            return;
        }
    
        // Extract song file name from full URL
        let songName = decodeURIComponent(currentSong.src.split("/").pop());
    
        let index = songs.findIndex(song => decodeURIComponent(song) === songName);
        
        if (index === -1) {
            console.error("Current song not found in list.");
            return;
        }
    
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1]);  // Play next song
        } else {
            console.log("Already at the last song. Continuing playback.");
            currentSong.play(); // Keep playing current song instead of stopping
        }
    });
    

    document.querySelector("#range").addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100
        volume = currentSong.volume
        if(currentSong.volume > 0){
            document.querySelector('.range>img').src = document.querySelector('.range>img').src.replace("mute.svg", "volume.svg")
        }
        if(currentSong.volume == 0){
            document.querySelector('.range>img').src = document.querySelector('.range>img').src.replace("volume.svg", "mute.svg")
        }
    })

    document.querySelector('.range>img').addEventListener("click", function(e){
        if(e.target.src.includes('volume.svg')){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            document.querySelector("#range").value = 0
            currentSong.volume = 0
        }else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            document.querySelector("#range").value = 10
            currentSong.volume = 0.1
        }
    })
}

main()