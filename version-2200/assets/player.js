var SitePlayer = (function () {
    function setup(options) {
        var video = document.getElementById(options.videoId);
        var cover = document.getElementById(options.coverId);
        var source = options.source;
        var started = false;
        var hls = null;

        if (!video || !cover || !source) {
            return;
        }

        function attach() {
            if (started) {
                return;
            }

            started = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function play() {
            attach();
            cover.classList.add("is-hidden");
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    cover.classList.remove("is-hidden");
                });
            }
        }

        cover.addEventListener("click", play);
        video.addEventListener("click", function () {
            if (!started) {
                play();
            }
        });

        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    }

    return {
        setup: setup
    };
})();
