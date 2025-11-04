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
   DROPDOWN HEADER TAB: CHỈ TƯƠNG TÁC VISUAL
   =========================== */
document.querySelectorAll('.dropdown-header .tab').forEach(tab=>{
  tab.addEventListener('click', ()=>{
    document.querySelectorAll('.dropdown-header .tab').forEach(t=> t.classList.remove('active'));
    tab.classList.add('active');
  });
});

/* ===========================
   ESC ĐỂ ẨN DROPDOWN (TÙY CHỌN)
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
    // ẨN tất cả các trang detail
    const cartDetail = document.getElementById('cartDetail');
    const productDetail = document.getElementById('productDetail');
    
    if (cartDetail) cartDetail.style.display = 'none';
    if (productDetail) productDetail.style.display = 'none';
    
    // HIỂN THỊ trang chủ
    const suggestions = document.getElementById('suggestions');
    const accessories = document.getElementById('accessories');
    const slider = document.querySelector('.slider');
    
    if (suggestions) {
        suggestions.style.display = 'block';
        // Đảm bảo hiển thị đúng layout
        suggestions.style.opacity = '1';
        suggestions.style.visibility = 'visible';
    }
    if (accessories) {
        accessories.style.display = 'block';
        accessories.style.opacity = '1';
        accessories.style.visibility = 'visible';
    }
    if (slider) {
        slider.style.display = 'block';
        slider.style.opacity = '1';
        slider.style.visibility = 'visible';
    }
    
    // Cuộn lên đầu
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Reset filter sau một chút delay
    setTimeout(() => {
        if (typeof filterSuggest === 'function' && window.suggestTabs && window.suggestTabs.length > 0) {
            window.suggestTabs.forEach((b) => b.classList.remove("active"));
            window.suggestTabs[0].classList.add("active");
            filterSuggest("all");
        }
        
        if (typeof filterAccessory === 'function' && window.accessTabs && window.accessTabs.length > 0) {
            window.accessTabs.forEach((b) => b.classList.remove("active"));
            window.accessTabs[0].classList.add("active");
            filterAccessory("all");
        }
    }, 100);
};

/* ===========================
   PHÂN TRANG SẢN PHẨM & PHỤ KIỆN
   =========================== */
document.addEventListener("DOMContentLoaded", function() {
  // Khai báo biến toàn cục
  window.suggestTabs = document.querySelectorAll("#suggestions .tabs button");
  window.accessTabs = document.querySelectorAll("#accessories .tabs button");

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

  // ====== CLICK "TRANG CHỦ" → GỌI HÀM RESET ======
  document.querySelectorAll(".menu-list li").forEach((li) => {
    if (li.textContent.trim() === "Trang chủ") {
      // Xóa sự kiện cũ trước khi thêm mới (tránh duplicate)
      const newLi = li.cloneNode(true);
      li.parentNode.replaceChild(newLi, li);
    }
  });

  // Thêm sự kiện mới sau khi đã clone
  document.querySelectorAll(".menu-list li").forEach((li) => {
    if (li.textContent.trim() === "Trang chủ") {
      li.addEventListener("click", window.resetToHomePage);
    }
  });
});

/* ===========================
   LỌC SẢN PHẨM THEO THƯƠNG HIỆU (LAPTOP & PHỤ KIỆN)
   =========================== */
