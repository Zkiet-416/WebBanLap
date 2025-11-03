// productDetail.js

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