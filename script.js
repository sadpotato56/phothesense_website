// document.addEventListener('DOMContentLoaded', () => {
//   console.log('Script loaded');
//   const hamburger = document.querySelector('.hamburger');
//   const navLinks = document.querySelector('.nav-links');

//   if (hamburger && navLinks) {
//     hamburger.addEventListener('click', () => {
//       navLinks.classList.toggle('open');
//       hamburger.classList.toggle('open');
//     });
//   } else {
//     console.error('Elements not found. Check if .hamburger and .nav-links exist in HTML.');
//   }
// });


// script.js
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  // Tự động đóng menu khi bấm vào link
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });
});
