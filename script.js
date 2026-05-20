const videoContainer = document.getElementById('videoContainer');
const video = document.getElementById('myVideo');
const playPauseBtn = document.getElementById('playPauseBtn');
const bigPlayBtn = document.getElementById('bigPlayBtn');
const progressBar = document.getElementById('progressBar');
const timelineContainer = document.getElementById('timelineContainer');
const timeTooltip = document.createElement('div'); // Tạo linh hoạt Tooltip
const thumb = document.createElement('div'); // Tạo nút tròn kéo

const volumeSlider = document.getElementById('volumeSlider');
const muteBtn = document.getElementById('muteBtn');
const speedBtn = document.getElementById('speedBtn');
const speedMenu = document.getElementById('speedMenu');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const currentTimeEl = document.getElementById('currentTime');
const durationTimeEl = document.getElementById('durationTime');

// Chèn các thành phần UI bổ sung vào DOM một cách an toàn
timeTooltip.classList.add('time-tooltip');
timelineContainer.appendChild(timeTooltip);
thumb.classList.add('thumb');
timelineContainer.querySelector('.timeline').appendChild(thumb);

let controlsTimeout;

// ==========================================
// 1. TÍNH NĂNG PLAY / PAUSE & KIỂU DÁNG ẨN/HIỆN
// ==========================================
function togglePlay() {
    if (video.paused) {
        video.play();
        playPauseBtn.innerHTML = '<span class="material-icons">pause</span>';
        bigPlayBtn.style.opacity = '0';
        setTimeout(() => bigPlayBtn.style.display = 'none', 200);
        resetControlsTimeout(); // Kích hoạt đếm ngược ẩn thanh điều khiển
    } else {
        video.pause();
        playPauseBtn.innerHTML = '<span class="material-icons">play_arrow</span>';
        bigPlayBtn.style.display = 'flex';
        setTimeout(() => bigPlayBtn.style.opacity = '1', 10);
        showControls(); // Luôn hiện thanh điều khiển khi pause
    }
}

playPauseBtn.onclick = bigPlayBtn.onclick = togglePlay;
video.onclick = togglePlay;

// Cơ chế tự động ẩn controls sau 2.5 giây không di chuột (chỉ ẩn khi đang play)
function showControls() {
    videoContainer.classList.remove('hide-controls');
    videoContainer.classList.add('show-controls-active');
    clearTimeout(controlsTimeout);
}

function resetControlsTimeout() {
    showControls();
    if (!video.paused) {
        controlsTimeout = setTimeout(() => {
            videoContainer.classList.add('hide-controls');
            videoContainer.classList.remove('show-controls-active');
            speedMenu.style.display = 'none'; // Ẩn luôn menu tốc độ nếu mở mà bỏ quên
        }, 2500);
    }
}

videoContainer.onmousemove = resetControlsTimeout;
videoContainer.onmouseleave = () => {
    if (!video.paused) {
        videoContainer.classList.add('hide-controls');
        videoContainer.classList.remove('show-controls-active');
    }
};

