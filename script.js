// FILE: script.js
// ----------------------------------------------------
// 1) Cal.com embed (quick-chat) – dùng cho ABOUT / CONTACT
// 2) Dynamic header + footer include (header-hero / header-subpage + footer.html)
// 3) Tự set .active cho nav link theo URL
// 4) Hiệu ứng hero-header đổi style khi scroll
// 5) Filter + sort product cards (trang products.html)
// ----------------------------------------------------


// ===============================
// 1. Cal.com – Quick Chat Popup
// ===============================
function initCal() {
  // Đảm bảo chỉ init 1 lần (tránh gọi lại nhiều lần khi load header + footer)
  if (window.__calInitialized) return;
  window.__calInitialized = true;

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

  // Event type "quick-chat"
  Cal("init", "quick-chat", { origin: "https://app.cal.com" });

  Cal.ns["quick-chat"]("ui", {
    cssVarsPerTheme: {
      light: { "cal-brand": "#132c4f" },
      dark: { "cal-brand": "#FFFCEE" }
    },
    hideEventTypeDetails: false,
    layout: "month_view"
  });
}


// =========================================
// 2. Set .active cho nav link theo URL
// =========================================
function setActiveNavLink() {
  const path = window.location.pathname.toLowerCase();
  const links = document.querySelectorAll('.navbar-nav .nav-link[href]');

  links.forEach(link => {
    const href = link.getAttribute('href').toLowerCase();
    link.classList.remove('active');

    // Trang chủ: index.html hoặc '/'
    if (
      href === 'index.html' &&
      (path.endsWith('/') || path.endsWith('index.html'))
    ) {
      link.classList.add('active');
    }
    // Các trang khác
    else if (href !== 'index.html' && path.endsWith(href)) {
      link.classList.add('active');
    }
  });
}


// ===================================================
// 3. Hiệu ứng hero-header đổi style khi scroll
//    (chỉ áp dụng cho trang có .hero-header – trang chủ)
// ===================================================
function initHeroHeaderScroll() {
  const heroHeader = document.querySelector('.hero-header');
  if (!heroHeader) return;

  const THRESHOLD = 60; // scroll xuống sâu hơn rồi mới đổi
  let isScrolled = false;

  function onScroll() {
    const shouldBeScrolled = window.scrollY > THRESHOLD;

    if (shouldBeScrolled !== isScrolled) {
      isScrolled = shouldBeScrolled;
      heroHeader.classList.toggle('scrolled', isScrolled);
    }
  }

  window.addEventListener('scroll', onScroll);
  onScroll(); // set state ban đầu
}



// ===================================================
// 4. Dynamic Header + Footer include
// ===================================================
document.addEventListener('DOMContentLoaded', () => {
  // ----- HEADER -----
  const headerContainer = document.getElementById('header-placeholder');
  if (headerContainer) {
    const pageHeaderType = document.body.dataset.header || 'subpage';
    const headerFile = pageHeaderType === 'hero'
      ? 'components/header-hero.html'
      : 'components/header-subpage.html';

    fetch(headerFile)
      .then(res => res.text())
      .then(html => {
        headerContainer.innerHTML = html;

        // Sau khi header đã gắn vào DOM:
        setActiveNavLink();
        initHeroHeaderScroll();
        initCal(); // để ABOUT/CONTACT trong header hoạt động
      })
      .catch(err => console.error('Không load được header:', err));
  }

  // ----- FOOTER -----
  const footerContainer = document.getElementById('footer-placeholder');
  if (footerContainer) {
    fetch('components/footer.html')
      .then(res => res.text())
      .then(html => {
        footerContainer.innerHTML = html;

        // Footer cũng có ABOUT/CONTACT trigger → đảm bảo Cal đã init
        initCal();
      })
      .catch(err => console.error('Không load được footer:', err));
  }

  // ----- PRODUCT FILTERS (chỉ chạy ở trang có .product-grid) -----
  const productGrid = document.querySelector('.product-grid');
  if (productGrid) {
    initProductFilters();
    initFilterScrollArrows(); // filter scroll arrows
  }

  initWorkshopGallery();  // gallery + lightbox từ JSON

  initScrollToTop();        // scroll-to-top button
});


