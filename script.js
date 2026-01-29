// FILE: script.js
// ----------------------------------------------------
// 1) Global Components (Header, Footer, Cal.com)
// 2) Product Logic (Filter, Sort, Gallery)
// 3) UI Effects (Hero Scroll, Mobile Header, Sticky Bar)
// ----------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  // 1. Load Header & Footer
  initDynamicIncludes();

  // 2. Các chức năng cho trang Product (chỉ chạy nếu có filter-bar)
  if (document.querySelector('.filter-bar')) { 
    initProductFilters();
    // Chờ 0.5s để đảm bảo layout mobile render xong mới tính toán mũi tên
    initFilterScrollArrows();
  }

  // 3. Các chức năng khác
  initWorkshopGallery();  
  initOurPeopleHome(); 
  initReviewWallLightbox(); 
  initDetailedReviewLightbox();
  initScrollToTop(); 
  initStickyFeatures(); // Premium UX: Sticky Bar & Accordion
  
});


// =========================================
// 1. DYNAMIC INCLUDES & HEADER LOGIC
// =========================================
function initDynamicIncludes() {
  // ----- HEADER -----
  const headerContainer = document.getElementById('header-placeholder');
  if (headerContainer) {
    // 1. Lấy đường dẫn gốc (nếu có), nếu không thì để rỗng
    const basePath = headerContainer.getAttribute('data-base-path') || '';
    
    const pageHeaderType = document.body.dataset.header || 'subpage';
    // 2. Xác định tên file header
    const headerFileName = pageHeaderType === 'hero' ? 'components/header-hero.html' : 'components/header-subpage.html';
    
    // 3. Nối đường dẫn gốc vào trước tên file
    const fullHeaderPath = basePath + headerFileName;

    fetch(fullHeaderPath)
      .then(res => res.text())
      .then(html => {
        headerContainer.innerHTML = html;
        setActiveNavLink();
        initMobileHeaderAutoHide();
        initHeroHeaderScroll();
        initCal(); 
        
        // Cập nhật lại đường dẫn logo và link trong header sau khi load xong
        // (Bước này quan trọng để logo trong header hiển thị đúng khi ở trang con)
        if(basePath) {
            updateHeaderLinksForSubpage(headerContainer, basePath);
        }
      })
      .catch(err => console.error('Lỗi load header:', err));
  }

  // ----- FOOTER -----
  const footerContainer = document.getElementById('footer-placeholder');
  if (footerContainer) {
    // 1. Lấy đường dẫn gốc
    const basePath = footerContainer.getAttribute('data-base-path') || '';
    
    // 2. Nối vào đường dẫn footer
    const fullFooterPath = basePath + 'components/footer.html';

    fetch(fullFooterPath)
      .then(res => res.text())
      .then(html => {
        footerContainer.innerHTML = html;
        initCal();
        
        // Cập nhật link trong footer nếu cần
        if(basePath) {
            updateFooterLinksForSubpage(footerContainer, basePath);
        }
      })
      .catch(err => console.error('Lỗi load footer:', err));
  }
}

// Hàm phụ trợ: Tự động sửa đường dẫn hình ảnh/link trong Header/Footer khi ở trang con
function updateHeaderLinksForSubpage(container, basePath) {
    // Sửa đường dẫn ảnh (ví dụ Logo)
    const images = container.querySelectorAll('img');
    images.forEach(img => {
        const src = img.getAttribute('src');
        if (src && !src.startsWith('http') && !src.startsWith('../')) {
            img.setAttribute('src', basePath + src);
        }
    });

    // Sửa đường dẫn link (Menu)
    const links = container.querySelectorAll('a');
    links.forEach(link => {
        const href = link.getAttribute('href');
        // Chỉ sửa link nội bộ, không sửa link web khác hoặc tel/mailto
        if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:')) { 
             // Nếu link là index.html -> ../index.html
             // Nếu link là contact.html -> ../contact.html
             link.setAttribute('href', basePath + href);
        }
    });
}

