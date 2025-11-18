// history.js - Quản lý lịch sử mua hàng (ĐÃ ĐỒNG BỘ HOÀN TOÀN)

// ========== HÀM HIỂN THỊ TRANG LỊCH SỬ ==========
window.showHistoryPage = function() {
    const cartDetail = document.getElementById('cartDetail');
    const productDetail = document.getElementById('productDetail');
    const suggestions = document.getElementById('suggestions');
    const accessories = document.getElementById('accessories');
    const slider = document.querySelector('.slider');
    const historyPage = document.getElementById('historyPage');
    const profile = document.getElementById("profile");
    
    // Ẩn các trang khác
    if (cartDetail) cartDetail.style.display = 'none';
    if (productDetail) productDetail.style.display = 'none';
    if (suggestions) suggestions.style.display = 'none';
    if (accessories) accessories.style.display = 'none';
    if (slider) slider.style.display = 'none';
    profile.classList.add("hidden");
    
    // Hiển thị trang history
    if (historyPage) historyPage.style.display = 'block';
    
    // Load dữ liệu
    loadOrderHistory();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

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
    
    // Tự động đồng bộ mỗi 3 giây
    setInterval(syncDataFromOrdersManagement, 3000);
});

// ========== QUẢN LÝ DỮ LIỆU ==========

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
            const orders = JSON.parse(orderHistory);
            console.log(`📊 Tìm thấy ${orders.length} đơn hàng trong lịch sử`);
            return orders;
        } else {
            console.log('📝 Chưa có lịch sử đơn hàng');
            return [];
        }
    } catch (error) {
        console.error('Lỗi khi lấy lịch sử đơn hàng:', error);
        return [];
    }
}

// ========== RENDER GIAO DIỆN ==========

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
    // Xử lý thời gian an toàn
    let orderDate, orderTime;
    
    try {
        const dateObj = new Date(order.orderDate);
        
        if (isNaN(dateObj.getTime())) {
            const fallbackDate = new Date(order.orderDate.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$2/$1/$3'));
            if (!isNaN(fallbackDate.getTime())) {
                orderDate = fallbackDate.toLocaleDateString('vi-VN');
                orderTime = fallbackDate.toLocaleTimeString('vi-VN');
            } else {
                orderDate = 'Không xác định';
                orderTime = 'Không xác định';
            }
        } else {
            orderDate = dateObj.toLocaleDateString('vi-VN');
            orderTime = dateObj.toLocaleTimeString('vi-VN');
        }
    } catch (e) {
        console.error('Lỗi xử lý thời gian đơn hàng:', e, order.orderDate);
        orderDate = 'Không xác định';
        orderTime = 'Không xác định';
    }
    
   // 🎯 LOGIC HIỂN THỊ NÚT THEO TRẠNG THÁI MỚI
    const status = order.status || 'Mới đặt';
    let actionButtons = '';
    
    if (status === 'cancelled' || status === 'Đã hủy') {
        // ĐÃ HỦY: Chỉ hiện nút Mua tiếp
        actionButtons = `
            <button class="btn-action btn-reorder" onclick="continueShopping('${order.orderId}')">
                <i class="fas fa-cart-plus"></i> Mua tiếp ngay
            </button>
        `;
    } else {
        // TẤT CẢ TRẠNG THÁI KHÁC: Hiện cả 2 nút (Đang xử lý, Đã đặt, v.v.)
        actionButtons = `
            <button class="btn-action btn-reorder" onclick="continueShopping('${order.orderId}')">
                <i class="fas fa-cart-plus"></i> Mua tiếp ngay
            </button>
            <button class="btn-action btn-cancel" onclick="cancelOrder('${order.orderId}')">
                <i class="fas fa-times"></i> Hủy đơn hàng
            </button>
        `;
    }
    
    // 🎯 XÁC ĐỊNH CLASS CSS THEO TRẠNG THÁI
    let statusClass = 'completed'; // Mặc định
    if (status === 'cancelled' || status === 'Đã hủy') {
        statusClass = 'cancelled';
    } else if (status === 'Mới đặt' || status === 'Đang xử lý' || status === 'pending') {
        statusClass = 'processing';
    }
    
    return `
        <div class="order-card" data-order-id="${order.orderId}" data-status="${status}">
            <button class="btn-delete-order" onclick="deleteOrderSync('${order.orderId}')" title="Xóa đơn hàng">
                <i class="fas fa-times"></i>
            </button>
            
            <div class="order-header">
                <div class="order-info">
                    <h3>Đơn hàng #${order.orderId}</h3>
                    <div class="order-meta">
                        <span><i class="far fa-calendar"></i> ${orderDate}</span>
                        <span><i class="far fa-clock"></i> ${orderTime}</span>
                        <span><i class="fas fa-map-marker-alt"></i> ${order.shippingAddress || 'Không có địa chỉ'}</span>
                    </div>
                </div>
                <div class="order-status status-${statusClass}">
                    ${getStatusText(status)}
                </div>
            </div>
            
            <div class="order-items">
                ${order.items ? order.items.map(item => `
                    <div class="order-item">
                        <img src="${item.image || '../assets/images/default-product.jpg'}" alt="${item.name}" class="item-image" 
                             onerror="this.src='../assets/images/default-product.jpg'">
                        <div class="item-details">
                            <div class="item-name">${item.name || 'Sản phẩm không tên'}</div>
                            <div class="item-price">${formatCurrency(item.price || 0)}</div>
                        </div>
                        <div class="item-quantity">Số lượng: ${item.quantity || 0}</div>
                    </div>
                `).join('') : '<p>Không có sản phẩm</p>'}
            </div>
            
            <div class="order-footer">
                <div class="order-total">
                    Tổng cộng: ${formatCurrency(order.totalAmount || 0)}
                </div>
                <div class="order-actions">
                    ${actionButtons}
                </div>
            </div>
        </div>
    `;
}

