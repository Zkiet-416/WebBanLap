// productDetail.js - Đồng bộ với localStorage "laptopProducts"
// Hỗ trợ cấu trúc mới cho laptop và phụ kiện

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
  
  // Cập nhật nội dung cơ bản
  const detailName = document.getElementById('detail-product-name');
  const detailImg = document.getElementById('detail-product-img');
  const detailPrice = document.getElementById('detail-product-price');
  const detailInfo = document.getElementById('detail-product-info');
  
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
  
  // Cập nhật thông số kỹ thuật dựa trên category
  const specsSection = document.querySelector('.specs-section');
  const specsContent = document.querySelector('.specs-content');
  
  if (specsSection && specsContent) {
    if (product.category === "laptop") {
      // Hiển thị specs cho laptop
      specsContent.innerHTML = `
        <div class="spec-item">
          <span class="spec-label">CPU:</span>
          <span class="spec-value">${product.cpu || '-'}</span>
        </div>
        <div class="spec-item">
          <span class="spec-label">RAM:</span>
          <span class="spec-value">${product.ram || '-'}</span>
        </div>
        <div class="spec-item">
          <span class="spec-label">Card đồ họa:</span>
          <span class="spec-value">${product.cardManHinh || '-'}</span>
        </div>
        <div class="spec-item">
          <span class="spec-label">Màn hình:</span>
          <span class="spec-value">${product.manHinh ? `${product.manHinh}"` : '-'}</span>
        </div>
        <div class="spec-item">
          <span class="spec-label">Pin:</span>
          <span class="spec-value">${product.pin || '-'}</span>
        </div>
        <div class="spec-item">
          <span class="spec-label">Hệ điều hành:</span>
          <span class="spec-value">${product.heDieuHanh || '-'}</span>
        </div>
        ${product.oCung ? `
        <div class="spec-item">
          <span class="spec-label">Ổ cứng:</span>
          <span class="spec-value">${product.oCung}</span>
        </div>` : ''}
      `;
    } else {
      // Hiển thị specs cho phụ kiện
      let specsHTML = '';
      
      // Thuộc tính chung
      if (product.trongLuong) {
        specsHTML += `
        <div class="spec-item">
          <span class="spec-label">Trọng lượng:</span>
          <span class="spec-value">${product.trongLuong}</span>
        </div>`;
      }
      if (product.kichCo) {
        specsHTML += `
        <div class="spec-item">
          <span class="spec-label">Kích cỡ:</span>
          <span class="spec-value">${product.kichCo}</span>
        </div>`;
      }
      
      // Thuộc tính của đế tản nhiệt
      if (product.congKetNoi) {
        specsHTML += `
        <div class="spec-item">
          <span class="spec-label">Cổng kết nối:</span>
          <span class="spec-value">${product.congKetNoi}</span>
        </div>`;
      }
      if (product.tocDoQuat) {
        specsHTML += `
        <div class="spec-item">
          <span class="spec-label">Tốc độ quạt:</span>
          <span class="spec-value">${product.tocDoQuat}</span>
        </div>`;
      }
      
      // Thuộc tính của tai nghe
      if (product.daiTanSo) {
        specsHTML += `
        <div class="spec-item">
          <span class="spec-label">Dải tần số:</span>
          <span class="spec-value">${product.daiTanSo}</span>
        </div>`;
      }
      if (product.ketNoi) {
        specsHTML += `
        <div class="spec-item">
          <span class="spec-label">Kết nối:</span>
          <span class="spec-value">${product.ketNoi}</span>
        </div>`;
      }
      if (product.jackCam) {
        specsHTML += `
        <div class="spec-item">
          <span class="spec-label">Jack cắm:</span>
          <span class="spec-value">${product.jackCam}</span>
        </div>`;
      }
      
      // Thuộc tính của chuột
      if (product.doPhanGiai) {
        specsHTML += `
        <div class="spec-item">
          <span class="spec-label">Độ phân giải:</span>
          <span class="spec-value">${product.doPhanGiai}</span>
        </div>`;
      }
      if (product.khoangCachKetNoi) {
        specsHTML += `
        <div class="spec-item">
          <span class="spec-label">Khoảng cách kết nối:</span>
          <span class="spec-value">${product.khoangCachKetNoi}</span>
        </div>`;
      }
      if (product.denLED) {
        specsHTML += `
        <div class="spec-item">
          <span class="spec-label">Đèn LED:</span>
          <span class="spec-value">${product.denLED}</span>
        </div>`;
      }
      if (product.hangSanXuat) {
        specsHTML += `
        <div class="spec-item">
          <span class="spec-label">Hãng sản xuất:</span>
          <span class="spec-value">${product.hangSanXuat}</span>
        </div>`;
      }
      
      // Thuộc tính của bàn phím
      if (product.soPhim) {
        specsHTML += `
        <div class="spec-item">
          <span class="spec-label">Số phím:</span>
          <span class="spec-value">${product.soPhim}</span>
        </div>`;
      }
      if (product.day) {
        specsHTML += `
        <div class="spec-item">
          <span class="spec-label">Dây:</span>
          <span class="spec-value">${product.day}</span>
        </div>`;
      }
      
      specsContent.innerHTML = specsHTML || '<p>Không có thông số kỹ thuật</p>';
    }
  }
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  // Gắn sự kiện cho nút "Thêm giỏ hàng"
  const btnCart = document.querySelector('#productDetail .btn-cart');
  if (btnCart) {
    const newBtnCart = btnCart.cloneNode(true);
    btnCart.parentNode.replaceChild(newBtnCart, btnCart);
    
    newBtnCart.addEventListener('click', function() {
      addToCartFromDetail(productId);
    });
  }
  
  // Gắn sự kiện cho nút "Đặt mua ngay"
  const btnBuy = document.querySelector('#productDetail .btn-buy');
  if (btnBuy) {
    const newBtnBuy = btnBuy.cloneNode(true);
    btnBuy.parentNode.replaceChild(newBtnBuy, btnBuy);
    
    newBtnBuy.addEventListener('click', function() {
      addToCartFromDetail(productId);
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