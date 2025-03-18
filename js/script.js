function secondsToMinuteSeconds(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    // Pad the seconds with a leading zero if needed
    const formattedSeconds = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds;

    return `${minutes}:${formattedSeconds}`;
}

let currentSong = new Audio();
let songs;
let curFolder;
async function getSongs() {
    let a = await fetch("https://spotify-backend-0het.onrender.com/songs/")
    let response = await a.text()
    console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    let songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index]
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split("/songs/")[1])
        }
    }
    return songs
}

async function main(){
    // Get the list of all the songs
    let songs = await getSongs()
    playMusic(songs[0], true)

    let songUL = document.querySelector(".song-list").getElementsByTagName("ul")[0]
    for(const song of songs){
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
    Array.from(document.querySelector(".song-list").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click", element=>{
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })
    //Play the first song
    // var audio = new Audio(songs[0])
    // audio.play()
    // Attach an event listener  to play, next and previous
    play.addEventListener("click", ()=>{
        if(currentSong.paused){
            currentSong.play()
            play.src = "icons/pause.svg"
        }else{
            currentSong.pause()
            play.src = "icons/play.svg"
        }
    })

    //Listener for timeupdate event
    currentSong.addEventListener("timeupdate", ()=>{
        console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".song-time").innerHTML = `${secondsToMinuteSeconds(currentSong.currentTime)}/${secondsToMinuteSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime/currentSong.duration) * 100 + "%";
    })

    // Add an event listener to seekbar    
    document.querySelector(".seekbar").addEventListener("click", e=>{
        let percent = (e.offsetX/e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left =  percent  + "%"
        currentSong.currentTime = ((currentSong.duration)*percent)/100
    })
}

const playMusic = (track, pause = false) =>{
    currentSong.src = "https://spotify-backend-0het.onrender.com/songs/" + track
    if(!pause){
        currentSong.play()
        play.src = "icons/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".song-time").innerHTML = "00:00 / 00:00"
    
}
main()