// ===================================================
// 5. Filter + Sort logic cho trang products.html
//    - Sử dụng data-location & data-type trên .product-card
//    - Filter bằng .filter-chip.filter-location / .filter-chip.filter-type
//    - Không ẩn card, chỉ reorder (sort) theo độ match
// ===================================================
function initProductFilters() {
  const grid = document.querySelector('.product-grid');
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll('.product-card'));
  const locationChips = document.querySelectorAll('.filter-chip.filter-location');
  const typeChips = document.querySelectorAll('.filter-chip.filter-type');
  const locationTitle = document.querySelector('.location-header h1');

  const defaultLocationTitle = locationTitle ? locationTitle.textContent.trim() : '';

  const LOCATION_LABELS = {
    'hanoi': 'Hanoi',
    'ninh-binh': 'Ninh Binh',
    'sapa': 'Sapa'
  };

  // Lưu trạng thái ban đầu: element + index gốc + data
  const originalCards = cards.map((el, index) => ({
    el,
    originalIndex: index,
    location: (el.dataset.location || '').toLowerCase(),
    type: (el.dataset.type || '').toLowerCase()
  }));

  const urlParams = new URLSearchParams(window.location.search);
  let currentLocation = (urlParams.get('location') || '').toLowerCase();
  let currentType = (urlParams.get('type') || '').toLowerCase();

  // Nếu query location không hợp lệ → bỏ qua
  if (!LOCATION_LABELS[currentLocation] && currentLocation !== '') {
    currentLocation = '';
  }

  // Lắng nghe click trên chip Location
  locationChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const loc = (chip.dataset.location || '').toLowerCase();
      currentLocation = loc === currentLocation ? '' : loc; // click lại chip -> bỏ filter
      applyFilterSort();
    });
  });

  // Lắng nghe click trên chip Type
  typeChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const typ = (chip.dataset.type || '').toLowerCase();
      currentType = typ === currentType ? '' : typ;
      applyFilterSort();
    });
  });

  // Áp dụng filter + sort lần đầu khi load trang
  applyFilterSort();

  function applyFilterSort() {
    const hasFilter = !!currentLocation || !!currentType;

    // Tính điểm match cho từng card
    const sorted = originalCards.slice().sort((a, b) => {
      const scoreA = getMatchScore(a, currentLocation, currentType, hasFilter);
      const scoreB = getMatchScore(b, currentLocation, currentType, hasFilter);

      // Ưu tiên score cao hơn
      if (scoreA !== scoreB) return scoreB - scoreA;
      // Score bằng nhau → giữ thứ tự gốc
      return a.originalIndex - b.originalIndex;
    });

    // Re-append theo thứ tự mới (không ẩn card nào)
    sorted.forEach(item => {
      grid.appendChild(item.el);
      item.el.style.display = '';
    });

    // Cập nhật title theo location nếu có
    if (locationTitle) {
      if (currentLocation && LOCATION_LABELS[currentLocation]) {
        locationTitle.textContent = LOCATION_LABELS[currentLocation];
      } else {
        locationTitle.textContent = defaultLocationTitle;
      }
    }

    // Active state cho chips Location
    locationChips.forEach(chip => {
      const loc = (chip.dataset.location || '').toLowerCase();
      chip.classList.toggle('active', loc === currentLocation && currentLocation !== '');
    });

    // Active state cho chips Type
    typeChips.forEach(chip => {
      const typ = (chip.dataset.type || '').toLowerCase();
      chip.classList.toggle('active', typ === currentType && currentType !== '');
    });
  }

  // score: 0 = không match, 1 = match 1 điều kiện, 2 = match cả location + type
  function getMatchScore(item, loc, typ, hasFilter) {
    if (!hasFilter) return 1; // không filter thì tất cả score = 1 (giữ thứ tự gốc)
    let score = 0;
    if (loc && item.location === loc) score += 1;
    if (typ && item.type === typ) score += 1;
    return score;
  }
}

