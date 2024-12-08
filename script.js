let isDraggingTimeline = false;
let isDraggingVolume = false;
let videoDuration = 0;
let earliestWatchedTime = 0;
let previousVolume = 100;

const myVideo = document.getElementById('myVideo');
const loadingIndicator = document.getElementById('loadingIndicator');
const playPauseBtn = document.getElementById('playPauseBtn');
const rewindBtn = document.getElementById('rewindBtn');
const progressRed = document.getElementById('progressRed');
const progressLoaded = document.getElementById('progressLoaded');
const progressHandle = document.getElementById('progressHandle');
const timeCurrent = document.getElementById('timeCurrent');
const timeTotal = document.getElementById('timeTotal');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const progressSection = document.querySelector('.progress-section');
const volumeTrack = document.getElementById('volumeTrack');
const volumeHandle = document.getElementById('volumeHandle');
const volumeLevel = document.getElementById('volumeLevel');
const volumeBtn = document.getElementById('volumeBtn');

myVideo.addEventListener('loadedmetadata', () => {
  videoDuration = myVideo.duration;
  updateProgress();
  updateBuffered();
  let initialVolPercent = myVideo.volume * 100;
  setVolume(initialVolPercent);
});

myVideo.addEventListener('timeupdate', () => {
  updateProgress();
});

myVideo.addEventListener('progress', () => {
  updateBuffered();
});

myVideo.addEventListener('play', () => {
  playPauseBtn.classList.add('playing');
});

myVideo.addEventListener('pause', () => {
  playPauseBtn.classList.remove('playing');
});

let loadingFrame = 1;
const loadingTotalFrames = 22;
let loadingInterval = null;
const loadingFrameDelay = 100; // ms between loading frames

function updateLoadingFrame() {
    if (loadingFrame < loadingTotalFrames) {
      loadingFrame++;
      loadingIndicator.style.backgroundImage = `url('loading_frames/${loadingFrame}.png')`;
    } else {
      // Loop back to frame 1, no fade needed, just continuous loop
      loadingFrame = 1;
      loadingIndicator.style.backgroundImage = `url('loading_frames/1.png')`;
    }
  }
  
  function startLoadingAnimation() {
    if (!loadingInterval) {
      loadingFrame = 1;
      loadingIndicator.style.backgroundImage = `url('loading_frames/1.png')`;
      loadingIndicator.style.display = 'block'; // show the indicator
      loadingInterval = setInterval(updateLoadingFrame, loadingFrameDelay);
    }
  }
  
  function stopLoadingAnimation() {
    if (loadingInterval) {
      clearInterval(loadingInterval);
      loadingInterval = null;
      loadingIndicator.style.display = 'none'; // hide the indicator
      // reset to frame 1
      loadingFrame = 1;
      loadingIndicator.style.backgroundImage = `url('loading_frames/1.png')`;
    }
  }

// Video buffering events
// 'waiting' event fires when the video is buffering/waiting for data
myVideo.addEventListener('waiting', startLoadingAnimation);
// 'playing', 'canplay', 'canplaythrough' events fire when the video can play again
myVideo.addEventListener('playing', stopLoadingAnimation);
myVideo.addEventListener('canplay', stopLoadingAnimation);
myVideo.addEventListener('canplaythrough', stopLoadingAnimation);

function togglePlayPause() {
  if (myVideo.paused || myVideo.ended) {
    myVideo.play();
    playPauseBtn.classList.add('playing');
  } else {
    myVideo.pause();
    playPauseBtn.classList.remove('playing');
  }
}

function rewindVideo() {
  myVideo.currentTime = 0;
  earliestWatchedTime = 0;
  updateProgress();
  updateBuffered();
}

