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
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    songs = [];
    let as = div.getElementsByTagName("a");
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`${folder}`)[1]);
        }
    }
    console.log("Current Folder:", currFolder);
    let songUL = document.querySelector(".song-list").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `
        <li>
            <img width="20" src="icons/music.svg" class="invert">
            <div class="info">
                <div class="f12">${song.replaceAll("%20", " ")}</div>
            </div>
            <div class="playnow items-center">
                <span class="f12">Play Now</span>
                <img width="20" class="invert" src="icons/play.svg">
            </div>
        </li>    `;
    }

    //Attach an event listener to each song
    Array.from(document.querySelector(".song-list").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })
    return songs
}

const playMusic = (track, pause = false) => {
    if (!currFolder) {
        console.error("currFolder is undefined");
        return;
    }
    currentSong.src = `${currFolder}` + track;
    currentSong.load();
    if (!pause) {
        currentSong.play()
        play.src = "icons/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".song-time").innerHTML = "00:00 / 00:00"

}
async function displayAlbums() {
    let a = await fetch(`https://spotify-backend-0het.onrender.com/songs`)
    let response = await a.text(); 
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes('/songs')) {
            let songsFolder = e.href.split("/").slice(-2)[0]
            let a = await fetch(`https://spotify-backend-0het.onrender.com/songs/${songsFolder}/info.json`)
            let response = await a.json();
            document.querySelector('.playlist-cards').innerHTML = document.querySelector('.playlist-cards').innerHTML + `<div class="card" data-folder="${songsFolder}">
                        <img class="m0" src="https://spotify-backend-0het.onrender.com/songs/${songsFolder}/cover.png">
                        <img class="play-button" width="45" src="icons/play-button.svg">
                        <h3>${response.name}</h3>
                        <p class="color-secondary">${response.description}</p>
                    </div>`

        }
    }
    
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            let songs = await getSongs(`songs/${item.currentTarget.dataset.folder}/`);
            playMusic(songs[0])
            // item.dataset.folder
        })
    })
}
async function main() {
    // Get the list of all the songs
    await getSongs("songs/")
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
        currentSong.pause();
        let songName = currentSong.src.split("/").pop();
        let index = songs.indexOf(songName);
        if (index - 1 >= 0) {
            playMusic(songs[index - 1]);
        }
    });

    next.addEventListener("click", () => {
        currentSong.pause();
        let songName = currentSong.src.split("/").pop();
        let index = songs.indexOf(songName);
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1]);
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