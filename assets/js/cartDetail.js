// cartDetail.js - XỬ LÝ TRANG GIỎ HÀNG CHI TIẾT

// ====== HIỂN THỊ TRANG GIỎ HÀNG CHI TIẾT ======
window.showCartDetail = function() {
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
    if (cartDetail) {
        cartDetail.style.display = 'block';
        renderCartDetailPage();
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ====== ẨN TRANG GIỎ HÀNG CHI TIẾT ======
window.hideCartDetail = function() {
    const cartDetail = document.getElementById('cartDetail');
    if (cartDetail) {
        cartDetail.style.display = 'none';
    }
    
    // Hiển thị lại trang chủ
    const suggestions = document.getElementById('suggestions');
    const accessories = document.getElementById('accessories');
    const slider = document.querySelector('.slider');
    
    if (suggestions) suggestions.style.display = 'block';
    if (accessories) accessories.style.display = 'block';
    if (slider) slider.style.display = 'block';
};

// ====== RENDER TRANG GIỎ HÀNG CHI TIẾT ======
function renderCartDetailPage() {
    const container = document.querySelector(".cart-list");
    const itemCount = document.querySelector(".cart-header h3");
    
    if (!container) return;

    container.innerHTML = '';

    // Kiểm tra cart data
    if (!window.cartData || window.cartData.length === 0) {
        showEmptyCart();
        return;
    }

    // Cập nhật số lượng sản phẩm
    if (itemCount) itemCount.textContent = `Giỏ hàng(${window.cartData.length})`;

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
                       onchange="toggleItem(${item.id}, this.checked)">
                
                <img src="${item.image}" alt="${item.name}" class="item-image">
                <div class="item-details">
                    <h4 class="item-name">${item.name}</h4>
                    <p class="item-price-label">Giá: <span class="price-value">${formatCurrency(item.price)}</span></p>
                </div>
                <div class="item-controls">
                    <div class="quantity-control">
                        <button class="qty-btn minus" onclick="decreaseQty(${item.id})">-</button>
                        <span class="qty-display">${item.quantity}</span>
                        <button class="qty-btn plus" onclick="increaseQty(${item.id})">+</button>
                    </div>
                    <button class="remove-link" onclick="removeItem(${item.id})">Xóa</button>
                </div>
                <div class="item-total">${formatCurrency(itemTotal)}</div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', itemHTML);
    });

    // Cập nhật tổng tiền
    updateCartTotal(subtotal);
}

// ====== HÀM XỬ LÝ CHECKBOX ======
function toggleItem(id, isChecked) {
    const item = window.cartData.find(item => item.id === id);
    if (item) {
        item.checked = isChecked;
        window.saveCartData();
        // Tính lại tổng tiền ngay lập tức
        calculateAndUpdateTotal();
    }
}

// ====== HÀM TĂNG SỐ LƯỢNG ======
function increaseQty(id) {
    const item = window.cartData.find(item => item.id === id);
    if (item) {
        item.quantity++;
        window.saveCartData();
        renderCartDetailPage(); // Render lại toàn bộ
    }
}

// ====== HÀM GIẢM SỐ LƯỢNG ======
function decreaseQty(id) {
    const item = window.cartData.find(item => item.id === id);
    if (item) {
        if (item.quantity > 1) {
            item.quantity--;
            window.saveCartData();
            renderCartDetailPage(); // Render lại toàn bộ
        } else {
            // Nếu số lượng = 1, hỏi xóa
            if (confirm("Bạn có muốn xóa sản phẩm này không?")) {
                removeItem(id);
            }
        }
    }
}

// ====== HÀM XÓA SẢN PHẨM ======
function removeItem(id) {
    const index = window.cartData.findIndex(item => item.id === id);
    if (index > -1) {
        window.cartData.splice(index, 1);
        window.saveCartData();
        renderCartDetailPage(); // Render lại toàn bộ
    }
}

// ====== TÍNH LẠI TỔNG TIỀN ======
function calculateAndUpdateTotal() {
    let subtotal = 0;
    if (window.cartData) {
        window.cartData.forEach(item => {
            if (item.checked) {
                subtotal += item.price * item.quantity;
            }
        });
    }
    updateCartTotal(subtotal);
}

// ====== CẬP NHẬT HIỂN THỊ TỔNG TIỀN ======
function updateCartTotal(subtotal) {
    const subtotalElement = document.querySelector(".subtotal-value");
    const totalElement = document.querySelector(".total-price");
    
    if (subtotalElement) subtotalElement.textContent = formatCurrency(subtotal);
    if (totalElement) totalElement.textContent = formatCurrency(subtotal);
}

// ====== HIỂN THỊ KHI GIỎ HÀNG TRỐNG ======
function showEmptyCart() {
    const container = document.querySelector(".cart-list");
    const itemCount = document.querySelector(".cart-header h3");
    
    if (container) {
        container.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Giỏ hàng của bạn đang trống</p>
                <a href="javascript:void(0)" class="continue-shopping" onclick="hideCartDetail()">Tiếp tục mua sắm</a>
            </div>
        `;
    }
    
    if (itemCount) itemCount.textContent = 'Giỏ hàng(0)';
    updateCartTotal(0);
}

// ====== HÀM THANH TOÁN ======
function goToCheckout() {
    if (!window.cartData || window.cartData.length === 0) {
        alert("Giỏ hàng của bạn đang trống!");
        return;
    }
    
    const hasSelectedItems = window.cartData.some(item => item.checked);
    if (!hasSelectedItems) {
        alert("Vui lòng chọn ít nhất một sản phẩm để thanh toán!");
        return;
    }
    
    window.saveCartData();
    alert("Chức năng thanh toán đang được phát triển!");
}

// ====== ĐỊNH DẠNG TIỀN ======
function formatCurrency(amount) {
    if (!amount) return '0đ';
    return amount.toLocaleString('vi-VN') + 'đ';
}

// ====== KHỞI TẠO ======
document.addEventListener("DOMContentLoaded", function () {
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
});