// ==========================================
// 2. CẬP NHẬT TIẾN TRÌNH & HOVER TOOTLIP
// ==========================================
function formatTime(seconds) {
    let m = Math.floor(seconds / 60);
    let s = Math.floor(seconds % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}

video.onloadedmetadata = () => {
    durationTimeEl.innerText = formatTime(video.duration);
};

// Theo dõi thời gian thực phát video để tăng thanh tiến độ đỏ
video.ontimeupdate = () => {
    if(video.duration) {
        const currentPercentage = (video.currentTime / video.duration) * 100;
        progressBar.style.width = currentPercentage + '%';
        thumb.style.left = currentPercentage + '%';
        currentTimeEl.innerText = formatTime(video.currentTime);
    }
};

// Click chọn đoạn tua video ngẫu nhiên
timelineContainer.onclick = (e) => {
    const rect = timelineContainer.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    video.currentTime = (clickX / rect.width) * video.duration;
};

// Hiển thị nhãn thời gian thu nhỏ (Tooltip) khi lướt chuột qua thanh tua
timelineContainer.onmousemove = (e) => {
    const rect = timelineContainer.getBoundingClientRect();
    const hoverX = e.clientX - rect.left;
    const hoverPercent = hoverX / rect.width;
    const estimatedTime = hoverPercent * video.duration;
    
    if (estimatedTime >= 0 && estimatedTime <= video.duration) {
        timeTooltip.innerText = formatTime(estimatedTime);
        timeTooltip.style.left = `${hoverX}px`;
    }
};

// ==========================================
// 3. ĐIỀU CHỈNH ÂM THANH THÔNG MINH
// ==========================================
function updateVolumeIcon(vol, isMuted) {
    if (isMuted || vol === 0) {
        muteBtn.innerHTML = '<span class="material-icons">volume_off</span>';
    } else if (vol < 0.5) {
        muteBtn.innerHTML = '<span class="material-icons">volume_down</span>';
    } else {
        muteBtn.innerHTML = '<span class="material-icons">volume_up</span>';
    }
}

volumeSlider.oninput = (e) => {
    video.volume = e.target.value;
    video.muted = (video.volume === 0);
    updateVolumeIcon(video.volume, video.muted);
};

muteBtn.onclick = () => {
    video.muted = !video.muted;
    volumeSlider.value = video.muted ? 0 : video.volume;
    updateVolumeIcon(video.volume, video.muted);
};

// ==========================================
// 4. MENU TỐC ĐỘ PHÁT VIDEO (PLAYBACK SPEED)
// ==========================================
speedBtn.onclick = (e) => {
    e.stopPropagation(); // Tránh kích hoạt sự kiện click ra ngoài ẩn menu
    speedMenu.style.display = speedMenu.style.display === 'flex' ? 'none' : 'flex';
};

speedMenu.querySelectorAll('button').forEach(btn => {
    btn.onclick = () => {
        const targetSpeed = parseFloat(btn.dataset.speed);
        video.playbackRate = targetSpeed;
        speedBtn.innerText = targetSpeed === 1 ? '1x' : targetSpeed + 'x';
        
        speedMenu.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        speedMenu.style.display = 'none';
    };
});

// Click ra bất cứ đâu ngoài màn hình sẽ tự động đóng menu tốc độ
document.onclick = () => {
    speedMenu.style.display = 'none';
};

// ==========================================
// 5. TOÀN MÀN HÌNH (FULLSCREEN) & DOUBLE CLICK
// ==========================================
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        if (videoContainer.requestFullscreen) videoContainer.requestFullscreen();
        else if (videoContainer.webkitRequestFullscreen) videoContainer.webkitRequestFullscreen(); // Cho Safari
        fullscreenBtn.innerHTML = '<span class="material-icons">fullscreen_exit</span>';
    } else {
        if (document.exitFullscreen) document.exitFullscreen();
        fullscreenBtn.innerHTML = '<span class="material-icons">fullscreen</span>';
    }
}

fullscreenBtn.onclick = toggleFullscreen;
video.ondblclick = toggleFullscreen; // Nhấp đôi chuột vào khung hình để phóng to/thu nhỏ

document.onfullscreenchange = () => {
    if (!document.fullscreenElement) {
        fullscreenBtn.innerHTML = '<span class="material-icons">fullscreen</span>';
    }
};

// ==========================================
// 6. HỆ THỐNG BẮT PHÍM TẮT (KEYBOARD SHORTCUTS)
// ==========================================
window.addEventListener('keydown', (e) => {
    // Tránh ăn phím tắt khi người dùng đang nhập liệu trong input (nếu có sau này)
    if (document.activeElement.tagName === 'INPUT') return;

    switch(e.key.toLowerCase()) {
        case ' ': // Phím cách
            e.preventDefault(); // Tránh scroll trang web xuống dưới
            togglePlay();
            break;
        case 'f': // Phím F mở rộng màn hình
            e.preventDefault();
            toggleFullscreen();
            break;
        case 'arrowright': // Mũi tên Phải: Tua nhanh 5 giây
            e.preventDefault();
            video.currentTime = Math.min(video.currentTime + 5, video.duration);
            break;
        case 'arrowleft': // Mũi tên Trái: Tua lùi 5 giây
            e.preventDefault();
            video.currentTime = Math.max(video.currentTime - 5, 0);
            break;
        case 'arrowup': // Mũi tên Lên: Tăng âm lượng 10%
            e.preventDefault();
            video.volume = Math.min(video.volume + 0.1, 1);
            volumeSlider.value = video.volume;
            video.muted = false;
            updateVolumeIcon(video.volume, false);
            break;
        case 'arrowdown': // Mũi tên Xuống: Giảm âm lượng 10%
            e.preventDefault();
            video.volume = Math.max(video.volume - 0.1, 0);
            volumeSlider.value = video.volume;
            updateVolumeIcon(video.volume, video.volume === 0);
            break;
    }
});
