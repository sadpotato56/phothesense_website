// FILE: script.js
// ----------------------------------------------------
// 1) Global Components (Header, Footer, Cal.com)
// 2) Product Logic (Filter, Sort, Gallery)
// 3) UI Effects (Hero Scroll, Mobile Header, Sticky Bar)
// ----------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  // --- PHẦN 1: LOGIC HEADER (Chạy ngay lập tức) ---
   initHeroHeaderScroll();      // 3. Đổi màu header khi cuộn (Transparent -> Solid)
  setActiveNavLink();          // 1. Tô đậm link menu hiện tại
    // 2. Tự động ẩn header khi cuộn xuống (Mobile)

  // --- PHẦN 2: CÁC CHỨC NĂNG KHÁC (Giữ nguyên) ---
  
  initOurPeopleHome(); 
  initReviewWallLightbox(); 

  
});


// =========================================
// 1. HEADER UI LOGIC (Active, Scroll, Hide)
// =========================================

/**
 * 1. Set Active Nav Link
 * Tự động thêm class 'active' vào link menu tương ứng với trang đang xem
 */




// Global click delegation for Cal.com
document.addEventListener("click", (e) => {
  const el = e.target.closest('[data-cal-link][data-cal-namespace]');
  if (!el) return;
  if (el.tagName === "A") e.preventDefault();
  if (typeof window.Cal === "function") Cal("preload", { calLink: el.dataset.calLink });
});

// =========================================
// 1. HEADER UI LOGIC (Active, Scroll, Hide)
// =========================================

function setActiveNavLink() {
  const path = window.location.pathname.toLowerCase();
  const links = document.querySelectorAll('.navbar-nav .nav-link[href]');
  links.forEach(link => {
    const href = link.getAttribute('href').toLowerCase();
    link.classList.remove('active');
    if (href === 'index.astro' && (path.endsWith('/') || path.endsWith('index.astro'))) link.classList.add('active');
    else if (href !== 'index.astro' && path.endsWith(href)) link.classList.add('active');
  });
}

// =========================================
// 3. UI EFFECTS (Scroll, Hide Header)
// =========================================
function initHeroHeaderScroll() {
  const heroHeader = document.querySelector('.hero-header');
  if (!heroHeader) return;
  const THRESHOLD = 60;
  
  const handleScroll = () => {
    heroHeader.classList.toggle('scrolled', window.scrollY > THRESHOLD);
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); 
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