// Hàm phụ trợ cho Footer (tương tự Header)
function updateFooterLinksForSubpage(container, basePath) {
    updateHeaderLinksForSubpage(container, basePath); // Dùng chung logic
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

function setActiveNavLink() {
  const path = window.location.pathname.toLowerCase();
  const links = document.querySelectorAll('.navbar-nav .nav-link[href]');
  links.forEach(link => {
    const href = link.getAttribute('href').toLowerCase();
    link.classList.remove('active');
    if (href === 'index.html' && (path.endsWith('/') || path.endsWith('index.html'))) link.classList.add('active');
    else if (href !== 'index.html' && path.endsWith(href)) link.classList.add('active');
  });
}

// =========================================
// 3. UI EFFECTS (Scroll, Hide Header)
// =========================================
function initHeroHeaderScroll() {
  const heroHeader = document.querySelector('.hero-header');
  if (!heroHeader) return;
  const THRESHOLD = 60;
  window.addEventListener('scroll', () => {
    heroHeader.classList.toggle('scrolled', window.scrollY > THRESHOLD);
  });
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

function initScrollToTop() {
  const btn = document.getElementById('scrollToTop');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 120);
  });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// =========================================
// 4. PRODUCT FILTER & SORT LOGIC
// =========================================
function initProductFilters() {
  const productContainer = document.querySelector('.main-content .row');
  if (!productContainer) return;

  const items = Array.from(productContainer.querySelectorAll('.product-item'));
  items.forEach((item, index) => item.dataset.originalIndex = index);

  const locationChips = document.querySelectorAll('.filter-chip.filter-location');
  const typeChips = document.querySelectorAll('.filter-chip.filter-type');
  const mobileLocationSelect = document.getElementById('mobileLocationSelect');
  const mobileTypeSelect = document.getElementById('mobileTypeSelect');
  const sortSelect = document.getElementById('sortSelect');
  const locationTitle = document.querySelector('.location-header h1');
  const originalTitle = locationTitle ? locationTitle.textContent : 'Vietnam';

  let currentState = { location: '', type: '', sortBy: 'recommended' };

  function updateDisplay() {
    items.forEach(item => item.style.display = '');

    const sortedItems = items.sort((a, b) => {
      const scoreA = calculateScore(a);
      const scoreB = calculateScore(b);
      if (scoreA !== scoreB) return scoreB - scoreA;

      const priceA = parsePrice(a);
      const priceB = parsePrice(b);
      const ratingA = parseRating(a);
      const ratingB = parseRating(b);

      switch (currentState.sortBy) {
        case 'price-asc': return priceA - priceB;
        case 'price-desc': return priceB - priceA;
        case 'rating': return ratingB - ratingA;
        default: return parseInt(a.dataset.originalIndex) - parseInt(b.dataset.originalIndex);
      }
    });

    sortedItems.forEach(item => productContainer.appendChild(item));
    updateUI();
  }

  function calculateScore(item) {
    let score = 0;
    const itemLoc = (item.dataset.location || '').toLowerCase();
    const itemType = (item.dataset.type || '').toLowerCase();
    if (currentState.location && itemLoc === currentState.location) score += 10;
    if (currentState.type && itemType === currentState.type) score += 10;
    return score;
  }

  function parsePrice(item) {
    const el = item.querySelector('.price-block .amount');
    if (!el) return 0;
    let t = el.textContent.toLowerCase().replace(/[^0-9k.]/g, '');
    if (t.includes('k')) return parseFloat(t) * 1000;
    return parseFloat(t) || 0;
  }

  function parseRating(item) {
    const el = item.querySelector('.rating');
    return el ? (parseFloat(el.textContent) || 0) : 0;
  }

  function updateUI() {
    if (locationTitle) {
      if (currentState.location === 'hanoi') locationTitle.textContent = 'Hanoi';
      else if (currentState.location === 'ninh-binh') locationTitle.textContent = 'Ninh Binh';
      else if (currentState.location === 'sapa') locationTitle.textContent = 'Sapa';
      else locationTitle.textContent = originalTitle;
    }
    const setAct = (list, val, key) => list.forEach(b => b.classList.toggle('active', b.dataset[key] === val));
    setAct(locationChips, currentState.location, 'location');
    setAct(typeChips, currentState.type, 'type');

    if (mobileLocationSelect) mobileLocationSelect.value = currentState.location;
    if (mobileTypeSelect) mobileTypeSelect.value = currentState.type;
  }

  // Events: Chips
  const bindChip = (list, key) => list.forEach(b => b.addEventListener('click', (e) => {
    e.preventDefault();
    const v = b.dataset[key] || '';
    currentState[key] = (currentState[key] === v) ? '' : v;
    updateDisplay();
  }));
  bindChip(locationChips, 'location');
  bindChip(typeChips, 'type');

  // Events: Mobile Select
  if (mobileLocationSelect) mobileLocationSelect.addEventListener('change', e => { currentState.location = e.target.value; updateDisplay(); });
  if (mobileTypeSelect) mobileTypeSelect.addEventListener('change', e => { currentState.type = e.target.value; updateDisplay(); });
  if (sortSelect) sortSelect.addEventListener('change', e => { currentState.sortBy = e.target.value; updateDisplay(); });

  updateDisplay();
}

