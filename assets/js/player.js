document.addEventListener("DOMContentLoaded", function () {
  const musicToggle = document.getElementById("music-toggle");
  const musicPlayer = document.getElementById("music-player");
  const playerClose = document.getElementById("player-close");
  const audio = document.getElementById("audio");
  const playBtn = document.getElementById("play-btn");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const seekBar = document.getElementById("seek-bar");
  const currentTimeEl = document.getElementById("current-time");
  const durationEl = document.getElementById("duration");
  const playlistEl = document.getElementById("playlist");

  let playlist = [];
  let currentIndex = 0;
  let isPlaying = false;
  let updateTimer;

  // 切换播放器可见性
  musicToggle.addEventListener("click", () => {
    musicPlayer.classList.toggle("hidden");
  });
  playerClose.addEventListener("click", () => {
    musicPlayer.classList.add("hidden");
    pauseTrack();
  });

  // 加载播放列表
  fetch("{{ '/_data/playlist.json' | relative_url }}")
    .then((res) => res.json())
    .then((data) => {
      playlist = data;
      renderPlaylist();
      loadTrack(currentIndex);
    })
    .catch((err) => {
      console.error("无法加载 playlist.json：", err);
    });

  // 渲染播放列表
  function renderPlaylist() {
    playlistEl.innerHTML = "";
    playlist.forEach((track, index) => {
      const li = document.createElement("li");
      li.className = "playlist-item";
      li.dataset.index = index;
      li.innerHTML = `
        <span class="track-title">${track.title}</span>
        ${track.artist ? `<span class="track-artist"> - ${track.artist}</span>` : ""}
      `;
      li.addEventListener("click", () => {
        loadTrack(index);
        playTrack();
      });
      playlistEl.appendChild(li);
    });
    highlightCurrent();
  }

  // 载入指定索引的曲目
  function loadTrack(index) {
    if (index < 0 || index >= playlist.length) return;
    currentIndex = index;
    audio.src = playlist[index].url;
    audio.load();
    highlightCurrent();
  }

  // 高亮当前播放项
  function highlightCurrent() {
    const items = document.querySelectorAll(".playlist-item");
    items.forEach((item) => item.classList.remove("active"));
    const currentItem = document.querySelector(
      `.playlist-item[data-index="${currentIndex}"]`
    );
    if (currentItem) currentItem.classList.add("active");
  }

  // 播放 / 暂停
  playBtn.addEventListener("click", () => {
    if (!isPlaying) {
      playTrack();
    } else {
      pauseTrack();
    }
  });
  function playTrack() {
    audio.play();
    isPlaying = true;
    playBtn.textContent = "⏸";
    startUpdateTimer();
  }
  function pauseTrack() {
    audio.pause();
    isPlaying = false;
    playBtn.textContent = "▶️";
    clearInterval(updateTimer);
  }

  // 上一曲 / 下一曲
  prevBtn.addEventListener("click", () => {
    if (currentIndex > 0) {
      loadTrack(currentIndex - 1);
      playTrack();
    }
  });
  nextBtn.addEventListener("click", () => {
    if (currentIndex < playlist.length - 1) {
      loadTrack(currentIndex + 1);
      playTrack();
    }
  });

  // 更新进度条与时长
  function startUpdateTimer() {
    clearInterval(updateTimer);
    updateTimer = setInterval(() => {
      if (!isNaN(audio.duration)) {
        seekBar.max = Math.floor(audio.duration);
        seekBar.value = Math.floor(audio.currentTime);
        currentTimeEl.textContent = formatTime(audio.currentTime);
        durationEl.textContent = formatTime(audio.duration);
      }
    }, 500);
  }

  // 拖动进度条
  seekBar.addEventListener("input", () => {
    audio.currentTime = seekBar.value;
    currentTimeEl.textContent = formatTime(audio.currentTime);
  });

  // 自动播放下一曲
  audio.addEventListener("ended", () => {
    if (currentIndex < playlist.length - 1) {
      loadTrack(currentIndex + 1);
      playTrack();
    } else {
      pauseTrack();
      audio.currentTime = 0;
    }
  });

  // 时间格式化
  function formatTime(sec) {
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }
});