// ========== XỬ LÝ HÀNH ĐỘNG ==========

// Hàm xóa đơn hàng đồng bộ
function deleteOrderSync(orderId) {
    console.log('🗑️ Xóa đơn hàng đồng bộ:', orderId);
    
    if (confirm('Bạn có chắc muốn xóa vĩnh viễn đơn hàng này?')) {
        let deletedCount = 0;
        
        // 1. Xóa trong lịch sử cá nhân
        const orders = getOrderHistory();
        const orderIndex = orders.findIndex(o => o.orderId === orderId);
        
        if (orderIndex > -1) {
            orders.splice(orderIndex, 1);
            const currentUser = localStorage.getItem('currentUser');
            if (currentUser) {
                const user = JSON.parse(currentUser);
                const orderHistoryKey = `orderHistory_${user.email}`;
                localStorage.setItem(orderHistoryKey, JSON.stringify(orders));
                deletedCount++;
                console.log('✅ Đã xóa khỏi user history');
            }
        }
        
        // 2. Xóa trong hệ thống quản lý
        const allOrders = JSON.parse(localStorage.getItem('ordersHistory') || '[]');
        const allOrdersIndex = allOrders.findIndex(o => 
            o.orderId === orderId || o.id === orderId
        );
        
        if (allOrdersIndex > -1) {
            allOrders.splice(allOrdersIndex, 1);
            localStorage.setItem('ordersHistory', JSON.stringify(allOrders));
            deletedCount++;
            console.log('✅ Đã xóa khỏi ordersHistory');
        }
        
        // 3. Cập nhật giao diện
        loadOrderHistory();
        if (typeof window.renderOrdersManagement === 'function') {
            setTimeout(() => {
                window.renderOrdersManagement();
            }, 100);
        }
        
        if (deletedCount > 0) {
            alert('✅ Đã xóa đơn hàng thành công!');
        } else {
            alert('❌ Không tìm thấy đơn hàng để xóa!');
        }
    }
}

// Hàm mua tiếp ngay
function continueShopping(orderId) {
    const orders = getOrderHistory();
    const order = orders.find(o => o.orderId === orderId);
    
    if (order && order.items) {
        let addedCount = 0;
        
        order.items.forEach(item => {
            if (typeof window.addToCart === 'function' && item.id) {
                for (let i = 0; i < (item.quantity || 1); i++) {
                    window.addToCart(item.id);
                    addedCount++;
                }
            }
        });
    }
}

