
(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function initMobileMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!toggle || !menu) return;
    toggle.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function initHeroSlider() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    if (slides.length < 2) return;
    var index = 0;
    var timer = null;

    function activate(next) {
      index = next;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function next() {
      activate((index + 1) % slides.length);
    }

    function start() {
      stop();
      timer = window.setInterval(next, 5200);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        activate(i);
        start();
      });
    });

    activate(0);
    start();
    var panel = document.querySelector('.hero-panel');
    if (panel) {
      panel.addEventListener('mouseenter', stop);
      panel.addEventListener('mouseleave', start);
    }
  }

  function escapeHtml(text) {
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function posterStyle(seed) {
    var value = String(seed || '0');
    var hash = 0;
    for (var i = 0; i < value.length; i += 1) {
      hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
    }
    var h1 = hash % 360;
    var h2 = (h1 + 55) % 360;
    var h3 = (h1 + 160) % 360;
    return '--c1:hsl(' + h1 + ' 76% 48%);--c2:hsl(' + h2 + ' 68% 22%);--accent:hsl(' + h3 + ' 88% 62%);';
  }

  function makeCard(item) {
    var tags = (item.tags || []).slice(0, 4).map(function (tag) {
      return '<span class="tag">' + escapeHtml(tag) + '</span>';
    }).join('');
    var posterTitle = item.posterTitle || item.title || '';
    return '<a class="card" href="detail-' + escapeHtml(item.id) + '.html">' +
      '<div class="poster poster-card" style="' + posterStyle(item.seed || item.id) + '">' +
      '<div class="poster-inner">' +
      '<div class="poster-top"><span class="poster-badge">' + escapeHtml(item.category) + '</span><span class="poster-year">' + escapeHtml(item.year) + '</span></div>' +
      '<div class="poster-main"><p class="poster-kicker">' + escapeHtml(item.type) + '</p><h3 class="poster-title clamp-3">' + escapeHtml(posterTitle) + '</h3><p class="poster-sub clamp-3">' + escapeHtml(item.oneLine || '') + '</p></div>' +
      '<div class="poster-bottom">' + tags + '</div>' +
      '</div></div>' +
      '<div class="card-body">' +
      '<div class="meta-row"><span class="meta-chip">' + escapeHtml(item.category) + '</span><span>' + escapeHtml(item.region) + '</span><span>·</span><span>' + escapeHtml(item.year) + '</span></div>' +
      '<h3 class="clamp-2">' + escapeHtml(item.title) + '</h3>' +
      '<p class="clamp-3">' + escapeHtml(item.oneLine || item.summary || '') + '</p>' +
      '<div class="tag-row">' + tags + '</div>' +
      '<div class="meta-row"><span class="link-more">查看详情</span></div>' +
      '</div></a>';
  }

  function initSearchPage() {
    var mount = document.querySelector('[data-search-results]');
    if (!mount || !window.movieCatalog) return;
    var input = document.querySelector('[data-search-input]');
    var count = document.querySelector('[data-result-count]');
    var params = new URLSearchParams(window.location.search);
    var q = (params.get('q') || '').trim();
    if (input) input.value = q;

    function scoreItem(item, query) {
      if (!query) return 1;
      var hay = [
        item.title, item.region, item.type, item.genreRaw,
        (item.tags || []).join(' '), item.oneLine, item.summary, item.review
      ].join(' ').toLowerCase();
      var ql = query.toLowerCase();
      if (hay.indexOf(ql) !== -1) return 100 + hay.indexOf(ql);
      var parts = ql.split(/\s+/).filter(Boolean);
      var hits = 0;
      parts.forEach(function (part) {
        if (hay.indexOf(part) !== -1) hits += 1;
      });
      return hits ? hits * 10 : 0;
    }

    function render(query) {
      var list = window.movieCatalog.slice().map(function (item) {
        return { item: item, score: scoreItem(item, query) };
      }).filter(function (entry) {
        return !query || entry.score > 0;
      }).sort(function (a, b) {
        if (b.score !== a.score) return b.score - a.score;
        if ((b.item.views || 0) !== (a.item.views || 0)) return (b.item.views || 0) - (a.item.views || 0);
        return (b.item.year || 0) - (a.item.year || 0);
      });

      if (count) {
        count.textContent = query ? ('找到 ' + list.length + ' 部影片') : ('共 ' + window.movieCatalog.length + ' 部影片');
      }

      if (!list.length) {
        mount.innerHTML = '<div class="notice">没有找到匹配的影片，可以换一个关键词再试试。</div>';
        return;
      }

      var html = list.slice(0, 80).map(function (entry) {
        return makeCard(entry.item);
      }).join('');
      mount.innerHTML = '<div class="grid-list">' + html + '</div>';
    }

    if (input) {
      input.addEventListener('input', function () {
        render(input.value.trim());
      });
    }
    render(q);
  }

  ready(function () {
    initMobileMenu();
    initHeroSlider();
    initSearchPage();
  });
})();
