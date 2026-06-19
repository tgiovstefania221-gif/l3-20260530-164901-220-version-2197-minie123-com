(function () {
    "use strict";

    function loadScript(src) {
        return new Promise(function (resolve, reject) {
            var existing = document.querySelector('script[src="' + src + '"]');
            if (existing) {
                existing.addEventListener("load", resolve);
                existing.addEventListener("error", reject);
                return;
            }

            var script = document.createElement("script");
            script.src = src;
            script.async = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    function setStatus(node, message) {
        if (node) {
            node.textContent = message;
        }
    }

    function initPlayer() {
        var shell = document.querySelector("[data-player]");
        if (!shell) {
            return;
        }

        var video = shell.querySelector("video");
        var button = shell.querySelector("[data-play]");
        var status = shell.querySelector("[data-player-status]");
        var source = shell.getAttribute("data-m3u8");
        var hlsInstance = null;
        var initialized = false;

        if (!video || !button || !source) {
            setStatus(status, "播放器缺少必要参数。");
            return;
        }

        function attachWithHls() {
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                initialized = true;
                setStatus(status, "已使用浏览器原生 HLS 能力加载播放源。");
                return Promise.resolve();
            }

            function createHls() {
                if (!window.Hls || !window.Hls.isSupported()) {
                    throw new Error("当前浏览器不支持 HLS 播放。");
                }

                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false,
                    backBufferLength: 90
                });

                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setStatus(status, "HLS 播放源解析完成，可以播放。");
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
                    if (data && data.fatal) {
                        setStatus(status, "播放源加载异常，请刷新页面后重试。");
                    }
                });
                initialized = true;
            }

            if (window.Hls) {
                createHls();
                return Promise.resolve();
            }

            setStatus(status, "正在加载 HLS 播放核心...");
            return loadScript("https://cdn.jsdelivr.net/npm/hls.js@latest")
                .then(function () {
                    createHls();
                });
        }

        button.addEventListener("click", function () {
            button.classList.add("is-hidden");
            setStatus(status, "正在初始化播放器...");

            var ready = initialized ? Promise.resolve() : attachWithHls();
            ready.then(function () {
                return video.play();
            }).then(function () {
                setStatus(status, "正在播放。");
            }).catch(function (error) {
                button.classList.remove("is-hidden");
                setStatus(status, error && error.message ? error.message : "播放失败，请检查网络或浏览器支持情况。");
            });
        });

        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    document.addEventListener("DOMContentLoaded", initPlayer);
})();
