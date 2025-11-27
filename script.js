// FILE: script.js

// ✅ Hamburger menu + mobile nav
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('open');
      document.body.classList.toggle('nav-open');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
        document.body.classList.remove('nav-open');
      });
    });
  }

  // ✅ Chỉ chạy filter logic nếu đang ở trang Product (có .product-grid)
  const productGrid = document.querySelector('.product-grid');
  if (productGrid) {
    initProductFilters();
  }
});

// ✅ Header scroll effect
$(function() {
  $(window).on("scroll", function() {
    if ($(window).scrollTop() > 50) {
      $(".header").addClass("active");
    } else {
      $(".header").removeClass("active");
    }
  });
});

// =======================
//  Filter + Sort logic
// =======================
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

  // Lưu trạng thái ban đầu (thứ tự gốc + data)
  const originalCards = cards.map((el, index) => ({
    el,
    originalIndex: index,
    location: (el.dataset.location || '').toLowerCase(),
    type: (el.dataset.type || '').toLowerCase()
  }));

  const urlParams = new URLSearchParams(window.location.search);
  let currentLocation = (urlParams.get('location') || '').toLowerCase();
  let currentType = (urlParams.get('type') || '').toLowerCase();

  // Nếu query có giá trị nhưng không nằm trong list, coi như không filter
  if (!LOCATION_LABELS[currentLocation] && currentLocation !== '') {
    currentLocation = '';
  }

  // Lắng nghe click trên chip Location
  locationChips.forEach(chip => {
    chip.addEventListener('click', () => {
      currentLocation = (chip.dataset.location || '').toLowerCase();
      applyFilterSort();
    });
  });

  // Lắng nghe click trên chip Type
  typeChips.forEach(chip => {
    chip.addEventListener('click', () => {
      currentType = (chip.dataset.type || '').toLowerCase();
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
      if (scoreA !== scoreB) {
        return scoreB - scoreA;
      }
      // Nếu score bằng nhau, giữ theo thứ tự gốc
      return a.originalIndex - b.originalIndex;
    });

    // Re-append theo thứ tự mới (không ẩn card nào)
    sorted.forEach(item => {
      grid.appendChild(item.el);
      item.el.style.display = ''; // đảm bảo luôn hiển thị
    });

    // Cập nhật title nếu filter theo location
    if (locationTitle) {
      if (currentLocation && LOCATION_LABELS[currentLocation]) {
        locationTitle.textContent = LOCATION_LABELS[currentLocation];
      } else {
        locationTitle.textContent = defaultLocationTitle;
      }
    }

    // Set active cho chip Location
    locationChips.forEach(chip => {
      const loc = (chip.dataset.location || '').toLowerCase();
      chip.classList.toggle('active', loc === (currentLocation || ''));
    });

    // Set active cho chip Type
    typeChips.forEach(chip => {
      const typ = (chip.dataset.type || '').toLowerCase();
      chip.classList.toggle('active', typ === (currentType || ''));
    });
  }

  // score: 0 = không match, 1 = match 1 điều kiện, 2 = match cả location + type
  function getMatchScore(item, loc, typ, hasFilter) {
    if (!hasFilter) return 1; // không filter thì tất cả score = 1 (giữ nguyên thứ tự)
    let score = 0;
    if (loc && item.location === loc) score += 1;
    if (typ && item.type === typ) score += 1;
    return score;
  }
}
