document.addEventListener("DOMContentLoaded", function () {
    var menuButton = document.querySelector(".menu-toggle");
    var navLinks = document.querySelector(".nav-links");

    if (menuButton && navLinks) {
        menuButton.addEventListener("click", function () {
            var open = navLinks.classList.toggle("is-open");
            menuButton.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var prev = hero.querySelector(".hero-prev");
        var next = hero.querySelector(".hero-next");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    });

    document.querySelectorAll("[data-search]").forEach(function (box) {
        var input = box.querySelector(".search-input");
        var panel = box.querySelector(".search-panel");
        var data = window.SEARCH_DATA || [];

        if (!input || !panel) {
            return;
        }

        function closePanel() {
            panel.hidden = true;
            panel.innerHTML = "";
        }

        function renderResults(results) {
            if (!results.length) {
                panel.innerHTML = '<div class="search-empty">没有找到匹配内容</div>';
                panel.hidden = false;
                return;
            }

            panel.innerHTML = results.slice(0, 10).map(function (item) {
                return '<a class="search-result" href="' + item.url + '">' +
                    '<img src="' + item.image + '" alt="' + escapeHtml(item.title) + '">' +
                    '<span>' +
                    '<strong>' + escapeHtml(item.title) + '</strong>' +
                    '<em>' + escapeHtml(item.region + ' · ' + item.year + ' · ' + item.category) + '</em>' +
                    '</span>' +
                    '</a>';
            }).join("");
            panel.hidden = false;
        }

        input.addEventListener("input", function () {
            var query = input.value.trim().toLowerCase();
            if (!query) {
                closePanel();
                return;
            }
            var parts = query.split(/\s+/).filter(Boolean);
            var results = data.filter(function (item) {
                var text = [item.title, item.region, item.type, item.year, item.genre, item.category, item.line].concat(item.tags || []).join(" ").toLowerCase();
                return parts.every(function (part) {
                    return text.indexOf(part) !== -1;
                });
            });
            renderResults(results);
        });

        input.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                var first = panel.querySelector("a");
                if (first) {
                    window.location.href = first.getAttribute("href");
                }
            }
            if (event.key === "Escape") {
                closePanel();
            }
        });

        document.addEventListener("click", function (event) {
            if (!box.contains(event.target)) {
                closePanel();
            }
        });
    });
});

function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, function (char) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "\"": "&quot;"
        }[char];
    });
}

function initMoviePlayer(streamUrl) {
    var player = document.querySelector(".movie-player");
    if (!player) {
        return;
    }

    var video = player.querySelector("video");
    var cover = player.querySelector(".player-cover");
    var loaded = false;
    var hlsInstance = null;

    if (!video || !streamUrl) {
        return;
    }

    function load() {
        if (loaded) {
            return Promise.resolve();
        }

        loaded = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
            return Promise.resolve();
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
            return new Promise(function (resolve) {
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, resolve);
            });
        }

        video.src = streamUrl;
        return Promise.resolve();
    }

    function play() {
        player.classList.add("is-playing");
        load().then(function () {
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        });
    }

    if (cover) {
        cover.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            play();
        }
    });

    video.addEventListener("play", function () {
        player.classList.add("is-playing");
    });

    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
}
