// Hàm khởi chạy
function init() {
  setActiveNavLink();
  initMobileHeaderAutoHide();
    initCal();
    initScrollToTop();
   
}

// Kiểm tra xem HTML đã load xong chưa
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init(); // Nếu đã load xong rồi thì chạy luôn
}

// =========================================
// 1. NAVBAR ACTIVE LINK
// =========================================
// =========================================
// 1. NAVBAR ACTIVE LINK (FIXED FOR GITHUB PAGES)
// =========================================
function setActiveNavLink() {
  // 1. Lấy đường dẫn hiện tại và XÓA dấu / ở cuối (nếu có) để chuẩn hóa
  // Ví dụ: ".../knife-workshop/" thành ".../knife-workshop"
  const currentPath = window.location.pathname.replace(/\/$/, "").toLowerCase();

  const links = document.querySelectorAll('.navbar-nav .nav-link');

  links.forEach(link => {
    link.classList.remove('active');

    // 2. Lấy đường dẫn thực tế của link và cũng XÓA dấu / ở cuối
    // new URL(link.href).pathname sẽ tự động xử lý các link dạng "index.astro", "./", v.v. thành đường dẫn đầy đủ
    const linkPath = new URL(link.href).pathname.replace(/\/$/, "").toLowerCase();

    // 3. So sánh chính xác
    // Nếu link trỏ về trang chủ (thường rỗng hoặc chỉ có tên repo), ta cần check kỹ hơn chút
    if (currentPath === linkPath) {
       link.classList.add('active');
    }
  });
}

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



function initScrollToTop() {
  const btn = document.getElementById('scrollToTop');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 120);
  });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

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