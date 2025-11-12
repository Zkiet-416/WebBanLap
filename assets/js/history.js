// history.js - Quản lý lịch sử mua hàng

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 history.js đang tải...');
    loadOrderHistory();
    
    // Gắn sự kiện filter
    const statusFilter = document.getElementById('statusFilter');
    const dateFilter = document.getElementById('dateFilter');
    
    if (statusFilter) {
        statusFilter.addEventListener('change', filterOrders);
    }
    if (dateFilter) {
        dateFilter.addEventListener('change', filterOrders);
    }
});

// Hàm tải lịch sử đơn hàng
function loadOrderHistory() {
    const orders = getOrderHistory();
    console.log('📦 Lịch sử đơn hàng:', orders);
    renderOrders(orders);
}

// Lấy lịch sử đơn hàng từ localStorage
function getOrderHistory() {
    try {
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) {
            console.log('❌ Chưa đăng nhập');
            return [];
        }
        
        const user = JSON.parse(currentUser);
        const orderHistory = localStorage.getItem(`orderHistory_${user.email}`);
        
        if (orderHistory) {
            return JSON.parse(orderHistory);
        } else {
            console.log('📝 Chưa có lịch sử đơn hàng');
            return [];
        }
    } catch (error) {
        console.error('Lỗi khi lấy lịch sử đơn hàng:', error);
        return [];
    }
}

// Render danh sách đơn hàng
function renderOrders(orders) {
    const container = document.getElementById('ordersList');
    if (!container) return;
    
    if (!orders || orders.length === 0) {
        container.innerHTML = `
            <div class="empty-history">
                <i class="fas fa-receipt"></i>
                <h3>Chưa có đơn hàng nào</h3>
                <p>Bạn chưa có đơn hàng nào trong lịch sử</p>
                <button class="btn-shopping" onclick="resetToHomePage()">
                    <i class="fas fa-shopping-cart"></i>
                    Mua sắm ngay
                </button>
            </div>
        `;
        return;
    }

    // Sắp xếp đơn hàng mới nhất lên đầu
    orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    
    container.innerHTML = orders.map(order => createOrderHTML(order)).join('');
}

