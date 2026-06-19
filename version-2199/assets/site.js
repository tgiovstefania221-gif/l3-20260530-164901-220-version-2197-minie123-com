const menuButton = document.querySelector(".menu-toggle");
const siteMenu = document.querySelector(".site-menu");

if (menuButton && siteMenu) {
  menuButton.addEventListener("click", function() {
    const isOpen = siteMenu.classList.toggle("is-open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });
}

const hero = document.querySelector("[data-hero]");

if (hero) {
  const slides = Array.from(hero.querySelectorAll(".hero-slide"));
  const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
  let current = 0;

  function showSlide(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach(function(slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === current);
    });
    dots.forEach(function(dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  }

  dots.forEach(function(dot, index) {
    dot.addEventListener("click", function() {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function() {
      showSlide(current + 1);
    }, 5200);
  }
}

function normalize(value) {
  return (value || "").toString().trim().toLowerCase();
}

const filterScope = document.querySelector("[data-filter-scope]");

if (filterScope) {
  const input = filterScope.querySelector("[data-filter-input]");
  const yearFilter = filterScope.querySelector("[data-year-filter]");
  const typeFilter = filterScope.querySelector("[data-type-filter]");
  const cards = Array.from(filterScope.querySelectorAll("[data-movie-card]"));
  const emptyState = filterScope.querySelector("[data-empty-state]");
  const params = new URLSearchParams(window.location.search);
  const query = params.get("q");

  if (query && input) {
    input.value = query;
  }

  function applyFilters() {
    const keyword = normalize(input ? input.value : "");
    const year = normalize(yearFilter ? yearFilter.value : "");
    const type = normalize(typeFilter ? typeFilter.value : "");
    let visible = 0;

    cards.forEach(function(card) {
      const haystack = normalize(card.getAttribute("data-search"));
      const cardYear = normalize(card.getAttribute("data-year"));
      const cardType = normalize(card.getAttribute("data-type"));
      const matched = (!keyword || haystack.includes(keyword)) &&
        (!year || cardYear === year) &&
        (!type || cardType.includes(type));

      card.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle("is-visible", visible === 0);
    }
  }

  [input, yearFilter, typeFilter].forEach(function(control) {
    if (control) {
      control.addEventListener("input", applyFilters);
      control.addEventListener("change", applyFilters);
    }
  });

  applyFilters();
}
