
(function () {
  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  function initMenu() {
    const toggle = qs('[data-menu-toggle]');
    const panel = qs('[data-menu-panel]');
    if (!toggle || !panel) return;
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
    document.addEventListener('click', function (e) {
      if (!panel.contains(e.target) && !toggle.contains(e.target)) panel.classList.remove('open');
    });
  }

  function initBackTop() {
    const btn = document.createElement('button');
    btn.className = 'backtop';
    btn.type = 'button';
    btn.setAttribute('aria-label', '返回顶部');
    btn.textContent = '↑';
    document.body.appendChild(btn);
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    const onScroll = function () {
      if (window.scrollY > 500) btn.classList.add('show');
      else btn.classList.remove('show');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function initHeroSlider() {
    const slider = qs('[data-hero-slider]');
    if (!slider) return;
    const slides = qsa('.hero-slide', slider);
    const dotsWrap = qs('[data-hero-dots]', slider);
    if (!slides.length || !dotsWrap) return;
    let index = 0;
    const dots = slides.map(function (_, i) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'hero-dot' + (i === 0 ? ' active' : '');
      b.addEventListener('click', function () {
        index = i;
        render();
      });
      dotsWrap.appendChild(b);
      return b;
    });
    function render() {
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }
    render();
    setInterval(function () {
      index = (index + 1) % slides.length;
      render();
    }, 5200);
  }

  function initFilter() {
    const input = qs('[data-search-input]');
    const scope = qs('[data-filter-scope]');
    if (!input || !scope) return;
    const cards = qsa('[data-search-text]', scope);
    const count = qs('[data-filter-count]');
    const status = qs('[data-filter-status]');
    function apply() {
      const q = input.value.trim().toLowerCase();
      let visible = 0;
      cards.forEach(function (card) {
        const text = (card.getAttribute('data-search-text') || '').toLowerCase();
        const ok = !q || text.indexOf(q) !== -1;
        card.classList.toggle('hidden-card', !ok);
        if (ok) visible++;
      });
      if (count) count.textContent = String(visible);
      if (status) status.textContent = q ? ('已筛选：' + q) : '显示全部影片';
    }
    input.addEventListener('input', apply);
    apply();
  }

  function initPlayer() {
    const shell = qs('[data-player-shell]');
    if (!shell) return;
    const video = qs('video', shell);
    const overlay = qs('[data-player-overlay]', shell);
    const btn = qs('[data-player-btn]', shell);
    const source = shell.getAttribute('data-video') || '';
    if (!video || !source) return;
    let hls = null;
    function hideOverlay() {
      if (overlay) overlay.classList.add('hidden');
    }
    function playNow() {
      video.play().catch(function () {});
    }
    function mount() {
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          hideOverlay();
        });
        hls.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal) {
            hideOverlay();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', hideOverlay, { once: true });
      } else {
        hideOverlay();
      }
    }
    if (btn) {
      btn.addEventListener('click', function () {
        hideOverlay();
        playNow();
      });
    }
    video.addEventListener('click', function () {
      hideOverlay();
      playNow();
    });
    video.addEventListener('play', hideOverlay);
    mount();
  }

  function initQuickScroll() {
    qsa('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        const id = a.getAttribute('href');
        if (!id || id.length < 2) return;
        const el = document.getElementById(id.slice(1));
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initBackTop();
    initHeroSlider();
    initFilter();
    initPlayer();
    initQuickScroll();
  });
})();