function updateProgress() {
  if (!videoDuration) return;
  const currentTime = myVideo.currentTime;
  const timelineWidth = progressSection.clientWidth;

  const watchedDuration = Math.max(0, currentTime - earliestWatchedTime);
  const earliestPixel = (earliestWatchedTime / videoDuration) * timelineWidth;
  const watchedWidth = (watchedDuration / videoDuration) * timelineWidth;
  progressRed.style.left = earliestPixel + 'px';
  progressRed.style.width = watchedWidth + 'px';

  const handlePercent = (currentTime / videoDuration) * 100;
  const handleX = (handlePercent / 100) * timelineWidth;
  progressHandle.style.left = (handleX - (progressHandle.offsetWidth / 2)) + 'px';

  updateTimeDisplay(currentTime, videoDuration);
}

function updateTimeDisplay(currentTime, duration) {
  timeCurrent.textContent = formatTime(currentTime);
  timeTotal.textContent = duration ? formatTime(duration) : '0:00';
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return m + ':' + (s < 10 ? '0' + s : s);
}

function updateBuffered() {
  if (!myVideo.buffered || myVideo.buffered.length === 0 || !videoDuration) return;
  const bufferEnd = myVideo.buffered.end(myVideo.buffered.length - 1);
  const timelineWidth = progressSection.clientWidth;

  const loadedDuration = Math.max(0, bufferEnd - earliestWatchedTime);
  const earliestPixel = (earliestWatchedTime / videoDuration) * timelineWidth;
  const loadedWidth = (loadedDuration / videoDuration) * timelineWidth;

  progressLoaded.style.left = earliestPixel + 'px';
  progressLoaded.style.width = loadedWidth + 'px';
}

/* Timeline dragging */
function startTimelineDrag(e) {
  isDraggingTimeline = true;
  progressHandle.classList.add('active');
  document.addEventListener('mousemove', dragTimeline);
  document.addEventListener('mouseup', stopTimelineDrag);
  e.preventDefault();
}

function dragTimeline(e) {
  if (!isDraggingTimeline) return;
  e.preventDefault();
  const rect = progressSection.getBoundingClientRect();
  let x = e.clientX - rect.left;
  x = Math.max(0, Math.min(x, rect.width));
  const newTime = (x / rect.width) * videoDuration;

  const watchedDuration = Math.max(0, newTime - earliestWatchedTime);
  const earliestPixel = (earliestWatchedTime / videoDuration) * progressSection.clientWidth;
  const watchedWidth = (watchedDuration / videoDuration) * progressSection.clientWidth;
  progressRed.style.left = earliestPixel + 'px';
  progressRed.style.width = watchedWidth + 'px';

  const handlePercent = (newTime / videoDuration) * 100;
  const handleX = (handlePercent / 100) * progressSection.clientWidth;
  progressHandle.style.left = (handleX - (progressHandle.offsetWidth / 2)) + 'px';
  updateTimeDisplay(newTime, videoDuration);
}

function stopTimelineDrag(e) {
  if (!isDraggingTimeline) return;
  isDraggingTimeline = false;
  progressHandle.classList.remove('active');
  document.removeEventListener('mousemove', dragTimeline);
  document.removeEventListener('mouseup', stopTimelineDrag);

  const rect = progressSection.getBoundingClientRect();
  let x = e.clientX - rect.left;
  x = Math.max(0, Math.min(x, rect.width));
  const newTime = (x / rect.width) * videoDuration;

  earliestWatchedTime = newTime;
  myVideo.currentTime = newTime;
  updateProgress();
  updateBuffered();
}

progressHandle.addEventListener('mousedown', startTimelineDrag);

progressSection.addEventListener('click', (e) => {
  if (isDraggingTimeline) return;
  const rect = progressSection.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const newTime = (clickX / rect.width) * videoDuration;
  earliestWatchedTime = newTime;
  myVideo.currentTime = newTime;
  updateProgress();
  updateBuffered();
});

/* Volume Logic */
function updateVolumeIcon(volPercent) {
  let iconFile;
  if (volPercent === 0) {
    iconFile = 'volume_icon.png';
    volumeBtn.classList.add('muted');
  } else if (volPercent <= 25) {
    iconFile = 'volume_icon_1.png';
    volumeBtn.classList.remove('muted');
  } else if (volPercent <= 50) {
    iconFile = 'volume_icon_2.png';
    volumeBtn.classList.remove('muted');
  } else if (volPercent <= 75) {
    iconFile = 'volume_icon_3.png';
    volumeBtn.classList.remove('muted');
  } else {
    iconFile = 'volume_icon_4.png';
    volumeBtn.classList.remove('muted');
  }

  volumeBtn.style.backgroundImage = `url('${iconFile}')`;
  volumeBtn.style.backgroundRepeat = 'no-repeat';
  volumeBtn.style.backgroundPosition = 'center';
  volumeBtn.style.backgroundSize = 'contain';
}

