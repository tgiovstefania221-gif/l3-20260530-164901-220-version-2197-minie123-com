(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return (value || "").toString().toLowerCase().trim();
    }

    ready(function () {
        var mobileToggle = document.querySelector("[data-mobile-toggle]");
        var mobileMenu = document.querySelector("[data-mobile-menu]");

        if (mobileToggle && mobileMenu) {
            mobileToggle.addEventListener("click", function () {
                mobileMenu.classList.toggle("is-open");
            });
        }

        document.querySelectorAll("[data-header-search]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var keyword = input ? input.value.trim() : "";
                if (keyword) {
                    window.location.href = "./search.html?q=" + encodeURIComponent(keyword);
                }
            });
        });

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
            var current = 0;
            var timer = null;

            function setHero(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === current);
                });
            }

            function startHero() {
                timer = window.setInterval(function () {
                    setHero(current + 1);
                }, 5200);
            }

            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    window.clearInterval(timer);
                    setHero(index);
                    startHero();
                });
            });

            setHero(0);
            startHero();
        }

        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        var pageSearch = document.querySelector("[data-page-search]");
        var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-key]"));
        var emptyState = document.querySelector("[data-empty-state]");
        var activeFilters = {};

        function applyFilters() {
            var keyword = normalize(pageSearch ? pageSearch.value : "");
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-text"));
                var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchesFilters = Object.keys(activeFilters).every(function (key) {
                    return !activeFilters[key] || normalize(card.getAttribute("data-" + key)) === normalize(activeFilters[key]);
                });
                var isVisible = matchesKeyword && matchesFilters;
                card.style.display = isVisible ? "" : "none";
                if (isVisible) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle("is-visible", visible === 0);
            }
        }

        if (pageSearch) {
            var params = new URLSearchParams(window.location.search);
            var q = params.get("q");
            if (q) {
                pageSearch.value = q;
            }
            pageSearch.addEventListener("input", applyFilters);
        }

        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                var key = chip.getAttribute("data-filter-key");
                var value = chip.getAttribute("data-filter-value") || "";
                activeFilters[key] = value;

                chips.filter(function (item) {
                    return item.getAttribute("data-filter-key") === key;
                }).forEach(function (item) {
                    item.classList.toggle("is-active", item === chip);
                });

                applyFilters();
            });
        });

        applyFilters();

        document.querySelectorAll("[data-back-top]").forEach(function (button) {
            button.addEventListener("click", function () {
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        });
    });
})();
