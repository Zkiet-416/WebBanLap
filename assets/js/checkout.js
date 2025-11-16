// checkout.js - TÍCH HỢP VỚI CART.JS VÀ CARTDETAIL.JS

/* ===========================
   QUẢN LÝ MODAL CHECKOUT
   =========================== */

// Mở modal checkout
window.openCheckoutModal = function() {
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
    }
};

// Đóng modal checkout
window.closeCheckoutModal = function() {
    const modal = document.getElementById('checkoutModal');
    if (modal) {
        modal.style.display = 'none';
    }
};

// Click outside để đóng modal
window.addEventListener('click', function(e) {
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
   XỬ LÝ ĐỊA CHỈ
   =========================== */

// Điền địa chỉ từ danh sách có sẵn
window.fillAddress = function() {
    const select = document.getElementById('savedAddress');
    const selected = select.options[select.selectedIndex];
    
    clearErrors();
    
    if (selected.value) {
        document.getElementById('customerName').value = selected.getAttribute('data-name') || '';
        document.getElementById('customerPhone').value = selected.getAttribute('data-phone') || '';
        document.getElementById('customerAddress').value = selected.getAttribute('data-adr') || '';
        
        const province = selected.getAttribute('data-province');
        if (province) {
            document.getElementById('province').value = province;
            updateDistricts();
            
            const district = selected.getAttribute('data-district');
            if (district) {
                setTimeout(() => {
                    document.getElementById('district').value = district;
                }, 100);
            }
        }
    } else {
        resetCheckoutForm();
    }
};

// Cập nhật danh sách quận/huyện
window.updateDistricts = function() {
    const province = document.getElementById('province').value;
    const districtSelect = document.getElementById('district');
    
    districtSelect.innerHTML = '<option value="">-- Chọn quận/huyện --</option>';
    
    const districts = {
        'hanoi': [
            { value: 'caugiay', text: 'Cầu Giấy' },
            { value: 'dongda', text: 'Đống Đa' },
            { value: 'badinh', text: 'Ba Đình' },
            { value: 'hoankiem', text: 'Hoàn Kiếm' },
            { value: 'hayba', text: 'Hai Bà Trưng' }
        ],
        'hcm': [
            { value: 'quan1', text: 'Quận 1' },
            { value: 'quan2', text: 'Quận 2' },
            { value: 'quan3', text: 'Quận 3' },
            { value: 'binhthanh', text: 'Bình Thạnh' },
            { value: 'tanbinh', text: 'Tân Bình' }
        ],
        'danang': [
            { value: 'haichau', text: 'Hải Châu' },
            { value: 'thanhkhe', text: 'Thanh Khê' },
            { value: 'sontra', text: 'Sơn Trà' },
            { value: 'nguhanh', text: 'Ngũ Hành Sơn' }
        ]
    };
    
    if (districts[province]) {
        districts[province].forEach(d => {
            const option = document.createElement('option');
            option.value = d.value;
            option.textContent = d.text;
            districtSelect.appendChild(option);
        });
    }
    
    clearError('districtError');
};

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

window.completeOrder = function() {
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
    const orderId = saveOrder(orderInfo); 
    
    // 5. GHI GIAO DỊCH XUẤT KHO VÀ TRỪ TỒN KHO
    // Kiểm tra xem hàm recordSaleTransaction có sẵn không (từ stock.js)
    if (window.recordSaleTransaction) {
        // Gọi hàm trừ kho, sử dụng selectedItems và orderInfo
        window.recordSaleTransaction(selectedItems, orderId, orderInfo.date); 
    } else {
        console.warn("Lỗi: Hàm recordSaleTransaction không khả dụng. Không thể trừ kho.");
    }

    // 6. IN PHIẾU XUẤT KHO
    printSaleReceipt(orderInfo);
};

/* ===========================
   XÁC NHẬN ĐƠN HÀNG
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
        // Lưu đơn hàng vào lịch sử (QUAN TRỌNG: THÊM ĐOẠN NÀY)
        if (typeof window.saveOrderToHistory === 'function') {
            const orderData = {
                items: orderInfo.items.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image
                })),
                totalAmount: orderInfo.total,
                shippingAddress: `${orderInfo.customer.address}, ${orderInfo.customer.district}, ${orderInfo.customer.province}`,
                paymentMethod: orderInfo.payment.methodText,
                status: 'completed' // Trạng thái mặc định
            };
            window.saveOrderToHistory(orderData);
        }
        
        // Lưu đơn hàng (có thể lưu vào localStorage hoặc gửi lên server)
        saveOrder(orderInfo);
        
        // Xóa các sản phẩm đã đặt khỏi giỏ hàng
        window.cartData = window.cartData.filter(item => !item.checked);
        window.saveCartData();
        
        // Cập nhật giao diện
        if (typeof window.renderCartDropdown === 'function') {
            window.renderCartDropdown();
        }
        if (typeof window.renderCartDetailPage === 'function') {
            window.renderCartDetailPage();
        }
        
        // Đóng modal và thông báo thành công
        closeCheckoutModal();
        alert('🎉 Đặt hàng thành công!\n\nCảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý.');
        
        // Quay về trang chủ
        if (typeof window.resetToHomePage === 'function') {
            window.resetToHomePage();
        }
    }
}

/* ===========================
   LƯU ĐƠN HÀNG
   =========================== */

function saveOrder(orderInfo) {
    try {
        // Lấy danh sách đơn hàng cũ
        const ordersData = JSON.parse(localStorage.getItem('ordersHistory') || '[]');
        
        // Thêm đơn hàng mới
        orderInfo.orderId = 'ORD' + Date.now();
        ordersData.push(orderInfo);
        
        // Lưu lại
        localStorage.setItem('ordersHistory', JSON.stringify(ordersData));
        
        console.log('Đơn hàng đã được lưu:', orderInfo);
    } catch (e) {
        console.error('Lỗi khi lưu đơn hàng:', e);
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

document.addEventListener('DOMContentLoaded', function() {
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