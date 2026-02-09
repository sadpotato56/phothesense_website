// FILE: script.js
// ----------------------------------------------------
// 1) Global Components (Header, Footer, Cal.com)
// 2) Product Logic (Filter, Sort, Gallery)
// 3) UI Effects (Hero Scroll, Mobile Header, Sticky Bar)
// ----------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {

  // 3. Các chức năng khác
  setActiveNavLink();
  initMobileHeaderAutoHide(); 
  initScrollToTop(); 
  initCal();
});



// =========================================
// 2. CAL.COM & UTILITIES
// =========================================
function initCal() {
  if (!window.__calEmbedLoaded) {
    window.__calEmbedLoaded = true;
    (function (C, A, L) {
      let p = function (a, ar) { a.q.push(ar); };
      let d = C.document;
      C.Cal = C.Cal || function () {
        let cal = C.Cal;
        let ar = arguments;
        if (!cal.loaded) {
          cal.ns = {};
          cal.q = cal.q || [];
          d.head.appendChild(d.createElement("script")).src = A;
          cal.loaded = true;
        }
        if (ar[0] === L) {
          const api = function () { p(api, arguments); };
          const namespace = ar[1];
          api.q = api.q || [];
          if (typeof namespace === "string") {
            cal.ns[namespace] = cal.ns[namespace] || api;
            p(cal.ns[namespace], ar);
            p(cal, ["initNamespace", namespace]);
          } else p(cal, ar);
          return;
        }
        p(cal, ar);
      };
    })(window, "https://app.cal.com/embed/embed.js", "init");
  }

  const triggers = Array.from(document.querySelectorAll('[data-cal-namespace][data-cal-link]'));
  if (!triggers.length) return;

  window.__calNamespacesInited = window.__calNamespacesInited || {};
  const uniqueNamespaces = [...new Set(triggers.map(el => (el.dataset.calNamespace || '').trim()).filter(Boolean))];

  uniqueNamespaces.forEach((ns) => {
    if (window.__calNamespacesInited[ns]) return;
    window.__calNamespacesInited[ns] = true;
    Cal("init", ns, { origin: "https://app.cal.com" });
    const brand = (ns === "quick-chat") ? "#132c4f" : "#1C4278";
    Cal.ns[ns]("ui", {
      cssVarsPerTheme: { light: { "cal-brand": brand }, dark: { "cal-brand": "#FFFCEE" } },
      hideEventTypeDetails: false, layout: "month_view"
    });
  });
}

// Global click delegation for Cal.com
document.addEventListener("click", (e) => {
  const el = e.target.closest('[data-cal-link][data-cal-namespace]');
  if (!el) return;
  if (el.tagName === "A") e.preventDefault();
  if (typeof window.Cal === "function") Cal("preload", { calLink: el.dataset.calLink });
});

// =========================================
// 2. NAVBAR ACTIVE LINK
// =========================================
/**
 * Tối ưu cho: https://phothesense.com/
 * Xử lý chính xác các trang: /, /experience/, /blog/
 */
function setActiveNavLink() {
  // 1. Lấy đường dẫn hiện tại, thêm / vào cuối nếu thiếu để so sánh đồng nhất
  let path = window.location.pathname.toLowerCase();
  if (!path.endsWith('/')) path += '/';

  // 2. Tìm tất cả các link (ép kiểu để tránh lỗi TypeScript trong Astro)
  const links = document.querySelectorAll('.navbar-nav .nav-link');

  links.forEach((link) => {
    const anchor = link;
    let href = anchor.getAttribute('href')?.toLowerCase() || "";

    // Xóa class active cũ
    anchor.classList.remove('active');

    // 3. Chuẩn hóa href để so sánh
    // Bỏ qua các link rỗng hoặc link neo (#)
    if (!href || href.startsWith('#')) return;

    // Thêm / vào cuối href nếu thiếu (trừ khi là link file cụ thể)
    let cleanHref = href;
    if (!cleanHref.endsWith('/') && !cleanHref.includes('.')) {
      cleanHref += '/';
    }

    // 4. So sánh logic
    // Trường hợp trang chủ
    const isHome = cleanHref === '/' || cleanHref.includes('index');
    const isAtHome = path === '/' || path.includes('index');

    if (isHome && isAtHome) {
      anchor.classList.add('active');
    } 
    // Trường hợp các trang /experience/ hoặc /blog/
    else if (!isHome && path.includes(cleanHref)) {
      anchor.classList.add('active');
    }
  });
}


// =========================================
// 3. Mobile Header Auto Hide
// =========================================
function initMobileHeaderAutoHide() {
  const header = document.querySelector('.hero-header, .subpage-header');
  if (!header) return;
  const mq = window.matchMedia('(max-width: 768px)');
  let lastY = 0;
  
  if (header.dataset.autoHideBound === '1') return;
  header.dataset.autoHideBound = '1';

  const onScroll = () => {
    if (!mq.matches) { header.classList.remove('is-hidden'); return; }
    const y = window.scrollY || 0;
    const isMenuOpen = !!(header.querySelector('.show') || header.querySelector('[aria-expanded="true"]'));
    
    if (isMenuOpen || y <= 16) { header.classList.remove('is-hidden'); lastY = y; return; }
    if (y > lastY + 8 && y > 40) header.classList.add('is-hidden');
    else if (y < lastY - 8) header.classList.remove('is-hidden');
    lastY = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
}
// =========================================
// 3. SCROLL TO TOP BUTTON
// =========================================

function initScrollToTop() {
  const btn = document.getElementById('scrollToTop');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 120);
  });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}