// ===================================================
// Filter scroll arrows (mobile)
// - Hiện mũi tên phải ở đầu
// - Khi cuộn / bấm thì update: đầu -> chỉ phải, cuối -> chỉ trái, giữa -> cả 2
// ===================================================
function initFilterScrollArrows() {
  const scroller = document.querySelector('.filter-scroll-container');
  const leftBtn = document.querySelector('.filter-arrow-left');
  const rightBtn = document.querySelector('.filter-arrow-right');

  if (!scroller || !leftBtn || !rightBtn) return;

  function updateArrows() {
    const maxScroll = scroller.scrollWidth - scroller.clientWidth;

    // Nếu không đủ dài để cuộn -> ẩn cả 2
    if (maxScroll <= 0) {
      leftBtn.classList.add('hidden');
      rightBtn.classList.add('hidden');
      return;
    }

    const current = scroller.scrollLeft;

    // Đầu list -> ẩn trái, hiện phải
    leftBtn.classList.toggle('hidden', current <= 2);
    // Cuối list -> ẩn phải, hiện trái
    rightBtn.classList.toggle('hidden', current >= maxScroll - 2);
  }

  function scrollByStep(direction) {
    const step = scroller.clientWidth * 0.6; // cuộn ~60% chiều rộng
    scroller.scrollBy({ left: direction * step, behavior: 'smooth' });
  }

  // Click arrow
  leftBtn.addEventListener('click', () => scrollByStep(-1));
  rightBtn.addEventListener('click', () => scrollByStep(1));

  // Khi user tự kéo tay thì cũng update state mũi tên
  scroller.addEventListener('scroll', () => {
    window.requestAnimationFrame(updateArrows);
  });

  // Khi resize màn hình, tính lại
  window.addEventListener('resize', updateArrows);

  // Gọi lần đầu
  updateArrows();
}

