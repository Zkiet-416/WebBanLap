// checkout.js - TÍCH HỢP VỚI CART.JS VÀ CARTDETAIL.JS

/* ===========================
   QUẢN LÝ MODAL CHECKOUT
   =========================== */

// Mở modal checkout
window.openCheckoutModal = function () {
    // =====  KIỂM TRA ĐĂNG NHẬP =====
    const isLoggedIn = localStorage.getItem("currentUser") !== null;
    if (!isLoggedIn) {
        alert("Vui lòng đăng nhập để tiếp tục thanh toán!");
        document.getElementById("popupLogin").classList.remove("hidden");
        return;
    }
    // Kiểm tra giỏ hàng
    if (!window.cartData || window.cartData.length === 0) {
        alert("Giỏ hàng của bạn đang trống!");
        return;
    }

    // Kiểm tra có sản phẩm nào được chọn không
    const selectedItems = window.cartData.filter(item => item.checked);
    if (selectedItems.length === 0) {
        alert("Vui lòng chọn ít nhất một sản phẩm để thanh toán!");
        return;
    }

    // Hiển thị modal
    const modal = document.getElementById('checkoutModal');
    if (modal) {
        modal.style.display = 'block';
        renderOrderSummary();
        resetCheckoutForm();
        initCitiesCheckout();
        autoFillAddressFromProfile();
    }
};

// Đóng modal checkout
window.closeCheckoutModal = function () {
    const modal = document.getElementById('checkoutModal');
    if (modal) {
        modal.style.display = 'none';
    }
};

// Click outside để đóng modal
window.addEventListener('click', function (e) {
    const modal = document.getElementById('checkoutModal');
    if (e.target === modal) {
        closeCheckoutModal();
    }
});

/* ===========================
   RENDER ĐƠN HÀNG
   =========================== */

