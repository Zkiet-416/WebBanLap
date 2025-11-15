// main.js - Web Laptop & Phụ kiện
// Giữ nguyên slider, UI interactions

/* ===========================
   SIMPLE SLIDER (PREV/NEXT/AUTOPLAY)
   =========================== */
(function(){
  const slidesWrap = document.getElementById('slides');
  const slides = document.querySelectorAll('.slide');
  const total = slides.length;
  let idx = 0;
  const nextBtn = document.getElementById('nextBtn');
  const prevBtn = document.getElementById('prevBtn');

  function show(i){
    if(i < 0) i = total - 1;
    if(i >= total) i = 0;
    idx = i;
    slidesWrap.style.transform = `translateX(-${idx * 100}%)`;
  }

  nextBtn.addEventListener('click', ()=> show(idx + 1));
  prevBtn.addEventListener('click', ()=> show(idx - 1));
  let auto = setInterval(()=> show(idx + 1), 4000);

  const slider = document.getElementById('slider');
  slider.addEventListener('mouseenter', ()=> clearInterval(auto));
  slider.addEventListener('mouseleave', ()=> auto = setInterval(()=> show(idx + 1), 4000));
})();

/* ===========================
   TABS NHỎ UI
   =========================== */
document.querySelectorAll('.tabs').forEach(tabWrap=>{
  const buttons = tabWrap.querySelectorAll('button');
  buttons.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      buttons.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
});

/* ===========================
   ESC ĐỂ ẨN DROPDOWN
   =========================== */
document.addEventListener('keydown', (e)=>{
  if(e.key === 'Escape'){
    document.querySelectorAll('.dropdown').forEach(d=>{
      d.style.opacity = 0;
      d.style.visibility = 'hidden';
    });
  }
});

/* ===========================
   HÀM RESET VỀ TRANG CHỦ
   =========================== */
window.resetToHomePage = function() {
    // Gọi trực tiếp hàm từ products.js
    if (window.resetToHomePageFromProducts) {
        window.resetToHomePageFromProducts();
    }
};

// ========== CART TOGGLE ==========
document.addEventListener('DOMContentLoaded', function() {
    const cartToggle = document.querySelector('.cart-toggle-btn');
    const cartDropdown = document.querySelector('.cart-dropdown');
    
    if (cartToggle && cartDropdown) {
        cartToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            cartDropdown.classList.toggle('active');
        });
        
        // Đóng dropdown khi click ra ngoài
        document.addEventListener('click', function() {
            cartDropdown.classList.remove('active');
        });
        
        // Ngăn đóng khi click trong dropdown
        cartDropdown.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
});