// ===================================================
// 5. FILTER SCROLL ARROWS (UPDATED & ROBUST)
// ===================================================
function initFilterScrollArrows() {
  const scroller = document.querySelector('.filter-scroll-container');
  const leftBtn = document.querySelector('.filter-arrow-left');
  const rightBtn = document.querySelector('.filter-arrow-right');

  // Kiểm tra element tồn tại
  if (!scroller || !leftBtn || !rightBtn) return;

  function updateArrows() {
    const scrollLeft = Math.ceil(scroller.scrollLeft);
    const scrollWidth = Math.ceil(scroller.scrollWidth);
    const clientWidth = Math.ceil(scroller.clientWidth);
    const maxScroll = scrollWidth - clientWidth;

    // Nếu không đủ dài để cuộn -> ẩn cả 2
    if (maxScroll <= 2) { 
      leftBtn.classList.add('hidden');
      rightBtn.classList.add('hidden');
      return;
    }

    // Ẩn/Hiện trái
    leftBtn.classList.toggle('hidden', scrollLeft <= 5);
    // Ẩn/Hiện phải
    rightBtn.classList.toggle('hidden', scrollLeft >= maxScroll - 5);
  }

  function scrollByStep(direction) {
    const step = 200; // Khoảng cách cuộn cố định để đảm bảo hoạt động
    const current = scroller.scrollLeft;
    scroller.scrollTo({
      left: current + (direction * step),
      behavior: 'smooth'
    });
  }

  // Click arrow
  leftBtn.addEventListener('click', (e) => { e.preventDefault(); scrollByStep(-1); });
  rightBtn.addEventListener('click', (e) => { e.preventDefault(); scrollByStep(1); });

  // Update logic
  scroller.addEventListener('scroll', () => window.requestAnimationFrame(updateArrows));
  window.addEventListener('resize', () => { setTimeout(updateArrows, 100); });
  
  // Chạy lần đầu
  updateArrows();
}