// Hàm cập nhật trạng thái đồng bộ
function updateOrderStatusSync(orderId, newStatus) {
    console.log(`🔄 Cập nhật trạng thái đơn ${orderId} -> ${newStatus}`);
    
    let updated = false;
    
    // 1. Cập nhật trong lịch sử cá nhân
    const orders = getOrderHistory();
    const orderIndex = orders.findIndex(o => o.orderId === orderId);
    
    if (orderIndex > -1) {
        orders[orderIndex].status = newStatus;
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            const user = JSON.parse(currentUser);
            const orderHistoryKey = `orderHistory_${user.email}`;
            localStorage.setItem(orderHistoryKey, JSON.stringify(orders));
            updated = true;
            console.log('✅ Đã cập nhật trong user history');
        }
    }
    
    // 2. Cập nhật trong hệ thống quản lý
    const allOrders = JSON.parse(localStorage.getItem('ordersHistory') || '[]');
    const allOrdersIndex = allOrders.findIndex(o => 
        o.orderId === orderId || o.id === orderId
    );
    
    if (allOrdersIndex > -1) {
        allOrders[allOrdersIndex].status = newStatus;
        localStorage.setItem('ordersHistory', JSON.stringify(allOrders));
        updated = true;
        console.log('✅ Đã cập nhật trong ordersHistory');
    }
    
    // 3. Cập nhật giao diện
    if (updated) {
        loadOrderHistory();
        if (typeof window.renderOrdersManagement === 'function') {
            setTimeout(() => {
                window.renderOrdersManagement();
            }, 100);
        }
    }
    
    return updated;
}

// Hàm hủy đơn hàng
function cancelOrder(orderId) {
    console.log('❌ Hủy đơn hàng:', orderId);
    
    if (confirm('Bạn có chắc muốn hủy đơn hàng này?')) {
        if (updateOrderStatusSync(orderId, 'Đã hủy')) {
            alert('✅ Đã hủy đơn hàng thành công!');
        } else {
            alert('❌ Không tìm thấy đơn hàng để hủy!');
        }
    }
}

// ========== LỌC VÀ TÌM KIẾM ==========

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
        if (statusValue === 'processing') {
            // Lọc các đơn đang xử lý
            filteredOrders = filteredOrders.filter(order => 
                order.status === 'Mới đặt' || 
                order.status === 'Đang xử lý' || 
                order.status === 'pending'
            );
        } else if (statusValue === 'completed') {
            // Lọc các đơn đã đặt/hoàn thành
            filteredOrders = filteredOrders.filter(order => 
                order.status === 'completed' || 
                order.status === 'Đã giao' ||
                order.status === 'Đã đặt'
            );
        } else if (statusValue === 'cancelled') {
            // Lọc các đơn đã hủy
            filteredOrders = filteredOrders.filter(order => 
                order.status === 'cancelled' || 
                order.status === 'Đã hủy'
            );
        }
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
                startDate = new Date(0);
        }
        
        filteredOrders = filteredOrders.filter(order => {
            try {
                const orderDate = new Date(order.orderDate);
                return orderDate >= startDate;
            } catch (e) {
                return false;
            }
        });
    }
    
    renderOrders(filteredOrders);
}

// ========== HÀM TIỆN ÍCH ==========

// Hàm chuyển đổi trạng thái sang tiếng Việt
function getStatusText(status) {
    const statusMap = {
        // 🎯 TRẠNG THÁI TỪ ADMIN → HIỂN THỊ USER
        'Mới đặt': 'Đang xử lý',
        'Đang xử lý': 'Đang xử lý', 
        'pending': 'Đang xử lý',
        'completed': 'Đã đặt',
        'Đã giao': 'Đã đặt',
        'Đã đặt': 'Đã đặt',
        'cancelled': 'Đã hủy',
        'Đã hủy': 'Đã hủy',
        'shipping': 'Đang giao hàng'
    };
    return statusMap[status] || 'Đang xử lý';
}

// Định dạng tiền
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount || 0);
}

// ========== HỆ THỐNG ĐỒNG BỘ ==========

