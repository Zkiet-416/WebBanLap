// cart.js - CHỈ XỬ LÝ DROPDOWN GIỎ HÀNG

/* QUẢN LÝ GIỎ HÀNG - LAPTOP & PHỤ KIỆN */

document.addEventListener('DOMContentLoaded', function() {
  
  console.log('🚀 cart.js BẮT ĐẦU CHẠY');
  
  // ✅ Đảm bảo cartData là global
  if (!window.cartData) {
      window.cartData = [];
  }
  const MAX_DROPDOWN_ITEMS = 3;

  // Hàm kiểm tra đăng nhập
  const checkLoginStatus = () => {
      try {
          const currentUser = localStorage.getItem('currentUser');
          const userLoggedIn = currentUser !== null && currentUser !== 'null' && currentUser !== '';
          return { 
              isLoggedIn: userLoggedIn, 
              user: userLoggedIn ? JSON.parse(currentUser) : null 
          };
      } catch (error) {
          console.error('Lỗi khi kiểm tra đăng nhập:', error);
          return { isLoggedIn: false, user: null };
      }
  };

  // Hàm yêu cầu đăng nhập
  const requireLogin = () => {
      alert('Vui lòng đăng nhập để sử dụng giỏ hàng!');
      openLoginPopup();
      return false;
  };

  // Hàm mở popup đăng nhập
  const openLoginPopup = () => {
      const popupLogin = document.getElementById('popupLogin');
      if (popupLogin) {
          popupLogin.classList.remove('hidden');
          const logTab = document.getElementById('log-tab');
          if (logTab && !logTab.classList.contains('active')) {
              logTab.click();
          }
      }
  };

  // Định dạng tiền Việt Nam
  const formatCurrency = (amount) => {
      if (!amount) return '0đ';
      return amount.toLocaleString('vi-VN') + 'đ';
  };

  // Tính và cập nhật tổng tiền
  const calculateAndUpdateSummary = () => {
      let subtotal = 0;
      if (window.cartData && Array.isArray(window.cartData)) {
          window.cartData.forEach(item => {
              if (item.checked) {
                  subtotal += (item.price || 0) * (item.quantity || 1);
              }
          });
      }
      const cartTotalElement = document.getElementById('cart-total');
      if (cartTotalElement) {
          cartTotalElement.textContent = formatCurrency(subtotal);
      }
      return subtotal;
  };

  // --- LOCAL STORAGE ---
  window.saveCartData = () => {
      try {
          const { isLoggedIn, user } = checkLoginStatus();
          if (isLoggedIn && user) {
              const userCartKey = `shoppingCart_${user.email}`;
              localStorage.setItem(userCartKey, JSON.stringify(window.cartData));
          } else {
              localStorage.setItem('shoppingCart_guest', JSON.stringify(window.cartData));
          }
          console.log('💾 Đã lưu giỏ hàng:', window.cartData);
      } catch (e) {
          console.error('Lỗi khi lưu dữ liệu giỏ hàng:', e);
      }
  };

  /**
   * Tải dữ liệu giỏ hàng từ Local Storage và áp dụng logic di chuyển ID.
   * Đây là phần đã được chỉnh sửa để xử lý ID cũ/ID mới.
   */
  window.loadCartData = () => {
      try {
          const { isLoggedIn, user } = checkLoginStatus();
          let storedData = null;
          
          // 1. Tải dữ liệu giỏ hàng
          if (isLoggedIn && user) {
              const userCartKey = `shoppingCart_${user.email}`;
              storedData = localStorage.getItem(userCartKey);
              if (storedData) {
                  window.cartData = JSON.parse(storedData);
                  console.log('📥 Đã tải giỏ hàng của user:', user.email, window.cartData);
              } else {
                  const guestCart = localStorage.getItem('shoppingCart_guest');
                  if (guestCart) {
                      window.cartData = JSON.parse(guestCart);
                      localStorage.removeItem('shoppingCart_guest');
                      window.saveCartData();
                      console.log('🔄 Đã chuyển giỏ hàng guest sang user');
                  } else {
                      window.cartData = [];
                  }
              }
          } else {
              storedData = localStorage.getItem('shoppingCart_guest');
              if (storedData) {
                  window.cartData = JSON.parse(storedData);
                  console.log('📥 Đã tải giỏ hàng guest:', window.cartData);
              } else {
                  window.cartData = [];
              }
          }

          // 2. LOGIC DI CHUYỂN (MIGRATION) ID BỊ LỖI
          // Logic này chạy ngay sau khi tải dữ liệu từ Local Storage
          if (window.cartData.length > 0) {
              
              // Lấy danh sách sản phẩm chuẩn hóa (ID ngắn) từ products.js
              const allProducts = window.productsAPI && typeof window.productsAPI.getAllProducts === 'function' 
                                  ? window.productsAPI.getAllProducts() 
                                  : [];

              window.cartData = window.cartData.map(item => {
                  // Giả định ID cũ là ID dài có chứa dấu gạch dưới ('_') từ tên model
                  if (item.id && item.id.includes('_')) {
                      console.warn(`[MIGRATION] Phát hiện ID cũ: ${item.id}`);

                      // Tìm sản phẩm mới (ID ngắn) mà ID cũ bắt đầu bằng nó.
                      // Điều này hoạt động vì ID ngắn hiện tại là tiền tố của ID dài cũ.
                      const correspondingProduct = allProducts.find(p => item.id.startsWith(p.id));

                      if (correspondingProduct) {
                          // Cập nhật ID giỏ hàng thành ID ngắn mới
                          item.id = correspondingProduct.id;
                          console.log(`[MIGRATION] Chuyển đổi thành công thành ID mới: ${item.id}`);
                      } else {
                          // Nếu không tìm thấy ID tương ứng, giữ nguyên item và log lỗi
                          console.error(`[MIGRATION] Không tìm thấy sản phẩm mới tương ứng với ID cũ: ${item.id}`);
                      }
                  }
                  return item;
              });

              // Sau khi di chuyển ID, lưu lại giỏ hàng để ID cũ không còn bị tải ở lần sau
              window.saveCartData(); 
          }
          
      } catch (e) {
          console.error('Lỗi khi tải hoặc di chuyển dữ liệu giỏ hàng:', e);
          window.cartData = [];
      }
  };

  // --- HÀM TÌM SẢN PHẨM THEO ID ---
  const findProductById = (productId) => {
      console.log('🔍 Tìm sản phẩm với ID:', productId);
      
      // Tìm trong localStorage trước
      try {
          // Lưu ý: Đảm bảo 'laptopProducts' đã được chuẩn hóa (chứa ID ngắn)
          const localProducts = JSON.parse(localStorage.getItem('laptopProducts') || '[]');
          const product = localProducts.find(p => p.id === productId);
          if (product) {
              console.log('✅ Tìm thấy sản phẩm trong localStorage:', product.model); // Dùng product.model thay vì name
              return product;
          }
      } catch (error) {
          console.error('Lỗi khi đọc localStorage:', error);
      }

      // Tìm trong biến global
      if (window.allProducts && Array.isArray(window.allProducts)) {
          const product = window.allProducts.find(p => p.id === productId);
          if (product) {
              console.log('✅ Tìm thấy sản phẩm trong allProducts:', product.model); // Dùng product.model thay vì name
              return product;
          }
      }

      console.error('❌ Không tìm thấy sản phẩm với ID:', productId);
      return null;
  };

  // --- HÀM THÊM SẢN PHẨM VÀO GIỎ HÀNG ---
  window.addToCart = (productId) => {
      console.log('🛒 Gọi addToCart với ID:', productId);
      
      const { isLoggedIn } = checkLoginStatus();
      if (!isLoggedIn) return requireLogin();

      // Tìm sản phẩm từ nhiều nguồn
      const productData = findProductById(productId);
      
      if (!productData) {
          console.error('❌ Không tìm thấy sản phẩm!');
          alert('Không tìm thấy thông tin sản phẩm!');
          return;
      }

      // Chuẩn bị dữ liệu sản phẩm cho giỏ hàng
      const product = {
          id: productData.id,
          name: productData.model, // Sử dụng model làm tên
          price: productData.priceValue || parseInt(String(productData.price).replace(/\./g, '').replace(/đ$/, ''), 10) || 0, // Đảm bảo price là số
          image: productData.image || '../assets/images/default-product.jpg',
          quantity: 1,
          checked: true
      };

      console.log('📦 Sản phẩm chuẩn bị thêm:', product);

      // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
      const existingItemIndex = window.cartData.findIndex(item => item.id === product.id);

      if (existingItemIndex > -1) {
          // Tăng số lượng nếu đã có
          window.cartData[existingItemIndex].quantity++;
          console.log('➕ Tăng số lượng sản phẩm:', product.name);
      } else {
          // Thêm mới nếu chưa có
          window.cartData.push(product);
          console.log('🆕 Thêm sản phẩm mới:', product.name);
      }

      window.saveCartData();
      renderCartDropdown();
      
      // Hiển thị thông báo
      showAddToCartNotification(product.name);
  };

  // Hàm hiển thị thông báo
    function showAddToCartNotification(productName) {
        alert(`✅ Đã thêm "${productName}" vào giỏ hàng!`);
    }

  // --- HÀM XỬ LÝ CHECKBOX ---
  window.toggleCartItemDropdown = (id, isChecked) => {
      const { isLoggedIn } = checkLoginStatus();
      if (!isLoggedIn) return requireLogin();

      const item = window.cartData.find(item => item.id === id);
      if (item) {
          item.checked = isChecked;
          window.saveCartData();
          calculateAndUpdateSummary();
      }
  };

  // --- HÀM XỬ LÝ SỐ LƯỢNG ---
  window.incrementDropdownItem = (id) => {
      const { isLoggedIn } = checkLoginStatus();
      if (!isLoggedIn) return requireLogin();

      const item = window.cartData.find(item => item.id === id);
      if (item) {
          item.quantity++;
          window.saveCartData();
          renderCartDropdown();
      }
  };

  window.decrementDropdownItem = (id) => {
      const { isLoggedIn } = checkLoginStatus();
      if (!isLoggedIn) return requireLogin();

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
      }
  };

  // --- HÀM XÓA SẢN PHẨM ---
  window.removeCartItemDropdown = (id) => {
    const { isLoggedIn } = checkLoginStatus();
    if (!isLoggedIn) return requireLogin();

    const index = window.cartData.findIndex(item => item.id === id);
    if (index > -1) {
        window.cartData.splice(index, 1);
        window.saveCartData();
        renderCartDropdown();
    }
};

  // --- HÀM RENDER GIỎ HÀNG DROPDOWN ---
  const renderCartDropdown = () => {
      console.log('🎯 Hàm renderCartDropdown được gọi');
      
      const container = document.querySelector('.cart-items');
      const { isLoggedIn, user } = checkLoginStatus();
      
      console.log('📦 cartData:', window.cartData);
      console.log('🔐 Login status:', { isLoggedIn, user });
      console.log('🎯 Container:', container);

      if (!container) {
          console.error('❌ Không tìm thấy .cart-items');
          return;
      }

      // Clear container
      container.innerHTML = '';

      // Nếu chưa đăng nhập
      if (!isLoggedIn) {
          container.innerHTML = `
              <div class="empty-cart">
                  <i class="fas fa-user-lock"></i>
                  <p>Vui lòng đăng nhập để sử dụng giỏ hàng</p>
                  <button class="login-btn" onclick="openLoginPopup()">
                      Đăng nhập ngay
                  </button>
              </div>
          `;
          calculateAndUpdateSummary();
          return;
      }

      // Nếu giỏ hàng trống
      if (!window.cartData || window.cartData.length === 0) {
          container.innerHTML = `
              <div class="empty-cart">
                  <i class="fas fa-shopping-cart"></i>
                  <p>Giỏ hàng của bạn đang trống</p>
                  <small>Chào ${user?.username || 'bạn'}! Hãy thêm sản phẩm vào giỏ hàng</small>
              </div>
          `;
          calculateAndUpdateSummary();
          return;
      }

      // Hiển thị sản phẩm
      const itemsToDisplay = window.cartData.slice(0, MAX_DROPDOWN_ITEMS);

      itemsToDisplay.forEach(item => {
          const itemHTML = `
              <div class="cart-dropdown-item">
                  <input type="checkbox" class="item-checkbox" ${item.checked ? 'checked' : ''} 
                         onchange="toggleCartItemDropdown('${item.id}', this.checked)">
                  
                  <img src="${item.image}" alt="${item.name}" class="dropdown-item-image" 
                       onerror="this.src='../assets/images/default-product.jpg'">
                  <div class="dropdown-item-info">
                      <p class="dropdown-item-name">${item.name}</p>
                      <p class="dropdown-item-price">${formatCurrency(item.price)} x ${item.quantity}</p>
                  </div>
                  <div class="dropdown-item-controls">
                      <button class="dropdown-qty-btn minus" onclick="decrementDropdownItem('${item.id}')">-</button>
                      <span class="qty-display">${item.quantity}</span>
                      <button class="dropdown-qty-btn plus" onclick="incrementDropdownItem('${item.id}')">+</button>
                      <button class="dropdown-remove-btn" onclick="removeCartItemDropdown('${item.id}')">
                          <i class="fas fa-times"></i>
                      </button>
                  </div>
              </div>
          `;
          container.insertAdjacentHTML('beforeend', itemHTML);
      });

      // Thông báo nếu có nhiều sản phẩm
      if (window.cartData.length > MAX_DROPDOWN_ITEMS) {
          const remaining = window.cartData.length - MAX_DROPDOWN_ITEMS;
          container.insertAdjacentHTML('beforeend', `
              <div class="dropdown-more-items">
                  Và ${remaining} sản phẩm khác...
              </div>
          `);
      }

      calculateAndUpdateSummary();
      console.log('✅ Render dropdown thành công');
  };

  window.goToCheckoutFromDropdown = () => { 
      const { isLoggedIn } = checkLoginStatus();
      if (!isLoggedIn) return requireLogin();

      const hasSelectedItems = window.cartData.some(item => item.checked);
      if (!hasSelectedItems) {
          alert("Vui lòng chọn ít nhất một sản phẩm để thanh toán!");
          return;
      }
      
      window.saveCartData();
      
      // Hiển thị modal thanh toán nếu có
      const checkoutModal = document.getElementById('checkoutModal');
      if (checkoutModal) {
          checkoutModal.style.display = 'block';
      } else {
          alert('Chức năng thanh toán đang được phát triển!');
      }
  };

  // --- XỬ LÝ SỰ KIỆN ---
  const toggleCartDropdown = () => {
    console.log('🎯 CLICK VÀO GIỎ HÀNG');
    
    const dropdown = document.querySelector('.cart-dropdown');
    console.log('📦 Dropdown tìm thấy:', dropdown);
    
    if (dropdown) {
        const isActive = dropdown.classList.contains('active');
        console.log('🔘 Trạng thái trước:', isActive);
        
        // TOGGLE CLASS
        dropdown.classList.toggle('active');
        
        const isActiveAfter = dropdown.classList.contains('active');
        console.log('🔘 Trạng thái sau:', isActiveAfter);
        console.log('🎨 Class list:', dropdown.classList);
        
        if (isActiveAfter) {
            console.log('🔄 Rendering dropdown...');
            renderCartDropdown();
        }
    } else {
        console.error('❌ KHÔNG TÌM THẤY DROPDOWN');
    }
};

// Gắn sự kiện CHẮC CHẮN
const cartBtn = document.querySelector('.cart-toggle-btn');
console.log('🔍 Nút giỏ hàng:', cartBtn);

if (cartBtn) {
    // Gắn nhiều cách để chắc chắn
    cartBtn.addEventListener('click', toggleCartDropdown);
    cartBtn.onclick = toggleCartDropdown; // Dự phòng
    
    console.log('✅ Đã gắn sự kiện click');
}

  // Gắn sự kiện cho các nút trong dropdown
  document.addEventListener('click', function(e) {
      // Nút xem giỏ hàng
    if (e.target.closest('.btn-view')) {
        e.preventDefault();
        e.stopPropagation();
        
        if (typeof window.showCartDetailFromDropdown === 'function') {
            window.showCartDetailFromDropdown();
        } else {
            console.error('Hàm showCartDetailFromDropdown không tồn tại!');
        }
        
        // Đóng dropdown sau khi click
        const dropdown = document.querySelector('.cart-dropdown');
        if (dropdown) dropdown.classList.remove('active');
    }
      
      // Nút thanh toán
      if (e.target.closest('.btn-pay')) {
          e.preventDefault();
          e.stopPropagation();
          goToCheckoutFromDropdown();
          // Đóng dropdown sau khi click
          const dropdown = document.querySelector('.cart-dropdown');
          if (dropdown) dropdown.classList.remove('active');
      }
  });

  // Đóng dropdown khi click ra ngoài
  document.addEventListener('click', (e) => {
      const dropdown = document.querySelector('.cart-dropdown');
      const cartContainer = document.querySelector('.cart-container');
      
      if (dropdown && cartContainer && 
          !cartContainer.contains(e.target) && 
          dropdown.classList.contains('active')) {
          console.log('🚪 Đóng dropdown vì click ra ngoài');
          dropdown.classList.remove('active');
      }
  });

  // Xuất hàm ra global
  window.openLoginPopup = openLoginPopup;
  window.requireLogin = requireLogin;
  window.renderCartDropdown = renderCartDropdown;
  window.toggleCartDropdown = toggleCartDropdown;

  // THÊM CÁC HÀM XỬ LÝ GIỎ HÀNG
window.incrementDropdownItem = incrementDropdownItem;
window.decrementDropdownItem = decrementDropdownItem;
window.removeCartItemDropdown = removeCartItemDropdown;
window.toggleCartItemDropdown = toggleCartItemDropdown;

  // 🚀 KHỞI TẠO
  console.log('🔄 Khởi tạo giỏ hàng...');
  window.loadCartData();
  
  // Render lần đầu để có nội dung mặc định
  renderCartDropdown();
  
  console.log('✅ Giỏ hàng đã sẵn sàng');

  // Debug info
  console.log('=== CART DEBUG INFO ===');
  console.log('Current user:', localStorage.getItem('currentUser'));
  console.log('Cart data:', window.cartData);
  console.log('Cart elements found:', {
      toggleBtn: !!document.querySelector('.cart-toggle-btn'),
      dropdown: !!document.querySelector('.cart-dropdown'),
      itemsContainer: !!document.querySelector('.cart-items')
  });
});