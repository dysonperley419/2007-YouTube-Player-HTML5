const myVideo = document.getElementById("myVideo");
const endedButtons = document.getElementById("endedButtons");
const watchAgainBtn = document.getElementById("watchAgainBtn");
const shareBtn = document.getElementById("shareBtn");

let videos = [];
let currentVideo = 0;

// Fetch all .mp4 files from videos.php
fetch("videos.php")
  .then(res => res.json())
  .then(data => {
    videos = data;
    if (videos.length > 0) {
      loadVideo(0);
    }
  });

function loadVideo(index) {
  if (index < 0 || index >= videos.length) return;
  currentVideo = index;
  myVideo.src = videos[index];
  myVideo.load();
  myVideo.play();
  endedButtons.style.display = "none"; // hide overlay when video starts
}

// When video ends → show overlay
myVideo.addEventListener("ended", () => {
  endedButtons.style.display = "flex";
});

// Watch again button → replay current video
watchAgainBtn.addEventListener("click", () => {
  loadVideo(currentVideo);
});

// Share button → copy video URL
shareBtn.addEventListener("click", () => {
  const url = window.location.origin + "/" + videos[currentVideo];
  navigator.clipboard.writeText(url).then(() => {
    alert("Video URL copied: " + url);
  });
});
