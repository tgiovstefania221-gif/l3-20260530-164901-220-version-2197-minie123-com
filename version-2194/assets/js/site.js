(function () {
    "use strict";

    var navToggle = document.querySelector("[data-nav-toggle]");
    var navMenu = document.querySelector("[data-nav-menu]");
    var headerSearch = document.querySelector(".header-search");

    if (navToggle && navMenu) {
        navToggle.addEventListener("click", function () {
            navMenu.classList.toggle("is-open");
            if (headerSearch) {
                headerSearch.classList.toggle("is-open");
            }
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
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
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
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
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function initFilters() {
        var panel = document.querySelector("[data-filter-panel]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        var countNode = document.querySelector("[data-visible-count]");

        if (!panel || !cards.length) {
            if (countNode) {
                countNode.textContent = cards.length;
            }
            return;
        }

        var searchInput = panel.querySelector("[data-search-input]");
        var regionFilter = panel.querySelector("[data-region-filter]");
        var typeFilter = panel.querySelector("[data-type-filter]");
        var yearFilter = panel.querySelector("[data-year-filter]");
        var resetButton = panel.querySelector("[data-reset-filter]");
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");

        if (query && searchInput) {
            searchInput.value = query;
        }

        function apply() {
            var keyword = normalize(searchInput && searchInput.value);
            var region = normalize(regionFilter && regionFilter.value);
            var type = normalize(typeFilter && typeFilter.value);
            var year = normalize(yearFilter && yearFilter.value);
            var visible = 0;

            cards.forEach(function (card) {
                var searchText = normalize(card.getAttribute("data-search"));
                var cardRegion = normalize(card.getAttribute("data-region"));
                var cardType = normalize(card.getAttribute("data-type"));
                var cardYear = normalize(card.getAttribute("data-year"));
                var matched = true;

                if (keyword && searchText.indexOf(keyword) === -1) {
                    matched = false;
                }
                if (region && cardRegion !== region) {
                    matched = false;
                }
                if (type && cardType !== type) {
                    matched = false;
                }
                if (year && cardYear !== year) {
                    matched = false;
                }

                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });

            if (countNode) {
                countNode.textContent = visible;
            }
        }

        [searchInput, regionFilter, typeFilter, yearFilter].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });

        if (resetButton) {
            resetButton.addEventListener("click", function () {
                if (searchInput) { searchInput.value = ""; }
                if (regionFilter) { regionFilter.value = ""; }
                if (typeFilter) { typeFilter.value = ""; }
                if (yearFilter) { yearFilter.value = ""; }
                apply();
            });
        }

        apply();
    }

    function hydrateImageFallbacks() {
        var images = Array.prototype.slice.call(document.querySelectorAll("img"));
        images.forEach(function (img) {
            img.addEventListener("error", function () {
                img.classList.add("image-missing");
            }, { once: true });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        initHero();
        initFilters();
        hydrateImageFallbacks();
    });
})();
