// cart.js - CHỈ XỬ LÝ DROPDOWN GIỎ HÀNG

/* ===========================
   QUẢN LÝ GIỎ HÀNG - LAPTOP & PHỤ KIỆN
   =========================== */

document.addEventListener('DOMContentLoaded', function() {
  
  // ✅ Đảm bảo cartData là global
  if (!window.cartData) {
      window.cartData = [];
  }
  const MAX_DROPDOWN_ITEMS = 5;

  // Định dạng tiền Việt Nam
  const formatCurrency = (amount) => {
      if (!amount) return '0đ';
      return amount.toLocaleString('vi-VN') + 'đ';
  };

  // Tính và cập nhật tổng tiền
  const calculateAndUpdateSummary = () => {
      let subtotal = 0;
      window.cartData.forEach(item => {
          if (item.checked) {
              subtotal += item.price * item.quantity;
          }
      });
      const cartTotalElement = document.getElementById('cart-total');
      if (cartTotalElement) {
          cartTotalElement.textContent = formatCurrency(subtotal);
      }
  };

  // --- LOCAL STORAGE ---
  window.saveCartData = () => {
      try {
          localStorage.setItem('shoppingCartData', JSON.stringify(window.cartData));
      } catch (e) {
          console.error('Lỗi khi lưu dữ liệu giỏ hàng:', e);
      }
  };

  window.loadCartData = () => {
      try {
          const storedData = localStorage.getItem('shoppingCartData');
          if (storedData) {
              window.cartData = JSON.parse(storedData);
          }
      } catch (e) {
          console.error('Lỗi khi tải dữ liệu giỏ hàng:', e);
          localStorage.removeItem('shoppingCartData');
          window.cartData = [];
      }
  };

  // --- HÀM XỬ LÝ CHECKBOX ---
  window.toggleCartItemDropdown = (id, isChecked) => {
      const item = window.cartData.find(item => item.id === id);
      if (item) {
          item.checked = isChecked;
          window.saveCartData();
          calculateAndUpdateSummary();
          // Cập nhật cart detail nếu đang mở
          if (typeof window.updateCartDetail === 'function') {
              window.updateCartDetail();
          }
      }
  };

  // --- HÀM XỬ LÝ SỐ LƯỢNG ---
  window.incrementDropdownItem = (id) => {
      const item = window.cartData.find(item => item.id === id);
      if (item) {
          item.quantity++;
          window.saveCartData();
          renderCartDropdown();
          // Cập nhật cart detail nếu đang mở
          if (typeof window.updateCartDetail === 'function') {
              window.updateCartDetail();
          }
      }
  };

  window.decrementDropdownItem = (id) => {
      const index = window.cartData.findIndex(item => item.id === id);
      
      if (index > -1) {
          const item = window.cartData[index];
          
          if (item.quantity > 1) {
              item.quantity--;
          } else {
              window.cartData.splice(index, 1);
          }
          
          window.saveCartData();
          renderCartDropdown();
          // Cập nhật cart detail nếu đang mở
          if (typeof window.updateCartDetail === 'function') {
              window.updateCartDetail();
          }
      }
  };

  // --- HÀM THÊM SẢN PHẨM VÀO GIỎ HÀNG ---
  window.addToCart = (productData) => {
      if (!productData || !productData.name || !productData.price) {
          console.error('Dữ liệu sản phẩm không hợp lệ');
          return;
      }

      // Chuyển đổi giá từ chuỗi sang số
      const price = parseInt(productData.price.replace(/\D/g, '')) || 0;
      const image = productData.img || '../assets/images/noimg.png';
      
      // Tạo ID duy nhất cho sản phẩm
      const productId = Date.now() + Math.random();
      
      // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
      const existingItemIndex = window.cartData.findIndex(item => 
          item.name === productData.name && item.price === price
      );

      if (existingItemIndex > -1) {
          // Nếu đã có, tăng số lượng
          window.cartData[existingItemIndex].quantity++;
      } else {
          // Nếu chưa có, thêm mới
          window.cartData.push({
              id: productId,
              name: productData.name,
              price: price,
              image: image,
              quantity: 1,
              checked: true
          });
      }

      window.saveCartData();
      renderCartDropdown();
      
      // Hiển thị thông báo
      alert('Đã thêm "' + productData.name + '" vào giỏ hàng!');
  };

  // --- HÀM XÓA SẢN PHẨM ---
  window.removeCartItem = (id) => {
      const index = window.cartData.findIndex(item => item.id === id);
      if (index > -1) {
          window.cartData.splice(index, 1);
          window.saveCartData();
          renderCartDropdown();
          // Cập nhật cart detail nếu đang mở
          if (typeof window.updateCartDetail === 'function') {
              window.updateCartDetail();
          }
      }
  };

  // --- HÀM RENDER GIỎ HÀNG DROPDOWN ---
  const renderCartDropdown = () => {
      const container = document.querySelector('.cart-items');
      const emptyCart = document.querySelector('.empty-cart');
      
      if (!container) return;

      container.innerHTML = '';

      if (window.cartData.length === 0) {
        const items = container.querySelectorAll('.cart-dropdown-item, .dropdown-more-items');
        items.forEach(item => item.style.display = 'none');
          if (emptyCart) {
              emptyCart.style.display = 'flex';
          } else {
              container.innerHTML = `
                  <div class="empty-cart">
                      <i class="fas fa-shopping-cart"></i>
                      <p>Hiện chưa có sản phẩm</p>
                  </div>
              `;
          }
          calculateAndUpdateSummary();
          return;
      }

      // Ẩn thông báo giỏ hàng trống
      if (emptyCart) {
          emptyCart.style.display = 'none';
      }

      const itemsToDisplay = window.cartData.slice(0, MAX_DROPDOWN_ITEMS);

      itemsToDisplay.forEach(item => {
          const itemHTML = `
              <div class="cart-dropdown-item">
                  <!-- CHECKBOX CHỌN SẢN PHẨM -->
                  <input type="checkbox" class="item-checkbox" ${item.checked ? 'checked' : ''} 
                         onchange="toggleCartItemDropdown(${item.id}, this.checked)">
                  
                  <img src="${item.image}" alt="${item.name}" class="dropdown-item-image">
                  <div class="dropdown-item-info">
                      <p class="dropdown-item-name">${item.name}</p>
                      <p class="dropdown-item-price">${formatCurrency(item.price)} x ${item.quantity}</p>
                  </div>
                  <div class="dropdown-item-controls">
                      <button class="dropdown-qty-btn minus" onclick="decrementDropdownItem(${item.id})">-</button>
                      <button class="dropdown-qty-btn plus" onclick="incrementDropdownItem(${item.id})">+</button>
                      <button class="dropdown-remove-btn" onclick="removeCartItem(${item.id})">
                          <i class="fas fa-times"></i>
                      </button>
                  </div>
              </div>
          `;
          container.insertAdjacentHTML('beforeend', itemHTML);
      });

      // Hiển thị thông báo nếu có nhiều sản phẩm
      if (window.cartData.length > MAX_DROPDOWN_ITEMS) {
          const remaining = window.cartData.length - MAX_DROPDOWN_ITEMS;
          const moreInfoHTML = `
              <div class="dropdown-more-items">
                  Và ${remaining} sản phẩm khác...
              </div>
          `;
          container.insertAdjacentHTML('beforeend', moreInfoHTML);
      }

      calculateAndUpdateSummary();
  };

  // --- HÀM HIỂN THỊ TRANG CHÍNH ---
  window.showMainPageFromCart = () => {
      const cartDetail = document.getElementById('cartDetail');
      const productDetail = document.getElementById('productDetail');
      const suggestions = document.getElementById('suggestions');
      const accessories = document.getElementById('accessories');
      const slider = document.querySelector('.slider');
      
      if (cartDetail) cartDetail.style.display = 'none';
      if (productDetail) productDetail.style.display = 'none';
      if (suggestions) suggestions.style.display = 'block';
      if (accessories) accessories.style.display = 'block';
      if (slider) slider.style.display = 'block';
  };

  // --- HÀM HIỂN THỊ GIỎ HÀNG CHI TIẾT ---
  window.showCartDetailFromDropdown = () => {
      const cartDetail = document.getElementById('cartDetail');
      const productDetail = document.getElementById('productDetail');
      const suggestions = document.getElementById('suggestions');
      const accessories = document.getElementById('accessories');
      const slider = document.querySelector('.slider');
      
      if (cartDetail) cartDetail.style.display = 'block';
      if (productDetail) productDetail.style.display = 'none';
      if (suggestions) suggestions.style.display = 'none';
      if (accessories) accessories.style.display = 'none';
      if (slider) slider.style.display = 'none';
      
      // Gọi hàm từ cartDetail.js nếu tồn tại
      if (typeof window.renderCartDetailPage === 'function') {
          window.renderCartDetailPage();
      }
  };

  // --- HÀM THANH TOÁN ---
  window.goToCheckoutFromDropdown = () => { 
      const hasSelectedItems = window.cartData.some(item => item.checked);
      if (!hasSelectedItems) {
          alert("Vui lòng chọn ít nhất một sản phẩm để thanh toán!");
          return;
      }
      
      window.saveCartData();
      alert('Chức năng thanh toán đang được phát triển!');
  };

  // --- XỬ LÝ SỰ KIỆN ---
  const toggleCartDropdown = () => {
      const dropdown = document.querySelector('.cart-dropdown');
      if (dropdown) {
          dropdown.classList.toggle('active');
          if (dropdown.classList.contains('active')) {
              renderCartDropdown();
          }
      }
  };

  // Gắn sự kiện cho nút giỏ hàng
  const cartToggleBtn = document.querySelector('.cart-toggle-btn');
  if (cartToggleBtn) {
      cartToggleBtn.addEventListener('click', toggleCartDropdown);
  }

  // Gắn sự kiện cho nút "XEM GIỎ HÀNG"
  const viewCartBtn = document.querySelector('.btn-view');
  if (viewCartBtn) {
      viewCartBtn.addEventListener('click', showCartDetailFromDropdown);
  }

  // Gắn sự kiện cho nút "THANH TOÁN" trong dropdown
  const checkoutBtn = document.querySelector('.btn-pay');
  if (checkoutBtn) {
      checkoutBtn.addEventListener('click', goToCheckoutFromDropdown);
  }

  // Đóng dropdown khi click ra ngoài
  document.addEventListener('click', (e) => {
      const dropdown = document.querySelector('.cart-dropdown');
      const cartContainer = document.querySelector('.cart-container');
      
      if (dropdown && cartContainer && 
          !cartContainer.contains(e.target) && 
          dropdown.classList.contains('active')) {
          dropdown.classList.remove('active');
      }
  });

  // Animation cho cart dropdown khi load trang
  const cartDropdown = document.querySelector('.cart-dropdown');
  if (cartDropdown) {
      cartDropdown.style.opacity = '0';
      cartDropdown.style.transform = 'translateY(-10px)';
      setTimeout(() => {
          cartDropdown.style.transition = 'all 0.3s ease';
          cartDropdown.style.opacity = '1';
          cartDropdown.style.transform = 'translateY(0)';
      }, 100);
  }

  // KHỞI TẠO
  window.loadCartData();
  renderCartDropdown();

});