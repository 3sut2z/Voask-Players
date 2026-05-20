const videoContainer = document.getElementById('videoContainer');
const video = document.getElementById('myVideo');
const playPauseBtn = document.getElementById('playPauseBtn');
const bigPlayBtn = document.getElementById('bigPlayBtn');
const muteBtn = document.getElementById('muteBtn');
const volumeSlider = document.getElementById('volumeSlider');
const currentTimeEl = document.getElementById('currentTime');
const durationTimeEl = document.getElementById('durationTime');
const progressBar = document.getElementById('progressBar');
const timelineContainer = document.getElementById('timelineContainer');
const fullscreenBtn = document.getElementById('fullscreenBtn');

// 1. Tính năng Play / Pause
function togglePlay() {
    if (video.paused) {
        video.play();
        playPauseBtn.innerHTML = '<span class="material-icons">pause</span>';
        bigPlayBtn.style.display = 'none';
    } else {
        video.pause();
        playPauseBtn.innerHTML = '<span class="material-icons">play_arrow</span>';
        bigPlayBtn.style.display = 'flex';
    }
}

playPauseBtn.addEventListener('click', togglePlay);
bigPlayBtn.addEventListener('click', togglePlay);
video.addEventListener('click', togglePlay);

// 2. Cập nhật thời gian và thanh tiến trình (Progress Bar)
function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

video.addEventListener('loadedmetadata', () => {
    durationTimeEl.textContent = formatTime(video.duration);
});

video.addEventListener('timeupdate', () => {
    currentTimeEl.textContent = formatTime(video.currentTime);
    
    // Cập nhật độ dài thanh tiến trình đỏ
    const percentage = (video.currentTime / video.duration) * 100;
    progressBar.style.width = `${percentage}%`;
    
    // Cập nhật vị trí của nút tròn (thumb)
    const thumb = timelineContainer.querySelector('.thumb');
    thumb.style.left = `${percentage}%`;
});

// 3. Tính năng Tua Video (Scrubbing)
timelineContainer.addEventListener('click', (e) => {
    const rect = timelineContainer.getBoundingClientRect();
    const clickPositionX = e.clientX - rect.left;
    const timelineWidth = rect.width;
    
    // Tính phần trăm vị trí click để gán thời gian cho video
    const newTime = (clickPositionX / timelineWidth) * video.duration;
    video.currentTime = newTime;
});

// 4. Quản lý Âm lượng
volumeSlider.addEventListener('input', (e) => {
    video.volume = e.target.value;
    if (video.volume === 0) {
        muteBtn.innerHTML = '<span class="material-icons">volume_off</span>';
    } else if (video.volume < 0.5) {
        muteBtn.innerHTML = '<span class="material-icons">volume_down</span>';
    } else {
        muteBtn.innerHTML = '<span class="material-icons">volume_up</span>';
    }
    video.muted = false;
});

muteBtn.addEventListener('click', () => {
    if (video.muted) {
        video.muted = false;
        volumeSlider.value = video.volume;
        muteBtn.innerHTML = video.volume > 0.5 ? '<span class="material-icons">volume_up</span>' : '<span class="material-icons">volume_down</span>';
    } else {
        video.muted = true;
        volumeSlider.value = 0;
        muteBtn.innerHTML = '<span class="material-icons">volume_off</span>';
    }
});

// 5. Tính năng Toàn màn hình (Full Screen)
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        // Đưa toàn bộ container (gồm cả video và control) lên toàn màn hình
        if (videoContainer.requestFullscreen) {
            videoContainer.requestFullscreen();
        } else if (videoContainer.webkitRequestFullscreen) { /* Safari */
            videoContainer.webkitRequestFullscreen();
        }
        fullscreenBtn.innerHTML = '<span class="material-icons">fullscreen_exit</span>';
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
        fullscreenBtn.innerHTML = '<span class="material-icons">fullscreen</span>';
    }
}

fullscreenBtn.addEventListener('click', toggleFullscreen);

// Lắng nghe sự kiện ESC thoát Fullscreen để đổi lại Icon
document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
        fullscreenBtn.innerHTML = '<span class="material-icons">fullscreen</span>';
    }
});