document.addEventListener("DOMContentLoaded", function () {
  // ======= Lọc laptop theo thương hiệu =======
  const suggestGrid = document.querySelector("#suggestGrid");
  const suggestCards = suggestGrid ? suggestGrid.querySelectorAll(".card") : [];
  const suggestPager = document.querySelector("#suggestions .pager");
  const suggestPerPage = 15;

  function showSuggestPage(page, cardsToShow) {
    // Ẩn tất cả card trước
    suggestCards.forEach(card => card.style.display = "none");
    
    // Hiển thị các card trong trang hiện tại
    cardsToShow.forEach((card, i) => {
      if (i >= (page - 1) * suggestPerPage && i < page * suggestPerPage) {
        card.style.display = "flex";
      }
    });
  }

  function filterSuggest(brand) {
    const matched = [];
    suggestCards.forEach((card) => {
      const cardType = card.getAttribute("data-type");
      if (brand === "all" || cardType === brand) {
        matched.push(card);
      }
    });

    // Nếu ít hơn hoặc bằng 15 sp => ẩn phân trang
    if (matched.length <= suggestPerPage) {
      if (suggestPager) suggestPager.style.display = "none";
      // Hiển thị tất cả sản phẩm phù hợp
      suggestCards.forEach(card => card.style.display = "none");
      matched.forEach(card => card.style.display = "flex");
    } else {
      if (suggestPager) suggestPager.style.display = "flex";
      showSuggestPage(1, matched);
      
      // Cập nhật phân trang
      if (suggestPager) {
        suggestPager.querySelectorAll("button").forEach((btn, i) => {
          // Xóa sự kiện cũ trước khi thêm mới
          btn.replaceWith(btn.cloneNode(true));
        });
        
        suggestPager.querySelectorAll("button").forEach((btn, i) => {
          btn.addEventListener("click", () => {
            suggestPager.querySelectorAll("button").forEach(b=>b.classList.remove("active"));
            btn.classList.add("active");
            showSuggestPage(i + 1, matched);
          });
        });
        
        // Active nút đầu tiên
        if (suggestPager.querySelector("button")) {
          suggestPager.querySelectorAll("button").forEach(b=>b.classList.remove("active"));
          suggestPager.querySelector("button").classList.add("active");
        }
      }
    }
  }

  // Gắn sự kiện cho tabs laptop
  if (window.suggestTabs) {
    window.suggestTabs.forEach((btn) => {
      btn.addEventListener("click", () => {
        window.suggestTabs.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const brand = btn.textContent.trim();
        filterSuggest(brand === "" ? "all" : brand);
      });
    });
  }

  // ======= Lọc phụ kiện theo loại =======
  const accessGrid = document.querySelector("#accessGrid");
  const accessCards = accessGrid ? accessGrid.querySelectorAll(".card") : [];
  const accessPager = document.querySelector("#accessories .pager");
  const accPerPage = 10;

  // Map tên phụ kiện tiếng Việt sang data-type
  const accessoryTypeMap = {
    "balo": "balo",
    "đế tản nhiệt": "de-tan-nhiet", 
    "tai nghe": "tai-nghe",
    "chuột": "chuot",
    "bàn phím": "ban-phim"
  };

  function showAccessoryPage(page, cardsToShow) {
    // Ẩn tất cả card trước
    accessCards.forEach(card => card.style.display = "none");
    
    // Hiển thị các card trong trang hiện tại
    cardsToShow.forEach((card, i) => {
      if (i >= (page - 1) * accPerPage && i < page * accPerPage) {
        card.style.display = "flex";
      }
    });
  }

  function filterAccessory(type) {
    const matched = [];
    const typeKey = accessoryTypeMap[type.toLowerCase()] || type.toLowerCase();
    
    accessCards.forEach((card) => {
      const cardType = card.getAttribute("data-type");
      if (type === "all" || cardType === typeKey) {
        matched.push(card);
      }
    });

    if (matched.length <= accPerPage) {
      if (accessPager) accessPager.style.display = "none";
      // Hiển thị tất cả sản phẩm phù hợp
      accessCards.forEach(card => card.style.display = "none");
      matched.forEach(card => card.style.display = "flex");
    } else {
      if (accessPager) accessPager.style.display = "flex";
      showAccessoryPage(1, matched);
      
      // Cập nhật phân trang
      if (accessPager) {
        accessPager.querySelectorAll("button").forEach((btn, i) => {
          // Xóa sự kiện cũ trước khi thêm mới
          btn.replaceWith(btn.cloneNode(true));
        });
        
        accessPager.querySelectorAll("button").forEach((btn, i) => {
          btn.addEventListener("click", () => {
            accessPager.querySelectorAll("button").forEach(b=>b.classList.remove("active"));
            btn.classList.add("active");
            showAccessoryPage(i + 1, matched);
          });
        });
        
        // Active nút đầu tiên
        if (accessPager.querySelector("button")) {
          accessPager.querySelectorAll("button").forEach(b=>b.classList.remove("active"));
          accessPager.querySelector("button").classList.add("active");
        }
      }
    }
  }

  // Gắn sự kiện cho tabs phụ kiện
  if (window.accessTabs) {
    window.accessTabs.forEach((btn) => {
      btn.addEventListener("click", () => {
        window.accessTabs.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const type = btn.textContent.trim();
        filterAccessory(type === "" ? "all" : type);
      });
    });
  }

  // Sự kiện tùy chỉnh để lọc từ menu dropdown
  document.addEventListener("filterBrand", (e) => {
    filterSuggest(e.detail.brand);
  });
  
  document.addEventListener("filterAccessory", (e) => {
    filterAccessory(e.detail.type);
  });

  // Ban đầu hiển thị tất cả
  filterSuggest("all");
  filterAccessory("all");
});

