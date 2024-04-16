const videoInput = document.getElementById('videoInput');
const videoPlayer = document.getElementById('videoPlayer');

videoInput.onchange = function(event) {
    const file = event.target.files[0];
    const url = URL.createObjectURL(file);
    videoPlayer.src = url;
    videoPlayer.style.display = 'block';
};


// Enable the file input on page load or when ready
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('videoInput').disabled = false;
});

document.getElementById('videoInput').addEventListener('change', function(event) {
  if (event.target.files.length > 0) {
    var videoFile = event.target.files[0];
    var videoUrl = URL.createObjectURL(videoFile);
    var videoPlayer = document.getElementById('videoPlayer');

    videoPlayer.src = videoUrl;
    videoPlayer.load(); // Load the video file
    document.getElementById('startBtn').disabled = false; // Enable the "Start" button

    // Disable the file input and label to prevent further selections
    event.target.disabled = true;
    document.getElementById('fileInputLabel').style.pointerEvents = 'none';
    document.getElementById('fileInputLabel').style.opacity = '0.5'; // Visually indicate it's disabled
  }
});

document.getElementById('startBtn').addEventListener('click', function() {
  // Immediately disable the "Start" button to prevent further clicks
  this.disabled = true;

  // Set the time we're counting down to: 5 minutes from now
  var countDownDate = new Date(new Date().getTime() + 0.25 * 60 * 1000).getTime();

  // Make sure any previous countdown is cleared
  clearInterval(window.countdownFunction);

  // Start the countdown
  window.countdownFunction = setInterval(function() {
    var now = new Date().getTime();
    var distance = countDownDate - now;

    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById("countdownTimer").innerHTML = "Time left: " + ("0" + minutes).slice(-2) + ":" + ("0" + seconds).slice(-2);

    // When the countdown is finished
    if (distance < 0) {
      clearInterval(window.countdownFunction);
      document.getElementById("countdownTimer").innerHTML = "Time left: 00:00";

      // Actions to block the video
      var videoPlayer = document.getElementById('videoPlayer');
      videoPlayer.pause(); // Stop the video playback
      videoPlayer.currentTime = 0; // Optional: Rewind the video to the start
      videoPlayer.controls = false; // Disable video controls
      videoPlayer.style.display = 'none'; // Hide the video player
    }
  }, 1000);

  // Make the video player visible, enable controls, and play
  var videoPlayer = document.getElementById('videoPlayer');
  videoPlayer.style.display = 'block';
  videoPlayer.controls = true; // Enable video controls
  videoPlayer.play(); // Start playing the video
});