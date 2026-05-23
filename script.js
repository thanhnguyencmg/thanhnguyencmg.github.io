// === HAMBURGER ===
const hamburger = document.querySelector('.hamburger');
const mobileNav = document.querySelector('.mobile-nav');
if (hamburger && mobileNav) {
  hamburger.addEventListener('click', () => mobileNav.classList.toggle('open'));
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) mobileNav.classList.remove('open');
  });
}

// === BLOCK DOWNLOADS (except on resume.html) ===
const isResumePage = window.location.pathname.includes('resume');
if (!isResumePage) {
  // Remove download attribute from all links
  document.querySelectorAll('a[download]').forEach(a => a.removeAttribute('download'));
  // Block right-click context menu on images and media
  document.addEventListener('contextmenu', (e) => {
    if (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO' || e.target.tagName === 'CANVAS') {
      e.preventDefault();
    }
  });
  // Block drag on images
  document.addEventListener('dragstart', (e) => {
    if (e.target.tagName === 'IMG') e.preventDefault();
  });
}

// === SCROLL REVEAL ===
const reveals = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) setTimeout(() => entry.target.classList.add('visible'), i * 80);
  });
}, { threshold: 0.1 });
reveals.forEach(el => revealObserver.observe(el));

// === VIDEO CAROUSEL ===
function initCarousel(wrap) {
  const track = wrap.querySelector('.carousel-track');
  const prevBtn = wrap.querySelector('.prev-btn');
  const nextBtn = wrap.querySelector('.next-btn');
  if (!track) return;

  const items = Array.from(track.children);
  let currentIndex = 0;
  let autoTimer = null;

  function getVisibleCount() {
    const containerW = track.parentElement.offsetWidth;
    const item = items[0];
    if (!item) return 1;
    const itemW = item.offsetWidth + 10;
    return Math.max(1, Math.floor(containerW / itemW));
  }

  function getMaxIndex() {
    return Math.max(0, items.length - getVisibleCount());
  }

  function goTo(index) {
    const max = getMaxIndex();
    currentIndex = Math.max(0, Math.min(index, max));
    const item = items[currentIndex];
    track.style.transform = `translateX(-${item ? item.offsetLeft : 0}px)`;
    if (prevBtn) prevBtn.style.opacity = currentIndex === 0 ? '0.35' : '1';
    if (nextBtn) nextBtn.style.opacity = currentIndex >= max ? '0.35' : '1';
  }

  function next() { goTo(currentIndex + 1); }
  function prev() { goTo(currentIndex - 1); }

  if (prevBtn) prevBtn.addEventListener('click', () => { clearAuto(); prev(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { clearAuto(); next(); });

  function startAuto() {
    clearAuto();
    // Only autoscroll if carousel has data-autoscroll="true"
    if (wrap.dataset.autoscroll !== 'true') return;
    autoTimer = setInterval(() => {
      if (currentIndex >= getMaxIndex()) goTo(0);
      else next();
    }, 3000);
  }
  function clearAuto() { clearInterval(autoTimer); }

  // Autoscroll only on hover AND only if data-autoscroll="true"
  wrap.addEventListener('mouseenter', startAuto);
  wrap.addEventListener('mouseleave', clearAuto);

  // Touch swipe
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { if (diff > 0) next(); else prev(); }
  }, { passive: true });

  goTo(0);
  window.addEventListener('resize', () => goTo(currentIndex));
}

document.querySelectorAll('.carousel-wrap').forEach(initCarousel);

// === PDF MODAL (for testimonials) ===
window.openPDF = function(url) {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.82);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;';
  overlay.innerHTML = `
    <div style="background:#fff;border-radius:12px;overflow:hidden;width:100%;max-width:700px;height:90vh;display:flex;flex-direction:column;">
      <div style="display:flex;justify-content:flex-end;padding:12px 16px;border-bottom:1px solid #E5E7EB;">
        <button onclick="this.closest('[style*=fixed]').remove()" style="border:none;background:none;font-size:1.5rem;cursor:pointer;color:#6B7280;">&times;</button>
      </div>
      <iframe src="${url}" style="flex:1;border:none;width:100%;"></iframe>
    </div>`;
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
};

// ── Claude notification (home page only) ─────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Only show on home page
  const path = window.location.pathname;
  const isHome = path === '/' || path === '' || path.endsWith('/index.html');
  if (!isHome) return;

  const notifHTML = `
    <div id="claude-notification">
      <div class="notif-avatar"><img src="media/claude.png" alt="Claude"/></div>
      <div class="notif-body">
        <div class="notif-header">
          <span class="notif-name">Claude</span>
          <button class="notif-close" id="notif-close" aria-label="Dismiss">&times;</button>
        </div>
        <div class="notif-text">Coded with Claude in one week.</div>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', notifHTML);
  const notif = document.getElementById('claude-notification');
  document.getElementById('notif-close').addEventListener('click', () => {
    notif.classList.add('dismissed');
    setTimeout(() => notif.remove(), 320);
  });
  // Auto-dismiss after 12 seconds
  setTimeout(() => {
    if (notif && notif.isConnected) {
      notif.classList.add('dismissed');
      setTimeout(() => notif.remove(), 320);
    }
  }, 12000);
});

// ── Core values on every page (inject if not already on page) ─────────────
document.addEventListener('DOMContentLoaded', () => {
  if (!document.querySelector('.core-values')) {
    const cv = `<section><div class="core-values">
      <div class="core-value-col"><img src="media/scientific-expertise.svg" alt=""/><h3>Scientific Expertise</h3><p>Translating complex scientific concepts into clear, authoritative narratives through a systems-thinking approach.</p></div>
      <div class="core-value-col"><img src="media/strategic-marketing.svg" alt=""/><h3>Strategic Marketing</h3><p>Mapping out full-funnel strategies and seamless workflows to drive the journey from awareness to conversion.</p></div>
      <div class="core-value-col"><img src="media/ai-automation.svg" alt=""/><h3>AI &amp; Automation</h3><p>Architecting smart workflows and multi-functional pipelines to simplify complexity and maximize team capacity.</p></div>
      <div class="core-value-col"><img src="media/sustainable-growth.svg" alt=""/><h3>Sustainable Growth</h3><p>Building resilient, forward-looking systems guided by ESG principles for long-term viability.</p></div>
    </div></section>`;
    const hero = document.querySelector('.hero');
    if (hero) hero.insertAdjacentHTML('afterend', cv);
  }
});

// ── Alternating section backgrounds ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Video page sections
  document.querySelectorAll('.video-section-block').forEach((el, i) => {
    el.style.background = i % 2 === 0 ? '#fff' : '#F9FAFB';
    el.style.borderTop = 'none';
  });
  // Graphic design sections
  document.querySelectorAll('.design-section').forEach((el, i) => {
    el.style.paddingTop = '48px';
    el.style.paddingBottom = '48px';
    el.style.marginLeft = '-40px';
    el.style.paddingLeft = '40px';
    el.style.marginRight = '-40px';
    el.style.paddingRight = '40px';
    el.style.background = i % 2 === 0 ? '#fff' : '#F9FAFB';
    el.style.marginBottom = '0';
  });
  // SEO sub-sections
  const subSections = document.querySelectorAll('.sub-section');
  subSections.forEach((el, i) => {
    el.style.borderTop = 'none';
    el.style.background = i % 2 === 0 ? '#fff' : '#F9FAFB';
    el.style.marginLeft = '-40px';
    el.style.paddingLeft = '40px';
    el.style.marginRight = '-40px';
    el.style.paddingRight = '40px';
  });
});
