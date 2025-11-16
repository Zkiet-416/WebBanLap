// Xử lý trang giỏ hàng chi tiết

// ========== CÁC HÀM PHỤ TRỢ ==========
function checkLoginStatus() {
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
}   

function requireLogin() {
    alert('Vui lòng đăng nhập để xem giỏ hàng!');
    openLoginPopup();
    return false;
}

function openLoginPopup() {
    const popupLogin = document.getElementById('popupLogin');
    if (popupLogin) {
        popupLogin.classList.remove('hidden');
        const logTab = document.getElementById('log-tab');
        if (logTab && !logTab.classList.contains('active')) {
            logTab.click();
        }
    }
}

// ========== HÀM CHUYỂN TRANG TỪ DROPDOWN ==========
window.showCartDetailFromDropdown = () => {
    const { isLoggedIn } = checkLoginStatus();
    if (!isLoggedIn) return requireLogin();

    console.log('🎯 Chuyển sang trang giỏ hàng chi tiết từ dropdown');
    
    // Đóng dropdown trước
    const dropdown = document.querySelector('.cart-dropdown');
    if (dropdown) dropdown.classList.remove('active');
    
    // Gọi hàm hiển thị trang giỏ hàng chi tiết
    if (typeof window.showCartDetail === 'function') {
        console.log('✅ Gọi showCartDetail');
        window.showCartDetail();
    } else {
        console.error('❌ Hàm showCartDetail không tồn tại, sử dụng fallback');
        // Fallback trực tiếp
        showCartDetailDirect();
    }
};