function renderOrderSummary() {
    const container = document.getElementById('orderSummary');
    const totalElement = document.getElementById('checkoutTotal');

    if (!container) return;

    container.innerHTML = '';
    let total = 0;

    const selectedItems = window.cartData.filter(item => item.checked);

    if (selectedItems.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#666;">Không có sản phẩm nào được chọn</p>';
        if (totalElement) totalElement.textContent = '0đ';
        return;
    }

    selectedItems.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const itemHTML = `
            <div class="order-item">
                <span class="order-item-name">${item.name}</span>
                <span class="order-item-qty">x${item.quantity}</span>
                <span class="order-item-price">${formatCurrency(itemTotal)}</span>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', itemHTML);
    });

    if (totalElement) {
        totalElement.textContent = formatCurrency(total);
    }
}

/* ===========================
   XỬ LÝ ĐỊA CHỈ (DÙNG TƯƠNG TỰ PROFILE.JS)
   =========================== */

const addressData = {
    "Hà Nội": [
        "Phúc Xá", "Trúc Bạch", "Vĩnh Phúc", "Cống Vị", "Ngọc Khánh",
        "Kim Mã", "Giảng Võ", "Láng Hạ", "Láng Thượng", "Thịnh Liệt",
        "Hoàng Văn Thụ", "Mai Động", "Tương Mai", "Định Công", "Khương Đình"
    ],
    "Hồ Chí Minh": [
        "Bến Nghé", "Bến Thành", "Nguyễn Thái Bình", "Phạm Ngũ Lão", "Đa Kao",
        "Tân Định", "Hiệp Bình Chánh", "Hiệp Bình Phước", "Linh Trung", "Linh Tây",
        "Tăng Nhơn Phú A", "Tăng Nhơn Phú B", "Phước Long A", "Phước Long B",
        "Trường Thọ", "Chợ Quán", "Vườn Lài"
    ],
    "Đà Nẵng": [
        "Hải Châu 1", "Hải Châu 2", "Hòa Cường Bắc", "Hòa Cường Nam", "Thạch Thang",
        "Thanh Bình", "Thuận Phước", "Khuê Trung", "Khuê Mỹ", "Hòa Hải",
        "Hòa Quý", "Hòa Minh", "Hòa Khánh Bắc", "Hòa Khánh Nam"
    ],
    "Hải Phòng": [
        "Minh Khai", "Phan Bội Châu", "Hạ Lý", "Hoàng Văn Thụ", "Gia Viên",
        "Cầu Đất", "Lạc Viên", "Vạn Mỹ", "Đằng Hải", "Đằng Lâm",
        "Hợp Đức", "Vạn Hương"
    ],
    "Cần Thơ": [
        "Xuân Khánh", "An Hòa", "An Hội", "An Khánh", "An Nghiệp",
        "Tân An", "Cái Khế", "Thới Bình", "Hưng Lợi", "An Bình",
        "An Thới", "Bùi Hữu Nghĩa"
    ],
    "Khánh Hòa": [
        "xã Nam Cam Ranh", "Nam Nha Trang", "xã Bắc Ninh Hòa", "xã Tân Định",
        "xã Nam Ninh Hòa", "xã Tây Ninh Hòa", "xã Hòa Trí", "xã Đại Lãnh",
        "xã Tu Bông", "xã Vạn Thắng", "xã Cam An", "phường Tây Nha Trang",
        "phường Nam Nha Trang", "phường Bắc Cam Ranh", "phường Cam Ranh",
        "phường Ba Ngòi", "phường Cam Linh"
    ],
    "Bình Dương": [
        "Hiệp Thành", "Phú Lợi", "Phú Cường", "Chánh Nghĩa", "Định Hòa",
        "Tân An", "Tương Bình Hiệp", "Hòa Phú", "Phú Thọ", "Phú Hòa"
    ],
    "Đồng Nai": [
        "Tân Phong", "Tân Hiệp", "An Bình", "Tam Hòa", "Tam Hiệp",
        "Hố Nai", "Trảng Dài", "Long Bình", "Long Hưng", "Quang Vinh",
        "Thanh Bình"
    ],
    "Thừa Thiên Huế": [
        "Thuận Hòa", "Thuận Lộc", "Thuận Thành", "Phú Hậu", "Phú Hiệp",
        "Phú Bình", "Tây Lộc", "Thuỷ Biều", "An Tây", "Kim Long",
        "Hương Long"
    ],
    "Quảng Ninh": [
        "Hồng Gai", "Hồng Hà", "Cao Thắng", "Trần Hưng Đạo", "Yết Kiêu",
        "Bạch Đằng", "Hà Tu", "Hà Trung", "Hà Khánh", "Giếng Đáy",
        "Cao Xanh", "Hà Phong"
    ]
};
function initCitiesCheckout() {
    const provinceSelect = document.getElementById('province');
    if (!provinceSelect) return;

    provinceSelect.innerHTML = '<option value="">Chọn Tỉnh/TP</option>';

    Object.keys(addressData).forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        provinceSelect.appendChild(option);
    });
}
function updateDistricts() {
    const province = document.getElementById('province').value;
    const districtSelect = document.getElementById('district');

    if (!districtSelect) return;

    districtSelect.innerHTML = '<option value="">Chọn Phường/Xã</option>';

    if (!province) return;

    const districts = addressData[province];

    if (districts && districts.length > 0) {
        districts.forEach(district => {
            const option = document.createElement('option');
            option.value = district;
            option.textContent = district;
            districtSelect.appendChild(option);
        });
    }

    clearError('districtError');
};
// Điền địa chỉ từ danh sách có sẵn
window.fillAddressFromProfile = function () {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    document.getElementById('customerName').value = currentUser.fullname || '';
    document.getElementById('customerPhone').value = currentUser.phone || '';
    document.getElementById('customerAddress').value = currentUser.addressDetail || '';

    const provinceSelect = document.getElementById('province');
    if (provinceSelect && currentUser.city) {
        provinceSelect.value = currentUser.city;
        updateDistricts(); // Gọi hàm cập nhật quận/huyện

        const districtSelect = document.getElementById('district');
        if (districtSelect && currentUser.district) {
            districtSelect.value = currentUser.district;
        }
    }

    clearErrors();
    alert("Đã điền địa chỉ từ hồ sơ cá nhân!");
};

function autoFillAddressFromProfile() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (currentUser && currentUser.city && currentUser.district && currentUser.addressDetail) {
        // Tự động điền mà không cần hỏi
        fillAddressFromProfile();

    }
}

/* ===========================
   VALIDATION
   =========================== */

function validateCheckoutForm() {
    let isValid = true;
    clearErrors();

    // Validate tên
    const name = document.getElementById('customerName').value.trim();
    if (!name) {
        showError('nameError', 'Vui lòng nhập họ tên');
        isValid = false;
    } else if (name.length < 2) {
        showError('nameError', 'Họ tên phải có ít nhất 2 ký tự');
        isValid = false;
    }

    // Validate số điện thoại
    const phone = document.getElementById('customerPhone').value.trim();
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!phone) {
        showError('phoneError', 'Vui lòng nhập số điện thoại');
        isValid = false;
    } else if (!phoneRegex.test(phone)) {
        showError('phoneError', 'Số điện thoại không hợp lệ (VD: 0912345678)');
        isValid = false;
    }

    // Validate địa chỉ
    const address = document.getElementById('customerAddress').value.trim();
    if (!address) {
        showError('addressError', 'Vui lòng nhập địa chỉ');
        isValid = false;
    } else if (address.length < 5) {
        showError('addressError', 'Địa chỉ phải có ít nhất 5 ký tự');
        isValid = false;
    }

    // Validate tỉnh/thành phố
    const province = document.getElementById('province').value;
    if (!province) {
        showError('provinceError', 'Vui lòng chọn tỉnh/thành phố');
        isValid = false;
    }

    // Validate quận/huyện
    const district = document.getElementById('district').value;
    if (!district) {
        showError('districtError', 'Vui lòng chọn quận/huyện');
        isValid = false;
    }

    return isValid;
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

function clearError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
}

function clearErrors() {
    ['nameError', 'phoneError', 'addressError', 'provinceError', 'districtError'].forEach(id => {
        clearError(id);
    });
}

/* ===========================
   HOÀN TẤT ĐƠN HÀNG
   =========================== */

window.completeOrder = function () {
    // Validate form
    if (!validateCheckoutForm()) {
        alert('Vui lòng điền đầy đủ thông tin giao hàng!');
        return;
    }

    // Lấy thông tin khách hàng
    const customerInfo = {
        name: document.getElementById('customerName').value.trim(),
        phone: document.getElementById('customerPhone').value.trim(),
        address: document.getElementById('customerAddress').value.trim(),
        province: document.getElementById('province').options[document.getElementById('province').selectedIndex].text,
        district: document.getElementById('district').options[document.getElementById('district').selectedIndex].text,
        note: document.getElementById('orderNote').value.trim()
    };

    // Lấy phương thức thanh toán
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    const paymentText = {
        'cod': 'Thanh toán khi nhận hàng (COD)',
        'bank': 'Chuyển khoản ngân hàng',
        'ewallet': 'Ví điện tử'
    };

    // Lấy danh sách sản phẩm đã chọn
    const selectedItems = window.cartData.filter(item => item.checked);
    let total = 0;
    selectedItems.forEach(item => {
        total += item.price * item.quantity;
    });

    // Tạo thông tin đơn hàng
    const orderInfo = {
        customer: customerInfo,
        payment: {
            method: paymentMethod,
            methodText: paymentText[paymentMethod]
        },
        items: selectedItems,
        total: total,
        orderDate: new Date().toLocaleString('vi-VN')
    };

    // Hiển thị xác nhận đơn hàng
    showOrderConfirmation(orderInfo);
};

/* ===========================
   XÁC NHẬN ĐƠN HÀNG - CHỈ LƯU 1 LẦN DUY NHẤT
   =========================== */

function showOrderConfirmation(orderInfo) {
    let itemsList = '';
    orderInfo.items.forEach(item => {
        itemsList += `• ${item.name} x ${item.quantity} = ${formatCurrency(item.price * item.quantity)}\n`;
    });

    const confirmMessage = `
                                    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                                          XÁC NHẬN ĐƠN HÀNG
                                    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 SẢN PHẨM:
${itemsList}
💰 Tổng tiền: ${formatCurrency(orderInfo.total)}

👤 THÔNG TIN KHÁCH HÀNG:
Họ tên: ${orderInfo.customer.name}
SĐT: ${orderInfo.customer.phone}
Địa chỉ: ${orderInfo.customer.address}, ${orderInfo.customer.district}, ${orderInfo.customer.province}
${orderInfo.customer.note ? 'Ghi chú: ' + orderInfo.customer.note : ''}

💳 THANH TOÁN:
${orderInfo.payment.methodText}

📅 Thời gian: ${orderInfo.orderDate}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Xác nhận đặt hàng?
    `;

    if (confirm(confirmMessage)) {
        // 🎯 TẠO ORDER ID THỐNG NHẤT
        const orderId = 'ORD' + Date.now();
        const shippingAddress = `${orderInfo.customer.address}, ${orderInfo.customer.district}, ${orderInfo.customer.province}`;

        // 🎯 TÍNH TOÁN TỔNG TIỀN CHÍNH XÁC
        const totalAmount = orderInfo.items.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);

        const unifiedOrder = {
            // 🚨 ĐỒNG BỘ ID
            id: orderId,
            orderId: orderId,

            // 🚨 ĐỒNG BỘ ĐỊA CHỈ
            shippingAddress: shippingAddress,
            address: shippingAddress,

            // 🚨 ĐỒNG BỘ THÔNG TIN KHÁCH HÀNG
            customerName: orderInfo.customer.name,
            customerPhone: orderInfo.customer.phone,
            customer: orderInfo.customer,

            // 🚨 ĐỒNG BỘ THANH TOÁN
            paymentMethod: orderInfo.payment.methodText,
            payment: orderInfo.payment,

            // 🚨 ĐỒNG BỘ SẢN PHẨM
            items: orderInfo.items.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image
            })),

            // 🚨 ĐỒNG BỘ TỔNG TIỀN
            total: totalAmount,
            totalAmount: totalAmount,

            // 🚨 ĐỒNG BỘ THỜI GIAN
            orderDate: orderInfo.orderDate,
            createdAt: orderInfo.orderDate,

            // 🚨 ĐỒNG BỘ TRẠNG THÁI
            status: 'Mới đặt'
        };

        console.log('💾 Chuẩn bị lưu đơn hàng:', {
            id: orderId,
            items: unifiedOrder.items.length,
            total: totalAmount
        });

        // 🎯 CHỈ LƯU 1 LẦN DUY NHẤT - SỬA LỖI TRÙNG LẶP
        saveOrderOnce(unifiedOrder);

        processAfterCheckout();
    }
}

// 🎯 HÀM LƯU DUY NHẤT 1 LẦN
function saveOrderOnce(orderData) {
    try {
        const orderId = orderData.orderId;

        console.log('🔒 Bắt đầu lưu đơn hàng (chỉ 1 lần):', orderId);

        // 1. Lưu vào ordersHistory (hệ thống quản lý)
        const ordersHistory = JSON.parse(localStorage.getItem('ordersHistory') || '[]');

        // 🚨 KIỂM TRA TRÙNG LẶP TRƯỚC KHI LƯU
        const existingOrder = ordersHistory.find(order =>
            order.orderId === orderId || order.id === orderId
        );

        if (!existingOrder) {
            ordersHistory.push(orderData);
            localStorage.setItem('ordersHistory', JSON.stringify(ordersHistory));
            console.log('✅ Đã lưu vào ordersHistory');
        } else {
            console.log('⚠️ Đơn hàng đã tồn tại trong ordersHistory, bỏ qua');
        }

        // 2. Lưu vào lịch sử user (chỉ 1 lần)
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            const user = JSON.parse(currentUser);
            const orderHistoryKey = `orderHistory_${user.email}`;
            let userOrderHistory = JSON.parse(localStorage.getItem(orderHistoryKey) || '[]');

            // 🚨 KIỂM TRA TRÙNG LẶP TRONG USER HISTORY
            const existingUserOrder = userOrderHistory.find(order => order.orderId === orderId);

            if (!existingUserOrder) {
                const userOrder = {
                    orderId: orderData.orderId,
                    orderDate: orderData.orderDate,
                    items: orderData.items,
                    totalAmount: orderData.totalAmount,
                    shippingAddress: orderData.shippingAddress,
                    paymentMethod: orderData.paymentMethod,
                    status: 'completed'
                };

                userOrderHistory.unshift(userOrder);
                localStorage.setItem(orderHistoryKey, JSON.stringify(userOrderHistory));
                console.log('✅ Đã lưu vào user history');
            } else {
                console.log('⚠️ Đơn hàng đã tồn tại trong user history, bỏ qua');
            }
        }

        // 🚨 KHÔNG GỌI THÊM BẤT KỲ HÀM LƯU NÀO KHÁC

    } catch (error) {
        console.error('❌ Lỗi khi lưu đơn hàng:', error);
    }
}

// Hàm xử lý sau checkout
function processAfterCheckout() {
    console.log('🔄 Xử lý sau checkout...');

    // Xóa sản phẩm đã đặt
    window.cartData = window.cartData.filter(item => !item.checked);
    window.saveCartData();

    // Cập nhật UI
    if (typeof window.renderCartDropdown === 'function') window.renderCartDropdown();
    if (typeof window.renderCartDetailPage === 'function') window.renderCartDetailPage();

    // Đóng modal và thông báo
    closeCheckoutModal();
    alert('🎉 Đặt hàng thành công!');

    // Reset về trang chủ
    if (typeof window.resetToHomePage === 'function') {
        window.resetToHomePage();
    }
}

/* ===========================
   UTILITY FUNCTIONS
   =========================== */

function formatCurrency(amount) {
    if (!amount) return '0đ';
    return amount.toLocaleString('vi-VN') + 'đ';
}

function resetCheckoutForm() {
    document.getElementById('customerName').value = '';
    document.getElementById('customerPhone').value = '';
    document.getElementById('customerAddress').value = '';
    document.getElementById('province').value = '';
    document.getElementById('district').innerHTML = '<option value="">-- Chọn quận/huyện --</option>';
    document.getElementById('orderNote').value = '';
    document.getElementById('savedAddress').value = '';
    document.querySelector('input[name="payment"][value="cod"]').checked = true;
    clearErrors();
}

/* ===========================
   KHỞI TẠO
   =========================== */

document.addEventListener('DOMContentLoaded', function () {
    // Ẩn modal khi load trang
    const modal = document.getElementById('checkoutModal');
    if (modal) {
        modal.style.display = 'none';
    }

    // Cập nhật các nút thanh toán để gọi openCheckoutModal
    // Trong cart dropdown
    const btnPay = document.querySelector('.btn-pay');
    if (btnPay) {
        btnPay.onclick = openCheckoutModal;
    }

    // Trong cart detail page
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.onclick = openCheckoutModal;
    }
});