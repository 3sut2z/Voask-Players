const video = document.getElementById('myVideo');
const playPauseBtn = document.getElementById('playPauseBtn');
const bigPlayBtn = document.getElementById('bigPlayBtn');
const progressBar = document.getElementById('progressBar');
const timeline = document.getElementById('timelineContainer');
const volumeSlider = document.getElementById('volumeSlider');
const speedBtn = document.getElementById('speedBtn');
const speedMenu = document.getElementById('speedMenu');
const fullscreenBtn = document.getElementById('fullscreenBtn');

// Play/Pause
function togglePlay() {
    video.paused ? video.play() : video.pause();
    playPauseBtn.innerHTML = video.paused ? '<span class="material-icons">play_arrow</span>' : '<span class="material-icons">pause</span>';
    bigPlayBtn.style.display = video.paused ? 'block' : 'none';
}
playPauseBtn.onclick = bigPlayBtn.onclick = video.onclick = togglePlay;

// Tiến trình
video.ontimeupdate = () => {
    progressBar.style.width = (video.currentTime / video.duration) * 100 + '%';
    document.getElementById('currentTime').innerText = formatTime(video.currentTime);
};
video.onloadedmetadata = () => document.getElementById('durationTime').innerText = formatTime(video.duration);

timeline.onclick = (e) => {
    video.currentTime = (e.offsetX / timeline.offsetWidth) * video.duration;
};

// Volume
volumeSlider.oninput = (e) => {
    video.volume = e.target.value;
    video.muted = video.volume === 0;
};

// Speed
speedBtn.onclick = () => speedMenu.style.display = speedMenu.style.display === 'flex' ? 'none' : 'flex';
speedMenu.querySelectorAll('button').forEach(btn => {
    btn.onclick = () => {
        video.playbackRate = btn.dataset.speed;
        speedBtn.innerText = btn.innerText;
        speedMenu.style.display = 'none';
    };
});

// Fullscreen
fullscreenBtn.onclick = () => {
    document.fullscreenElement ? document.exitFullscreen() : document.getElementById('videoContainer').requestFullscreen();
};

function formatTime(s) {
    let m = Math.floor(s / 60);
    s = Math.floor(s % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
}