// ===================================================
// 6. GALLERY & REVIEW LIGHTBOX
// ===================================================
function initWorkshopGallery() {
  const galleryContainer = document.getElementById('auto-gallery');
  const lightbox = document.getElementById('lightbox');
  const dotsContainer = document.getElementById('gallery-dots');
  if (!galleryContainer || !lightbox) return;

  const jsonPath = galleryContainer.dataset.galleryJson;
  if (!jsonPath) return;

  fetch(jsonPath).then(res => res.json()).then(data => {
      const imageList = data.images || [];
      if (!imageList.length) return;

      let currentIndex = 0;
      let mainImageDesktop = null;
      let track = null;

      const galleryLeft  = document.createElement('div'); galleryLeft.className  = 'gallery-left';
      const galleryRight = document.createElement('div'); galleryRight.className = 'gallery-right';
      galleryContainer.append(galleryLeft, galleryRight);

      track = document.createElement('div'); track.className = 'gallery-track';
      galleryContainer.appendChild(track);

      const createArrow = (cls, icon, label) => {
        const btn = document.createElement('button'); btn.className = `gallery-arrow ${cls}`;
        btn.innerHTML = `<i class="fa-solid ${icon}"></i>`; btn.setAttribute('aria-label', label);
        return btn;
      };
      const arrowLeft = createArrow('gallery-arrow-left', 'fa-chevron-left', 'Previous');
      const arrowRight = createArrow('gallery-arrow-right', 'fa-chevron-right', 'Next');
      galleryContainer.append(arrowLeft, arrowRight);

      imageList.forEach((src, index) => {
        const img = document.createElement('img'); img.src = src; img.className = 'gallery-img'; img.dataset.index = index;
        if (index === 0) { galleryLeft.appendChild(img); mainImageDesktop = img; }
        else if (index === 1 || index === 2) galleryRight.appendChild(img);
        
        const slide = document.createElement('div'); slide.className = 'gallery-slide';
        const imgM = img.cloneNode(true); slide.appendChild(imgM);
        track.appendChild(slide);
      });

      if (dotsContainer) {
        dotsContainer.innerHTML = '';
        imageList.forEach((_, index) => {
          const dot = document.createElement('button'); dot.className = 'gallery-dot' + (index===0?' active':'');
          dot.addEventListener('click', () => { currentIndex = index; updateUI(false); if(track) track.scrollTo({left: track.clientWidth*index, behavior:'smooth'}); });
          dotsContainer.appendChild(dot);
        });
      }

      const lightboxImg = lightbox.querySelector('.lightbox-img');
      const counter = lightbox.querySelector('.counter');
      
      function updateUI(updateLb = true) {
        if (updateLb && lightboxImg) lightboxImg.src = imageList[currentIndex];
        if (mainImageDesktop) mainImageDesktop.src = imageList[currentIndex];
        if (counter) counter.textContent = `${currentIndex + 1} / ${imageList.length}`;
        if (dotsContainer) dotsContainer.querySelectorAll('.gallery-dot').forEach((d, i) => d.classList.toggle('active', i === currentIndex));
      }

      galleryContainer.addEventListener('click', e => {
        const img = e.target.closest('.gallery-img');
        if (img) { currentIndex = parseInt(img.dataset.index); updateUI(true); lightbox.style.display = 'block'; }
      });

      lightbox.querySelector('.close').addEventListener('click', () => lightbox.style.display = 'none');
      lightbox.querySelector('.prev').addEventListener('click', () => { currentIndex = (currentIndex - 1 + imageList.length) % imageList.length; updateUI(true); });
      lightbox.querySelector('.next').addEventListener('click', () => { currentIndex = (currentIndex + 1) % imageList.length; updateUI(true); });

      // Swipe Lightbox
      let ts = 0;
      lightbox.addEventListener('touchstart', e => ts = e.changedTouches[0].screenX, {passive:true});
      lightbox.addEventListener('touchend', e => {
        const diff = ts - e.changedTouches[0].screenX;
        if (diff > 50) lightbox.querySelector('.next').click();
        else if (diff < -50) lightbox.querySelector('.prev').click();
      }, {passive:true});

      // Track Arrows Logic (Mobile)
      const updateGalArrows = () => {
        if (!track) return;
        const sl = track.scrollLeft;
        const max = track.scrollWidth - track.clientWidth;
        arrowLeft.classList.toggle('show', sl > 2);
        arrowRight.classList.toggle('show',sl < max - 2 || sl > 2);
      };
      arrowLeft.addEventListener('click', (e) => { e.stopPropagation(); track.scrollBy({left: -track.clientWidth, behavior:'smooth'}); });
      arrowRight.addEventListener('click', (e) => {
      e.stopPropagation();
      const maxScroll = track.scrollWidth - track.clientWidth;
      if (track.scrollLeft >= maxScroll - 10) {
        // Nếu đang ở cuối, lướt về đầu
        track.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        track.scrollBy({ left: track.clientWidth, behavior: 'smooth' });
      }
    });
      track.addEventListener('scroll', () => {
        requestAnimationFrame(() => {
          currentIndex = Math.round(track.scrollLeft / track.clientWidth);
          updateUI(false); updateGalArrows();
        });
      });
      setTimeout(updateGalArrows, 500);
  }).catch(e => console.error(e));
}

