(function () {
    function startPlayer(shell) {
        var video = shell.querySelector('video');
        var button = shell.querySelector('[data-play]');
        if (!video || !button) {
            return;
        }
        var streamUrl = video.getAttribute('data-stream');
        var hls = null;
        var loaded = false;

        function loadAndPlay() {
            if (!streamUrl) {
                return;
            }
            if (!loaded) {
                loaded = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = streamUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(streamUrl);
                    hls.attachMedia(video);
                } else {
                    video.src = streamUrl;
                }
            }
            shell.classList.add('is-playing');
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }

        button.addEventListener('click', loadAndPlay);
        video.addEventListener('click', function () {
            if (!loaded) {
                loadAndPlay();
                return;
            }
            if (video.paused) {
                video.play();
            } else {
                video.pause();
            }
        });
        video.addEventListener('play', function () {
            shell.classList.add('is-playing');
        });
        video.addEventListener('ended', function () {
            shell.classList.remove('is-playing');
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('[data-player]').forEach(startPlayer);
    });
})();