// Hàm đồng bộ dữ liệu từ orders-management
function syncDataFromOrdersManagement() {
    try {
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) return;
        
        const user = JSON.parse(currentUser);
        const userHistoryKey = `orderHistory_${user.email}`;
        const ordersHistory = JSON.parse(localStorage.getItem('ordersHistory') || '[]');
        
        let userOrders = JSON.parse(localStorage.getItem(userHistoryKey) || '[]');
        let updated = false;
        
        // Đồng bộ từ ordersHistory sang user history
        ordersHistory.forEach(adminOrder => {
            const orderId = adminOrder.orderId || adminOrder.id;
            const existingUserOrder = userOrders.find(userOrder => userOrder.orderId === orderId);
            
            if (existingUserOrder) {
                // 🎯 CẬP NHẬT TRẠNG THÁI THEO ADMIN
                const adminStatus = adminOrder.status;
                if (adminStatus && existingUserOrder.status !== adminStatus) {
                    existingUserOrder.status = adminStatus;
                    updated = true;
                    console.log(`🔄 Đồng bộ trạng thái đơn ${orderId}: ${existingUserOrder.status} → ${adminStatus}`);
                }
                
                // Cập nhật thông tin khác
                existingUserOrder.items = adminOrder.items || existingUserOrder.items;
                existingUserOrder.totalAmount = adminOrder.totalAmount || adminOrder.total || existingUserOrder.totalAmount;
                existingUserOrder.shippingAddress = adminOrder.shippingAddress || adminOrder.address || existingUserOrder.shippingAddress;
                
            } else if (adminOrder.customerName || adminOrder.customer) {
                // Thêm đơn hàng mới từ admin
                const newUserOrder = {
                    orderId: orderId,
                    orderDate: adminOrder.orderDate || adminOrder.createdAt || new Date().toISOString(),
                    items: adminOrder.items || [],
                    totalAmount: adminOrder.totalAmount || adminOrder.total || 0,
                    shippingAddress: adminOrder.shippingAddress || adminOrder.address || '',
                    paymentMethod: adminOrder.paymentMethod || (adminOrder.payment && adminOrder.payment.methodText) || '',
                    status: adminOrder.status || 'Mới đặt'
                };
                userOrders.unshift(newUserOrder);
                updated = true;
                console.log(`➕ Thêm đơn mới từ admin: ${orderId} - ${newUserOrder.status}`);
            }
        });
        
        if (updated) {
            userOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
            localStorage.setItem(userHistoryKey, JSON.stringify(userOrders));
            console.log('✅ Đã đồng bộ dữ liệu từ admin');
            loadOrderHistory();
        }
        
    } catch (error) {
        console.error('❌ Lỗi đồng bộ dữ liệu:', error);
    }
}

// Hàm kiểm tra và sửa lỗi dữ liệu
function validateAndFixOrderData() {
    try {
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) return;
        
        const user = JSON.parse(currentUser);
        const userHistoryKey = `orderHistory_${user.email}`;
        let userOrders = JSON.parse(localStorage.getItem(userHistoryKey) || '[]');
        let fixed = false;
        
        userOrders = userOrders.filter(order => {
            if (!order.orderId) {
                fixed = true;
                return false;
            }
            
            if (!order.items || !Array.isArray(order.items)) {
                order.items = [];
                fixed = true;
            }
            
            if (!order.totalAmount && order.totalAmount !== 0) {
                order.totalAmount = order.items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
                fixed = true;
            }
            
            return true;
        });
        
        if (fixed) {
            localStorage.setItem(userHistoryKey, JSON.stringify(userOrders));
            console.log('✅ Đã sửa lỗi dữ liệu đơn hàng');
            loadOrderHistory();
        }
        
    } catch (error) {
        console.error('❌ Lỗi kiểm tra dữ liệu:', error);
    }
}

// Tự động đồng bộ khi tải trang
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        validateAndFixOrderData();
        syncDataFromOrdersManagement();
    }, 1000);
});

// Export hàm để sử dụng từ file khác
window.loadOrderHistory = loadOrderHistory;
window.getOrderHistory = getOrderHistory;
window.syncDataFromOrdersManagement = syncDataFromOrdersManagement;
window.cancelOrder = cancelOrder;
window.continueShopping = continueShopping;
window.deleteOrderSync = deleteOrderSync;