// ===================================================
// Scroll-to-top button
// ===================================================
function initScrollToTop() {
  const btn = document.getElementById('scrollToTop');
  if (!btn) return;

  function toggleVisibility() {
    if (window.scrollY > 120) {  // user kéo xuống >200px
      btn.classList.add('show');
    } else {
      btn.classList.remove('show');
    }
  }

  window.addEventListener('scroll', toggleVisibility);
  toggleVisibility(); // chạy lúc load

  btn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// ===================================================
// GALLERY + LIGHTBOX từ JSON (cho các trang product)
// - Desktop: 1 ảnh lớn + 2 ảnh nhỏ (layout cũ)
// - Mobile: slider ngang dùng scroll-snap (.gallery-track)
// - Dots luôn sync với ảnh hiện tại
// ===================================================
function initWorkshopGallery() {
  const galleryContainer = document.getElementById('auto-gallery');
  const lightbox = document.getElementById('lightbox');
  const dotsContainer = document.getElementById('gallery-dots');

  if (!galleryContainer || !lightbox) return;

  const jsonPath = galleryContainer.dataset.galleryJson;
  if (!jsonPath) {
    console.warn('Không có data-gallery-json trên #auto-gallery');
    return;
  }

  fetch(jsonPath)
    .then(res => res.json())
    .then(data => {
      const imageList = data.images || [];
      if (!imageList.length) return;

      let currentIndex = 0;
      let mainImageDesktop = null;  // ảnh lớn bên trái (desktop)
      let track = null;             // track cho slider mobile

      // ---------- TẠO LAYOUT DESKTOP (1 lớn + 2 nhỏ) ----------
      const galleryLeft  = document.createElement('div');
      const galleryRight = document.createElement('div');
      galleryLeft.className  = 'gallery-left';
      galleryRight.className = 'gallery-right';

      galleryContainer.append(galleryLeft, galleryRight);

      // ---------- TẠO TRACK MOBILE (scroll-snap slider) ----------
      track = document.createElement('div');
      track.className = 'gallery-track';
      galleryContainer.appendChild(track);

      // ---------- TẠO MŨI TÊN ĐIỀU HƯỚNG (MOBILE) ----------
      const arrowLeft = document.createElement('button');
      arrowLeft.className = 'gallery-arrow gallery-arrow-left';
      arrowLeft.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
      arrowLeft.setAttribute('aria-label', 'Previous image');
      galleryContainer.appendChild(arrowLeft);

      const arrowRight = document.createElement('button');
      arrowRight.className = 'gallery-arrow gallery-arrow-right';
      arrowRight.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
      arrowRight.setAttribute('aria-label', 'Next image');
      galleryContainer.appendChild(arrowRight);

      imageList.forEach((src, index) => {
        // --- Ảnh DESKTOP ---
        const imgDesktop = document.createElement('img');
        imgDesktop.src = src;
        imgDesktop.className = 'gallery-img';
        imgDesktop.dataset.index = index;
        imgDesktop.alt = `Workshop gallery image ${index + 1}`;

        if (index === 0) {
          galleryLeft.appendChild(imgDesktop);
          mainImageDesktop = imgDesktop;
        } else if (index === 1 || index === 2) {
          galleryRight.appendChild(imgDesktop);
        }

        // --- Slide MOBILE ---
        const slide = document.createElement('div');
        slide.className = 'gallery-slide';

        const imgMobile = document.createElement('img');
        imgMobile.src = src;
        imgMobile.className = 'gallery-img';
        imgMobile.dataset.index = index;
        imgMobile.alt = `Workshop gallery image ${index + 1}`;

        slide.appendChild(imgMobile);
        track.appendChild(slide);
      });

      // ---------- DOTS NAVIGATION ----------
      if (dotsContainer) {
        dotsContainer.innerHTML = '';
        imageList.forEach((_, index) => {
          const dot = document.createElement('button');
          dot.className = 'gallery-dot' + (index === 0 ? ' active' : '');
          dot.dataset.index = index;

          dot.addEventListener('click', () => {
            currentIndex = index;
            updateUI(false); // update preview + dots

            // Scroll tới slide tương ứng (mobile)
            if (track) {
              const slideWidth = track.clientWidth;
              track.scrollTo({
                left: slideWidth * index,
                behavior: 'smooth'
              });
            }
          });

          dotsContainer.appendChild(dot);
        });
      }

      function updateDots() {
        if (!dotsContainer) return;
        const dots = dotsContainer.querySelectorAll('.gallery-dot');
        dots.forEach(dot => {
          const idx = Number(dot.dataset.index);
          dot.classList.toggle('active', idx === currentIndex);
        });
      }

      // ---------- LIGHTBOX SETUP ----------
      const lightboxImg = lightbox.querySelector('.lightbox-img');
      const closeBtn    = lightbox.querySelector('.close');
      const counter     = lightbox.querySelector('.counter');
      const prevBtn     = lightbox.querySelector('.prev');
      const nextBtn     = lightbox.querySelector('.next');

      function updateUI(updateLightbox = true) {
        const newSrc = imageList[currentIndex];

        // Update lightbox
        if (updateLightbox && lightboxImg) {
          lightboxImg.src = newSrc;
        }

        // Update ảnh lớn desktop
        if (mainImageDesktop) {
          mainImageDesktop.src = newSrc;
        }

        // Counter
        if (counter) {
          counter.textContent = `${currentIndex + 1} / ${imageList.length}`;
        }

        // Dots
        updateDots();
      }

      // Sync lần đầu
      updateUI(false);

      // Click ảnh (desktop + mobile) -> mở lightbox
      galleryContainer.addEventListener('click', e => {
        const img = e.target.closest('.gallery-img');
        if (!img) return;

        const idx = parseInt(img.dataset.index, 10);
        if (!Number.isNaN(idx)) {
          currentIndex = idx;
        }

        updateUI(true);
        lightbox.style.display = 'block';
      });

      // Đóng lightbox
      closeBtn.addEventListener('click', () => {
        lightbox.style.display = 'none';
      });

      lightbox.addEventListener('click', e => {
        if (e.target === lightbox) {
          lightbox.style.display = 'none';
        }
      });

      // Mũi tên trong lightbox
      prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + imageList.length) % imageList.length;
        updateUI(true);
      });

      nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % imageList.length;
        updateUI(true);
      });

      // ---------- SWIPE GESTURE CHO LIGHTBOX (MOBILE) ----------
      let touchStartX = 0;
      let touchEndX = 0;
      const SWIPE_THRESHOLD = 50; // khoảng cách tối thiểu để nhận diện swipe

      lightbox.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      lightbox.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
      }, { passive: true });

      function handleSwipe() {
        const diff = touchStartX - touchEndX;
        
        // Swipe trái (vuốt sang trái) -> ảnh tiếp theo
        if (diff > SWIPE_THRESHOLD) {
          currentIndex = (currentIndex + 1) % imageList.length;
          updateUI(true);
        }
        // Swipe phải (vuốt sang phải) -> ảnh trước
        else if (diff < -SWIPE_THRESHOLD) {
          currentIndex = (currentIndex - 1 + imageList.length) % imageList.length;
          updateUI(true);
        }
      }

      // Bàn phím
      document.addEventListener('keydown', e => {
        if (lightbox.style.display === 'block') {
          if (e.key === 'ArrowLeft')  prevBtn.click();
          if (e.key === 'ArrowRight') nextBtn.click();
          if (e.key === 'Escape')     closeBtn.click();
        }
      });

      // ---------- SCROLL-SNAP SYNC (MOBILE) + GALLERY ARROWS ----------
      if (track) {
        let scrollTimeout = null;

        // Function update visibility mũi tên
        function updateGalleryArrows() {
          if (!track || imageList.length <= 1) {
            arrowLeft.classList.remove('show');
            arrowRight.classList.remove('show');
            return;
          }

          const maxScroll = track.scrollWidth - track.clientWidth;
          const currentScroll = track.scrollLeft;

          // Đầu list -> chỉ hiện mũi tên phải
          if (currentScroll <= 2) {
            arrowLeft.classList.remove('show');
            arrowRight.classList.add('show');
          }
          // Cuối list -> chỉ hiện mũi tên trái
          else if (currentScroll >= maxScroll - 2) {
            arrowLeft.classList.add('show');
            arrowRight.classList.remove('show');
          }
          // Giữa -> hiện cả 2
          else {
            arrowLeft.classList.add('show');
            arrowRight.classList.add('show');
          }
        }

        // Click mũi tên để scroll
        arrowLeft.addEventListener('click', (e) => {
          e.stopPropagation();
          const slideWidth = track.clientWidth;
          track.scrollBy({ left: -slideWidth, behavior: 'smooth' });
        });

        arrowRight.addEventListener('click', (e) => {
          e.stopPropagation();
          const slideWidth = track.clientWidth;
          track.scrollBy({ left: slideWidth, behavior: 'smooth' });
        });

        // Update arrows khi scroll
        track.addEventListener('scroll', () => {
          if (scrollTimeout) {
            window.cancelAnimationFrame(scrollTimeout);
          }

          scrollTimeout = window.requestAnimationFrame(() => {
            const slideWidth = track.clientWidth || 1;
            const rawIndex = track.scrollLeft / slideWidth;
            const idx = Math.round(rawIndex);

            const clampedIndex = Math.max(0, Math.min(idx, imageList.length - 1));

            if (clampedIndex !== currentIndex) {
              currentIndex = clampedIndex;
              updateUI(false); // chỉ update preview + dots
            }

            // Update arrows visibility
            updateGalleryArrows();
          });
        });

        // Update arrows khi resize
        window.addEventListener('resize', () => {
          updateGalleryArrows();
        });

        // Gọi lần đầu để set state ban đầu
        updateGalleryArrows();
      }
    })
    .catch(err => console.error('Không thể tải gallery JSON:', err));
}



