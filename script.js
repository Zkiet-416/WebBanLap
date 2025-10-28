    /* Simple slider (prev/next/autoplay) */
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

    /* Tabs nhỏ UI */
    document.querySelectorAll('.tabs').forEach(tabWrap=>{
      const buttons = tabWrap.querySelectorAll('button');
      buttons.forEach(btn=>{
        btn.addEventListener('click', ()=>{
          buttons.forEach(b=>b.classList.remove('active'));
          btn.classList.add('active');
        });
      });
    });

    /* Dropdown header tab: chỉ tương tác visual -> đổi active màu (không thay nội dung body) */
    document.querySelectorAll('.dropdown-header .tab').forEach(tab=>{
      tab.addEventListener('click', ()=>{
        document.querySelectorAll('.dropdown-header .tab').forEach(t=> t.classList.remove('active'));
        tab.classList.add('active');
      });
    });

    /* ESC để ẩn dropdown (tùy chọn) */
    document.addEventListener('keydown', (e)=>{
      if(e.key === 'Escape'){
        document.querySelectorAll('.dropdown').forEach(d=>{
          d.style.opacity = 0;
          d.style.visibility = 'hidden';
        });
      }
    });
    /* ===========================
   PHÂN TRANG SẢN PHẨM & PHỤ KIỆN
   =========================== */
document.addEventListener("DOMContentLoaded", function() {
  // ====== GỢI Ý CHO BẠN (15 / trang, 45 tổng) ======
  const suggestCards = document.querySelectorAll("#suggestGrid .card");
  const suggestPager = document.querySelector("#suggestions .pager");
  const suggestPerPage = 15;

  function showSuggestPage(page) {
    suggestCards.forEach((card, i) => {
      card.style.display =
        i >= (page - 1) * suggestPerPage && i < page * suggestPerPage
          ? "flex"
          : "none";
    });
  }

  if (suggestPager) {
    suggestPager.querySelectorAll("button").forEach((btn, i) => {
      btn.addEventListener("click", () => {
        suggestPager.querySelectorAll("button").forEach(b=>b.classList.remove("active"));
        btn.classList.add("active");
        showSuggestPage(i + 1);
      });
    });
    showSuggestPage(1);
    suggestPager.querySelector("button").classList.add("active");
  }

  // ====== PHỤ KIỆN (10 / trang, 30 tổng) ======
  const accCards = document.querySelectorAll("#accessGrid .card");
  const accPager = document.querySelector("#accessories .pager");
  const accPerPage = 10;

  function showAccessoryPage(page) {
    accCards.forEach((card, i) => {
      card.style.display =
        i >= (page - 1) * accPerPage && i < page * accPerPage
          ? "flex"
          : "none";
    });
  }

  if (accPager) {
    accPager.querySelectorAll("button").forEach((btn, i) => {
      btn.addEventListener("click", () => {
        accPager.querySelectorAll("button").forEach(b=>b.classList.remove("active"));
        btn.classList.add("active");
        showAccessoryPage(i + 1);
      });
    });
    showAccessoryPage(1);
    accPager.querySelector("button").classList.add("active");
  }
});

/* ===========================
   GIỮ HEADER KHI CUỘN XUỐNG
   =========================== */
window.addEventListener("scroll", () => {
  const header = document.querySelector(".header-top");
  if (window.scrollY > 0) {
    header.style.position = "fixed";
    header.style.top = "0";
    header.style.left = "0";
    header.style.width = "100%";
    header.style.zIndex = "999";
    header.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
  } else {
    header.style.position = "relative";
    header.style.boxShadow = "none";
  }
});

/* ===========================
   CLICK "TRANG CHỦ" → LÊN ĐẦU TRANG
   =========================== */
document.querySelectorAll(".menu-list li").forEach(li => {
  if (li.textContent.trim() === "Trang chủ") {
    li.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
});
