// productDetail.js
// ========== CONNECT CARDS -> PRODUCT DETAIL ==========
document.addEventListener('DOMContentLoaded', () => {
  // helper: list of types we treat as "laptop" (có CPU/RAM/HDD/GPU)
  const laptopTypes = ['Acer','Asus','Lenovo','HP','Dell','Laptop','lap'];

  function isLaptop(type) {
    if(!type) return false;
    return laptopTypes.includes(type) || laptopTypes.includes(type.trim());
  }

  const detailSection = document.getElementById('productDetail');
  const suggestions = document.getElementById('suggestions');
  const accessories = document.getElementById('accessories');
  const slider = document.querySelector('.slider');

  const detailName = document.getElementById('detail-product-name');
  const detailImg = document.getElementById('detail-product-img');
  const detailInfo = document.getElementById('detail-product-info');

  // spec elements inside detail (tạo id tương ứng trong main.html nếu cần)
  const specCPU = document.querySelector('.spec-item .spec-value[data-spec="cpu"]');
  const specRAM = document.querySelector('.spec-item .spec-value[data-spec="ram"]');
  const specHDD = document.querySelector('.spec-item .spec-value[data-spec="hdd"]');
  const specGPU = document.querySelector('.spec-item .spec-value[data-spec="gpu"]');

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
      if(detailInfo) detailInfo.textContent = (price ? 'Giá: ' + price + '. ' : '') + 'Loại: ' + type;

      // Nếu có AdminProduct data (ví dụ window.adminProducts là mảng), ưu tiên lấy thông số chi tiết từ đó
      // adminProducts format expected: [{ id: 'xxx', name: '...', cpu:'', ram:'', hdd:'', gpu:'' }, ...]
      let adminData = null;
      if(window.adminProducts && Array.isArray(window.adminProducts)) {
        adminData = window.adminProducts.find(p => {
          // match by name or id if available
          return p.name === name || p.id === card.getAttribute('data-id') || p.id === name;
        }) || null;
      }

      if(isLaptop(type)) {
        // hiển thị spec CPU/RAM/HDD/GPU (ẩn pin/OS)
        if(adminData) {
          if(specCPU) specCPU.textContent = adminData.cpu || 'N/A';
          if(specRAM) specRAM.textContent = adminData.ram || 'N/A';
          if(specHDD) specHDD.textContent = adminData.hdd || 'N/A';
          if(specGPU) specGPU.textContent = adminData.gpu || 'N/A';
        } else {
          // fallback: nếu không có admin data, cố lấy từ data-* attributes (ví dụ data-cpu)
          if(specCPU) specCPU.textContent = card.getAttribute('data-cpu') || 'Xem chi tiết';
          if(specRAM) specRAM.textContent = card.getAttribute('data-ram') || 'Xem chi tiết';
          if(specHDD) specHDD.textContent = card.getAttribute('data-hdd') || 'Xem chi tiết';
          if(specGPU) specGPU.textContent = card.getAttribute('data-gpu') || 'Xem chi tiết';
        }
      } else {
        // Nếu không phải laptop: bạn muốn hiện thông số khác — ví dụ hiện "Loại" và "Mô tả ngắn"
        // (Bạn có thể tinh chỉnh phần này theo yêu cầu)
        if(specCPU) specCPU.textContent = 'Loại: ' + (type || 'Phụ kiện');
        if(specRAM) specRAM.textContent = '';
        if(specHDD) specHDD.textContent = '';
        if(specGPU) specGPU.textContent = '';
      }

      // Ẩn list & show detail
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

document.addEventListener('DOMContentLoaded', function() {
  
  // Xử lý nút "Đặt mua ngay"
  const btnBuy = document.querySelector('.btn-buy');
  if (btnBuy) {
    btnBuy.addEventListener('click', function() {
      alert('Chức năng đặt mua đang được phát triển!');
      // TODO: Implement purchase functionality
    });
  }

  // Xử lý nút "Thêm giỏ hàng"
  const btnCart = document.querySelector('.btn-cart');
  if (btnCart) {
    btnCart.addEventListener('click', function() {
      alert('Đã thêm sản phẩm vào giỏ hàng!');
      // TODO: Implement add to cart functionality
    });
  }

  // Xử lý search
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        const searchTerm = this.value.trim();
        if (searchTerm) {
          console.log('Tìm kiếm:', searchTerm);
          // TODO: Implement search functionality
        }
      }
    });
  }

  // Animation cho buttons khi load trang
  const buttons = document.querySelectorAll('.action-buttons button');
  buttons.forEach((btn, index) => {
    btn.style.opacity = '0';
    btn.style.transform = 'translateY(20px)';
    setTimeout(() => {
      btn.style.transition = 'all 0.5s ease';
      btn.style.opacity = '1';
      btn.style.transform = 'translateY(0)';
    }, 100 * (index + 1));
  });

  // Smooth scroll cho các link trong menu
  const menuLinks = document.querySelectorAll('.menu-list li');
  menuLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      if (this.textContent.trim() === 'Trang chủ') {
        e.preventDefault();
        window.location.href = 'index.html';
      }
    });
  });

});