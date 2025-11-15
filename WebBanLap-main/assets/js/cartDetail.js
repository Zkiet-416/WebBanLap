// Xử lý trang giỏ hàng chi tiết

// ========== CẤU HÌNH PHÂN TRANG ==========
const CART_ITEMS_PER_PAGE = 3; // Hiển thị 3 sản phẩm

// ========== KIỂM TRA ĐĂNG NHẬP ==========
function checkLoginStatus() {
    try {
        // Lấy thông tin user từ local storage
        const currentUser = localStorage.getItem('currentUser');
        // Kiểm tra user có tồn tại không
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
    alert('Vui lòng đăng nhập để sử dụng giỏ hàng!');
    openLoginPopup();
    return false;
}

function openLoginPopup() {
    const popupLogin = document.getElementById('popupLogin');
    if (popupLogin) {
        popupLogin.classList.remove('hidden');
        const logTab = document.getElementById('log-tab');
        if (logTab && !logTab.classList.contains('active')) {
            logTab.click(); // Chuyển trang tag log
        }
    }
}

// ========== HÀM CHUYỂN TRANG TỪ DROPDOWN ==========
window.showCartDetailFromDropdown = () => {
    const { isLoggedIn } = checkLoginStatus();
    if (!isLoggedIn) return requireLogin();
    
    // Đóng dropdown trước
    const dropdown = document.querySelector('.btn-view');
    if (dropdown) dropdown.classList.remove('active');
    
    window.showCartDetail();
};

// ========== HÀM HIỂN THỊ TRANG GIỎ HÀNG CHI TIẾT ==========
window.showCartDetail = function() {  
    // Kiểm tra đăng nhập
    const { isLoggedIn } = checkLoginStatus();
    if (!isLoggedIn) {
        console.log('Chưa đăng nhập, yêu cầu đăng nhập');
        requireLogin();
        return;
    }

    // Ẩn các section khác
    const suggestions = document.getElementById('suggestions');
    const accessories = document.getElementById('accessories');
    const slider = document.querySelector('.slider');
    const productDetail = document.getElementById('productDetail');
    const historyPage = document.getElementById('historyPage');
    const profile = document.getElementById('profile');

    if (suggestions) suggestions.style.display = 'none';
    if (accessories) accessories.style.display = 'none';
    if (slider) slider.style.display = 'none';
    if (productDetail) productDetail.style.display = 'none';
    if (historyPage) historyPage.style.display = 'none'; 
    profile.classList.add("hidden");
    
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

// ========== HÀM RENDER TRANG GIỎ HÀNG CHI TIẾT VỚI PHÂN TRANG ==========
function renderCartDetailPage() {
    const container = document.querySelector(".cart-list");
    const itemCount = document.querySelector(".cart-header h3");
    const paginationContainer = document.querySelector(".cart-pagination");
    
    if (!container) {
        console.error('Không tìm thấy .cart-list');
        return;
    }

    container.innerHTML = ''; // Xóa nội dung cũ

    // Kiểm tra cart data có trống không
    if (!window.cartData || window.cartData.length === 0) {
        showEmptyCart(); // Hiển thị giỏ hàng trống
        if (paginationContainer) paginationContainer.innerHTML = '';
        return;
    }

    // Cập nhật tổng số lượng sản phẩm
    const totalItems = window.cartData.reduce((total, item) => total + item.quantity, 0);
    if (itemCount) itemCount.textContent = `Giỏ hàng(${totalItems})`;

    // Tính toán phân trang
    const totalPages = Math.ceil(window.cartData.length / CART_ITEMS_PER_PAGE); // Tổng số sản phẩm trong giỏ / Số sản phẩm 1 trang
    const currentPage = window.currentCartPage || 1; // Trang hiện tại
    const startIndex = (currentPage - 1) * CART_ITEMS_PER_PAGE; // Vị trí bắt đầu
    const endIndex = startIndex + CART_ITEMS_PER_PAGE; // Vị trí kết thúc
    const currentItems = window.cartData.slice(startIndex, endIndex); // Lấy sản phẩm cho trang hiện tại

    let subtotal = 0;

    // Render sản phẩm cho trang hiện tại
    currentItems.forEach(item => {
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
        container.insertAdjacentHTML('beforeend', itemHTML); // Thêm vào container
    });

    // Render phân trang
    renderCartPagination(totalPages, currentPage);
    
    // Cập nhật tổng tiền (tính tất cả sản phẩm được chọn, không chỉ trang hiện tại)
    updateCartSummary(calculateTotalSelectedItems());
}

// ========== HÀM TÍNH TỔNG TIỀN TẤT CẢ SẢN PHẨM ĐƯỢC CHỌN ==========
function calculateTotalSelectedItems() {
    let total = 0;
    if (window.cartData && Array.isArray(window.cartData)) {
        window.cartData.forEach(item => {
            if (item.checked) {
                total += item.price * item.quantity;
            }
        });
    }
    return total;
}

// ========== HÀM RENDER PHÂN TRANG GIỎ HÀNG ==========
function renderCartPagination(totalPages, currentPage) {
    const paginationContainer = document.querySelector(".cart-pagination");
    if (!paginationContainer) {
        console.error('Không tìm thấy .cart-pagination');
        return;
    }

    if (totalPages <= 1) {
        paginationContainer.innerHTML = ''; // Ẩn phân trang nếu chỉ có 1 trang
        return;
    }

    let paginationHTML = '';

    // Nút Previous
    if (currentPage > 1) {
        paginationHTML += `<button class="page-btn" onclick="changeCartPage(${currentPage - 1})">‹</button>`;
    } else {
        paginationHTML += `<button class="page-btn disabled">‹</button>`; // Không hiện nếu ở trang đầu
    }

    // Các nút trang
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            paginationHTML += `<button class="page-btn active">${i}</button>`;
        } else {
            paginationHTML += `<button class="page-btn" onclick="changeCartPage(${i})">${i}</button>`;
        }
    }

    // Nút Next
    if (currentPage < totalPages) {
        paginationHTML += `<button class="page-btn" onclick="changeCartPage(${currentPage + 1})">›</button>`;
    } else {
        paginationHTML += `<button class="page-btn disabled">›</button>`; // Không hiện nếu ở trang cuối
    }

    paginationContainer.innerHTML = paginationHTML;
}

