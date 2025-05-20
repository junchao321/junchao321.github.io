// 脚本文件

// 音乐播放器功能
const musicPlayer = document.getElementById('player');
const songs = [
    { title: 'Song 1', url: 'assets/music/song1.mp3' },
    { title: 'Song 2', url: 'assets/music/song2.mp3' },
    // 添加更多歌曲
];

let currentSongIndex = 0;

function loadSong(index) {
    const song = songs[index];
    musicPlayer.innerHTML = `
        <h3>${song.title}</h3>
        <audio controls>
            <source src="${song.url}" type="audio/mp3">
            您的浏览器不支持音频元素。
        </audio>
    `;
}

loadSong(currentSongIndex);

// 自动播放下一首
musicPlayer.querySelector('audio').addEventListener('ended', () => {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    loadSong(currentSongIndex);
});

// 评论功能
const commentForm = document.getElementById('comment-form');
const commentInput = document.getElementById('comment-input');
const commentsSection = document.querySelector('.comments');

commentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const comment = commentInput.value.trim();
    if (comment) {
        const commentElement = document.createElement('div');
        commentElement.classList.add('comment');
        commentElement.textContent = comment;
        commentsSection.appendChild(commentElement);
        commentInput.value = '';
    }
});
