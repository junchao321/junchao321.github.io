document.addEventListener("DOMContentLoaded", function () {
  // --- 获取所有必要的 DOM 元素 ---
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

  const muteBtn = document.getElementById("mute-btn");
  const volumeBar = document.getElementById("volume-bar");

  const playlistEl = document.getElementById("playlist");
  const coverImg = document.getElementById("cover-img");

  const lyricsContainer = document.getElementById("lyrics-list");

  // --- 播放器状态变量 ---
  let playlist = [];          // 存储 JSON 解析后的歌曲列表
  let currentIndex = 0;       // 当前播放的曲目在 playlist 数组中的索引
  let isPlaying = false;      // 当前是否正在播放
  let updateTimer = null;     // 定时器，用于更新进度与歌词
  let lyricsData = [];        // 加载后存储的 [{ time: sec, text: "..." }, ...]
  let currentLyricIndex = -1; // 当前高亮的歌词行索引

  // --- 1. 切换播放器显示/隐藏 ---
  musicToggle.addEventListener("click", () => {
    musicPlayer.classList.toggle("hidden");
  });
  playerClose.addEventListener("click", () => {
    musicPlayer.classList.add("hidden");
    pauseTrack();
  });

  // --- 2. 加载播放列表 JSON ---
  fetch("{{ '/_data/playlist.json' | relative_url }}")
    .then((res) => res.json())
    .then((data) => {
      playlist = data;
      renderPlaylist();
      loadTrack(0); // 默认加载第一首，但不自动播放
    })
    .catch((err) => {
      console.error("无法加载 playlist.json：", err);
    });

  // --- 3. 渲染播放列表与点击事件 ---
  function renderPlaylist() {
    playlistEl.innerHTML = "";
    playlist.forEach((track, index) => {
      const li = document.createElement("li");
      li.className = "playlist-item";
      li.dataset.index = index;
      li.innerHTML = `
        <div class="track-info">
          <span class="track-title">${track.title}</span>
          ${track.artist ? `<span class="track-artist"> - ${track.artist}</span>` : ""}
        </div>
      `;
      li.addEventListener("click", () => {
        if (index !== currentIndex) {
          loadTrack(index);
          playTrack();
        }
      });
      playlistEl.appendChild(li);
    });
    highlightCurrent();
  }

  // --- 4. 载入指定索引的曲目（不自动播放） ---
  function loadTrack(index) {
    if (index < 0 || index >= playlist.length) return;
    currentIndex = index;
    const track = playlist[index];

    // 切换 audio 源
    audio.src = track.url;
    audio.load();

    // 切换封面
    if (track.cover) {
      coverImg.src = track.cover;
      coverImg.classList.remove("hidden");
    } else {
      coverImg.classList.add("hidden");
    }

    // 重置歌词
    lyricsData = [];
    currentLyricIndex = -1;
    lyricsContainer.innerHTML = "";

    // 加载歌词（如果有 lyrics 字段）
    if (track.lyrics) {
      fetch(track.lyrics)
        .then((res) => {
          if (!res.ok) throw new Error("歌词文件加载失败");
          return res.text();
        })
        .then((lrcText) => {
          lyricsData = parseLRC(lrcText);
          renderLyrics();
        })
        .catch((err) => {
          console.warn(`无法加载歌词：${err}`);
        });
    }

    highlightCurrent();
  }

  // --- 5. 高亮播放列表当前项目 ---
  function highlightCurrent() {
    const items = document.querySelectorAll(".playlist-item");
    items.forEach((item) => item.classList.remove("active"));
    const currentItem = document.querySelector(
      `.playlist-item[data-index="${currentIndex}"]`
    );
    if (currentItem) currentItem.classList.add("active");
  }

  // --- 6. 播放与暂停逻辑 ---
  playBtn.addEventListener("click", () => {
    if (!isPlaying) {
      playTrack();
    } else {
      pauseTrack();
    }
  });
  function playTrack() {
    audio.play().catch((err) => {
      console.warn("播放被禁止：", err);
    });
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

  // --- 7. 上一曲 / 下一曲 按钮 ---
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

  // --- 8. 时间更新与进度条逻辑 ---
  function startUpdateTimer() {
    clearInterval(updateTimer);
    updateTimer = setInterval(() => {
      if (!isNaN(audio.duration)) {
        seekBar.max = Math.floor(audio.duration);
        seekBar.value = Math.floor(audio.currentTime);
        currentTimeEl.textContent = formatTime(audio.currentTime);
        durationEl.textContent = formatTime(audio.duration);

        // 同步更新歌词高亮
        syncLyrics(audio.currentTime);
      }
    }, 300);
  }

  // 拖动进度条时更新 audio.currentTime
  seekBar.addEventListener("input", () => {
    audio.currentTime = seekBar.value;
    currentTimeEl.textContent = formatTime(audio.currentTime);
    syncLyrics(audio.currentTime, true);
  });

  // 播放结束后自动切换下一曲
  audio.addEventListener("ended", () => {
    if (currentIndex < playlist.length - 1) {
      loadTrack(currentIndex + 1);
      playTrack();
    } else {
      pauseTrack();
      audio.currentTime = 0;
    }
  });

  // --- 9. 音量控制与静音按钮 ---
  // 初始化音量
  audio.volume = parseFloat(volumeBar.value);

  // 音量滑块变化时，实时设置 volume
  volumeBar.addEventListener("input", () => {
    audio.volume = parseFloat(volumeBar.value);
    if (audio.volume === 0) {
      muteBtn.textContent = "🔇"; // 静音图标
    } else {
      muteBtn.textContent = "🔊";
    }
  });

  // 静音按钮切换
  muteBtn.addEventListener("click", () => {
    if (audio.muted) {
      audio.muted = false;
      muteBtn.textContent = "🔊";
      volumeBar.value = audio.volume;
    } else {
      audio.muted = true;
      muteBtn.textContent = "🔇";
      volumeBar.value = 0;
    }
  });

  // --- 10. 歌词解析与渲染 ---
  // 解析 LRC 文本，返回 [{ time: 秒, text: 歌词行 }, ...]
  function parseLRC(lrcText) {
    const lines = lrcText.split(/\r?\n/);
    const timeReg = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/g;
    const result = [];

    lines.forEach((line) => {
      let match;
      const text = line.replace(timeReg, "").trim();
      // 在一行内可能有多个时间戳
      while ((match = timeReg.exec(line)) !== null) {
        const min = parseInt(match[1], 10);
        const sec = parseInt(match[2], 10);
        const msec = match[3] ? parseInt(match[3].padEnd(3, "0"), 10) : 0;
        const timeInSec = min * 60 + sec + msec / 1000;
        if (text) {
          result.push({ time: timeInSec, text });
        }
      }
    });

    // 按时间升序排序
    result.sort((a, b) => a.time - b.time);
    return result;
  }

  // 将解析后的歌词渲染到页面上
  function renderLyrics() {
    lyricsContainer.innerHTML = "";
    lyricsData.forEach((line, idx) => {
      const li = document.createElement("li");
      li.className = "lyric-line";
      li.dataset.index = idx;
      li.textContent = line.text;
      lyricsContainer.appendChild(li);
    });
  }

  // 根据当前播放时间高亮对应歌词行，并滚动到可见位置
  function syncLyrics(currentTime, forceScroll = false) {
    if (!lyricsData || lyricsData.length === 0) return;

    // 如果已经是最后一行，且播放时间超过最后时间，则保持最后一行高亮
    if (
      currentLyricIndex === lyricsData.length - 1 &&
      currentTime >= lyricsData[lyricsData.length - 1].time
    ) {
      return;
    }

    // 找到最新一行 time <= currentTime 的索引
    for (let i = 0; i < lyricsData.length; i++) {
      if (
        currentTime >= lyricsData[i].time &&
        (i === lyricsData.length - 1 || currentTime < lyricsData[i + 1].time)
      ) {
        if (currentLyricIndex !== i || forceScroll) {
          // 取消前一个高亮
          if (currentLyricIndex !== -1) {
            const prevEl = document.querySelector(
              `.lyric-line[data-index="${currentLyricIndex}"]`
            );
            if (prevEl) prevEl.classList.remove("active");
          }
          // 高亮当前
          const currentEl = document.querySelector(
            `.lyric-line[data-index="${i}"]`
          );
          if (currentEl) {
            currentEl.classList.add("active");
            // 滚动到可见区域：距离容器顶部中间位置
            const container = document.querySelector(".lyrics-container");
            const containerHeight = container.clientHeight;
            const offsetTop = currentEl.offsetTop;
            container.scrollTo({
              top: offsetTop - containerHeight / 2 + currentEl.clientHeight / 2,
              behavior: "smooth"
            });
          }
          currentLyricIndex = i;
        }
        break;
      }
    }
  }

  // --- 11. 时间格式化，秒 => mm:ss ---
  function formatTime(sec) {
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }
}); // End of DOMContentLoaded
