
(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const mobileBtn = $('[data-mobile-toggle]');
  const mobilePanel = $('[data-mobile-panel]');
  if (mobileBtn && mobilePanel) {
    mobileBtn.addEventListener('click', () => {
      mobilePanel.classList.toggle('hide');
    });
  }

  // Search & filter on pages that expose cards
  const searchInput = $('[data-search-input]');
  const cards = $$('[data-filter-item]');
  const counter = $('[data-filter-count]');
  const filterButtons = $$('[data-filter-btn]');

  function updateCounter(visible) {
    if (counter) counter.textContent = visible;
  }

  function applyFilters() {
    const term = (searchInput?.value || '').trim().toLowerCase();
    const active = filterButtons.find(btn => btn.classList.contains('active'))?.dataset.filterBtn || 'all';
    let visible = 0;
    cards.forEach(card => {
      const text = (card.dataset.search || '').toLowerCase();
      const cat = card.dataset.category || 'all';
      const matchText = !term || text.includes(term);
      const matchCat = active === 'all' || active === cat;
      const show = matchText && matchCat;
      card.classList.toggle('hide', !show);
      if (show) visible += 1;
    });
    updateCounter(visible);
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilters();
    });
  });
  if (searchInput || cards.length) applyFilters();

  // Hero slider arrows
  const slider = $('[data-slider-track]');
  const prev = $('[data-slider-prev]');
  const next = $('[data-slider-next]');
  if (slider && prev && next) {
    const step = () => Math.max(280, Math.floor(slider.clientWidth * 0.82));
    prev.addEventListener('click', () => slider.scrollBy({ left: -step(), behavior: 'smooth' }));
    next.addEventListener('click', () => slider.scrollBy({ left: step(), behavior: 'smooth' }));
  }

  // Random film links
  const randomLinks = $$('[data-random-film]');
  if (randomLinks.length) {
    const movies = randomLinks.map(a => a.getAttribute('href')).filter(Boolean);
    randomLinks.forEach(a => {
      a.addEventListener('click', (e) => {
        if (a.dataset.randomFilm === 'true') {
          e.preventDefault();
          const hrefs = $$('[data-film-link]').map(x => x.getAttribute('href')).filter(Boolean);
          const pick = hrefs[Math.floor(Math.random() * hrefs.length)] || a.getAttribute('href');
          if (pick) window.location.href = pick;
        }
      });
    });
  }

  // HLS player init
  const shells = $$('[data-player-shell]');
  shells.forEach(shell => {
    const video = $('video', shell);
    const src = shell.dataset.m3u8;
    const btn = $('[data-play-btn]', shell);
    if (!video || !src) return;

    const initPlayback = async () => {
      try {
        if (window.Hls && Hls.isSupported()) {
          const hls = new Hls({
            lowLatencyMode: false,
            backBufferLength: 30
          });
          hls.loadSource(src);
          hls.attachMedia(video);
          shell.__hls = hls;
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(() => {});
            shell.classList.add('playing');
          });
          hls.on(Hls.Events.ERROR, (_evt, data) => {
            if (data && data.fatal) {
              try { hls.destroy(); } catch (e) {}
              video.src = src;
              video.play().catch(() => {});
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          video.addEventListener('loadedmetadata', () => {
            video.play().catch(() => {});
            shell.classList.add('playing');
          }, { once: true });
        } else {
          video.src = src;
          video.play().catch(() => {});
          shell.classList.add('playing');
        }
      } catch (err) {
        video.src = src;
        video.play().catch(() => {});
        shell.classList.add('playing');
      }
    };

    if (btn) btn.addEventListener('click', initPlayback);
    shell.addEventListener('click', (e) => {
      if (e.target.closest('[data-play-btn]')) return;
      if (!shell.classList.contains('playing')) initPlayback();
    });
  });
})();