function setVolume(volPercent) {
  volPercent = Math.max(0, Math.min(100, volPercent));
  myVideo.volume = volPercent / 100;
  volumeLevel.style.width = volPercent + '%';

  const trackWidth = volumeTrack.clientWidth;
  const handleX = (volPercent / 100) * trackWidth;
  volumeHandle.style.left = (handleX - (volumeHandle.offsetWidth / 2)) + 'px';

  updateVolumeIcon(volPercent);
}

volumeBtn.addEventListener('click', () => {
  let currentVolPercent = myVideo.volume * 100;
  if (currentVolPercent > 0) {
    previousVolume = currentVolPercent;
    setVolume(0);
  } else {
    setVolume(previousVolume);
  }
});

function startVolumeDrag(e) {
  isDraggingVolume = true;
  volumeHandle.classList.add('active');
  document.addEventListener('mousemove', dragVolume);
  document.addEventListener('mouseup', stopVolumeDrag);
  e.preventDefault();
}

function dragVolume(e) {
  if (!isDraggingVolume) return;
  e.preventDefault();
  const rect = volumeTrack.getBoundingClientRect();
  let x = e.clientX - rect.left;
  const width = rect.width;
  x = Math.max(0, Math.min(x, width));
  let volPercent = (x / width) * 100;
  setVolume(volPercent);
}

function stopVolumeDrag(e) {
  if (!isDraggingVolume) return;
  isDraggingVolume = false;
  volumeHandle.classList.remove('active');
  document.removeEventListener('mousemove', dragVolume);
  document.removeEventListener('mouseup', stopVolumeDrag);
}

volumeHandle.addEventListener('mousedown', startVolumeDrag);

/* Fullscreen Toggle */
function toggleFullscreen() {
  const container = document.querySelector('.player-container');
  if (!document.fullscreenElement) {
    container.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

playPauseBtn.addEventListener('click', togglePlayPause);
rewindBtn.addEventListener('click', rewindVideo);
fullscreenBtn.addEventListener('click', toggleFullscreen);

/* Animated Fullscreen Button Frames */
let fullscreenFrame = 1;
const totalFrames = 24;
let fullscreenInterval = null;
const frameDelay = 40; // ms between frames


function updateFullscreenFrame() {
    if (fullscreenFrame < totalFrames) {
      fullscreenFrame++;
      fullscreenBtn.style.backgroundImage = `url('fullscreen_button/${fullscreenFrame}.png')`;
    } else {
      // On last frame, directly reset to frame 1 without fade or blink
      fullscreenFrame = 1;
      fullscreenBtn.style.backgroundImage = `url('fullscreen_button/1.png')`;
    }
  }

  function startFullscreenAnimation() {
    if (!fullscreenInterval) {
      fullscreenFrame = 1;
      fullscreenBtn.style.backgroundImage = `url('fullscreen_button/1.png')`;
      fullscreenBtn.style.opacity = 1; // Ensure fully visible
      fullscreenInterval = setInterval(updateFullscreenFrame, frameDelay);
    }
  }
  
  function stopFullscreenAnimation() {
    if (fullscreenInterval) {
      clearInterval(fullscreenInterval);
      fullscreenInterval = null;
      // Reset to frame 1 so it rests at frame 1 when not hovered
      fullscreenFrame = 1;
      fullscreenBtn.style.backgroundImage = `url('fullscreen_button/1.png')`;
    }
  }
  
  
  fullscreenBtn.addEventListener('mouseenter', startFullscreenAnimation);
  fullscreenBtn.addEventListener('mouseleave', stopFullscreenAnimation);

  