// ===================================================
// 5. OUR PEOPLE HOME INTERACTION
// ===================================================
function initOurPeopleHome() {
  const root = document.querySelector('.our-people__list');
  if (!root) return;

  const groups = Array.from(document.querySelectorAll('.our-people__group'));
  const images = Array.from(document.querySelectorAll('.our-people__img'));

  // Các phần tử hiển thị trên Desktop (Panel bên phải/dưới)
  const desktopName = document.getElementById('ourPeopleName');
  const desktopRole = document.getElementById('ourPeopleRole');
  const desktopBio = document.getElementById('ourPeopleBio');
  const desktopPanel = document.getElementById('our-people');

  // Hàm cập nhật nội dung cho Desktop
  const updateDesktopPanel = (group) => {
    const meta = group.querySelector('.bio-meta')?.textContent;
    const name = group.querySelector('.bio-name')?.textContent;
    const desc = group.querySelector('.bio-desc')?.textContent;

    if (desktopRole) desktopRole.textContent = meta || '';
    if (desktopName) desktopName.textContent = name || '';
    if (desktopBio) desktopBio.textContent = desc || '';
    if (desktopPanel) desktopPanel.classList.add('is-bio-open');
  };

  // Hàm xử lý khi click
  const handleGroupClick = (clickedGroup) => {
    const personId = clickedGroup.dataset.person;
    
    // 1. Kiểm tra xem mục vừa bấm có đang mở không?
    const isAlreadyActive = clickedGroup.classList.contains('is-active');

    // 2. Đóng TẤT CẢ các mục lại (Reset về trạng thái đóng)
    groups.forEach(g => g.classList.remove('is-active'));
    
    // Lưu ý: Trên Desktop, ta có thể giữ nguyên ảnh của người cũ 
    // để tránh bị "nháy" đen màn hình, nên không remove class is-active của ảnh ngay lập tức ở đây.

    // 3. LOGIC MỚI: Chỉ mở lại nếu trước đó nó CHƯA mở
    // (Nếu nó đang mở mà bấm lại -> bước 2 đã đóng nó rồi -> bước này bỏ qua -> kết quả là đóng hẳn)
    if (!isAlreadyActive) {
      clickedGroup.classList.add('is-active');

      // Update ảnh (Desktop)
      images.forEach(img => img.classList.remove('is-active'));
      const targetImg = images.find(img => img.dataset.person === personId);
      if (targetImg) targetImg.classList.add('is-active');

      // Update thông tin (Desktop)
      updateDesktopPanel(clickedGroup);
    } 
    // Nếu isAlreadyActive == true, thì code sẽ dừng ở bước 2 (đã đóng), 
    // tạo hiệu ứng "Thu gọn".
  };

  // Gắn sự kiện click
  groups.forEach(group => {
    const btn = group.querySelector('.our-people__item');
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        handleGroupClick(group);
      });
    }
  });

  // Mặc định khi vào trang:
  // Nếu bạn muốn người đầu tiên luôn mở sẵn thì giữ dòng này.
  // Nếu muốn vào trang là đóng hết thì XÓA dòng này đi.
  if (groups.length > 0) {
     // handleGroupClick(groups[0]); // <-- Bỏ comment nếu muốn mở sẵn người số 1
     
     // Tuy nhiên, để đồng bộ hiển thị Desktop (cần có ảnh nền ban đầu),
     // ta chỉ kích hoạt hiển thị dữ liệu người số 1 nhưng không thêm class 'is-active' để nó xổ xuống trên mobile
     const firstGroup = groups[0];
     updateDesktopPanel(firstGroup);
     const firstImg = images.find(img => img.dataset.person === firstGroup.dataset.person);
     if (firstImg) firstImg.classList.add('is-active');
     
     // Trên Mobile, nếu muốn nó đóng sẵn thì không làm gì thêm.
     // Nếu muốn Mobile cũng mở sẵn người đầu tiên thì uncomment dòng dưới:
     // firstGroup.classList.add('is-active');
  }
}

