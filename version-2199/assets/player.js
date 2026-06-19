const activePlayers = new WeakMap();

window.startMoviePlayer = function(video, source) {
  if (!video || !source) {
    return;
  }

  const currentSource = activePlayers.get(video);
  if (currentSource === source) {
    video.controls = true;
    return;
  }

  video.controls = true;

  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = source;
    activePlayers.set(video, source);
    return;
  }

  const Hls = window.Hls;

  if (Hls && Hls.isSupported()) {
    if (video.hlsInstance) {
      video.hlsInstance.destroy();
    }

    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });

    video.hlsInstance = hls;
    hls.loadSource(source);
    hls.attachMedia(video);
    activePlayers.set(video, source);
    return;
  }

  video.src = source;
  activePlayers.set(video, source);
};
