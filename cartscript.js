
const cartData = [
    { id: 1, name: "Áo Polo Đen", price: 300000, image: "https://via.placeholder.com/40x40?text=P1", quantity: 2, checked: true },
    { id: 2, name: "Quần Kaki Xám", price: 850000, image: "https://via.placeholder.com/40x40?text=K1", quantity: 1, checked: false },
    { id: 3, name: "Giày Sneaker Trắng", price: 1200000, image: "https://via.placeholder.com/40x40?text=G1", quantity: 1, checked: true },
    { id: 4, name: "Balo Du Lịch", price: 550000, image: "https://via.placeholder.com/40x40?text=B1", quantity: 1, checked: true }
];
const MAX_DROPDOWN_ITEMS = 5; 

const formatCurrency = (amount) => amount.toLocaleString('vi-VN') + 'đ';

const calculateAndUpdateSummary = () => {
    let subtotal = 0;
    cartData.forEach(item => {
        if (item.checked) {
            subtotal += item.price * item.quantity;
        }
    });
    document.getElementById('cart-total-amount').textContent = formatCurrency(subtotal);
};


// --- LOCAL STORAGE ---                          //de tai du lieu len local storage, lam cartdeatail thi them doan code de load local storage xuong
const saveCartData = () => {
    try {
        localStorage.setItem('shoppingCartData', JSON.stringify(cartData));
    } catch (e) {
        console.error('Lỗi khi lưu dữ liệu giỏ hàng:', e);
    }
};

const loadCartData = () => {
    try {
        const storedData = localStorage.getItem('shoppingCartData');
        if (storedData) {
            cartData.splice(0, cartData.length, ...JSON.parse(storedData)); 
        }
    } catch (e) {
        console.error('Lỗi khi tải dữ liệu giỏ hàng:', e);
        localStorage.removeItem('shoppingCartData'); 
    }
};

// --- HÀM XỬ LÝ CHECKBOX ---


window.toggleItemChecked = (id) => {
    const item = cartData.find(item => item.id === id);
    if (item) {
        item.checked = !item.checked;
        saveCartData();
        renderCartDropdown(); // Render lại để cập nhật tổng tiền
    }
};
// --- HÀM XỬ LÝ SỐ LƯỢNG (Giữ nguyên) ---

window.incrementDropdownItem = (id) => {
    const item = cartData.find(item => item.id === id);
    if (item) {
        item.quantity++;
        saveCartData();
        renderCartDropdown();
    }
};

window.removeDropdownItem = (id) => {
    const index = cartData.findIndex(item => item.id === id);
    
    if (index > -1) {
        const item = cartData[index];
        
        if (item.quantity > 1) {
            item.quantity--;
        } 
        else {
            cartData.splice(index, 1);
        }
        
        saveCartData(); 
        renderCartDropdown(); 
    }
};


// --- HÀM RENDER ---

const renderCartDropdown = () => {
    const container = document.getElementById('cart-items-container');
    container.innerHTML = '';
    const totalItems = cartData.length;

    if (totalItems === 0) {
        container.innerHTML = '<div class="empty-cart-message"><i class="fas fa-shopping-basket"></i><p>Hiện chưa có sản phẩm</p></div>';
        document.getElementById('cart-total-amount').textContent = '0đ';
        return;
    }

    const itemsToDisplay = cartData.slice(0, MAX_DROPDOWN_ITEMS);

    itemsToDisplay.forEach(item => {
        const checkedAttr = item.checked ? 'checked' : ''; // Trạng thái checkbox
        const itemHTML = `
            <div class="dropdown-cart-item">
                <input type="checkbox" class="item-checkbox" ${checkedAttr} onchange="toggleItemChecked(${item.id})">
                <div class="item-info">
                    <img src="${item.image || 'https://via.placeholder.com/40x40?text=SP'}" alt="${item.name}" class="item-image-small">
                    <span>${item.name}</span>
                </div>
                <div class="item-pricing">
                    <span class="item-price-small">${formatCurrency(item.price)}</span>
                    <span class="item-quantity-small">x${item.quantity}</span>
                </div>
                <div class="dropdown-item-controls">
                    <span class="dropdown-item-add" onclick="incrementDropdownItem(${item.id})">+</span>
                    <span class="dropdown-item-remove" onclick="removeDropdownItem(${item.id})">&times;</span>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', itemHTML);
    });

    if (totalItems > MAX_DROPDOWN_ITEMS) {
        const remaining = totalItems - MAX_DROPDOWN_ITEMS;
        const moreInfoHTML = `
            <div style="text-align: center; padding: 10px 0; color: #555; font-style: italic; border-top: 1px solid #eee;">
                Và ${remaining} sản phẩm khác. Vui lòng xem giỏ hàng!
            </div>
        `;
        container.insertAdjacentHTML('beforeend', moreInfoHTML);
    }

    calculateAndUpdateSummary();
};


// --- XỬ LÝ SỰ KIỆN KHỞI TẠO VÀ ĐIỀU HƯỚNG ---

const toggleCartDropdown = () => {
    const dropdown = document.getElementById('cartDropdown');
    dropdown.classList.toggle('active');
    if (dropdown.classList.contains('active')) {
        renderCartDropdown();
    }
};

const showCartDetailView = () => {
    saveCartData(); 
    window.location.href = 'cartdetail.html';
};

const goToCheckout = () => {
    saveCartData(); 
    window.location.href = 'checkout.html';
};

document.addEventListener('click', e => {
    const dropdown = document.getElementById('cartDropdown');
    const container = document.querySelector('.cart-container');

    if (dropdown && container && !container.contains(e.target) && dropdown.classList.contains('active')) {
        dropdown.classList.remove('active');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    loadCartData();

    document.getElementById('cartToggleBtn').addEventListener('click', toggleCartDropdown);
    document.getElementById('view-cart-btn').addEventListener('click', showCartDetailView);
    document.getElementById('checkout-btn').addEventListener('click', goToCheckout);

    renderCartDropdown();
});