// ===================================================
// 6. REVIEW WALL LIGHTBOX
// ===================================================
function initReviewWallLightbox() {
  const lb = document.getElementById('reviewLightbox');
  if (!lb) return;
  document.querySelector('.review-wall')?.addEventListener('click', e => {
    const btn = e.target.closest('.review-shot');
    if (!btn) return;
    const img = btn.querySelector('img');
    lb.querySelector('.review-lightbox__img').src = btn.dataset.reviewSrc || img.src;
    lb.classList.add('is-open');
  });
  lb.querySelectorAll('[data-review-close]').forEach(el => el.addEventListener('click', () => lb.classList.remove('is-open')));
}

// ===================================================
// 7. PREMIUM UX: Sticky Bar & Accordion
// ===================================================
function initStickyFeatures() {
  const stickyBar = document.getElementById('stickyBar');
  const heroSection = document.querySelector('.about-this-activity'); 
  const scrollTopBtn = document.getElementById('scrollToTop');

  if (stickyBar && heroSection) {
    window.addEventListener('scroll', () => {
      const pastHero = heroSection.getBoundingClientRect().bottom < 0;
      stickyBar.classList.toggle('visible', pastHero);
      if(scrollTopBtn) scrollTopBtn.classList.toggle('lifted', pastHero);
    });
  }

  document.querySelectorAll('.timeline-header').forEach(header => {
    header.addEventListener('click', function() {
      this.parentElement.classList.toggle('active');
    });
  });
}


// ===================================================
// 8. DETAILED REVIEW LIGHTBOX (Simple & Fast)
// ===================================================
function initDetailedReviewLightbox() {
  const lb = document.getElementById('simpleReviewLightbox');
  if (!lb) return;
  
  const lbImg = lb.querySelector('.custom-lightbox-img');
  const closeBtn = lb.querySelector('.close-lb');
  
  // 1. Mở Lightbox
  document.querySelectorAll('.review-lightbox-trigger').forEach(trigger => {
    trigger.addEventListener('click', function() {
      const src = this.getAttribute('data-src');
      if (src) {
        lbImg.src = src;
        lb.classList.add('active');
      }
    });
  });

  // 2. Đóng Lightbox (khi bấm X hoặc bấm ra ngoài ảnh)
  const closeLightbox = () => {
    lb.classList.remove('active');
    setTimeout(() => { lbImg.src = ''; }, 200); // Xóa src để lần sau load mới
  };

  closeBtn.addEventListener('click', closeLightbox);
  
  lb.addEventListener('click', (e) => {
    if (e.target === lb) closeLightbox();
  });

  // Đóng bằng phím ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lb.classList.contains('active')) {
      closeLightbox();
    }
  });
}