// ========== HÀM CHUYỂN TRANG GIỎ HÀNG ==========
window.changeCartPage = function(page) {
    window.currentCartPage = page;
    renderCartDetailPage();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ========== HÀM HIỂN THỊ GIỎ HÀNG TRỐNG ==========
function showEmptyCart() {
    const container = document.querySelector(".cart-list");
    const itemCount = document.querySelector(".cart-header h3");
    const paginationContainer = document.querySelector(".cart-pagination");
    
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
    
    if (paginationContainer) {
        paginationContainer.innerHTML = '';
    }
    
    updateCartSummary(0); // Cập nhật tổng tiền = 0
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
    const item = window.cartData.find(item => item.id === id);
    if (item) {
        item.checked = isChecked; // Cập nhật trang thái checkbox
        window.saveCartData();
        calculateCartTotal();
    }
};

// ========== HÀM TĂNG SỐ LƯỢNG SẢN PHẨM ==========
window.increaseCartQty = function(id) {
    const item = window.cartData.find(item => item.id === id);
    if (item) {
        item.quantity++;
        window.saveCartData();

        if (typeof window.renderCartDropdown === 'function') {
            window.renderCartDropdown();
        }
        // Giữ nguyên trang hiện tại khi cập nhật
        renderCartDetailPage();
    }
};

// ========== HÀM GIẢM SỐ LƯỢNG SẢN PHẨM ==========
window.decreaseCartQty = function(id) {
    const item = window.cartData.find(item => item.id === id);
    if (item) {
        if (item.quantity > 1) {
            item.quantity--;
            window.saveCartData();

            if (typeof window.renderCartDropdown === 'function') {
                window.renderCartDropdown();
            }
            // Giữ nguyên trang hiện tại khi cập nhật
            renderCartDetailPage();
        } else {
            window.removeCartItem(id);
        }
    }
};

// ========== HÀM XÓA SẢN PHẨM KHỎI GIỎ HÀNG CHI TIẾT ==========
window.removeCartItem = function(id) {
    if (!confirm("Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?")) {
        return;
    }

    const index = window.cartData.findIndex(item => item.id === id);
    if (index > -1) {
        window.cartData.splice(index, 1);
        window.saveCartData();
        
        // Reset về trang 1 nếu xóa hết sản phẩm trên trang hiện tại
        const currentPage = window.currentCartPage || 1;
        const itemsPerPage = CART_ITEMS_PER_PAGE;
        const totalItemsAfterRemove = window.cartData.length;
        const totalPagesAfterRemove = Math.ceil(totalItemsAfterRemove / itemsPerPage);
        
        if (currentPage > totalPagesAfterRemove && totalPagesAfterRemove > 0) {
            window.currentCartPage = totalPagesAfterRemove; // Về trang cuối
        } else if (totalPagesAfterRemove === 0) {
            window.currentCartPage = 1; // Về trang 1 nếu giỏ hàng trống
        }
        
        renderCartDetailPage();
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
   
    updateCartSummary(subtotal);
    return subtotal;
}

// ========== HÀM CHUYỂN ĐẾN THANH TOÁN ==========
window.goToCheckout = function() {
    const hasSelectedItems = window.cartData && window.cartData.some(item => item.checked);
    
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
    
    // Đảm bảo cart detail ẩn khi trang load
    const cartDetail = document.getElementById('cartDetail');
    if (cartDetail) {
        cartDetail.style.display = 'none';
    }
    
    // Khởi tạo trang hiện tại
    window.currentCartPage = 1;
    
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
});

// ========== EXPORT HÀM ĐỂ CÓ THỂ GỌI TỪ FILE KHÁC ==========
window.renderCartDetailPage = renderCartDetailPage;
window.showCartDetail = showCartDetail;
window.formatCurrency = formatCurrency;
window.updateCartSummary = updateCartSummary;
window.calculateCartTotal = calculateCartTotal;