/* ===========================
   MENU DANH MỤC SẢN PHẨM: NHẢY ĐẾN PHẦN TƯƠNG ỨNG
   =========================== */
document.addEventListener("DOMContentLoaded", function () {
  const suggestSection = document.querySelector("#suggestions");
  const accessoriesSection = document.querySelector("#accessories");

  // Các nút trong dropdown menu
  const laptopItems = document.querySelectorAll(".dropdown .col:first-child ul li"); // Acer→Dell
  const accessoryItems = document.querySelectorAll(".dropdown .col:last-child ul li"); // Balo→Bàn phím

  // Map tên phụ kiện từ menu dropdown sang tabs
  const accessoryMenuMap = {
    "balo": "Balo",
    "đế tản nhiệt": "Đế tản nhiệt",
    "tai nghe": "Tai nghe", 
    "chuột": "Chuột",
    "bàn phím": "Bàn phím"
  };

  // ==== Khi click vào laptop (Acer, Asus, ...) ====
  laptopItems.forEach(item => {
    item.addEventListener("click", () => {
      const brand = item.textContent.trim();
      
      // Tìm và kích hoạt tab tương ứng
      let found = false;
      if (window.suggestTabs) {
        window.suggestTabs.forEach(btn => {
          if (btn.textContent.trim().toLowerCase() === brand.toLowerCase()) {
            btn.classList.add("active");
            found = true;
          } else {
            btn.classList.remove("active");
          }
        });
      }

      // Nếu không tìm thấy tab chính xác, kích hoạt tab đầu tiên
      if (!found && window.suggestTabs && window.suggestTabs.length > 0) {
        window.suggestTabs[0].classList.add("active");
      }

      // Gọi hàm lọc thương hiệu có sẵn
      const event = new CustomEvent("filterBrand", { detail: { brand } });
      document.dispatchEvent(event);

      // Cuộn xuống phần laptop
      if (suggestSection) {
        suggestSection.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // ==== Khi click vào phụ kiện (Chuột, Balo, ...) ====
  accessoryItems.forEach(item => {
    item.addEventListener("click", () => {
      const type = item.textContent.trim();
      const mappedType = accessoryMenuMap[type.toLowerCase()] || type;
      
      // Tìm và kích hoạt tab tương ứng
      let found = false;
      if (window.accessTabs) {
        window.accessTabs.forEach(btn => {
          if (btn.textContent.trim().toLowerCase() === mappedType.toLowerCase()) {
            btn.classList.add("active");
            found = true;
          } else {
            btn.classList.remove("active");
          }
        });
      }

      // Nếu không tìm thấy tab chính xác, kích hoạt tab đầu tiên
      if (!found && window.accessTabs && window.accessTabs.length > 0) {
        window.accessTabs[0].classList.add("active");
      }

      // Gọi hàm lọc phụ kiện có sẵn
      const event = new CustomEvent("filterAccessory", { detail: { type: mappedType } });
      document.dispatchEvent(event);

      // Cuộn xuống phần phụ kiện
      if (accessoriesSection) {
        accessoriesSection.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
});

// ========== CONNECT CARDS -> PRODUCT DETAIL ==========
document.addEventListener('DOMContentLoaded', () => {
  // helper: list of types we treat as "laptop" (có CPU/RAM/HDD/GPU)
  const laptopTypes = ['Acer','Asus','Lenovo','HP','Dell','Laptop','lap'];

  function isLaptop(type) {
    if(!type) return false;
    return laptopTypes.includes(type) || laptopTypes.includes(type.trim());
  }

  // Hàm parse description từ AdminProduct.js
  function parseDescription(description) {
    if (!description) return {};
    
    const specs = {};
    const parts = description.split('|').map(p => p.trim());
    
    parts.forEach(part => {
      if (part.includes('CPU:')) {
        specs.cpu = part.replace('CPU:', '').trim();
      } else if (part.includes('RAM:')) {
        specs.ram = part.replace('RAM:', '').trim();
      } else if (part.includes('Ổ cứng:')) {
        specs.storage = part.replace('Ổ cứng:', '').trim();
      } else if (part.includes('VGA:') || part.includes('Card đồ họa:')) {
        specs.gpu = part.replace('VGA:', '').replace('Card đồ họa:', '').trim();
      }
    });
    
    return specs;
  }

  const detailSection = document.getElementById('productDetail');
  const suggestions = document.getElementById('suggestions');
  const accessories = document.getElementById('accessories');
  const slider = document.querySelector('.slider');

  const detailName = document.getElementById('detail-product-name');
  const detailImg = document.getElementById('detail-product-img');
  const detailInfo = document.getElementById('detail-product-info');
  const detailPrice = document.getElementById('detail-product-price');

  // spec elements inside detail
  const specCPU = document.getElementById('spec-cpu');
  const specRAM = document.getElementById('spec-ram');
  const specStorage = document.getElementById('spec-storage');
  const specGPU = document.getElementById('spec-gpu');

  // attach click to every .btn-detail
  document.querySelectorAll('.btn-detail').forEach(btn => {
    btn.addEventListener('click', (e) => {
      // tìm .card chứa nút
      const card = btn.closest('.card');
      if(!card) return;

      // Lấy dữ liệu từ card
      const nameEl = card.querySelector('.product-name');
      const imgEl = card.querySelector('img.product-img');
      const priceEl = card.querySelector('.product-price');
      const type = card.getAttribute('data-type') || '';

      const name = nameEl ? nameEl.textContent.trim() : '';
      const imgSrc = imgEl ? imgEl.getAttribute('src') : '';
      const price = priceEl ? priceEl.textContent.trim() : '';

      // Fill vào productDetail
      if(detailName) detailName.textContent = name;
      if(detailImg) {
        detailImg.setAttribute('src', imgSrc || '');
        detailImg.setAttribute('alt', name || 'Product Image');
      }
      if(detailPrice) detailPrice.textContent = price;

      // Tìm dữ liệu từ globalJsonData
      let productData = null;
      if(window.globalJsonData && window.globalJsonData.product && window.globalJsonData.product.brand) {
        const brands = window.globalJsonData.product.brand;
        
        // Tìm trong tất cả brands
        for(let brand of brands) {
          // Tìm trong laptop
          if(brand.laptop && Array.isArray(brand.laptop)) {
            productData = brand.laptop.find(p => p.model === name);
            if(productData) break;
          }
          // Tìm trong balo
          if(!productData && brand.balo && Array.isArray(brand.balo)) {
            productData = brand.balo.find(p => p.model === name);
            if(productData) break;
          }
          // Tìm trong phukienkhac
          if(!productData && brand.phukienkhac && Array.isArray(brand.phukienkhac)) {
            productData = brand.phukienkhac.find(p => p.model === name);
            if(productData) break;
          }
        }
      }

      if(isLaptop(type)) {
        // Hiển thị spec CPU/RAM/Storage/GPU cho laptop
        if(productData && productData.description) {
          const specs = parseDescription(productData.description);
          if(specCPU) specCPU.textContent = specs.cpu || '-';
          if(specRAM) specRAM.textContent = specs.ram || '-';
          if(specStorage) specStorage.textContent = specs.storage || '-';
          if(specGPU) specGPU.textContent = specs.gpu || '-';
          
          // Cập nhật thông tin sản phẩm
          if(detailInfo) detailInfo.textContent = productData.description.replace(/\|/g, '\n');
        } else {
          // Fallback nếu không tìm thấy data
          if(specCPU) specCPU.textContent = '-';
          if(specRAM) specRAM.textContent = '-';
          if(specStorage) specStorage.textContent = '-';
          if(specGPU) specGPU.textContent = '-';
          if(detailInfo) detailInfo.textContent = 'Thông tin chi tiết đang được cập nhật...';
        }
      } else {
        // Nếu không phải laptop (balo, phụ kiện khác) - hiển thị dấu -
        if(specCPU) specCPU.textContent = '-';
        if(specRAM) specRAM.textContent = '-';
        if(specStorage) specStorage.textContent = '-';
        if(specGPU) specGPU.textContent = '-';
        
        if(productData && productData.description) {
          if(detailInfo) detailInfo.textContent = productData.description.replace(/\|/g, '\n');
        } else {
          if(detailInfo) detailInfo.textContent = `Loại: ${type}\nThông tin chi tiết đang được cập nhật...`;
        }
      }

      // ẩn list & show detail
      if(suggestions) suggestions.style.display = 'none';
      if(accessories) accessories.style.display = 'none';
      if(slider) slider.style.display = 'none';
      if(detailSection) detailSection.style.display = 'block';

      // Cuộn tới vị trí detail (mượt) thay vì lên đầu trang
      detailSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // ngăn hành vi default nếu là <a> (trong trường hợp)
      if(e.preventDefault) e.preventDefault();
    });
  });
});
