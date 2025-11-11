// productDetail.js - Đồng bộ với localStorage "laptopProducts"

// ========== HÀM LẤY DỮ LIỆU TỪ LOCALSTORAGE ==========
function getLocalProducts() {
  try {
    const data = localStorage.getItem("laptopProducts");
    if (data) {
      const parsedData = JSON.parse(data);
      if (Array.isArray(parsedData) && parsedData.length > 0) {
        return parsedData;
      }
    }
    console.warn("Không tìm thấy dữ liệu laptopProducts trong localStorage");
    return [];
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu sản phẩm:", error);
    return [];
  }
}

// ========== HÀM FORMAT GIÁ ==========
function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
}

// ========== HÀM HIỂN THỊ CHI TIẾT SẢN PHẨM ==========
function showProductDetail(productId) {
  const allProducts = getLocalProducts();
  const product = allProducts.find(p => p.id === productId);
  
  if (!product) {
    console.error("Không tìm thấy sản phẩm với ID:", productId);
    alert("Không tìm thấy thông tin sản phẩm!");
    return;
  }
  
  // Ẩn các section khác
  const suggestions = document.getElementById('suggestions');
  const accessories = document.getElementById('accessories');
  const slider = document.querySelector('.slider');
  const cartDetail = document.getElementById('cartDetail');
  
  if (suggestions) suggestions.style.display = 'none';
  if (accessories) accessories.style.display = 'none';
  if (slider) slider.style.display = 'none';
  if (cartDetail) cartDetail.style.display = 'none';
  
  // Hiển thị product detail
  const productDetail = document.getElementById('productDetail');
  if (!productDetail) {
    console.error("Không tìm thấy element productDetail");
    return;
  }
  
  productDetail.style.display = 'block';
  
  // Cập nhật nội dung
  const detailName = document.getElementById('detail-product-name');
  const detailImg = document.getElementById('detail-product-img');
  const detailPrice = document.getElementById('detail-product-price');
  const detailInfo = document.getElementById('detail-product-info');
  
  // Cập nhật thông số kỹ thuật
  const specCpu = document.getElementById('spec-cpu');
  const specRam = document.getElementById('spec-ram');
  const specGpu = document.getElementById('spec-gpu');
  const specScreen = document.getElementById('spec-screen');
  const specBattery = document.getElementById('spec-battery');
  const specOs = document.getElementById('spec-os');
  
  if (detailName) detailName.textContent = product.name;
  if (detailImg) {
    detailImg.src = product.image || '../assets/images/default-product.jpg';
    detailImg.alt = product.name;
    detailImg.onerror = function() {
      this.src = '../assets/images/default-product.jpg';
    };
  }
  if (detailPrice) detailPrice.textContent = formatPrice(product.priceValue);
  
  // Thông tin sản phẩm - Luôn hiển thị dòng cố định
  if (detailInfo) {
    detailInfo.textContent = "Sản phẩm chất lượng, giá cả phải chăng.";
  }
  
  // Cập nhật thông số kỹ thuật
  if (specCpu) specCpu.textContent = product.cpu || '-';
  if (specRam) specRam.textContent = product.ram || '-';
  if (specGpu) specGpu.textContent = product.cardManHinh || '-';
  if (specScreen) specScreen.textContent = product.manHinh ? `${product.manHinh}` : '-';
  if (specBattery) specBattery.textContent = product.pin || '-';
  if (specOs) specOs.textContent = product.heDieuHanh || '-';
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  // Gắn sự kiện cho nút "Thêm giỏ hàng"
  const btnCart = document.querySelector('#productDetail .btn-cart');
  if (btnCart) {
    // Xóa event listener cũ (nếu có)
    const newBtnCart = btnCart.cloneNode(true);
    btnCart.parentNode.replaceChild(newBtnCart, btnCart);
    
    newBtnCart.addEventListener('click', function() {
      addToCartFromDetail(productId);
    });
  }
  
  // Gắn sự kiện cho nút "Đặt mua ngay"
  const btnBuy = document.querySelector('#productDetail .btn-buy');
  if (btnBuy) {
    // Xóa event listener cũ (nếu có)
    const newBtnBuy = btnBuy.cloneNode(true);
    btnBuy.parentNode.replaceChild(newBtnBuy, btnBuy);
    
    newBtnBuy.addEventListener('click', function() {
      addToCartFromDetail(productId);
      // Chuyển sang trang giỏ hàng để thanh toán
      if (typeof showCartDetail === 'function') {
        showCartDetail();
      }
    });
  }
}

// ========== HÀM THÊM VÀO GIỎ HÀNG TỪ TRANG CHI TIẾT ==========
function addToCartFromDetail(productId) {
  if (typeof addToCart === 'function') {
    addToCart(productId);
  } else {
    console.error("Hàm addToCart không tồn tại!");
    alert("Đã thêm sản phẩm vào giỏ hàng!");
  }
}

// ========== XỬ LÝ KHI CLICK VÀO SẢN PHẨM ==========
document.addEventListener('DOMContentLoaded', function() {
  // Gắn sự kiện cho các product card
  document.addEventListener('click', function(e) {
    const productCard = e.target.closest('.product-card');
    if (!productCard) return;
    
    // Nếu click vào nút "Thêm vào giỏ", không mở chi tiết
    if (e.target.closest('.add-to-cart')) return;
    
    // Lấy ID sản phẩm từ nút "Thêm vào giỏ"
    const addToCartBtn = productCard.querySelector('.add-to-cart');
    if (addToCartBtn) {
      const productId = addToCartBtn.getAttribute('data-id');
      if (productId) {
        showProductDetail(productId);
      }
    }
  });
  
  // Xử lý nút tìm kiếm
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        const searchTerm = this.value.trim();
        if (searchTerm) {
          console.log('Tìm kiếm:', searchTerm);
          // Hàm searchProducts() đã được định nghĩa trong products.js
          if (typeof searchProducts === 'function') {
            searchProducts();
          }
        }
      }
    });
  }

  // Animation cho buttons khi load trang chi tiết
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.target.id === 'productDetail' && 
          mutation.target.style.display !== 'none') {
        const buttons = document.querySelectorAll('#productDetail .action-buttons button');
        buttons.forEach((btn, index) => {
          btn.style.opacity = '0';
          btn.style.transform = 'translateY(20px)';
          setTimeout(() => {
            btn.style.transition = 'all 0.5s ease';
            btn.style.opacity = '1';
            btn.style.transform = 'translateY(0)';
          }, 100 * (index + 1));
        });
      }
    });
  });

  const productDetail = document.getElementById('productDetail');
  if (productDetail) {
    observer.observe(productDetail, { 
      attributes: true, 
      attributeFilter: ['style'] 
    });
  }

  // Smooth scroll cho các link trong menu về trang chủ
  const menuLinks = document.querySelectorAll('.menu-list li');
  menuLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const text = this.textContent.trim().toLowerCase();
      if (text === 'trang chủ' || text.includes('trang chủ')) {
        e.preventDefault();
        if (typeof resetToHomePage === 'function') {
          resetToHomePage();
        }
      }
    });
  });
});

// Export hàm để có thể gọi từ file khác
window.showProductDetail = showProductDetail;