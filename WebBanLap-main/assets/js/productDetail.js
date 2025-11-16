// productDetail.js - Đồng bộ với localStorage "laptopProducts"
// Hỗ trợ cấu trúc mới cho laptop và phụ kiện

// ========== HÀM LẤY DỮ LIỆU TỪ LOCALSTORAGE (GIỮ NGUYÊN) ==========
function getLocalProducts() {
  try {
    // Ưu tiên sử dụng dữ liệu đã được xử lý và export từ products.js
    if (window.allProducts && Array.isArray(window.allProducts) && window.allProducts.length > 0) {
        return window.allProducts;
    }

    // Trường hợp dự phòng (dữ liệu chưa kịp tải hoặc products.js bị thiếu)
    const data = localStorage.getItem("laptopProducts");
    if (data) {
      const parsedData = JSON.parse(data);
      // Giả định dữ liệu trong LS là mảng phẳng (nhưng sẽ không có originalProductId)
      if (Array.isArray(parsedData) && parsedData.length > 0) {
        return parsedData;
      }
    }

    console.warn("Không tìm thấy dữ liệu sản phẩm trong window.allProducts hoặc localStorage");
    return [];
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu sản phẩm:", error);
    return [];
  }
}

// ========== HÀM FORMAT GIÁ (GIỮ NGUYÊN) ==========
function formatPrice(price) {
  // Đảm bảo giá là số trước khi format
  const priceNumber = parseInt(price, 10);
  if (isNaN(priceNumber)) return 'Liên hệ';
  
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(priceNumber);
}
function parseDescriptionToSpecsHTML(description) {
  if (!description) {
    return '<div class="spec-item"><span class="spec-label">Thông số:</span><span class="spec-value">Đang cập nhật</span></div>';
  }
  
  let specsHTML = '';
  // Tách chuỗi theo dấu '|'
  const specs = description.split('|');
  
  specs.forEach(spec => {
    const trimmedSpec = spec.trim();
    if (trimmedSpec) {
      // Tách chuỗi theo dấu ':'
      const parts = trimmedSpec.split(':');
      
      // Đảm bảo có ít nhất label và value
      if (parts.length >= 2) {
        // Lấy phần đầu là label, phần còn lại là value (phòng trường hợp value có dấu ':')
        const label = parts[0].trim();
        const value = parts.slice(1).join(':').trim();
        
        if (label && value) {
          specsHTML += `
            <div class="spec-item">
              <span class="spec-label">${label}:</span>
              <span class="spec-value">${value}</span>
            </div>
          `;
        }
      }
    }
  });
  
  return specsHTML || '<div class="spec-item"><span class="spec-label">Thông số:</span><span class="spec-value">Không có thông số chi tiết.</span></div>';
}

// ========== HÀM HIỂN THỊ CHI TIẾT SẢN PHẨM (ĐÃ SỬA) ==========
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
  
  if (detailName) detailName.textContent = product.model;
  if (detailImg) {
    detailImg.src = product.image || '../assets/images/default-product.jpg';
    detailImg.alt = product.model;
    detailImg.onerror = function() {
      this.src = '../assets/images/default-product.jpg';
    };
  }
  
  // SỬA: Chuyển đổi giá từ chuỗi có dấu chấm (vd: "16.390.000") sang số
  const rawPrice = product.price ? product.price.replace(/\./g, '').replace(/[^\d]/g, '').trim() : 0;
  if (detailPrice) detailPrice.textContent = formatPrice(rawPrice);
  
  // Thông tin sản phẩm - Luôn hiển thị dòng cố định
  if (detailInfo) {
    detailInfo.textContent = "Sản phẩm chất lượng, giá cả phải chăng.";
  }
  
  // SỬA ĐỔI QUAN TRỌNG: Cập nhật thông số kỹ thuật (Spec) bằng cách gọi hàm phân tích description
  const specsSection = document.querySelector('.specs-section');
  const specsContent = document.querySelector('.specs-content');
  
  if (specsSection && specsContent) {
    // Gọi hàm mới để phân tích chuỗi description và tạo HTML spec
    specsContent.innerHTML = parseDescriptionToSpecsHTML(product.description);
    
    // Đảm bảo section tiêu đề vẫn hiển thị đúng
    const specsTitle = specsSection.querySelector('h2');
    if (specsTitle) {
      specsTitle.textContent = "THÔNG SỐ KỸ THUẬT";
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

// ========== HÀM THÊM VÀO GIỎ HÀNG TỪ TRANG CHI TIẾT (GIỮ NGUYÊN) ==========
function addToCartFromDetail(productId) {
  if (typeof addToCart === 'function') {
    addToCart(productId);
  } else {
    console.error("Hàm addToCart không tồn tại!");
    alert("Đã thêm sản phẩm vào giỏ hàng!");
  }
}

// ========== XỬ LÝ KHI CLICK VÀO SẢN PHẨM (GIỮ NGUYÊN) ==========
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