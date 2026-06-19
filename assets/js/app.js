(function () {
  var menuButton = document.querySelector("[data-menu-button]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function startHero() {
      stopHero();
      timer = setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    function stopHero() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(index - 1);
        startHero();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(index + 1);
        startHero();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
        startHero();
      });
    });

    hero.addEventListener("mouseenter", stopHero);
    hero.addEventListener("mouseleave", startHero);
    showSlide(0);
    startHero();
  }

  var filterInput = document.querySelector("[data-filter-input]");
  var filterScope = document.querySelector("[data-filter-scope]");
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-button]"));

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function runFilter(value) {
    if (!filterScope) {
      return;
    }
    var query = normalize(value);
    var items = Array.prototype.slice.call(filterScope.querySelectorAll("[data-search]"));
    items.forEach(function (item) {
      var haystack = normalize(item.getAttribute("data-search") || "");
      item.classList.toggle("is-filter-hidden", query && haystack.indexOf(query) === -1);
    });
  }

  if (filterInput && filterScope) {
    var params = new URLSearchParams(window.location.search);
    var key = filterInput.getAttribute("data-url-query");
    if (key && params.get(key)) {
      filterInput.value = params.get(key);
    }
    runFilter(filterInput.value);
    filterInput.addEventListener("input", function () {
      runFilter(filterInput.value);
    });
  }

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      filterButtons.forEach(function (item) {
        item.classList.remove("active");
      });
      button.classList.add("active");
      var value = button.getAttribute("data-filter-button") || "";
      if (filterInput) {
        filterInput.value = value;
      }
      runFilter(value);
    });
  });

  window.initMoviePlayer = function (source) {
    var video = document.querySelector("[data-player-video]");
    var overlay = document.querySelector("[data-player-overlay]");
    var hls = null;

    if (!video || !source) {
      return;
    }

    function showMessage() {
      if (overlay) {
        overlay.innerHTML = "<span>!</span>";
        overlay.setAttribute("aria-label", "播放加载失败，请稍后再试");
      }
    }

    function attach() {
      if (video.getAttribute("data-ready") === "1") {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showMessage();
          }
        });
      } else {
        showMessage();
        return;
      }
      video.setAttribute("data-ready", "1");
    }

    function play() {
      attach();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });

    video.addEventListener("pause", function () {
      if (overlay && video.currentTime === 0) {
        overlay.classList.remove("is-hidden");
      }
    });

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  };
})();
