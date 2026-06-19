
(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function initPlayer() {
    var root = document.querySelector('[data-player-root]');
    if (!root) return;
    var video = root.querySelector('video');
    var overlay = root.querySelector('[data-player-overlay]');
    var status = root.querySelector('[data-player-status]');
    var playBtns = Array.prototype.slice.call(root.querySelectorAll('[data-player-play]'));
    var muteBtns = Array.prototype.slice.call(root.querySelectorAll('[data-player-mute]'));
    var fsBtns = Array.prototype.slice.call(root.querySelectorAll('[data-player-fullscreen]'));
    var src = root.getAttribute('data-video-url') || '';
    var poster = root.getAttribute('data-poster') || '';
    var hls = null;

    if (poster) {
      video.setAttribute('poster', poster);
    }

    function setStatus(text) {
      if (status) status.textContent = text;
    }

    function showOverlay(show) {
      if (!overlay) return;
      overlay.classList.toggle('hidden', !show);
    }

    function attachSource() {
      if (!src) {
        setStatus('未提供播放地址');
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        setStatus('已准备播放');
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('已准备播放');
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              setStatus('网络加载失败，正在重试');
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              setStatus('媒体流异常，正在恢复');
              hls.recoverMediaError();
            } else {
              setStatus('播放失败，请稍后再试');
            }
          }
        });
        return;
      }
      video.src = src;
      setStatus('当前浏览器已使用原生播放模式');
    }

    function togglePlay() {
      if (video.paused) {
        var p = video.play();
        if (p && typeof p.catch === 'function') {
          p.catch(function () {
            setStatus('点击播放后浏览器阻止了自动播放，请再次点击');
          });
        }
      } else {
        video.pause();
      }
    }

    function toggleMute() {
      video.muted = !video.muted;
      muteBtns.forEach(function (btn) {
        btn.textContent = video.muted ? '取消静音' : '静音';
      });
    }

    function toggleFullscreen() {
      if (document.fullscreenElement) {
        document.exitFullscreen();
        return;
      }
      if (root.requestFullscreen) {
        root.requestFullscreen();
      }
    }

    playBtns.forEach(function (btn) {
      btn.addEventListener('click', togglePlay);
    });
    muteBtns.forEach(function (btn) {
      btn.addEventListener('click', toggleMute);
    });
    fsBtns.forEach(function (btn) {
      btn.addEventListener('click', toggleFullscreen);
    });
    if (overlay) overlay.addEventListener('click', togglePlay);

    video.addEventListener('play', function () {
      showOverlay(false);
      setStatus('播放中');
      playBtns.forEach(function (btn) { btn.textContent = '暂停'; });
    });
    video.addEventListener('pause', function () {
      showOverlay(true);
      setStatus('已暂停');
      playBtns.forEach(function (btn) { btn.textContent = '播放'; });
    });
    video.addEventListener('ended', function () {
      showOverlay(true);
      setStatus('播放结束');
      playBtns.forEach(function (btn) { btn.textContent = '重播'; });
    });
    video.addEventListener('loadedmetadata', function () {
      setStatus('视频已加载');
    });

    attachSource();

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  ready(initPlayer);
})();
