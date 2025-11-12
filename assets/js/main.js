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
   TABS NHỎ UI - GIỮ NGUYÊN
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
   DROPDOWN HEADER TAB - GIỮ NGUYÊN
   =========================== */
document.querySelectorAll('.dropdown-header .tab').forEach(tab=>{
  tab.addEventListener('click', ()=>{
    document.querySelectorAll('.dropdown-header .tab').forEach(t=> t.classList.remove('active'));
    tab.classList.add('active');
  });
});

/* ===========================
   ESC ĐỂ ẨN DROPDOWN - GIỮ NGUYÊN
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
   HÀM RESET VỀ TRANG CHỦ - GIỮ NGUYÊN
   =========================== */
window.resetToHomePage = function() {
    const cartDetail = document.getElementById('cartDetail');
    const productDetail = document.getElementById('productDetail');
    
    if (cartDetail) cartDetail.style.display = 'none';
    if (productDetail) productDetail.style.display = 'none';
    
    const suggestions = document.getElementById('suggestions');
    const accessories = document.getElementById('accessories');
    const slider = document.querySelector('.slider');
    
    if (suggestions) suggestions.style.display = 'block';
    if (accessories) accessories.style.display = 'block';
    if (slider) slider.style.display = 'block';
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

    // ========== HÀM HIỂN THỊ TRANG LỊCH SỬ ==========
  window.showHistoryPage = function() {
    console.log('📜 Hiển thị trang lịch sử');
    
    // Ẩn tất cả section khác
    const sectionsToHide = [
        'suggestions', 'accessories', 'productDetail', 'cartDetail'
    ];
    
    sectionsToHide.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.style.display = 'none';
    });
    
    const slider = document.querySelector('.slider');
    if (slider) slider.style.display = 'none';
    
    // Hiển thị trang lịch sử
    const historyPage = document.getElementById('historyPage');
    if (historyPage) {
        historyPage.style.display = 'block';
        
        // Load lịch sử đơn hàng
        if (typeof loadOrderHistory === 'function') {
            loadOrderHistory();
        }
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
});
