// 音乐播放器功能
document.addEventListener('DOMContentLoaded', function() {
    // 定义音乐列表
    const songs = [
        {
            title: "Summer Memories",
            artist: "Music For Life",
            duration: "3:45",
            cover: "https://picsum.photos/id/1074/600/600",
            src: "https://example.com/music/summer-memories.mp3" // 替换为实际音频链接
        },
        {
            title: "Ocean Waves",
            artist: "Relaxing Sounds",
            duration: "4:20",
            cover: "https://picsum.photos/id/1040/600/600",
            src: "https://example.com/music/ocean-waves.mp3" // 替换为实际音频链接
        },
        {
            title: "Morning Coffee",
            artist: "Acoustic Sessions",
            duration: "3:15",
            cover: "https://picsum.photos/id/1060/600/600",
            src: "https://example.com/music/morning-coffee.mp3" // 替换为实际音频链接
        },
        {
            title: "City Lights",
            artist: "Night Vibes",
            duration: "5:02",
            cover: "https://picsum.photos/id/1039/600/600",
            src: "https://example.com/music/city-lights.mp3" // 替换为实际音频链接
        },
        {
            title: "Rainy Day",
            artist: "Piano Mood",
            duration: "4:30",
            cover: "https://picsum.photos/id/1059/600/600",
            src: "https://example.com/music/rainy-day.mp3" // 替换为实际音频链接
        }
    ];
    
    // 获取DOM元素
    const audio = new Audio(songs[0].src);
    const playPauseBtn = document.getElementById('play-pause');
    const muteBtn = document.getElementById('mute');
    const progressBar = document.getElementById('progress-bar');
    const progressHandle = document.getElementById('progress-handle');
    const progressContainer = document.getElementById('progress-container');
    const volumeBar = document.getElementById('volume-bar');
    const volumeHandle = document.getElementById('volume-handle');
    const volumeContainer = document.getElementById('volume-container');
    const playlistItems = document.querySelectorAll('#playlist li');
    const currentTimeEl = document.getElementById('current-time');
    const durationEl = document.getElementById('duration');
    const albumCover = document.getElementById('album-cover');
    const songTitle = document.getElementById('song-title');
    const songArtist = document.getElementById('song-artist');
    const prevBtn = document.getElementById('prev');
    const nextBtn = document.getElementById('next');
    const repeatBtn = document.getElementById('repeat');
    const repeatStatus = document.getElementById('repeat-status');
    const shuffleBtn = document.getElementById('shuffle');
    const playIndicator = document.getElementById('play-indicator');
    const playlistCount = document.getElementById('playlist-count');
    const expandPlaylistBtn = document.getElementById('expand-playlist');
    const playlistContainer = document.getElementById('playlist');
    const addMusicBtn = document.getElementById('add-music');
    
    // 状态变量
    let currentSongIndex = 0;
    let isShuffle = false;
    let repeatMode = 0; // 0: 不重复, 1: 单曲循环, 2: 列表循环
    let isDraggingProgress = false;
    let isDraggingVolume = false;
    let playlistExpanded = false;
    
    // 更新歌曲信息
    function updateSongInfo() {
        const song = songs[currentSongIndex];
        songTitle.textContent = song.title;
        songArtist.textContent = song.artist;
        albumCover.src = song.cover;
        durationEl.textContent = song.duration;
        audio.src = song.src;
        
        // 更新播放列表选中状态
        playlistItems.forEach((item, index) => {
            if (index === currentSongIndex) {
                item.classList.add('bg-primary/5');
                const indexSpan = item.querySelector('span:first-child');
                indexSpan.classList.remove('text-gray-400');
                indexSpan.classList.add('text-primary');
            } else {
                item.classList.remove('bg-primary/5');
                const indexSpan = item.querySelector('span:first-child');
                indexSpan.classList.remove('text-primary');
                indexSpan.classList.add('text-gray-400');
            }
        });
        
        // 更新播放指示器
        if (!audio.paused) {
            playIndicator.style.opacity = '0';
            setTimeout(() => {
                playIndicator.querySelector('i').classList.remove('fa-play');
                playIndicator.querySelector('i').classList.add('fa-pause');
                playIndicator.style.opacity = '1';
            }, 300);
        } else {
            playIndicator.querySelector('i').classList.remove('fa-pause');
            playIndicator.querySelector('i').classList.add('fa-play');
            playIndicator.style.opacity = '0';
        }
    }
    
    // 格式化时间
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }
    
    // 更新进度条
    function updateProgress() {
        if (!isDraggingProgress) {
            const percent = (audio.currentTime / audio.duration) * 100;
            progressBar.style.width = `${percent}%`;
            progressHandle.style.left = `${percent}%`;
            currentTimeEl.textContent = formatTime(audio.currentTime);
        }
    }
    
    // 更新音量
    function updateVolume() {
        if (!isDraggingVolume) {
            audio.volume = volumeBar.offsetWidth / volumeContainer.offsetWidth;
            if (audio.volume === 0) {
                muteBtn.innerHTML = '<i class="fa fa-volume-off"></i>';
            } else if (audio.volume < 0.5) {
                muteBtn.innerHTML = '<i class="fa fa-volume-down"></i>';
            } else {
                muteBtn.innerHTML = '<i class="fa fa-volume-up"></i>';
            }
        }
    }
    
    // 播放/暂停
    playPauseBtn.addEventListener('click', function() {
        if (audio.paused) {
            audio.play();
            playPauseBtn.innerHTML = '<i class="fa fa-pause"></i>';
            playIndicator.querySelector('i').classList.remove('fa-play');
            playIndicator.querySelector('i').classList.add('fa-pause');
            playIndicator.style.opacity = '1';
        } else {
            audio.pause();
            playPauseBtn.innerHTML = '<i class="fa fa-play"></i>';
            playIndicator.style.opacity = '0';
        }
    });
    
    // 静音
    muteBtn.addEventListener('click', function() {
        if (audio.muted) {
            audio.muted = false;
            volumeBar.style.width = `${audio.volume * 100}%`;
            volumeHandle.style.left = `${audio.volume * 100}%`;
            updateVolume();
        } else {
            audio.muted = true;
            volumeBar.style.width = '0%';
            volumeHandle.style.left = '0%';
            muteBtn.innerHTML = '<i class="fa fa-volume-off"></i>';
        }
    });
    
    // 进度条点击
    progressContainer.addEventListener('click', function(e) {
        const percent = (e.offsetX / progressContainer.offsetWidth);
        audio.currentTime = percent * audio.duration;
        updateProgress();
    });
    
    // 进度条拖拽
    progressContainer.addEventListener('mousedown', function(e) {
        isDraggingProgress = true;
        document.body.classList.add('cursor-grabbing');
        
        // 立即更新进度
        const percent = (e.offsetX / progressContainer.offsetWidth);
        progressBar.style.width = `${percent * 100}%`;
        progressHandle.style.left = `${percent * 100}%`;
        currentTimeEl.textContent = formatTime(percent * audio.duration);
    });
    
    document.addEventListener('mousemove', function(e) {
        if (isDraggingProgress) {
            const containerRect = progressContainer.getBoundingClientRect();
            let percent = (e.clientX - containerRect.left) / containerRect.width;
            percent = Math.max(0, Math.min(1, percent));
            
            progressBar.style.width = `${percent * 100}%`;
            progressHandle.style.left = `${percent * 100}%`;
            currentTimeEl.textContent = formatTime(percent * audio.duration);
        }
    });
    
    document.addEventListener('mouseup', function(e) {
        if (isDraggingProgress) {
            isDraggingProgress = false;
            document.body.classList.remove('cursor-grabbing');
            
            const containerRect = progressContainer.getBoundingClientRect();
            let percent = (e.clientX - containerRect.left) / containerRect.width;
            percent = Math.max(0, Math.min(1, percent));
            
            audio.currentTime = percent * audio.duration;
            updateProgress();
        }
    });
    
    // 音量条点击
    volumeContainer.addEventListener('click', function(e) {
        const percent = (e.offsetX / volumeContainer.offsetWidth);
        audio.volume = percent;
        volumeBar.style.width = `${percent * 100}%`;
        volumeHandle.style.left = `${percent * 100}%`;
        updateVolume();
    });
    
    // 音量条拖拽
    volumeContainer.addEventListener('mousedown', function(e) {
        isDraggingVolume = true;
        document.body.classList.add('cursor-grabbing');
        
        // 立即更新音量
        const percent = (e.offsetX / volumeContainer.offsetWidth);
        volumeBar.style.width = `${percent * 100}%`;
        volumeHandle.style.left = `${percent * 100}%`;
        updateVolume();
    });
    
    document.addEventListener('mousemove', function(e) {
        if (isDraggingVolume) {
            const containerRect = volumeContainer.getBoundingClientRect();
            let percent = (e.clientX - containerRect.left) / containerRect.width;
            percent = Math.max(0, Math.min(1, percent));
            
            volumeBar.style.width = `${percent * 100}%`;
            volumeHandle.style.left = `${percent * 100}%`;
            updateVolume();
        }
    });
    
    document.addEventListener('mouseup', function(e) {
        if (isDraggingVolume) {
            isDraggingVolume = false;
            document.body.classList.remove('cursor-grabbing');
            
            const containerRect = volumeContainer.getBoundingClientRect();
            let percent = (e.clientX - containerRect.left) / containerRect.width;
            percent = Math.max(0, Math.min(1, percent));
            
            audio.volume = percent;
            updateVolume();
        }
    });
    
    // 播放列表项点击
    playlistItems.forEach(item => {
        item.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            if (index !== currentSongIndex) {
                currentSongIndex = index;
                updateSongInfo();
                audio.play();
                playPauseBtn.innerHTML = '<i class="fa fa-pause"></i>';
            } else if (audio.paused) {
                audio.play();
                playPauseBtn.innerHTML = '<i class="fa fa-pause"></i>';
                playIndicator.style.opacity = '1';
            } else {
                audio.pause();
                playPauseBtn.innerHTML = '<i class="fa fa-play"></i>';
                playIndicator.style.opacity = '0';
            }
        });
    });
    
    // 上一首
    prevBtn.addEventListener('click', function() {
        if (isShuffle) {
            // 随机播放
            let randomIndex;
            do {
                randomIndex = Math.floor(Math.random() * songs.length);
            } while (randomIndex === currentSongIndex);
            currentSongIndex = randomIndex;
        } else {
            // 顺序播放
            currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
        }
        updateSongInfo();
        audio.play();
        playPauseBtn.innerHTML = '<i class="fa fa-pause"></i>';
    });
    
    // 下一首
    nextBtn.addEventListener('click', function() {
        if (isShuffle) {
            // 随机播放
            let randomIndex;
            do {
                randomIndex = Math.floor(Math.random() * songs.length);
            } while (randomIndex === currentSongIndex);
            currentSongIndex = randomIndex;
        } else {
            // 顺序播放
            currentSongIndex = (currentSongIndex + 1) % songs.length;
        }
        updateSongInfo();
        audio.play();
        playPauseBtn.innerHTML = '<i class="fa fa-pause"></i>';
    });
    
    // 循环模式切换
    repeatBtn.addEventListener('click', function() {
        repeatMode = (repeatMode + 1) % 3;
        switch (repeatMode) {
            case 0: // 不重复
                repeatBtn.classList.remove('text-primary');
                repeatStatus.classList.add('hidden');
                break;
            case 1: // 单曲循环
                repeatBtn.classList.add('text-primary');
                repeatStatus.classList.remove('hidden');
                repeatStatus.textContent = '1';
                break;
            case 2: // 列表循环
                repeatBtn.classList.add('text-primary');
                repeatStatus.classList.remove('hidden');
                repeatStatus.textContent = '';
                break;
        }
    });
    
    // 随机播放切换
    shuffleBtn.addEventListener('click', function() {
        isShuffle = !isShuffle;
        if (isShuffle) {
            shuffleBtn.classList.add('text-primary');
        } else {
            shuffleBtn.classList.remove('text-primary');
        }
    });
    
    // 歌曲结束处理
    audio.addEventListener('ended', function() {
        if (repeatMode === 1) {
            // 单曲循环
            audio.currentTime = 0;
            audio.play();
        } else {
            if (isShuffle) {
                // 随机播放
                let randomIndex;
                do {
                    randomIndex = Math.floor(Math.random() * songs.length);
                } while (randomIndex === currentSongIndex);
                currentSongIndex = randomIndex;
            } else {
                // 顺序播放
                currentSongIndex = (currentSongIndex + 1) % songs.length;
            }
            updateSongInfo();
            audio.play();
        }
    });
    
    // 音频元数据加载完成后更新总时长
    audio.addEventListener('loadedmetadata', function() {
        durationEl.textContent = formatTime(audio.duration);
    });
    
    // 定时更新进度条
    audio.addEventListener('timeupdate', updateProgress);
    
    // 播放列表展开/折叠
    expandPlaylistBtn.addEventListener('click', function() {
        playlistExpanded = !playlistExpanded;
        if (playlistExpanded) {
            playlistContainer.style.maxHeight = 'none';
            expandPlaylistBtn.innerHTML = '<i class="fa fa-chevron-up"></i>';
        } else {
            playlistContainer.style.maxHeight = '64px';
            expandPlaylistBtn.innerHTML = '<i class="fa fa-chevron-down"></i>';
        }
    });
    
    // 添加音乐按钮点击事件
    addMusicBtn.addEventListener('click', function() {
        alert('音乐添加功能将在未来版本中实现');
    });
    
    // 添加自定义滚动条样式
    const style = document.createElement('style');
    style.textContent = `
        .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
        }
    `;
    document.head.appendChild(style);
    
    // 初始化
    updateSongInfo();
    playlistCount.textContent = `${songs.length} 首歌曲`;
});    