// HÀM FALLBACK
function showCartDetailDirect() {
    console.log('🔄 Hiển thị trang giỏ hàng trực tiếp');
    
    // Ẩn các section khác
    const sectionsToHide = [
        'suggestions', 'accessories', 'productDetail'
    ];
    
    sectionsToHide.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.style.display = 'none';
    });
    
    const slider = document.querySelector('.slider');
    if (slider) slider.style.display = 'none';
    
    // Hiển thị cart detail
    const cartDetail = document.getElementById('cartDetail');
    if (cartDetail) {
        cartDetail.style.display = 'block';
        
        // Render giỏ hàng
        if (typeof window.renderCartDetailPage === 'function') {
            window.renderCartDetailPage();
        } else {
            console.error('❌ Không thể render giỏ hàng');
        }
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// ========== HÀM HIỂN THỊ TRANG GIỎ HÀNG CHI TIẾT ==========
window.showCartDetail = function() {
    console.log('🎯 Hàm showCartDetail được gọi');
    
    // Kiểm tra đăng nhập
    const { isLoggedIn } = checkLoginStatus();
    if (!isLoggedIn) {
        console.log('❌ Chưa đăng nhập, yêu cầu đăng nhập');
        requireLogin();
        return;
    }

    // Ẩn các section khác
    const suggestions = document.getElementById('suggestions');
    const accessories = document.getElementById('accessories');
    const slider = document.querySelector('.slider');
    const productDetail = document.getElementById('productDetail');
    
    if (suggestions) suggestions.style.display = 'none';
    if (accessories) accessories.style.display = 'none';
    if (slider) slider.style.display = 'none';
    if (productDetail) productDetail.style.display = 'none';
    
    // Hiển thị cart detail
    const cartDetail = document.getElementById('cartDetail');
    if (!cartDetail) {
        console.error("Không tìm thấy element cartDetail");
        return;
    }
    
    cartDetail.style.display = 'block';
    
    // Render nội dung giỏ hàng
    renderCartDetailPage();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========== HÀM RENDER TRANG GIỎ HÀNG CHI TIẾT ==========
function renderCartDetailPage() {
    const container = document.querySelector(".cart-list");
    const itemCount = document.querySelector(".cart-header h3");
    
    console.log('🔄 Rendering cart detail page...');
    console.log('📦 cartData:', window.cartData);
    
    if (!container) {
        console.error('❌ Không tìm thấy .cart-list');
        return;
    }

    container.innerHTML = '';

    // Kiểm tra cart data
    if (!window.cartData || window.cartData.length === 0) {
        console.log('Giỏ hàng trống');
        showEmptyCart();
        return;
    }

    // Cập nhật số lượng sản phẩm
    const totalItems = window.cartData.reduce((total, item) => total + item.quantity, 0);
    if (itemCount) itemCount.textContent = `Giỏ hàng(${totalItems})`;

    let subtotal = 0;

    // Render từng sản phẩm
    window.cartData.forEach(item => {
        const itemTotal = item.price * item.quantity;
        if (item.checked) {
            subtotal += itemTotal;
        }
        
        const itemHTML = `
            <div class="cart-item">
                <input type="checkbox" class="item-checkbox" ${item.checked ? 'checked' : ''} 
                       onchange="toggleCartItem('${item.id}', this.checked)">
                
                <img src="${item.image}" alt="${item.name}" class="item-image" 
                     onerror="this.src='../assets/images/default-product.jpg'">
                <div class="item-details">
                    <h4 class="item-name">${item.name}</h4>
                    <p class="item-price-label">Giá: <span class="price-value">${formatCurrency(item.price)}</span></p>
                </div>
                <div class="item-controls">
                    <div class="quantity-control">
                        <button class="qty-btn minus" onclick="decreaseCartQty('${item.id}')">-</button>
                        <span class="qty-display">${item.quantity}</span>
                        <button class="qty-btn plus" onclick="increaseCartQty('${item.id}')">+</button>
                    </div>
                    <button class="remove-link" onclick="removeCartItem('${item.id}')">Xóa</button>
                </div>
                <div class="item-total">${formatCurrency(itemTotal)}</div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', itemHTML);
    });

    // Cập nhật tổng tiền
    updateCartSummary(subtotal);
    console.log('✅ Render cart detail thành công');
}

// ========== HÀM HIỂN THỊ GIỎ HÀNG TRỐNG ==========
function showEmptyCart() {
    const container = document.querySelector(".cart-list");
    const itemCount = document.querySelector(".cart-header h3");
    
    if (container) {
        container.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Giỏ hàng của bạn đang trống</p>
                <a href="#" class="continue-shopping" onclick="resetToHomePage()">Tiếp tục mua sắm</a>
            </div>
        `;
    }
    
    if (itemCount) {
        itemCount.textContent = "Giỏ hàng(0)";
    }
    
    updateCartSummary(0);
}

// ========== HÀM CẬP NHẬT TỔNG TIỀN ==========
function updateCartSummary(subtotal) {
    const subtotalElement = document.querySelector('.subtotal-value');
    const totalElement = document.querySelector('.total-price');
    
    if (subtotalElement) {
        subtotalElement.textContent = formatCurrency(subtotal);
    }
    if (totalElement) {
        totalElement.textContent = formatCurrency(subtotal);
    }
}

// ========== HÀM ĐỊNH DẠNG TIỀN ==========
function formatCurrency(amount) {
    if (!amount) return '0đ';
    return amount.toLocaleString('vi-VN') + 'đ';
}

// ========== CÁC HÀM XỬ LÝ GIỎ HÀNG ==========
window.toggleCartItem = function(id, isChecked) {
    console.log('Toggle cart item:', id, isChecked);
    const item = window.cartData.find(item => item.id === id);
    if (item) {
        item.checked = isChecked;
        window.saveCartData();
        window.calculateCartTotal();
    }
};

window.increaseCartQty = function(id) {
    console.log('Increase cart quantity:', id);
    const item = window.cartData.find(item => item.id === id);
    if (item) {
        item.quantity++;
        window.saveCartData();

        if (typeof window.renderCartDropdown === 'function') {
            window.renderCartDropdown();
        }
        window.renderCartDetailPage();
    }
};

window.decreaseCartQty = function(id) {
    console.log('Decrease cart quantity:', id);
    const item = window.cartData.find(item => item.id === id);
    if (item) {
        if (item.quantity > 1) {
            item.quantity--;
            window.saveCartData();

            if (typeof window.renderCartDropdown === 'function') {
            window.renderCartDropdown();
        }
            window.renderCartDetailPage();
        } else {
                window.removeCartItem(id);
            }
        }
};

window.removeCartItem = function(id) {
    console.log('Remove cart item:', id);
    if (!confirm("Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?")) {
        return;
    }

    const index = window.cartData.findIndex(item => item.id === id);
    if (index > -1) {
        window.cartData.splice(index, 1);
        window.saveCartData();
        window.renderCartDetailPage();
    }
};

// ========== HÀM TÍNH TỔNG TIỀN ==========
function calculateCartTotal() {
    let subtotal = 0;
    
    if (window.cartData && Array.isArray(window.cartData)) {
        window.cartData.forEach(item => {
            if (item.checked) {
                subtotal += (item.price || 0) * (item.quantity || 1);
            }
        });
    }
    
    window.updateCartSummary(subtotal);
    return subtotal;
}

// ========== HÀM CHUYỂN ĐẾN THANH TOÁN ==========
window.goToCheckout = function() {
    const hasSelectedItems = window.cartData.some(item => item.checked);
    
    if (!hasSelectedItems) {
        alert("Vui lòng chọn ít nhất một sản phẩm để thanh toán!");
        return;
    }
    
    // Hiển thị modal thanh toán
    const checkoutModal = document.getElementById('checkoutModal');
    if (checkoutModal) {
        checkoutModal.style.display = 'block';
    } else {
        alert('Chức năng thanh toán đang được phát triển!');
    }
};

// ========== XỬ LÝ KHI TRANG LOAD ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ cartDetail.js đã tải');
    
    // Đảm bảo cart detail ẩn khi trang load
    const cartDetail = document.getElementById('cartDetail');
    if (cartDetail) {
        cartDetail.style.display = 'none';
    }
    
    // Gắn sự kiện cho nút thanh toán
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', goToCheckout);
    }
    
    // Gắn sự kiện cho nút "Mua thêm"
    const continueShoppingBtn = document.querySelector('.continue-shopping');
    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (typeof resetToHomePage === 'function') {
                resetToHomePage();
            }
        });
    }

    // Animation cho cart items khi load trang
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.target.id === 'cartDetail' && 
                mutation.target.style.display !== 'none') {
                const cartItems = document.querySelectorAll('#cartDetail .cart-item');
                cartItems.forEach((item, index) => {
                    item.style.opacity = '0';
                    item.style.transform = 'translateX(-20px)';
                    setTimeout(() => {
                        item.style.transition = 'all 0.5s ease';
                        item.style.opacity = '1';
                        item.style.transform = 'translateX(0)';
                    }, 100 * (index + 1));
                });
            }
        });
    });

    if (cartDetail) {
        observer.observe(cartDetail, { 
            attributes: true, 
            attributeFilter: ['style'] 
        });
    }
});

// Export hàm để có thể gọi từ file khác
window.renderCartDetailPage = renderCartDetailPage;
window.showCartDetail = showCartDetail;
window.formatCurrency = formatCurrency;
window.updateCartSummary = updateCartSummary;
window.calculateCartTotal = calculateCartTotal;