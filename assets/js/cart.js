// Xử lý giỏ hàng

document.addEventListener('DOMContentLoaded', function() {
  
  // Đảm bảo cartData là global
  if (!window.cartData) {
      window.cartData = [];
  }
  const MAX_DROPDOWN_ITEMS = 2;

  // ========== HÀM ĐỊNH DẠNG TIỀN ==========
  const formatCurrency = (amount) => {
      if (!amount) return '0đ';
      return amount.toLocaleString('vi-VN') + 'đ';
  };

  // ========== HÀM TÍNH TOÁN TỔNG TIỀN ==========
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

  // ========== XỬ LÝ LOCAL STORAGE ==========
  window.saveCartData = () => {
      try {
          const { isLoggedIn, user } = checkLoginStatus();
          if (isLoggedIn && user) {
              const userCartKey = `shoppingCart_${user.email}`;
              localStorage.setItem(userCartKey, JSON.stringify(window.cartData));
          } else {
              localStorage.setItem('shoppingCart_guest', JSON.stringify(window.cartData));
          }
          console.log('Đã lưu giỏ hàng:', window.cartData);
      } catch (e) {
          console.error('Lỗi khi lưu dữ liệu giỏ hàng:', e);
      }
  };

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
              } else {
                  const guestCart = localStorage.getItem('shoppingCart_guest');
                  if (guestCart) {
                      window.cartData = JSON.parse(guestCart);
                      localStorage.removeItem('shoppingCart_guest');
                      window.saveCartData();
                  } else {
                      window.cartData = [];
                  }
              }
          } else {
              storedData = localStorage.getItem('shoppingCart_guest');
              if (storedData) {
                  window.cartData = JSON.parse(storedData);
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

  // ========== HÀM TÌM SẢN PHẨM ==========
  const findProductById = (productId) => {    
      // Tìm trong localStorage trước
      try {
          const localProducts = JSON.parse(localStorage.getItem('laptopProducts') || '[]');
          const product = localProducts.find(p => p.id === productId);
          if (product) {
              console.log('Tìm thấy sản phẩm trong localStorage:', product.model);
              return product;
          }
      } catch (error) {
          console.error('Lỗi khi đọc localStorage:', error);
      }

      // Tìm trong biến global
      if (window.allProducts && Array.isArray(window.allProducts)) {
          const product = window.allProducts.find(p => p.id === productId);
          if (product) {
              console.log('Tìm thấy sản phẩm trong allProducts:', product.model);
              return product;
          }
      }

      console.error('Không tìm thấy sản phẩm với ID:', productId);
      return null;
  };

  // ========== HÀM THÊM SẢN PHẨM VÀO GIỎ HÀNG ==========
  window.addToCart = (productId) => {
      
      const { isLoggedIn } = checkLoginStatus();
      if (!isLoggedIn) return requireLogin();

      // Tìm sản phẩm từ nhiều nguồn
      const productData = findProductById(productId);
      
      if (!productData) {
          console.error('Không tìm thấy sản phẩm!');
          alert('Không tìm thấy thông tin sản phẩm!');
          return;
      }

      // Chuẩn bị dữ liệu sản phẩm cho giỏ hàng
      const product = {
          id: productData.id,
          name: productData.model,
          price: productData.priceValue || parseInt(String(productData.price).replace(/\./g, '').replace(/đ$/, ''), 10) || 0, // Đảm bảo price là số
          image: productData.image || '../assets/images/default-product.jpg',
          quantity: 1,
          checked: true
      };

      // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
      const existingItemIndex = window.cartData.findIndex(item => item.id === product.id);

      if (existingItemIndex > -1) {
          // Tăng số lượng nếu đã có
          window.cartData[existingItemIndex].quantity++;
      } else {
          // Thêm mới nếu chưa có
          window.cartData.push(product);
      }

      window.saveCartData();
      renderCartDropdown();
      
      // Hiển thị thông báo
      showAddToCartNotification(product.name);
  };

  // ========== HÀM HIỂN THỊ THÔNG BÁO ==========
  function showAddToCartNotification(productName) {
      alert(`Đã thêm "${productName}" vào giỏ hàng!`);
  }

  // ========== HÀM XỬ LÝ CHECKBOX ==========
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

  // ========== HÀM XỬ LÝ SỐ LƯỢNG ==========
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

  // ========== HÀM XÓA SẢN PHẨM ==========
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

  // ========== HÀM RENDER GIỎ HÀNG DROPDOWN ==========
  const renderCartDropdown = () => {
      console.log('Hàm renderCartDropdown được gọi');
      
      const container = document.querySelector('.cart-items');
      const { isLoggedIn, user } = checkLoginStatus();
      
      console.log('CartData:', window.cartData);
      console.log('Login status:', { isLoggedIn, user });
      console.log('Container:', container);

      if (!container) {
          console.error('Không tìm thấy .cart-items');
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
      console.log('Render dropdown thành công');
  };

  // ========== HÀM CHUYỂN ĐẾN THANH TOÁN ==========
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

  // ========== XỬ LÝ SỰ KIỆN DROPDOWN ==========
  const toggleCartDropdown = () => {   
    const dropdown = document.querySelector('.cart-dropdown');
    
    if (dropdown) {
        const isActive = dropdown.classList.contains('active');
        
        // TOGGLE CLASS
        dropdown.classList.toggle('active');
        
        const isActiveAfter = dropdown.classList.contains('active');
        
        if (isActiveAfter) {
            renderCartDropdown();
        }
    } else {
        console.error('KHÔNG TÌM THẤY DROPDOWN');
    }
  };

  // ========== GẮN SỰ KIỆN ==========
  const cartBtn = document.querySelector('.cart-toggle-btn');

  if (cartBtn) {
      // Gắn nhiều cách để chắc chắn
      cartBtn.addEventListener('click', toggleCartDropdown);
      cartBtn.onclick = toggleCartDropdown; // Dự phòng
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
        const dropdown = document.querySelector('.btn-view');
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
          console.log('Đóng dropdown vì click ra ngoài');
          dropdown.classList.remove('active');
      }
  });

  // ========== EXPORT HÀM RA GLOBAL ==========
  window.openLoginPopup = openLoginPopup;
  window.requireLogin = requireLogin;
  window.renderCartDropdown = renderCartDropdown;
  window.toggleCartDropdown = toggleCartDropdown;

  // THÊM CÁC HÀM XỬ LÝ GIỎ HÀNG
  window.incrementDropdownItem = incrementDropdownItem;
  window.decrementDropdownItem = decrementDropdownItem;
  window.removeCartItemDropdown = removeCartItemDropdown;
  window.toggleCartItemDropdown = toggleCartItemDropdown;

  // ========== KHỞI TẠO ==========
  console.log('Khởi tạo giỏ hàng...');
  window.loadCartData();
  
  // Render lần đầu để có nội dung mặc định
  renderCartDropdown();
});