// Tạo HTML cho một đơn hàng
function createOrderHTML(order) {
    const orderDate = new Date(order.orderDate).toLocaleDateString('vi-VN');
    const orderTime = new Date(order.orderDate).toLocaleTimeString('vi-VN');
    
    return `
        <div class="order-card" data-order-id="${order.orderId}" data-status="${order.status}">
            <div class="order-header">
                <div class="order-info">
                    <h3>Đơn hàng #${order.orderId}</h3>
                    <div class="order-meta">
                        <span><i class="far fa-calendar"></i> ${orderDate}</span>
                        <span><i class="far fa-clock"></i> ${orderTime}</span>
                        <span><i class="fas fa-map-marker-alt"></i> ${order.shippingAddress}</span>
                    </div>
                </div>
                <div class="order-status status-${order.status}">
                    ${getStatusText(order.status)}
                </div>
            </div>
            
            <div class="order-items">
                ${order.items.map(item => `
                    <div class="order-item">
                        <img src="${item.image}" alt="${item.name}" class="item-image" 
                             onerror="this.src='../assets/images/default-product.jpg'">
                        <div class="item-details">
                            <div class="item-name">${item.name}</div>
                            <div class="item-price">${formatCurrency(item.price)}</div>
                        </div>
                        <div class="item-quantity">Số lượng: ${item.quantity}</div>
                    </div>
                `).join('')}
            </div>
            
            <div class="order-footer">
                <div class="order-total">
                    Tổng cộng: ${formatCurrency(order.totalAmount)}
                </div>
                <div class="order-actions">
                    <button class="btn-action" onclick="viewOrderDetail('${order.orderId}')">
                        <i class="fas fa-eye"></i> Chi tiết
                    </button>
                    ${order.status === 'completed' ? `
                        <button class="btn-action btn-reorder" onclick="reorder('${order.orderId}')">
                            <i class="fas fa-redo"></i> Mua lại
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

// Lọc đơn hàng
function filterOrders() {
    const statusFilter = document.getElementById('statusFilter');
    const dateFilter = document.getElementById('dateFilter');
    
    if (!statusFilter || !dateFilter) return;
    
    const statusValue = statusFilter.value;
    const dateValue = dateFilter.value;
    const allOrders = getOrderHistory();
    
    let filteredOrders = allOrders;
    
    // Lọc theo trạng thái
    if (statusValue !== 'all') {
        filteredOrders = filteredOrders.filter(order => order.status === statusValue);
    }
    
    // Lọc theo thời gian
    if (dateValue !== 'all') {
        const now = new Date();
        let startDate;
        
        switch(dateValue) {
            case '7days':
                startDate = new Date(now.setDate(now.getDate() - 7));
                break;
            case '30days':
                startDate = new Date(now.setDate(now.getDate() - 30));
                break;
            case '3months':
                startDate = new Date(now.setMonth(now.getMonth() - 3));
                break;
            case '6months':
                startDate = new Date(now.setMonth(now.getMonth() - 6));
                break;
            default:
                startDate = new Date(0); // Từ ngày đầu tiên
        }
        
        filteredOrders = filteredOrders.filter(order => 
            new Date(order.orderDate) >= startDate
        );
    }
    
    renderOrders(filteredOrders);
}

// Hàm chuyển đổi trạng thái sang tiếng Việt
function getStatusText(status) {
    const statusMap = {
        'completed': 'Đã hoàn thành',
        'cancelled': 'Đã hủy'
    };
    return statusMap[status] || status;
}

// Định dạng tiền
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

// Xem chi tiết đơn hàng
function viewOrderDetail(orderId) {
    console.log('🔍 Xem chi tiết đơn hàng:', orderId);
    const orders = getOrderHistory();
    const order = orders.find(o => o.orderId === orderId);
    
    if (order) {
        // Tạo modal hoặc hiển thị chi tiết
        const detailHTML = `
            <div class="order-detail-modal">
                <h3>Chi tiết đơn hàng #${order.orderId}</h3>
                <div class="order-info">
                    <p><strong>Ngày đặt:</strong> ${new Date(order.orderDate).toLocaleString('vi-VN')}</p>
                    <p><strong>Địa chỉ giao hàng:</strong> ${order.shippingAddress}</p>
                    <p><strong>Trạng thái:</strong> ${getStatusText(order.status)}</p>
                    <p><strong>Phương thức thanh toán:</strong> ${order.paymentMethod}</p>
                </div>
                <div class="order-items-detail">
                    <h4>Sản phẩm:</h4>
                    ${order.items.map(item => `
                        <div class="order-item-detail">
                            <img src="${item.image}" alt="${item.name}" width="50">
                            <span>${item.name}</span>
                            <span>${formatCurrency(item.price)} x ${item.quantity}</span>
                            <span>${formatCurrency(item.price * item.quantity)}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="order-total-detail">
                    <strong>Tổng cộng: ${formatCurrency(order.totalAmount)}</strong>
                </div>
            </div>
        `;
        
        // Hiển thị modal (có thể dùng alert tạm thời)
        alert(`Chi tiết đơn hàng #${orderId}\nTổng tiền: ${formatCurrency(order.totalAmount)}\nTrạng thái: ${getStatusText(order.status)}`);
    }
}

// Mua lại đơn hàng
function reorder(orderId) {
    console.log('🔄 Mua lại đơn hàng:', orderId);
    const orders = getOrderHistory();
    const order = orders.find(o => o.orderId === orderId);
    
    if (order && confirm('Bạn có muốn mua lại đơn hàng này?')) {
        // Thêm sản phẩm vào giỏ hàng
        order.items.forEach(item => {
            if (typeof window.addToCart === 'function') {
                // Thêm từng sản phẩm với số lượng
                for (let i = 0; i < item.quantity; i++) {
                    window.addToCart(item.id);
                }
            }
        });
        
        alert('Đã thêm sản phẩm vào giỏ hàng!');
        
        // Chuyển đến trang giỏ hàng
        if (typeof window.showCartDetail === 'function') {
            window.showCartDetail();
        }
    }
}

// Hàm lưu đơn hàng mới (gọi từ checkout.js)
window.saveOrderToHistory = function(orderData) {
    try {
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) {
            console.error('❌ Không thể lưu đơn hàng: chưa đăng nhập');
            return false;
        }
        
        const user = JSON.parse(currentUser);
        const orderHistoryKey = `orderHistory_${user.email}`;
        
        // Lấy lịch sử hiện tại
        let orderHistory = getOrderHistory();
        
        // Tạo ID đơn hàng mới
        const orderId = 'DH' + Date.now() + Math.random().toString(36).substr(2, 5);
        
        // Tạo đơn hàng mới
        const newOrder = {
            orderId: orderId,
            orderDate: new Date().toISOString(),
            items: orderData.items,
            totalAmount: orderData.totalAmount,
            shippingAddress: orderData.shippingAddress,
            paymentMethod: orderData.paymentMethod,
            status: 'completed' // Mặc định chờ xác nhận
        };
        
        // Thêm vào đầu mảng
        orderHistory.unshift(newOrder);
        
        // Lưu lại
        localStorage.setItem(orderHistoryKey, JSON.stringify(orderHistory));
        
        console.log('✅ Đã lưu đơn hàng vào lịch sử:', newOrder);
        return true;
        
    } catch (error) {
        console.error('❌ Lỗi khi lưu đơn hàng:', error);
        return false;
    }
};

// Export hàm để sử dụng từ file khác
window.loadOrderHistory = loadOrderHistory;
window.getOrderHistory = getOrderHistory;